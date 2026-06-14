import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { MinioService } from '../integrations/minio/minio.service';
import { NotaTipo, OperationType } from '../generated/prisma/client';
import { buildFileName, generateObjectKey } from '../common/utils/file-generator.utils';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { NotaListDto } from './dto/nota-list.dto';
import { RelatorioAporteDto } from './dto/report-aporte.dto';
import { RelatorioVendaDto } from './dto/report-venda.dto';
import { RelatorioAluguelDto } from './dto/report-aluguel.dto';
import { RelatorioProventoDto } from './dto/report-proventos.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  async uploadFile(
    arquivo: Express.Multer.File,
    userId: number,
    nota?: string,
  ): Promise<{ fileId: number; nome: string; path: string }> {
    const objectName = generateObjectKey(userId, arquivo.originalname, nota);
    const url = await this.minioService.uploadFile(objectName, arquivo.buffer, arquivo.mimetype);
    const nome = buildFileName(arquivo.originalname, nota);

    const record = await this.prisma.nota.create({
      data: {
        nome,
        data: new Date(),
        tipo: NotaTipo.PATH,
        path: url,
        createdBy: userId,
      },
    });

    return { fileId: record.id, nome: record.nome, path: record.path };
  }

  async removeNota(id: number, userId: number, mode: 'unlink' | 'cascade'): Promise<void> {
    const nota = await this.prisma.nota.findFirst({
      where: { id, createdBy: userId },
    });

    if (!nota) {
      throw new NotFoundException('Nota não encontrada');
    }

    const objectName = this.minioService.extractObjectName(nota.path);

    if (mode === 'cascade') {
      await this.prisma.operation.deleteMany({ where: { fileId: id } });
      const fipIds = await this.prisma.fixedIncomePosition.findMany({
        where: { fileId: id },
        select: { id: true },
      });
      if (fipIds.length > 0) {
        await this.prisma.fixedIncomeYield.deleteMany({
          where: { fixedIncomeId: { in: fipIds.map(f => f.id) } },
        });
      }
      await this.prisma.fixedIncomePosition.deleteMany({ where: { fileId: id } });
    } else {
      await this.prisma.operation.updateMany({ where: { fileId: id }, data: { fileId: null } });
      await this.prisma.fixedIncomePosition.updateMany({ where: { fileId: id }, data: { fileId: null } });
    }

    await this.prisma.nota.delete({ where: { id } });
    await this.minioService.deleteFile(objectName);
  }

  async getNotaLinks(id: number, userId: number): Promise<{ hasLinks: boolean }> {
    const nota = await this.prisma.nota.findFirst({
      where: { id, createdBy: userId },
    });

    if (!nota) {
      throw new NotFoundException('Nota não encontrada');
    }

    const [operationCount, fixedIncomeCount] = await Promise.all([
      this.prisma.operation.count({ where: { fileId: id } }),
      this.prisma.fixedIncomePosition.count({ where: { fileId: id } }),
    ]);

    return { hasLinks: operationCount + fixedIncomeCount > 0 };
  }

  async getNotas(userId: number): Promise<{ data: NotaListDto[] }> {
    const notas = await this.prisma.nota.findMany({
      where: { createdBy: userId },
      orderBy: { data: 'desc' },
    });

    const baseUrl = (process.env['MINIO_BASE_URL'] || 'http://localhost:9000').replace(/\/$/, '');

    return {
      data: notas.map((n) => ({
        id: n.id,
        nome: n.nome,
        data: n.data,
        tipo: n.tipo,
        path: `${baseUrl}${n.path}`,
        createdAt: n.createdAt,
      })),
    };
  }

  async getAportes(
    userId: number,
    filter?: ReportFiltersDto,
  ): Promise<PaginatedResult<RelatorioAporteDto>> {
    const { page = 1, limit = 20, ticker, dataInicio, dataFim } = filter || {
      page: 1,
      limit: 20,
    };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {
      createdBy: userId,
      tipoOperacao: OperationType.Proventos,
    };
    if (ticker) where['ticker'] = { contains: ticker };
    if (dataInicio || dataFim) {
      where['data'] = {};
      if (dataInicio) where['data']['gte'] = new Date(dataInicio);
      if (dataFim) where['data']['lte'] = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.operation.findMany({ where, skip, take, orderBy: { data: 'desc' } }),
      this.prisma.operation.count({ where }),
    ]);

    const aportes: RelatorioAporteDto[] = data.map((op) => {
      const d = new Date(op.data);
      return {
        id: op.id,
        data: op.data,
        mes: d.getMonth() + 1,
        ano: d.getFullYear(),
        valor: op.total,
        taxas: op.taxas ?? undefined,
        ativos: [
          {
            ticker: op.ticker,
            qtd: op.qtd || 0,
            precoUn: op.precoUn,
            total: op.total,
          },
        ],
      };
    });

    return { data: aportes, meta: calculatePaginationMeta(total, page, limit) };
  }

  async getVendas(
    userId: number,
    filter?: ReportFiltersDto,
  ): Promise<PaginatedResult<RelatorioVendaDto>> {
    const { page = 1, limit = 20, ticker, dataInicio, dataFim } = filter || {
      page: 1,
      limit: 20,
    };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {
      createdBy: userId,
      tipoOperacao: OperationType.Venda,
    };
    if (ticker) where['ticker'] = { contains: ticker };
    if (dataInicio || dataFim) {
      where['data'] = {};
      if (dataInicio) where['data']['gte'] = new Date(dataInicio);
      if (dataFim) where['data']['lte'] = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.operation.findMany({ where, skip, take, orderBy: { data: 'desc' } }),
      this.prisma.operation.count({ where }),
    ]);

    const vendas: RelatorioVendaDto[] = data.map((op) => ({
      id: op.id,
      ticker: op.ticker,
      data: op.data,
      qtd: op.qtd || 0,
      precoUn: op.precoUn,
      total: op.total,
      taxas: op.taxas ?? undefined,
      tipo: op.tipo ?? undefined,
    }));

    return { data: vendas, meta: calculatePaginationMeta(total, page, limit) };
  }

  async getAlugueis(
    userId: number,
    filter?: ReportFiltersDto,
  ): Promise<PaginatedResult<RelatorioAluguelDto>> {
    const { page = 1, limit = 20, ticker, dataInicio, dataFim } = filter || {
      page: 1,
      limit: 20,
    };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {
      createdBy: userId,
      tipoOperacao: 'Proventos',
    };
    if (ticker) where['ticker'] = { contains: ticker };
    if (dataInicio || dataFim) {
      where['data'] = {};
      if (dataInicio) where['data']['gte'] = new Date(dataInicio);
      if (dataFim) where['data']['lte'] = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.operation.findMany({ where, skip, take, orderBy: { data: 'desc' } }),
      this.prisma.operation.count({ where }),
    ]);

    const alugueis: RelatorioAluguelDto[] = data.map((op) => ({
      id: op.id,
      ticker: op.ticker,
      data: op.data,
      qtd: op.qtd || 0,
      precoUn: op.precoUn,
      total: op.total,
    }));

    return { data: alugueis, meta: calculatePaginationMeta(total, page, limit) };
  }

  async getProventos(
    userId: number,
    filter?: ReportFiltersDto,
  ): Promise<PaginatedResult<RelatorioProventoDto>> {
    const { page = 1, limit = 20, ticker, dataInicio, dataFim } = filter || {
      page: 1,
      limit: 20,
    };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {
      createdBy: userId,
      tipoOperacao: 'Proventos',
    };
    if (ticker) where['ticker'] = { contains: ticker };
    if (dataInicio || dataFim) {
      where['data'] = {};
      if (dataInicio) where['data']['gte'] = new Date(dataInicio);
      if (dataFim) where['data']['lte'] = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.operation.findMany({ where, skip, take, orderBy: { data: 'desc' } }),
      this.prisma.operation.count({ where }),
    ]);

    const proventos: RelatorioProventoDto[] = data.map((op) => ({
      id: op.id,
      ticker: op.ticker,
      data: op.data,
      tipo: op.tipoOperacao,
      qtd: op.qtd || 0,
      valorUn: op.precoUn,
      total: op.total,
    }));

    return { data: proventos, meta: calculatePaginationMeta(total, page, limit) };
  }

  async getPrecoMedio(userId: number, filter?: ReportFiltersDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, ticker } = filter || { page: 1, limit: 20 };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {
      asset: { createdBy: userId },
    };
    if (ticker) where['ticker'] = { contains: ticker };

    const [positions, total] = await Promise.all([
      this.prisma.portfolioPosition.findMany({
        where,
        skip,
        take,
        include: { asset: true },
        orderBy: { ticker: 'asc' },
      }),
      this.prisma.portfolioPosition.count({ where }),
    ]);

    const data = positions.map((p) => ({
      ticker: p.ticker,
      tipo: p.asset.tipo,
      qtd: p.qtd,
      precoMedio: p.precoMedio,
      custoTotal: p.custoTotal,
    }));

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getRendaFixa(
    userId: number,
    filter?: ReportFiltersDto,
  ): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, dataInicio, dataFim } = filter || {
      page: 1,
      limit: 20,
    };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = { createdBy: userId };
    if (dataInicio || dataFim) {
      where['createdAt'] = {};
      if (dataInicio) where['createdAt']['gte'] = new Date(dataInicio);
      if (dataFim) where['createdAt']['lte'] = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.fixedIncomePosition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fixedIncomePosition.count({ where }),
    ]);

    return { data, meta: calculatePaginationMeta(total, page, limit) };
  }
}
