import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { ListOperationsDto } from './dto/list-operations.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { PaginatedResult } from '../common/types/pagination.interface';
import { calculatePaginationMeta, getPaginationParams } from '../common/utils/pagination.utils';
import { generateRandomString } from '../common/utils/file-generator.utils';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

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
    nota?: string,
  ): Promise<OperationResponseDto> {
    const asset = await this.prisma.asset.findUnique({
      where: { ticker: dto.ticker },
    });

    if (!asset) {
      throw new BadRequestException(
        `Asset with ticker ${dto.ticker} not found. Create the asset first.`,
      );
    }

    let notaPath: string | undefined;
    let notaNome: string | undefined;

    if (arquivo) {
      notaPath = generateRandomString();
      notaNome = arquivo.originalname;
    } else if (nota) {
      notaPath = generateRandomString();
      notaNome = nota;
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
        createdBy: userId,
      },
    });
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
    nota?: string,
  ): Promise<OperationResponseDto> {
    await this.findById(id, userId);

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.data) updateData['data'] = new Date(dto.data);

    if (arquivo) {
      updateData['notaPath'] = generateRandomString();
      updateData['notaNome'] = arquivo.originalname;
    } else if (nota) {
      updateData['notaPath'] = generateRandomString();
      updateData['notaNome'] = nota;
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
