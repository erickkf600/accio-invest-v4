import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { DividendResponseDto } from './dto/dividend-response.dto';
import { YieldResponseDto } from './dto/yield-response.dto';
import { CreateFixedIncomeDto } from './dto/create-fixed-income.dto';
import { UpdateFixedIncomeDto } from './dto/update-fixed-income.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { generateRandomString } from '../common/utils/file-generator.utils';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getPositions(
    userId: number,
    filter?: PortfolioFilterDto,
  ): Promise<PaginatedResult<PositionResponseDto>> {
    const { page = 1, limit = 20, ticker } = filter || { page: 1, limit: 20 };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {};
    if (ticker) where['ticker'] = { contains: ticker };

    const operations = await this.prisma.operation.findMany({
      where: { createdBy: userId, ...where },
      include: { asset: true },
      orderBy: { ticker: 'asc' },
    });

    const grouped = new Map<
      string,
      { ticker: string; tipo: string; qtd: number; custoTotal: number; precoMedio: number }
    >();

    for (const op of operations) {
      const existing = grouped.get(op.ticker) || {
        ticker: op.ticker,
        tipo: op.asset.tipo,
        qtd: 0,
        custoTotal: 0,
        precoMedio: 0,
      };

      if (op.tipo === 'Compra') {
        existing.qtd += op.qtd || 0;
        existing.custoTotal += op.total;
      } else if (op.tipo === 'Venda') {
        existing.qtd -= op.qtd || 0;
        existing.custoTotal -= op.total;
      }

      if (existing.qtd > 0) {
        existing.precoMedio = existing.custoTotal / existing.qtd;
      }

      grouped.set(op.ticker, existing);
    }

    const positions = Array.from(grouped.values())
      .filter((p) => p.qtd > 0)
      .map((p) => ({
        id: 0,
        ticker: p.ticker,
        tipo: p.tipo as PositionResponseDto['tipo'],
        qtd: p.qtd,
        precoMedio: p.precoMedio,
        custoTotal: p.custoTotal,
        precoAtual: 0,
        valorAtual: 0,
        lucroPrejuizo: 0,
        lucroPrejuizoPct: 0,
        participacao: 0,
      }));

    const total = positions.length;
    const paginatedData = positions.slice(skip, skip + take);

    const totalValor = paginatedData.reduce((acc, p) => acc + p.custoTotal, 0);

    const data = paginatedData.map((p) => ({
      ...p,
      valorAtual: p.qtd * p.precoMedio,
      participacao: totalValor > 0 ? (p.custoTotal / totalValor) * 100 : 0,
    }));

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getDividends(
    userId: number,
    filter?: PortfolioFilterDto,
  ): Promise<PaginatedResult<DividendResponseDto>> {
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
      this.prisma.operation.findMany({
        where,
        skip,
        take,
        orderBy: { data: 'desc' },
      }),
      this.prisma.operation.count({ where }),
    ]);

    const dividends: DividendResponseDto[] = data.map((op) => ({
      id: op.id,
      data: op.data,
      ticker: op.ticker,
      tipo: op.tipo,
      qtd: op.qtd || 0,
      valorUn: op.precoUn,
      total: op.total,
      status: 'Recebido',
    }));

    return {
      data: dividends,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getYields(
    userId: number,
    filter?: PortfolioFilterDto,
  ): Promise<PaginatedResult<YieldResponseDto>> {
    const { page = 1, limit = 20, ticker } = filter || { page: 1, limit: 20 };
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = { createdBy: userId };
    if (ticker) where['ticker'] = { contains: ticker };

    const [data, total] = await Promise.all([
      this.prisma.fixedIncomePosition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fixedIncomePosition.count({ where }),
    ]);

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async createFixedIncome(
    dto: CreateFixedIncomeDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<YieldResponseDto> {
    let notaPath: string | undefined;
    let notaNome: string | undefined;

    if (arquivo) {
      notaPath = generateRandomString();
      notaNome = arquivo.originalname;
    } else if (dto.nota) {
      notaPath = generateRandomString();
      notaNome = dto.nota;
    }

    return this.prisma.fixedIncomePosition.create({
      data: {
        emissor: dto.emissor,
        tipo: dto.tipo,
        indexador: dto.indexador,
        taxaJuros: dto.taxaJuros,
        liquidezDiaria: dto.liquidezDiaria,
        possuiImposto: dto.possuiImposto,
        valorAplicado: dto.valorAplicado,
        dataCompra: new Date(dto.dataCompra),
        vencimento: dto.vencimento ? new Date(dto.vencimento) : null,
        notaPath,
        notaNome,
        createdBy: userId,
      },
    });
  }

  async updateFixedIncome(
    id: number,
    dto: UpdateFixedIncomeDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<YieldResponseDto> {
    const existing = await this.prisma.fixedIncomePosition.findFirst({
      where: { id, createdBy: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Fixed income position with id ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.emissor) updateData['emissor'] = dto.emissor;
    if (dto.tipo) updateData['tipo'] = dto.tipo;
    if (dto.indexador) updateData['indexador'] = dto.indexador;
    if (dto.taxaJuros !== undefined) updateData['taxaJuros'] = dto.taxaJuros;
    if (dto.liquidezDiaria !== undefined) updateData['liquidezDiaria'] = dto.liquidezDiaria;
    if (dto.possuiImposto !== undefined) updateData['possuiImposto'] = dto.possuiImposto;
    if (dto.valorAplicado !== undefined) updateData['valorAplicado'] = dto.valorAplicado;
    if (dto.dataCompra) updateData['dataCompra'] = new Date(dto.dataCompra);
    if (dto.vencimento) updateData['vencimento'] = new Date(dto.vencimento);

    if (arquivo) {
      updateData['notaPath'] = generateRandomString();
      updateData['notaNome'] = arquivo.originalname;
    } else if (dto.nota) {
      updateData['notaPath'] = generateRandomString();
      updateData['notaNome'] = dto.nota;
    }

    return this.prisma.fixedIncomePosition.update({
      where: { id },
      data: updateData,
    });
  }
}
