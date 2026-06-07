import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { DashboardDataDto } from './dto/dashboard-data.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: number): Promise<DashboardDataDto> {
    const operations = await this.prisma.operation.findMany({
      where: { createdBy: userId },
      orderBy: { data: 'desc' },
    });

    if (operations.length === 0) {
      return {
        temDados: false,
        patrimonioTotal: 0,
        rentabilidadeMes: 0,
        saldoDisponivel: 0,
        aportes: [],
        totalInvestido: 0,
        totalOperacoes: 0,
        totalProventos: 0,
      };
    }

    const totalInvestido = operations
      .filter((op) => op.tipo === 'Compra')
      .reduce((acc, op) => acc + op.total, 0);

    const totalVendas = operations
      .filter((op) => op.tipo === 'Venda')
      .reduce((acc, op) => acc + op.total, 0);

    const totalProventos = operations
      .filter((op) => op.tipo === 'Proventos')
      .reduce((acc, op) => acc + op.total, 0);

    const patrimonioTotal = totalInvestido - totalVendas + totalProventos;

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const aportesMes = operations.filter(
      (op) => op.tipo === 'Compra' && new Date(op.data) >= inicioMes,
    );
    const valorAportesMes = aportesMes.reduce((acc, op) => acc + op.total, 0);

    const rentabilidadeMes =
      totalInvestido > 0 ? (valorAportesMes / totalInvestido) * 100 : 0;

    const aportesAgrupados = this.agruparAportesPorMes(operations);

    return {
      temDados: true,
      patrimonioTotal,
      rentabilidadeMes: parseFloat(rentabilidadeMes.toFixed(2)),
      saldoDisponivel: 0,
      aportes: aportesAgrupados,
      totalInvestido,
      totalOperacoes: operations.length,
      totalProventos,
    };
  }

  private agruparAportesPorMes(
    operations: { data: Date; tipo: string; total: number }[],
  ): { mes: number; ano: number; valor: number }[] {
    const grouped = new Map<string, { mes: number; ano: number; valor: number }>();

    for (const op of operations) {
      if (op.tipo !== 'Compra') continue;
      const d = new Date(op.data);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const existing = grouped.get(key) || {
        mes: d.getMonth() + 1,
        ano: d.getFullYear(),
        valor: 0,
      };
      existing.valor += op.total;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });
  }
}
