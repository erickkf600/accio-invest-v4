import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { PositionSyncService } from '../portfolio/position-sync.service';
import { AssetType, OperationType } from '../generated/prisma/client';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { ListOperationsDto } from './dto/list-operations.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { generateRandomString } from '../common/utils/file-generator.utils';
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
    tipo: 'Renda Fixa',
    data: fi.dataCompra,
    qtd: null,
    precoUn: fi.valorAplicado,
    taxas: 0,
    total: fi.valorAplicado,
    lucroRealizado: undefined,
    notaPath: fi.notaPath,
    notaNome: fi.notaNome,
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
    tipo: 'Renda Fixa - Rendimento',
    data: y.dataOperacao,
    qtd: null,
    precoUn: y.valor,
    taxas: 0,
    total: y.valor,
    lucroRealizado: undefined,
    notaPath: undefined,
    notaNome: undefined,
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
  ) {}

  async list(
    dto: ListOperationsDto,
    userId?: number,
  ): Promise<PaginatedResult<OperationResponseDto>> {
    const { page = 1, limit = 20, ticker, tipo, dataInicio, dataFim } = dto;
    const { skip, take } = getPaginationParams(page, limit);

    const includeFi = !tipo || tipo === 'Renda Fixa' || tipo === 'Renda Fixa - Rendimento';
    const includeOp = !tipo || (tipo !== 'Renda Fixa' && tipo !== 'Rendimento');

    const opWhere: Record<string, unknown> = {};
    if (userId) opWhere['createdBy'] = userId;
    if (ticker) opWhere['ticker'] = { contains: ticker };
    if (tipo && includeOp) opWhere['tipo'] = tipo;
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
      if (dto.tipo === OperationType.Compra) {
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

    let notaPath: string | undefined;
    let notaNome: string | undefined;

    if (arquivo) {
      notaPath = generateRandomString();
      notaNome = arquivo.originalname;
    }

    const operation = await this.prisma.operation.create({
      data: {
        assetId: asset.id,
        ticker: dto.ticker,
        tipo: dto.tipo as any,
        data: new Date(dto.data),
        qtd: dto.qtd,
        precoUn: dto.precoUn,
        taxas: dto.taxas ?? 0,
        total: dto.total,
        lucroRealizado: dto.lucroRealizado,
        notaPath,
        notaNome,
        observacoes: dto.observacoes ?? null,
        createdBy: userId,
      },
    });

    if (dto.tipo === OperationType.Compra || dto.tipo === OperationType.Venda) {
      await this.positionSync.syncPosition(dto.ticker, userId);
    }

    return operation as unknown as OperationResponseDto;
  }

  async createBatch(
    dtoList: CreateOperationDto[],
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto[]> {
    let notaPath: string | undefined;
    let notaNome: string | undefined;

    if (arquivo) {
      notaPath = generateRandomString();
      notaNome = arquivo.originalname;
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const ops: OperationResponseDto[] = [];

      for (const dto of dtoList) {
        let asset = await tx.asset.findFirst({
          where: { ticker: dto.ticker, createdBy: userId },
        });

        if (!asset) {
          if (dto.tipo === OperationType.Compra) {
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

        const operation = await tx.operation.create({
          data: {
            assetId: asset.id,
            ticker: dto.ticker,
            tipo: dto.tipo as any,
            data: new Date(dto.data),
            qtd: dto.qtd,
            precoUn: dto.precoUn,
            taxas: dto.taxas ?? 0,
            total: dto.total,
            lucroRealizado: dto.lucroRealizado,
            notaPath,
            notaNome,
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
      if (dto.tipo === OperationType.Compra || dto.tipo === OperationType.Venda) {
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
        updateData['notaPath'] = generateRandomString();
        updateData['notaNome'] = arquivo.originalname;
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
      updateData['notaPath'] = generateRandomString();
      updateData['notaNome'] = arquivo.originalname;
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

    const tipo = dto.tipo ?? oldOp.tipo;
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
    const tipo = operation.tipo;
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
}
