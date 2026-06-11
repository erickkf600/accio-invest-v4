import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { OperationType } from '../generated/prisma/client';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { DividendResponseDto } from './dto/dividend-response.dto';
import { YieldResponseDto } from './dto/yield-response.dto';
import { CreateFixedIncomeDto } from './dto/create-fixed-income.dto';
import { UpdateFixedIncomeDto } from './dto/update-fixed-income.dto';
import { CreateFixedIncomeYieldDto } from './dto/create-fixed-income-yield.dto';
import { FixedIncomeYieldResponseDto } from './dto/fixed-income-yield-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { generateRandomString } from '../common/utils/file-generator.utils';
import { FI_ID_PREFIX, FI_YIELD_PREFIX } from '../common/constants';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getPositions(
    userId: number,
    filter?: PortfolioFilterDto,
  ): Promise<PaginatedResult<PositionResponseDto>> {
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

    const totalValor = positions.reduce((acc, p) => acc + p.custoTotal, 0);

    const data: PositionResponseDto[] = positions.map((p) => ({
      id: p.id,
      ticker: p.ticker,
      tipo: p.asset.tipo as PositionResponseDto['tipo'],
      qtd: p.qtd,
      precoMedio: p.precoMedio,
      custoTotal: p.custoTotal,
      precoAtual: 0,
      valorAtual: p.qtd * p.precoMedio,
      lucroPrejuizo: 0,
      lucroPrejuizoPct: 0,
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
      tipo: OperationType.Proventos,
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
        observacoes: dto.observacoes ?? null,
        createdBy: userId,
      },
    });
  }

  private resolveId(id: number): number {
    return id >= FI_ID_PREFIX ? id - FI_ID_PREFIX : id;
  }

  private resolveYieldId(id: number): number {
    return id >= FI_YIELD_PREFIX ? id - FI_YIELD_PREFIX : id;
  }

  async findFixedIncomeById(id: number, userId: number): Promise<YieldResponseDto> {
    const realId = this.resolveId(id);
    const existing = await this.prisma.fixedIncomePosition.findFirst({
      where: { id: realId, createdBy: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Fixed income position with id ${id} not found`);
    }

    return existing;
  }

  async updateFixedIncome(
    id: number,
    dto: UpdateFixedIncomeDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<YieldResponseDto> {
    const realId = this.resolveId(id);
    const existing = await this.prisma.fixedIncomePosition.findFirst({
      where: { id: realId, createdBy: userId },
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
    }

    if (dto.observacoes !== undefined) {
      updateData['observacoes'] = dto.observacoes;
    }

    return this.prisma.fixedIncomePosition.update({
      where: { id: realId },
      data: updateData,
    });
  }

  private validateYieldDate(
    dataOperacao: Date,
    parent: { dataCompra: Date; vencimento: Date | null; liquidezDiaria: boolean },
  ): void {
    if (dataOperacao < parent.dataCompra) {
      throw new BadRequestException(
        'A data da operação não pode ser anterior à data da compra.',
      );
    }

    if (!parent.liquidezDiaria && parent.vencimento && dataOperacao > parent.vencimento) {
      throw new BadRequestException(
        'A data da operação não pode ser posterior à data de vencimento.',
      );
    }
  }

  async createYield(
    dto: CreateFixedIncomeYieldDto,
    userId: number,
  ): Promise<FixedIncomeYieldResponseDto> {
    const parent = await this.prisma.fixedIncomePosition.findFirst({
      where: { emissor: dto.emissor, createdBy: userId },
    });

    if (!parent) {
      throw new BadRequestException(
        `Nenhuma posição de renda fixa encontrada para o emissor "${dto.emissor}". Crie uma compra primeiro.`,
      );
    }

    this.validateYieldDate(new Date(dto.dataOperacao), parent);

    return this.prisma.fixedIncomeYield.create({
      data: {
        fixedIncomeId: parent.id,
        emissor: dto.emissor,
        dataOperacao: new Date(dto.dataOperacao),
        valor: dto.valor,
        observacoes: dto.observacoes ?? null,
        createdBy: userId,
      },
    }) as unknown as FixedIncomeYieldResponseDto;
  }

  async findYieldById(id: number, userId: number): Promise<FixedIncomeYieldResponseDto> {
    const realId = this.resolveYieldId(id);
    const existing = await this.prisma.fixedIncomeYield.findFirst({
      where: { id: realId, createdBy: userId },
    });
    if (!existing) {
      throw new NotFoundException(`Rendimento de renda fixa com id ${id} não encontrado`);
    }
    return existing as unknown as FixedIncomeYieldResponseDto;
  }

  async updateYield(
    id: number,
    dto: Partial<CreateFixedIncomeYieldDto>,
    userId: number,
  ): Promise<FixedIncomeYieldResponseDto> {
    const realId = this.resolveYieldId(id);
    const existing = await this.prisma.fixedIncomeYield.findFirst({
      where: { id: realId, createdBy: userId },
    });
    if (!existing) {
      throw new NotFoundException(`Rendimento de renda fixa com id ${id} não encontrado`);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.dataOperacao) {
      const parent = await this.prisma.fixedIncomePosition.findFirst({
        where: { id: existing.fixedIncomeId, createdBy: userId },
      });
      if (parent) {
        this.validateYieldDate(new Date(dto.dataOperacao), parent);
      }
      updateData['dataOperacao'] = new Date(dto.dataOperacao);
    }
    if (dto.valor !== undefined) updateData['valor'] = dto.valor;
    if (dto.observacoes !== undefined) updateData['observacoes'] = dto.observacoes;

    return this.prisma.fixedIncomeYield.update({
      where: { id: realId },
      data: updateData,
    }) as unknown as FixedIncomeYieldResponseDto;
  }

  async removeYield(id: number, userId: number): Promise<void> {
    const realId = this.resolveYieldId(id);
    const existing = await this.prisma.fixedIncomeYield.findFirst({
      where: { id: realId, createdBy: userId },
    });
    if (!existing) {
      throw new NotFoundException(`Rendimento de renda fixa com id ${id} não encontrado`);
    }
    await this.prisma.fixedIncomeYield.delete({ where: { id: realId } });
  }

  async getEmissores(userId: number): Promise<string[]> {
    const result = await this.prisma.fixedIncomePosition.findMany({
      where: { createdBy: userId },
      select: { emissor: true },
      distinct: ['emissor'],
      orderBy: { emissor: 'asc' },
    });
    return result.map(r => r.emissor);
  }

  async removeFixedIncome(id: number, userId: number): Promise<void> {
    const realId = this.resolveId(id);
    const existing = await this.prisma.fixedIncomePosition.findFirst({
      where: { id: realId, createdBy: userId },
    });

    if (!existing) {
      throw new NotFoundException(`Fixed income position with id ${id} not found`);
    }

    await this.prisma.fixedIncomePosition.delete({ where: { id: realId } });
  }
}
