import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { OperationType } from '../generated/prisma/client';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { RelatorioAporteDto } from './dto/report-aporte.dto';
import { RelatorioVendaDto } from './dto/report-venda.dto';
import { RelatorioAluguelDto } from './dto/report-aluguel.dto';
import { RelatorioProventoDto } from './dto/report-proventos.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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
      tipo: OperationType.Proventos,
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
      tipo: OperationType.Venda,
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
      resultado: op.lucroRealizado ?? undefined,
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
      tipo: 'Proventos',
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
      tipo: 'Proventos',
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
      tipo: op.tipo,
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
