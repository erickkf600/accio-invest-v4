import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { MinioService } from '../integrations/minio/minio.service';
import { PositionSyncService } from '../portfolio/position-sync.service';
import { PythonApiService } from '../integrations/python-api/python-api.service';
import { AssetType, OperationType, NotaTipo, TipoValor } from '../generated/prisma/client';
import { buildFileName, generateObjectKey } from '../common/utils/file-generator.utils';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { ListOperationsDto } from './dto/list-operations.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { DividendStatusResponseDto } from './dto/dividend-status-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { FI_ID_PREFIX, FI_YIELD_PREFIX } from '../common/constants';

function isFIPrefixedId(id: number): boolean {
  return id >= FI_ID_PREFIX && id < FI_YIELD_PREFIX;
}

function isYieldPrefixedId(id: number): boolean {
  return id >= FI_YIELD_PREFIX;
}

function toFiDto(fi: Record<string, any>): OperationResponseDto {
  return {
    id: fi.id + FI_ID_PREFIX,
    assetId: fi.assetId ?? 0,
    ticker: fi.emissor,
    tipoOperacao: 'Renda Fixa',
    data: fi.dataCompra,
    qtd: null,
    precoUn: fi.valorAplicado,
    taxas: 0,
    total: fi.valorAplicado,
    tipo: undefined,
    fileId: fi.fileId,
    observacoes: fi.observacoes,
    vencimento: fi.vencimento ?? undefined,
    createdAt: fi.createdAt,
    updatedAt: fi.updatedAt,
  };
}

function toYieldDto(y: Record<string, any>): OperationResponseDto {
  return {
    id: y.id + FI_YIELD_PREFIX,
    assetId: 0,
    ticker: y.emissor,
    tipoOperacao: 'Renda Fixa - Rendimento',
    data: y.dataOperacao,
    qtd: null,
    precoUn: y.valor,
    taxas: 0,
    total: y.valor,
    tipo: undefined,
    fileId: undefined,
    observacoes: y.observacoes,
    vencimento: undefined,
    createdAt: y.createdAt,
    updatedAt: y.updatedAt,
  };
}

