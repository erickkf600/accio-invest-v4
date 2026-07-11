import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // Buscar o portfolioPosition pelo ticker
    const asset = await this.prisma.asset.findFirst({
      where: { ticker: dto.ticker, createdBy: userId },
    });

    if (!asset) {
      throw new NotFoundException(`Ativo ${dto.ticker} não encontrado na carteira`);
    }

    const portfolioPosition = await this.prisma.portfolioPosition.findUnique({
      where: { assetId: asset.id },
    });

    if (!portfolioPosition) {
      throw new NotFoundException(`Posição não encontrada para o ticker ${dto.ticker}`);
    }

    const ratioDe = parseInt(dto.ratioDe);
    const ratioPara = parseInt(dto.ratioPara);

    if (isNaN(ratioDe) || isNaN(ratioPara) || ratioDe === 0) {
      throw new BadRequestException('Ratios inválidos');
    }

    // Valores originais
    const qtdOriginal = portfolioPosition.qtd;
    const precoMedioOriginal = portfolioPosition.precoMedio;
    const custoTotalOriginal = portfolioPosition.custoTotal;

    // Calcular novos valores
    // Fator de reposicionamento: ratioPara / ratioDe
    // Ex: desdobramento 1→10: fator = 10, novaQtd = qtd * 10, novoPreco = preco / 10
    // Ex: grupamento 10→1: fator = 0.1, novaQtd = qtd * 0.1, novoPreco = preco * 10
    const fator = ratioPara / ratioDe;
    const novaQtd = Math.round(qtdOriginal * fator * 1000000) / 1000000;
    const novoPrecoMedio = Math.round((precoMedioOriginal / fator) * 10000) / 10000;
    const novoCustoTotal = Math.round(novaQtd * novoPrecoMedio * 100) / 100;

    // Usar transação para garantir consistência
    const result = await this.prisma.$transaction(async (tx) => {
      // Atualizar quantidade, preço médio e custo total no portfolioPosition
      await tx.portfolioPosition.update({
        where: { id: portfolioPosition.id },
        data: {
          qtd: novaQtd,
          precoMedio: novoPrecoMedio,
          custoTotal: novoCustoTotal,
        },
      });

      // Criar o repositioning com valores originais
      const repositioning = await tx.repositioning.create({
        data: {
          ticker: dto.ticker,
          dataOperacao: new Date(dto.dataOperacao),
          ratioDe: dto.ratioDe,
          ratioPara: dto.ratioPara,
          qtdOriginal: qtdOriginal,
          precoMedioOriginal: precoMedioOriginal,
          custoTotalOriginal: custoTotalOriginal,
          observacoes: dto.observacoes ?? null,
          createdBy: userId,
          portfolioPositionId: portfolioPosition.id,
        },
      });

      return repositioning;
    });

    return result;
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

  async findAll(userId: number): Promise<RepositioningResponseDto[]> {
    return this.prisma.repositioning.findMany({
      where: { createdBy: userId },
      orderBy: { dataOperacao: 'desc' },
    });
  }

  async update(
    id: number,
    dto: UpdateRepositioningDto,
    userId: number,
  ): Promise<RepositioningResponseDto> {
    const existing = await this.findById(id, userId);

    if (dto.ratioDe || dto.ratioPara) {
      const newRatioDe = dto.ratioDe ? parseInt(dto.ratioDe) : parseInt(existing.ratioDe);
      const newRatioPara = dto.ratioPara ? parseInt(dto.ratioPara) : parseInt(existing.ratioPara);

      if (isNaN(newRatioDe) || isNaN(newRatioPara) || newRatioDe === 0) {
        throw new BadRequestException('Novos ratios inválidos');
      }

      if (existing.portfolioPositionId) {
        // Calcular novos valores baseados nos originais
        const fator = newRatioPara / newRatioDe;
        const newQtd = Math.round(existing.qtdOriginal * fator * 1000000) / 1000000;
        const newPrecoMedio = Math.round((existing.precoMedioOriginal / fator) * 10000) / 10000;
        const newCustoTotal = Math.round(newQtd * newPrecoMedio * 100) / 100;

        await this.prisma.portfolioPosition.update({
          where: { id: existing.portfolioPositionId },
          data: {
            qtd: newQtd,
            precoMedio: newPrecoMedio,
            custoTotal: newCustoTotal,
          },
        });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.ticker) updateData['ticker'] = dto.ticker;
    if (dto.dataOperacao) updateData['dataOperacao'] = new Date(dto.dataOperacao);
    if (dto.ratioDe) updateData['ratioDe'] = dto.ratioDe;
    if (dto.ratioPara) updateData['ratioPara'] = dto.ratioPara;
    if (dto.observacoes !== undefined) updateData['observacoes'] = dto.observacoes;

    return this.prisma.repositioning.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    const existing = await this.findById(id, userId);

    if (existing.portfolioPositionId) {
      await this.prisma.$transaction(async (tx) => {
        // Restaurar quantidade, preço médio e custo total originais
        await tx.portfolioPosition.update({
          where: { id: existing.portfolioPositionId! },
          data: {
            qtd: existing.qtdOriginal,
            precoMedio: existing.precoMedioOriginal,
            custoTotal: existing.custoTotalOriginal,
          },
        });

        await tx.repositioning.delete({ where: { id } });
      });
    } else {
      await this.prisma.repositioning.delete({ where: { id } });
    }
  }
}
