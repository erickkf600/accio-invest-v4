import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { OperationType } from '../generated/prisma/client';

@Injectable()
export class PositionSyncService {
  constructor(private prisma: PrismaService) {}

  async syncPosition(ticker: string, userId: number): Promise<void> {
    const asset = await this.prisma.asset.findFirst({
      where: { ticker, createdBy: userId },
    });

    if (!asset) return;

    const operations = await this.prisma.operation.findMany({
      where: { ticker, createdBy: userId },
    });

    let qtd = 0;
    let custoTotal = 0;

    for (const op of operations) {
      if (op.tipo === OperationType.Compra) {
        qtd += op.qtd ?? 0;
        custoTotal += op.total;
      } else if (op.tipo === OperationType.Venda) {
        qtd -= op.qtd ?? 0;
        custoTotal -= op.total;
      }
    }

    if (qtd <= 0) {
      try {
        await this.prisma.portfolioPosition.delete({ where: { assetId: asset.id } });
      } catch {
        // position already deleted
      }
      return;
    }

    const precoMedio = custoTotal / qtd;

    await this.prisma.portfolioPosition.upsert({
      where: { assetId: asset.id },
      create: {
        assetId: asset.id,
        ticker,
        qtd,
        precoMedio,
        custoTotal,
      },
      update: {
        ticker,
        qtd,
        precoMedio,
        custoTotal,
      },
    });
  }
}
