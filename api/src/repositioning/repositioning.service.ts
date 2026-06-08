import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { CreateRepositioningDto } from './dto/create-repositioning.dto';
import { UpdateRepositioningDto } from './dto/update-repositioning.dto';
import { RepositioningResponseDto } from './dto/repositioning-response.dto';

@Injectable()
export class RepositioningService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateRepositioningDto,
    userId: number,
  ): Promise<RepositioningResponseDto> {
    return this.prisma.repositioning.create({
      data: {
        ticker: dto.ticker,
        dataOperacao: new Date(dto.dataOperacao),
        tipo: dto.tipo,
        fator: dto.fator,
        ratioDe: dto.ratioDe,
        ratioPara: dto.ratioPara,
        observacoes: dto.observacoes ?? null,
        createdBy: userId,
      },
    });
  }

  async findById(id: number, userId?: number): Promise<RepositioningResponseDto> {
    const where: Record<string, unknown> = { id };
    if (userId) where['createdBy'] = userId;

    const item = await this.prisma.repositioning.findFirst({ where });
    if (!item) {
      throw new NotFoundException(`Repositioning with id ${id} not found`);
    }
    return item;
  }

  async update(
    id: number,
    dto: UpdateRepositioningDto,
    userId: number,
  ): Promise<RepositioningResponseDto> {
    await this.findById(id, userId);

    const updateData: Record<string, unknown> = {};
    if (dto.ticker) updateData['ticker'] = dto.ticker;
    if (dto.dataOperacao) updateData['dataOperacao'] = new Date(dto.dataOperacao);
    if (dto.tipo) updateData['tipo'] = dto.tipo;
    if (dto.fator) updateData['fator'] = dto.fator;
    if (dto.ratioDe) updateData['ratioDe'] = dto.ratioDe;
    if (dto.ratioPara) updateData['ratioPara'] = dto.ratioPara;
    if (dto.observacoes !== undefined) updateData['observacoes'] = dto.observacoes;

    return this.prisma.repositioning.update({
      where: { id },
      data: updateData,
    });
  }
}
