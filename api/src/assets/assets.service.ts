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

  async list(dto: ListAssetsDto): Promise<PaginatedResult<AssetResponseDto>> {
    const { page = 1, limit = 20, tipo, search } = dto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Record<string, unknown> = {};
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

  async create(dto: CreateAssetDto, userId?: number): Promise<AssetResponseDto> {
    const existing = await this.prisma.asset.findUnique({
      where: { ticker: dto.ticker },
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

  async findByTicker(ticker: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findUnique({ where: { ticker } });
    if (!asset) {
      throw new NotFoundException(`Asset with ticker ${ticker} not found`);
    }
    return asset;
  }

  async update(ticker: string, dto: UpdateAssetDto): Promise<AssetResponseDto> {
    await this.findByTicker(ticker);

    return this.prisma.asset.update({
      where: { ticker },
      data: dto,
    });
  }

  async remove(ticker: string): Promise<void> {
    await this.findByTicker(ticker);
    await this.prisma.asset.delete({ where: { ticker } });
  }
}
