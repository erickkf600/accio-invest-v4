import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { AssetType } from '../generated/prisma/client';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { ListOperationsDto } from './dto/list-operations.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { generateRandomString } from '../common/utils/file-generator.utils';

@Injectable()
export class OperationsService {
  constructor(
    private prisma: PrismaService,
    private assetsService: AssetsService,
  ) {}

  async list(
    dto: ListOperationsDto,
    userId?: number,
  ): Promise<PaginatedResult<OperationResponseDto>> {
    const { page = 1, limit = 20, ticker, tipo, dataInicio, dataFim } = dto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {};
    if (userId) where['createdBy'] = userId;
    if (ticker) where['ticker'] = { contains: ticker };
    if (tipo) where['tipo'] = tipo;
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

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async create(
    dto: CreateOperationDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto> {
    let asset: { id: number } | null = await this.prisma.asset.findUnique({
      where: { ticker: dto.ticker },
    });

    if (!asset) {
      if (dto.tipo === 'Compra') {
        const tipo = this.inferAssetType(dto.ticker);
        asset = await this.assetsService.create({ ticker: dto.ticker, tipo }, userId);
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

    return this.prisma.operation.create({
      data: {
        assetId: asset.id,
        ticker: dto.ticker,
        tipo: dto.tipo,
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

    return this.prisma.$transaction(async (tx) => {
      const results: OperationResponseDto[] = [];

      for (const dto of dtoList) {
        let asset: { id: number } | null = await tx.asset.findUnique({
          where: { ticker: dto.ticker },
        });

        if (!asset) {
          if (dto.tipo === 'Compra') {
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
            tipo: dto.tipo,
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

        results.push(operation);
      }

      return results;
    });
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
    const where: Record<string, unknown> = { id };
    if (userId) where['createdBy'] = userId;

    const operation = await this.prisma.operation.findFirst({ where });
    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }
    return operation;
  }

  async update(
    id: number,
    dto: UpdateOperationDto,
    userId: number,
    arquivo?: Express.Multer.File,
  ): Promise<OperationResponseDto> {
    await this.findById(id, userId);

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

    if (dto.ticker) {
      const asset = await this.prisma.asset.findUnique({
        where: { ticker: dto.ticker },
      });
      if (!asset) {
        throw new BadRequestException(`Asset with ticker ${dto.ticker} not found`);
      }
      updateData['assetId'] = asset.id;
    }

    return this.prisma.operation.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number, userId?: number): Promise<void> {
    await this.findById(id, userId);
    await this.prisma.operation.delete({ where: { id } });
  }
}