@Injectable()
export class OperationsService {
  constructor(
    private prisma: PrismaService,
    private positionSync: PositionSyncService,
    private minioService: MinioService,
    private pythonApiService: PythonApiService,
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

  async list(
    dto: ListOperationsDto,
    userId?: number,
  ): Promise<PaginatedResult<OperationResponseDto>> {
    const { page = 1, limit = 20, ticker, tipoOperacao, dataInicio, dataFim } = dto;
    const { skip, take } = getPaginationParams(page, limit);

    const includeFi = !tipoOperacao || tipoOperacao === 'Renda Fixa' || tipoOperacao === 'Renda Fixa - Rendimento';
    const includeOp = !tipoOperacao || (tipoOperacao !== 'Renda Fixa' && tipoOperacao !== 'Rendimento');

    const opWhere: Record<string, unknown> = {};
    if (userId) opWhere['createdBy'] = userId;
    if (ticker) opWhere['ticker'] = { contains: ticker };
    if (tipoOperacao && includeOp) opWhere['tipoOperacao'] = tipoOperacao;
    if (dataInicio || dataFim) {
      opWhere['data'] = {};
      if (dataInicio) opWhere['data']['gte'] = new Date(dataInicio);
      if (dataFim) opWhere['data']['lte'] = new Date(dataFim);
    }

    const fiWhere: Record<string, unknown> = {};
    if (userId) fiWhere['createdBy'] = userId;
    if (ticker) fiWhere['emissor'] = { contains: ticker };
    if (dataInicio || dataFim) {
      fiWhere['dataCompra'] = {};
      if (dataInicio) fiWhere['dataCompra']['gte'] = new Date(dataInicio);
      if (dataFim) fiWhere['dataCompra']['lte'] = new Date(dataFim);
    }

    const yieldWhere: Record<string, unknown> = {};
    if (userId) yieldWhere['createdBy'] = userId;
    if (ticker) yieldWhere['emissor'] = { contains: ticker };
    if (dataInicio || dataFim) {
      yieldWhere['dataOperacao'] = {};
      if (dataInicio) yieldWhere['dataOperacao']['gte'] = new Date(dataInicio);
      if (dataFim) yieldWhere['dataOperacao']['lte'] = new Date(dataFim);
    }

    const mergeTake = skip + take;

    let total = 0;
    let all: OperationResponseDto[] = [];

    if (includeOp) {
      const [ops, opCount] = await Promise.all([
        this.prisma.operation.findMany({
          where: opWhere,
          take: mergeTake,
          orderBy: { data: 'desc' },
        }),
        this.prisma.operation.count({ where: opWhere }),
      ]);
      all = ops as unknown as OperationResponseDto[];
      total += opCount;
    }

    if (includeFi) {
      const [fi, fiCount] = await Promise.all([
        this.prisma.fixedIncomePosition.findMany({
          where: fiWhere,
          take: mergeTake,
          orderBy: { dataCompra: 'desc' },
        }),
        this.prisma.fixedIncomePosition.count({ where: fiWhere }),
      ]);
      const fiDtos = fi.map(toFiDto);

      const [yields, yieldCount] = await Promise.all([
        this.prisma.fixedIncomeYield.findMany({
          where: yieldWhere,
          take: mergeTake,
          orderBy: { dataOperacao: 'desc' },
        }),
        this.prisma.fixedIncomeYield.count({ where: yieldWhere }),
      ]);
      const yieldDtos = yields.map(toYieldDto);

      all = [...all, ...fiDtos, ...yieldDtos];
      total += fiCount + yieldCount;
    }

    all.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );

    const paginated = all.slice(skip, skip + take);

    return {
      data: paginated,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async create(
    dto: CreateOperationDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto> {
    let asset = await this.prisma.asset.findFirst({
      where: { ticker: dto.ticker, createdBy: userId },
    });

    if (!asset) {
          if (dto.tipoOperacao === OperationType.Compra) {
        const tipo = this.inferAssetType(dto.ticker);
        asset = await this.prisma.asset.create({
          data: { ticker: dto.ticker, tipo, createdBy: userId },
        });
      } else {
        throw new BadRequestException(
          `Asset with ticker ${dto.ticker} not found. Create the asset first.`,
        );
      }
    }

    let fileId: number | undefined;

    if (arquivo) {
      fileId = await this.uploadAndCreateNota(
        arquivo,
        userId,
        NotaTipo.V_RV,
        dto.nota,
      );
    }

    const operation = await this.prisma.operation.create({
      data: {
        assetId: asset.id,
        ticker: dto.ticker,
        tipoOperacao: dto.tipoOperacao as any,
        data: new Date(dto.data),
        qtd: dto.qtd,
        precoUn: dto.precoUn,
        taxas: dto.taxas ?? 0,
        total: dto.total,
        tipo: dto.tipo,
        fileId,
        observacoes: dto.observacoes ?? null,
        createdBy: userId,
      },
    });

    if (dto.tipoOperacao === OperationType.Compra || dto.tipoOperacao === OperationType.Venda) {
      await this.positionSync.syncPosition(dto.ticker, userId);
    }

    return operation as unknown as OperationResponseDto;
  }

  async createBatch(
    dtoList: CreateOperationDto[],
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto[]> {
    let fileId: number | undefined;

    if (arquivo) {
      fileId = await this.uploadAndCreateNota(
        arquivo,
        userId,
        NotaTipo.V_RV,
      );
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const ops: OperationResponseDto[] = [];

      for (const dto of dtoList) {
        let asset = await tx.asset.findFirst({
          where: { ticker: dto.ticker, createdBy: userId },
        });

        if (!asset) {
      if (dto.tipoOperacao === OperationType.Compra) {
            const tipo = this.inferAssetType(dto.ticker);
            asset = await tx.asset.create({
              data: { ticker: dto.ticker, tipo, createdBy: userId },
            });
          } else {
            throw new BadRequestException(
              `Asset with ticker ${dto.ticker} not found. Create the asset first.`,
            );
          }
        }

        if (dto.tipoOperacao === OperationType.Proventos) {
          const inputDate = new Date(dto.data);
          const startOfDay = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate(), 0, 0, 0));
          const endOfDay = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate() + 1, 0, 0, 0));

          const existing = await tx.operation.findFirst({
            where: {
              ticker: dto.ticker,
              precoUn: dto.precoUn,
              data: { gte: startOfDay, lt: endOfDay },
              tipoOperacao: OperationType.Proventos,
              createdBy: userId,
            },
          });

          if (existing) {
            throw new BadRequestException(
              `Provento já cadastrado para ${dto.ticker} no dia ${dto.data} com valor unitário R$ ${dto.precoUn}.`,
            );
          }
        }

        const operation = await tx.operation.create({
          data: {
            assetId: asset.id,
            ticker: dto.ticker,
            tipoOperacao: dto.tipoOperacao as any,
            data: new Date(dto.data),
            qtd: dto.qtd,
            precoUn: dto.precoUn,
            taxas: dto.taxas ?? 0,
            total: dto.total,
            tipo: dto.tipo,
            fileId,
            observacoes: dto.observacoes ?? null,
            createdBy: userId,
          },
        });

        ops.push(operation as unknown as OperationResponseDto);
      }

      return ops;
    });

