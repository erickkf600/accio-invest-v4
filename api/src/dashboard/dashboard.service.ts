import { Injectable } from '@nestjs/common';
import { PrismaService } from '../app/prisma/prisma.service';
import { PythonApiService } from '../integrations/python-api/python-api.service';
import { OperationType, AssetType } from '../generated/prisma/client';
import {
  DashboardDataDto,
  AporteInfoDto,
  DistribuicaoItemDto,
  RendimentoMensalDto,
} from './dto/dashboard-data.dto';
import { ProximoPagamentoDto } from './dto/proximo-pagamento.dto';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private pythonApi: PythonApiService,
  ) {}

  async getDashboard(userId: number, ano?: string): Promise<DashboardDataDto> {
    const targetYear = ano ? parseInt(ano) : new Date().getFullYear();

    const operations = await this.prisma.operation.findMany({
      where: { createdBy: userId },
      orderBy: { data: 'desc' },
    });

    const totalCompras = operations
      .filter((op) => op.tipoOperacao === OperationType.Compra)
      .reduce((acc, op) => acc + op.total, 0);

    const totalVendas = operations
      .filter((op) => op.tipoOperacao === OperationType.Venda)
      .reduce((acc, op) => acc + op.total, 0);

    const totalProventos = operations
      .filter((op) => op.tipoOperacao === OperationType.Proventos)
      .reduce((acc, op) => acc + op.total, 0);

    const patrimonioTotal = totalCompras - totalVendas + totalProventos;
    const totalInvestido = totalCompras;

    const rendimentos = await this.calcularRendimentos(userId, targetYear, totalInvestido);
    const distribuicao = await this.calcularDistribuicao(userId);
    const availableYears = await this.calcularAvailableYears(userId);
    const aportes = this.agruparAportes(operations);

    return {
      patrimonioTotal,
      totalInvestido,
      totalProventos,
      aportes,
      distribuicao,
      rendimentos,
      availableYears,
    };
  }

  async getAvailableYears(userId: number): Promise<number[]> {
    return this.calcularAvailableYears(userId);
  }

  private agruparAportes(
    operations: { data: Date; tipoOperacao: string; total: number; taxas: number | null }[],
  ): AporteInfoDto[] {
    const grouped = new Map<string, AporteInfoDto>();

    for (const op of operations) {
      if (op.tipoOperacao !== OperationType.Compra) continue;
      const d = new Date(op.data);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const existing = grouped.get(key) || {
        mes: d.getMonth() + 1,
        ano: d.getFullYear(),
        valor: 0,
        taxa: 0,
      };
      existing.valor += op.total;
      existing.taxa += op.taxas ?? 0;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values())
      .sort((a, b) => {
        if (a.ano !== b.ano) return b.ano - a.ano;
        return b.mes - a.mes;
      })
      .slice(0, 5);
  }

  private async calcularDistribuicao(userId: number): Promise<DistribuicaoItemDto[]> {
    const positions = await this.prisma.portfolioPosition.findMany({
      where: {
        asset: { createdBy: userId },
      },
      include: {
        asset: true,
      },
    });

    const fixedIncome = await this.prisma.fixedIncomePosition.findMany({
      where: { createdBy: userId },
    });

    const tipoValor = new Map<string, number>();

    for (const pos of positions) {
      const tipo = pos.asset.tipo;
      const current = tipoValor.get(tipo) || 0;
      tipoValor.set(tipo, current + pos.custoTotal);
    }

    const totalFI = fixedIncome.reduce((acc, fi) => acc + fi.valorAplicado, 0);

    const categorias: Record<string, { valor: number; cor: string; rotulo: string }> = {
      [AssetType.ACOES]: { valor: tipoValor.get(AssetType.ACOES) || 0, cor: '#75d33b', rotulo: 'Ações' },
      [AssetType.FII]: { valor: tipoValor.get(AssetType.FII) || 0, cor: '#3b82f6', rotulo: 'FIIs' },
      RENDA_FIXA: { valor: totalFI, cor: '#fb923c', rotulo: 'Renda Fixa' },
    };

    const outrosTipos = [AssetType.BDR, AssetType.ETF, AssetType.CRIPTO];
    const outrosValor = outrosTipos.reduce((acc, t) => acc + (tipoValor.get(t) || 0), 0);
    if (outrosValor > 0) {
      categorias['OUTROS'] = { valor: outrosValor, cor: '#64748b', rotulo: 'Outros' };
    }

    const total = Object.values(categorias).reduce((acc, c) => acc + c.valor, 0);

    if (total === 0) return [];

    return Object.values(categorias)
      .filter((c) => c.valor > 0)
      .map((c) => ({
        tipo: c.rotulo,
        percentual: parseFloat(((c.valor / total) * 100).toFixed(1)),
        valor: parseFloat(c.valor.toFixed(2)),
        cor: c.cor,
      }));
  }

  private async calcularRendimentos(
    userId: number,
    ano: number,
    totalInvestido: number,
  ): Promise<RendimentoMensalDto[]> {
    const operations = await this.prisma.operation.findMany({
      where: {
        createdBy: userId,
        data: {
          gte: new Date(ano, 0, 1),
          lte: new Date(ano, 11, 31),
        },
      },
      orderBy: { data: 'asc' },
    });

    const proventos = operations.filter((op) => op.tipoOperacao === OperationType.Proventos);
    const compras = operations.filter((op) => op.tipoOperacao === OperationType.Compra);

    const fixedIncomeHistories = await this.prisma.fixedIncomeHistory.findMany({
      where: {
        createdBy: userId,
        dataVencimento: {
          gte: new Date(ano, 0, 1),
          lte: new Date(ano, 11, 31),
        },
      },
    });

    const totalProventosAno = proventos.reduce((acc, p) => acc + p.total, 0);
    const totalRendimentoRF = fixedIncomeHistories.reduce((acc, f) => acc + f.rendimentoBruto, 0);
    const temProventos = totalProventosAno > 0 || totalRendimentoRF > 0;

    const cdiData = await this.fetchCDI(ano);

    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const rendimentos: RendimentoMensalDto[] = [];

    const firstMonthCompras = compras.filter((c) => new Date(c.data).getMonth() + 1 === 1);
    const firstCusto = firstMonthCompras.reduce((acc, c) => acc + c.precoUn * (c.qtd ?? 0), 0);
    const firstQtd = firstMonthCompras.reduce((acc, c) => acc + (c.qtd ?? 0), 0);
    const firstAvgPrice = firstQtd > 0 ? firstCusto / firstQtd : null;

    for (const mes of meses) {
      const proventosAteMes = proventos
        .filter((p) => new Date(p.data).getMonth() + 1 <= mes)
        .reduce((acc, p) => acc + p.total, 0);

      const rendimentoRFAteMes = fixedIncomeHistories
        .filter((f) => new Date(f.dataVencimento).getMonth() + 1 <= mes)
        .reduce((acc, f) => acc + f.rendimentoBruto, 0);

      const carteiraVal =
        temProventos && totalInvestido > 0
          ? parseFloat(
              (
                ((proventosAteMes + rendimentoRFAteMes) / totalInvestido) *
                100
              ).toFixed(2),
            )
          : null;

      const cdiCumulativo = cdiData
        .filter((c) => c.mes <= mes)
        .reduce((acc, c) => acc + c.valor, 0);

      const cdiVal = cdiData.length > 0 ? parseFloat(cdiCumulativo.toFixed(2)) : null;

      const comprasAteMes = compras.filter((c) => new Date(c.data).getMonth() + 1 <= mes);
      const totalCusto = comprasAteMes.reduce(
        (acc, c) => acc + c.precoUn * (c.qtd ?? 0),
        0,
      );
      const totalQtd = comprasAteMes.reduce((acc, c) => acc + (c.qtd ?? 0), 0);

      let precoMedioVal: number | null = null;
      if (totalQtd > 0 && firstAvgPrice !== null) {
        const avgPrice = totalCusto / totalQtd;
        precoMedioVal = parseFloat(
          (((avgPrice - firstAvgPrice) / firstAvgPrice) * 100).toFixed(2),
        );
      }

      rendimentos.push({
        mes,
        carteira: carteiraVal,
        cdi: cdiVal,
        precoMedio: precoMedioVal,
      });
    }

    return rendimentos;
  }

  private async fetchCDI(
    ano: number,
  ): Promise<{ mes: number; valor: number }[]> {
    try {
      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=31/12/${ano}`;
      const response = await fetch(url);
      const data: { data: string; valor: string }[] = await response.json();
      return data.map((item) => {
        const [dia, mes] = item.data.split('/');
        return { mes: parseInt(mes), valor: parseFloat(item.valor) };
      });
    } catch {
      return [];
    }
  }

  async getProximosPagamentos(userId: number): Promise<ProximoPagamentoDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: { createdBy: userId },
    });

    if (!assets.length) {
      return [];
    }

    const papeisTipos = assets.map((a) => ({
      papel: a.ticker,
      tipo: a.tipo === AssetType.FII ? 1 : 2,
    }));

    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const result = await this.pythonApi.fetchProventos({
      papeis_tipos: papeisTipos,
      dataInicio: fmt(primeiroDia),
      dataFim: fmt(ultimoDia),
    });
    

    return result
      .flatMap((r) =>
        r.proventos.map((p) => ({
          ticker: r.ticker,
          tipo: 'Dividendo',
          valor: p.value,
          dataPagamento: p.payment_date,
          dataCom: p.date_com,
          percentual: p.percent,
        })),
      )
      .sort((a, b) => a.dataPagamento.localeCompare(b.dataPagamento));
  }

  private async calcularAvailableYears(userId: number): Promise<number[]> {
    const operations = await this.prisma.operation.findMany({
      where: { createdBy: userId, tipoOperacao: OperationType.Compra },
      select: { data: true },
    });

    const years = new Set<number>();
    for (const op of operations) {
      years.add(new Date(op.data).getFullYear());
    }

    return Array.from(years).sort((a, b) => b - a);
  }
}
