import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async list(dto: ListAssetsDto, userId: number): Promise<PaginatedResult<AssetResponseDto>> {
    const { page = 1, limit = 20, tipo, search } = dto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {};
    if (userId) {
      where['createdBy'] = userId;
    }
    if (tipo) where['tipo'] = tipo;
    if (search) {
      where['OR'] = [
        { ticker: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({ where, skip, take, orderBy: { ticker: 'asc' } }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async create(dto: CreateAssetDto, userId: number): Promise<AssetResponseDto> {
    const existing = await this.prisma.asset.findFirst({
      where: { ticker: dto.ticker, createdBy: userId },
    });

    if (existing) {
      throw new ConflictException(`Asset with ticker ${dto.ticker} already exists`);
    }

    return this.prisma.asset.create({
      data: {
        ticker: dto.ticker,
        tipo: dto.tipo,
        quantidade: dto.quantidade,
        createdBy: userId,
      },
    });
  }

  async findByTicker(ticker: string, userId: number): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findFirst({
      where: { ticker, createdBy: userId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ticker ${ticker} not found`);
    }
    return asset;
  }

  async update(ticker: string, dto: UpdateAssetDto, userId: number): Promise<AssetResponseDto> {
    await this.findByTicker(ticker, userId);

    return this.prisma.asset.updateMany({
      where: { ticker, createdBy: userId },
      data: dto,
    }).then(() => this.findByTicker(ticker, userId));
  }

  async remove(ticker: string, userId: number): Promise<void> {
    const asset = await this.findByTicker(ticker, userId);
    await this.prisma.asset.delete({ where: { id: asset.id } });
  }
}