    const tickersToSync = new Set<string>();
    for (const dto of dtoList) {
      if (dto.tipoOperacao === OperationType.Compra || dto.tipoOperacao === OperationType.Venda) {
        tickersToSync.add(dto.ticker);
      }
    }
    await Promise.all(
      Array.from(tickersToSync).map((ticker) =>
        this.positionSync.syncPosition(ticker, userId),
      ),
    );

    return results;
  }

  private inferAssetType(ticker: string): AssetType {
    const upper = ticker.toUpperCase();
    if (upper.endsWith('11')) return AssetType.FII;
    if (upper.endsWith('34') || upper.endsWith('35') || upper.endsWith('39')) return AssetType.BDR;
    if (['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE', 'XRP', 'USDT', 'USDC'].includes(upper)) {
      return AssetType.CRIPTO;
    }
    return AssetType.ACOES;
  }

  async findById(id: number, userId?: number): Promise<OperationResponseDto> {
    if (isFIPrefixedId(id)) {
      const realId = id - FI_ID_PREFIX;
      const fi = await this.prisma.fixedIncomePosition.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!fi) {
        throw new NotFoundException(`Fixed income position with id ${id} not found`);
      }
      return toFiDto(fi as any);
    }

    if (isYieldPrefixedId(id)) {
      const realId = id - FI_YIELD_PREFIX;
      const y = await this.prisma.fixedIncomeYield.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!y) {
        throw new NotFoundException(`Fixed income yield with id ${id} not found`);
      }
      return toYieldDto(y as any);
    }

    const where: Record<string, unknown> = { id };
    if (userId) where['createdBy'] = userId;

    const operation = await this.prisma.operation.findFirst({ where });
    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }
    return operation as unknown as OperationResponseDto;
  }

  async update(
    id: number,
    dto: UpdateOperationDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto> {
    if (isFIPrefixedId(id)) {
      const realId = id - FI_ID_PREFIX;
      const existing = await this.prisma.fixedIncomePosition.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!existing) {
        throw new NotFoundException(`Fixed income position with id ${id} not found`);
      }

      const updateData: Record<string, unknown> = {};
      if (dto.ticker) updateData['emissor'] = dto.ticker;
      if (dto.data) updateData['dataCompra'] = new Date(dto.data);
      if (dto.precoUn !== undefined) updateData['valorAplicado'] = dto.precoUn;
      if (dto.total !== undefined) updateData['valorAplicado'] = dto.total;
      if (dto.observacoes !== undefined) updateData['observacoes'] = dto.observacoes;

      if (arquivo) {
        updateData['fileId'] = await this.updateNotaForEntity(
          arquivo,
          userId,
          existing,
          NotaTipo.RF,
          dto.nota,
        );
      }

      const updated = await this.prisma.fixedIncomePosition.update({
        where: { id: realId },
        data: updateData,
      });
      return toFiDto(updated as any);
    }

    if (isYieldPrefixedId(id)) {
      const realId = id - FI_YIELD_PREFIX;
      const existing = await this.prisma.fixedIncomeYield.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!existing) {
        throw new NotFoundException(`Fixed income yield with id ${id} not found`);
      }

      const updateData: Record<string, unknown> = {};
      if (dto.data) updateData['dataOperacao'] = new Date(dto.data);
      if (dto.precoUn !== undefined) updateData['valor'] = dto.precoUn;
      if (dto.total !== undefined) updateData['valor'] = dto.total;
      if (dto.observacoes !== undefined) updateData['observacoes'] = dto.observacoes;

      const updated = await this.prisma.fixedIncomeYield.update({
        where: { id: realId },
        data: updateData,
      });
      return toYieldDto(updated as any);
    }

    const oldOp = await this.findById(id, userId);
    const oldTicker = oldOp.ticker;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nota, ...rest } = dto;
    const updateData: Record<string, unknown> = { ...rest };
    if (dto.data) updateData['data'] = new Date(dto.data);

    if (arquivo) {
      const oldOpFull = await this.prisma.operation.findFirst({
        where: { id },
      });
      updateData['fileId'] = await this.updateNotaForEntity(
        arquivo,
        userId,
        { fileId: oldOpFull?.fileId },
        NotaTipo.V_RV,
        dto.nota,
      );
    }

    if (dto.observacoes !== undefined) {
      updateData['observacoes'] = dto.observacoes;
    }

    const newTicker = dto.ticker ?? oldTicker;

    if (dto.ticker) {
      let asset = await this.prisma.asset.findFirst({
        where: { ticker: dto.ticker, createdBy: userId },
      });
      if (!asset) {
        const tipo = this.inferAssetType(dto.ticker);
        asset = await this.prisma.asset.create({
          data: { ticker: dto.ticker, tipo, createdBy: userId },
        });
      }
      updateData['assetId'] = asset.id;
    }

    const updated = await this.prisma.operation.update({
      where: { id },
      data: updateData,
    }) as unknown as OperationResponseDto;

    const tipo = dto.tipoOperacao ?? oldOp.tipoOperacao;
    if (tipo === OperationType.Compra || tipo === OperationType.Venda) {
      const tickersToSync = new Set<string>([oldTicker, newTicker]);
      await Promise.all(
        Array.from(tickersToSync).map((t) =>
          this.positionSync.syncPosition(t, userId),
        ),
      );

      if (oldTicker !== newTicker) {
        await this.cleanupOrphanAsset(oldTicker, userId);
      }
    }

    return updated;
  }

  async remove(id: number, userId?: number): Promise<void> {
    if (isFIPrefixedId(id)) {
      const realId = id - FI_ID_PREFIX;
      const existing = await this.prisma.fixedIncomePosition.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!existing) {
        throw new NotFoundException(`Fixed income position with id ${id} not found`);
      }
      await this.prisma.fixedIncomePosition.delete({ where: { id: realId } });
      return;
    }

    if (isYieldPrefixedId(id)) {
      const realId = id - FI_YIELD_PREFIX;
      const existing = await this.prisma.fixedIncomeYield.findFirst({
        where: { id: realId, createdBy: userId },
      });
      if (!existing) {
        throw new NotFoundException(`Fixed income yield with id ${id} not found`);
      }
      await this.prisma.fixedIncomeYield.delete({ where: { id: realId } });
      return;
    }

    const operation = await this.findById(id, userId);
    const ticker = operation.ticker;
    const tipo = operation.tipoOperacao;
    const fileId = operation.fileId;

    if (fileId) {
      const nota = await this.prisma.nota.findUnique({ where: { id: fileId } });
      if (nota) {
        await this.minioService.deleteFile(this.minioService.extractObjectName(nota.path));
        await this.prisma.nota.delete({ where: { id: fileId } });
      }
    }

    await this.prisma.operation.delete({ where: { id } });

    if (tipo === OperationType.Compra || tipo === OperationType.Venda) {
      await this.positionSync.syncPosition(ticker, userId);
      await this.cleanupOrphanAsset(ticker, userId);
    }
  }

  private async cleanupOrphanAsset(ticker: string, userId: number): Promise<void> {
    const count = await this.prisma.operation.count({
      where: { ticker, createdBy: userId },
    });

    if (count === 0) {
      await this.prisma.asset.deleteMany({
        where: { ticker, createdBy: userId },
      });
    }
  }

  private parseStartMonthYear(dateStr: string): string {
    const parts = dateStr.split(/[/\-]/).map(Number);
    const month = parts[0];
    const year = parts[1];
    const d = new Date(year, month - 1, 1);
    return d.toISOString().split('T')[0];
  }

  private parseEndMonthYear(dateStr: string): string {
    const parts = dateStr.split(/[/\-]/).map(Number);
    const month = parts[0];
    const year = parts[1];
    const d = new Date(year, month, 0);
    return d.toISOString().split('T')[0];
  }

  async listPendingDividends(
    start: string,
    end: string,
    userId: number,
  ): Promise<DividendStatusResponseDto[]> {
    const dataInicio = this.parseStartMonthYear(start);
    const dataFim = this.parseEndMonthYear(end);

    const assets = await this.prisma.asset.findMany({
      where: {
        createdBy: userId,
        tipo: { in: [AssetType.FII, AssetType.ACOES] },
      },
    });

    if (assets.length === 0) return [];

    const papeisTipos = assets.map((a) => ({
      papel: a.ticker,
      tipo: a.tipo === AssetType.FII ? 1 : 2,
    }));

    const proventosResponse = await this.pythonApiService.fetchProventos({
      papeis_tipos: papeisTipos,
      dataInicio,
      dataFim,
    });

    const results: DividendStatusResponseDto[] = [];

    for (const item of proventosResponse) {
      for (const provento of item.proventos) {
        const { value, payment_date, date_com } = provento;

        const [day, month, year] = payment_date.split('/').map(Number);
        const paymentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

        const qtdAtDateCom = await this.calculateQtdAtDate(
          item.ticker,
          paymentDate,
          userId,
        );

        if (qtdAtDateCom <= 0) continue;

        const existing = await this.prisma.operation.findFirst({
          where: {
            ticker: item.ticker,
            precoUn: value,
            data: {
              gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
              lt: new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0)),
            },
            tipoOperacao: OperationType.Proventos,
            createdBy: userId,
          },
        });

        if (existing) continue;

        const assetTipo = papeisTipos.find(
          (p) => p.papel === item.ticker,
        )?.tipo;

        results.push({
          ticker: item.ticker,
          dataCom: date_com,
          dataPagamento: payment_date,
          valor: value,
          tipo: assetTipo === 1 ? 'FII' : 'ACOES',
          quantidadeCarteira: qtdAtDateCom,
          status: 'no_registered',
        });
      }
    }

    return results;
  }

  async listAllDividendsByYear(
    year: string,
    userId: number,
  ): Promise<DividendStatusResponseDto[]> {
    const dataInicio = `${year}-01-01`;
    const dataFim = `${year}-12-31`;

    const assets = await this.prisma.asset.findMany({
      where: {
        createdBy: userId,
        tipo: { in: [AssetType.FII, AssetType.ACOES] },
      },
    });

    if (assets.length === 0) return [];

    const papeisTipos = assets.map((a) => ({
      papel: a.ticker,
      tipo: a.tipo === AssetType.FII ? 1 : 2,
    }));

    const proventosResponse = await this.pythonApiService.fetchProventos({
      papeis_tipos: papeisTipos,
      dataInicio,
      dataFim,
    });

    const results: DividendStatusResponseDto[] = [];

    for (const item of proventosResponse) {
      for (const provento of item.proventos) {
        const { value, payment_date, date_com } = provento;

        const [day, month, yearNum] = payment_date.split('/').map(Number);
        const paymentDate = new Date(Date.UTC(yearNum, month - 1, day, 0, 0, 0));

        const qtdAtDateCom = await this.calculateQtdAtDate(
          item.ticker,
          paymentDate,
          userId,
        );

        if (qtdAtDateCom <= 0) continue;

        const existing = await this.prisma.operation.findFirst({
          where: {
            ticker: item.ticker,
            precoUn: value,
            data: {
              gte: new Date(Date.UTC(yearNum, month - 1, day, 0, 0, 0)),
              lt: new Date(Date.UTC(yearNum, month - 1, day + 1, 0, 0, 0)),
            },
            tipoOperacao: OperationType.Proventos,
            createdBy: userId,
          },
        });

        const assetTipo = papeisTipos.find(
          (p) => p.papel === item.ticker,
        )?.tipo;

        results.push({
          ticker: item.ticker,
          dataCom: date_com,
          dataPagamento: payment_date,
          valor: value,
          tipo: assetTipo === 1 ? 'FII' : 'ACOES',
          quantidadeCarteira: qtdAtDateCom,
          status: existing ? 'registered' : 'no_registered',
        });
      }
    }

    return results;
  }

  private async calculateQtdAtDate(
    ticker: string,
    date: Date,
    userId: number,
  ): Promise<number> {
    const operations = await this.prisma.operation.findMany({
      where: {
        ticker,
        createdBy: userId,
        data: { lte: date },
        tipoOperacao: { in: [OperationType.Compra, OperationType.Venda] },
      },
    });

    let qtd = 0;
    for (const op of operations) {
      if (op.tipoOperacao === OperationType.Compra) {
        qtd += op.qtd ?? 0;
      } else if (op.tipoOperacao === OperationType.Venda) {
        qtd -= op.qtd ?? 0;
      }
    }

    return Math.max(0, qtd);
  }
}
