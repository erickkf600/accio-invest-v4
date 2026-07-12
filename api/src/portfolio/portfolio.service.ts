import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { MinioService } from '../integrations/minio/minio.service';
import { PythonApiService } from '../integrations/python-api/python-api.service';
import { OperationType, NotaTipo } from '../generated/prisma/client';
import { buildFileName, generateObjectKey } from '../common/utils/file-generator.utils';
import { PortfolioFilterDto } from './dto/portfolio-filter.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { ClassSummaryItemDto } from './dto/class-summary-response.dto';
import { DividendResponseDto } from './dto/dividend-response.dto';
import { YieldResponseDto } from './dto/yield-response.dto';
import { PortfolioSummaryResponseDto } from './dto/portfolio-summary-response.dto';
import { CreateFixedIncomeDto } from './dto/create-fixed-income.dto';
import { UpdateFixedIncomeDto } from './dto/update-fixed-income.dto';
import { CreateFixedIncomeYieldDto } from './dto/create-fixed-income-yield.dto';
import { FixedIncomeYieldResponseDto } from './dto/fixed-income-yield-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { FI_ID_PREFIX, FI_YIELD_PREFIX } from '../common/constants';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private pythonApi: PythonApiService,
  ) {}

  private async uploadAndCreateNota(
    arquivo: Express.Multer.File,
    userId: number,
    tipo: NotaTipo,
    nome?: string,
  ): Promise<number> {
    const objectName = generateObjectKey(userId, arquivo.originalname, nome);
    const url = await this.minioService.uploadFile(objectName, arquivo.buffer, arquivo.mimetype);

    const nota = await this.prisma.nota.create({
      data: {
        nome: buildFileName(arquivo.originalname, nome),
        data: new Date(),
        tipo,
        path: url,
        createdBy: userId,
      },
    });

    return nota.id;
  }

  private async updateNotaForEntity(
    arquivo: Express.Multer.File,
    userId: number,
    entity: { fileId?: number | null },
    tipo: NotaTipo,
    nome?: string,
  ): Promise<number> {
    if (entity.fileId) {
      const oldNota = await this.prisma.nota.findUnique({
        where: { id: entity.fileId },
      });
      if (oldNota) {
        const objectName = this.minioService.extractObjectName(oldNota.path);
        await this.minioService.deleteFile(objectName);
      }
    }
    return this.uploadAndCreateNota(arquivo, userId, tipo, nome);
  }

  async getPositions(
    userId: number,
    filter?: PortfolioFilterDto,
  ): Promise<PaginatedResult<PositionResponseDto>> {
    const { page = 1, limit = 20, ticker } = filter || { page: 1, limit: 20 };
    const { skip, take } = getPaginationParams(page, limit);

    const portfolioWhere: Record<string, unknown> = { userId };
    const fiWhere: Record<string, unknown> = { createdBy: userId };

    if (ticker) {
      portfolioWhere['ticker'] = { contains: ticker };
      fiWhere['emissor'] = { contains: ticker };
    }

    const [portfolioPositions, fiPositions] = await Promise.all([
      this.prisma.portfolioPosition.findMany({
        where: portfolioWhere,
        include: { asset: true },
        orderBy: { ticker: 'asc' },
      }),
      this.prisma.fixedIncomePosition.findMany({
        where: fiWhere,
        orderBy: { emissor: 'asc' },
      }),
    ]);

    const tickers = portfolioPositions.map((p) => p.ticker);
    let quoteMap = new Map<string, number>();
    if (tickers.length > 0) {
      try {
        const quotes = await this.pythonApi.getQuotes(tickers);
        quoteMap = new Map(quotes.map((q) => [q.ticker, q.precoAtual]));
      } catch (err) {
        this.logger.warn(`Failed to fetch quotes: ${(err as Error).message}`);
      }
    }

    const allPositions: PositionResponseDto[] = [
      ...portfolioPositions.map((p) => {
        const precoAtual = quoteMap.get(p.ticker) ?? p.precoMedio;
        const valorAtual = p.qtd * precoAtual;
        const lucroPrejuizo = valorAtual - p.custoTotal;
        const lucroPrejuizoPct = p.custoTotal > 0 ? (lucroPrejuizo / p.custoTotal) * 100 : 0;
        return {
          id: p.id,
          ticker: p.ticker,
          tipo: p.asset.tipo as unknown as PositionResponseDto['tipo'],
          qtd: p.qtd,
          precoMedio: p.precoMedio,
          custoTotal: p.custoTotal,
          precoAtual,
          valorAtual,
          lucroPrejuizo,
          lucroPrejuizoPct,
          participacao: 0,
        };
      }),
      ...fiPositions.map((p) => ({
        id: p.id + FI_ID_PREFIX,
        ticker: p.emissor,
        tipo: 'RF' as unknown as PositionResponseDto['tipo'],
        qtd: 1,
        precoMedio: p.valorAplicado,
        custoTotal: p.valorAplicado,
        precoAtual: p.valorAplicado,
        valorAtual: p.valorAplicado,
        lucroPrejuizo: 0,
        lucroPrejuizoPct: 0,
        participacao: 0,
      })),
    ];

    allPositions.sort((a, b) => a.ticker.localeCompare(b.ticker));
    const total = allPositions.length;
    const totalValor = allPositions.reduce((acc, p) => acc + p.custoTotal, 0);

    const data = allPositions.slice(skip, skip + take).map((p) => ({
      ...p,
      participacao: totalValor > 0 ? (p.custoTotal / totalValor) * 100 : 0,
    }));

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getClassSummary(userId: number): Promise<ClassSummaryItemDto[]> {
    const [portfolioPositions, fiPositions] = await Promise.all([
      this.prisma.portfolioPosition.findMany({
        where: { userId },
        include: { asset: true },
      }),
      this.prisma.fixedIncomePosition.findMany({
        where: { createdBy: userId },
      }),
    ]);

    const tickers = portfolioPositions.map((p) => p.ticker);
    let precoMap = new Map<string, number>();
    let histMap = new Map<string, { preco30d: number; preco12m: number }>();

    if (tickers.length > 0) {
      try {
        const now = new Date();
        const data30d = new Date(now);
        data30d.setDate(data30d.getDate() - 30);
        const data12m = new Date(now);
        data12m.setFullYear(data12m.getFullYear() - 1);
        const data30dStr = data30d.toISOString().split('T')[0];
        const data12mStr = data12m.toISOString().split('T')[0];

        const [quotes, history] = await Promise.all([
          this.pythonApi.getQuotes(tickers),
          this.pythonApi.fetchHistory(tickers, data12mStr, now.toISOString().split('T')[0]),
        ]);

        precoMap = new Map(quotes.map((q) => [q.ticker, q.precoAtual]));

        for (const h of history) {
          const sorted = [...h.valores].reverse();
          let preco30d = 0;
          let preco12m = 0;
          for (const v of sorted) {
            const d = new Date(v.data);
            if (!preco12m && d >= data30d) preco30d = parseFloat(v.valor);
            if (!preco12m && d >= data12m) preco12m = parseFloat(v.valor);
            if (preco30d && preco12m) break;
          }
          histMap.set(h.ticker, {
            preco30d: preco30d || 0,
            preco12m: preco12m || 0,
          });
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch quotes/history: ${(err as Error).message}`);
      }
    }

    const allPositions: {
      tipo: string;
      qtd: number;
      custoTotal: number;
      valorAtual: number;
      rent30d: number;
      rent12m: number;
      lucroPrejuizoPct: number;
    }[] = [
      ...portfolioPositions.map((p) => {
        const precoAtual = precoMap.get(p.ticker) ?? p.precoMedio;
        const valorAtual = p.qtd * precoAtual;
        const lucroPrejuizo = valorAtual - p.custoTotal;
        const lucroPrejuizoPct = p.custoTotal > 0 ? (lucroPrejuizo / p.custoTotal) * 100 : 0;
        const hist = histMap.get(p.ticker);
        const preco30d = hist?.preco30d ?? p.precoMedio;
        const preco12m = hist?.preco12m ?? p.precoMedio;
        return {
          tipo: p.asset.tipo,
          qtd: p.qtd,
          custoTotal: p.custoTotal,
          valorAtual,
          rent30d: preco30d > 0 ? ((precoAtual / preco30d) - 1) * 100 : 0,
          rent12m: preco12m > 0 ? ((precoAtual / preco12m) - 1) * 100 : 0,
          lucroPrejuizoPct,
        };
      }),
      ...fiPositions.map((p) => ({
        tipo: 'RF',
        qtd: 1,
        custoTotal: p.valorAplicado,
        valorAtual: p.valorAplicado,
        rent30d: 0,
        rent12m: 0,
        lucroPrejuizoPct: 0,
      })),
    ];

    const groups = new Map<string, {
      tipo: string;
      qtd: number;
      saldoPM: number;
      saldoCotacao: number;
      rent30dW: number;
      rent12mW: number;
      rentHistW: number;
      weight30: number;
      weight12: number;
      weightHist: number;
    }>();

    for (const p of allPositions) {
      const g = groups.get(p.tipo) ?? {
        tipo: p.tipo,
        qtd: 0,
        saldoPM: 0,
        saldoCotacao: 0,
        rent30dW: 0,
        rent12mW: 0,
        rentHistW: 0,
        weight30: 0,
        weight12: 0,
        weightHist: 0,
      };
      g.qtd += p.qtd;
      g.saldoPM += p.custoTotal;
      g.saldoCotacao += p.valorAtual;
      g.rent30dW += p.rent30d * p.valorAtual;
      g.rent12mW += p.rent12m * p.valorAtual;
      g.rentHistW += p.lucroPrejuizoPct * p.custoTotal;
      g.weight30 += p.valorAtual;
      g.weight12 += p.valorAtual;
      g.weightHist += p.custoTotal;
      groups.set(p.tipo, g);
    }

    return Array.from(groups.entries()).map(([, g]) => ({
      tipo: g.tipo,
      qtd: g.qtd,
      saldoPM: g.saldoPM,
      saldoCotacao: g.saldoCotacao,
      rent30d: g.weight30 > 0 ? g.rent30dW / g.weight30 : 0,
      rent12m: g.weight12 > 0 ? g.rent12mW / g.weight12 : 0,
      rentHistorica: g.weightHist > 0 ? g.rentHistW / g.weightHist : 0,
    }));
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
      tipo: op.tipoOperacao,
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
    let fileId: number | undefined;

    if (arquivo) {
      fileId = await this.uploadAndCreateNota(
        arquivo,
        userId,
        NotaTipo.RF,
        dto.nota,
      );
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
        fileId,
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
      updateData['fileId'] = await this.updateNotaForEntity(
        arquivo,
        userId,
        existing,
        NotaTipo.RF,
        dto.nota,
      );
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

  async getSummary(userId: number): Promise<PortfolioSummaryResponseDto> {
    const [
      portfolioAgg,
      fiPosAgg,
      fiYieldsAgg,
      proventosAgg,
      positions,
    ] = await Promise.all([
      this.prisma.portfolioPosition.aggregate({
        where: { userId },
        _sum: { custoTotal: true },
      }),
      this.prisma.fixedIncomePosition.aggregate({
        where: { createdBy: userId },
        _sum: { valorAplicado: true },
      }),
      this.prisma.fixedIncomeYield.aggregate({
        where: { createdBy: userId },
        _sum: { valor: true },
      }),
      this.prisma.operation.aggregate({
        where: { createdBy: userId, tipoOperacao: OperationType.Proventos },
        _sum: { total: true },
      }),
      this.prisma.portfolioPosition.findMany({
        where: { userId },
        select: { precoMedio: true, qtd: true },
      }),
    ]);

    const patrimonio =
      (portfolioAgg._sum.custoTotal ?? 0) +
      (fiPosAgg._sum.valorAplicado ?? 0) +
      (fiYieldsAgg._sum.valor ?? 0) +
      (proventosAgg._sum.total ?? 0);

    const saldoMedio = positions.reduce(
      (acc, p) => acc + p.precoMedio * p.qtd,
      0,
    );

    const totalRendimento =
      (proventosAgg._sum.total ?? 0) + (fiYieldsAgg._sum.valor ?? 0);

    return { patrimonio, saldoMedio, totalRendimento };
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
