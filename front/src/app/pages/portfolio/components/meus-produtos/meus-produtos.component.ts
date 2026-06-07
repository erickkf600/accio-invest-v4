import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';

@Component({
  selector: 'app-meus-produtos',
  standalone: true,
  imports: [DecimalPipe, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule,],
  templateUrl: './meus-produtos.component.html',
})
export class MeusProdutosComponent {
  private _abbreviate = new AbbreviateNumberPipe();
  private portfolioService = inject(PortfolioService);

  products = computed(() => this.portfolioService.state$().products);
  currentPage = signal(1);

  totalCost = computed(() =>
    this.products().reduce((acc, p) => acc + p.custoTotal, 0)
  );

  totalValue = computed(() =>
    this.products().reduce((acc, p) => acc + p.valorAtual, 0)
  );

  totalProfit = computed(() =>
    this.totalValue() - this.totalCost()
  );

  totalProfitPct = computed(() =>
    this.totalCost() > 0 ? (this.totalProfit() / this.totalCost()) * 100 : 0
  );

  columnsClassSummary: TableColumn[] = [
    { key: 'tipo', label: 'Classe' },
    { key: 'qtd', label: 'Saldo', align: 'right' },
    { key: 'saldoPM', label: 'Saldo (PM)', align: 'right' },
    { key: 'saldoCotacao', label: 'Saldo (Cotação)', align: 'right' },
    { key: 'rent30d', label: '30D', align: 'right' },
    { key: 'rent12m', label: '12M', align: 'right' },
    { key: 'rentHistorica', label: 'Hist.', align: 'right' },
  ];

  columns: TableColumn[] = [
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoMedio', label: 'Preço Médio', align: 'right' },
    { key: 'custoTotal', label: 'Custo Total', align: 'right' },
    { key: 'precoAtual', label: 'Preço Atual', align: 'right' },
    { key: 'valorAtual', label: 'Valor Atual', align: 'right' },
    { key: 'lucroPrejuizo', label: 'Lucro/Prejuízo', align: 'right' },
    { key: 'participacao', label: 'Part. (%)', align: 'right' },
  ];

  allocationColors: Record<string, string> = {
    'Ações': '#75d33b',
    'FII': '#60a5fa',
    'BDR': '#8b5cf6',
    'ETF': '#06b6d4',
    'Cripto': '#f97316',
    'Renda Fixa': '#f59e0b',
    'Outros': '#a855f7',
  };

  allocationByType = computed(() => {
    const products = this.products();
    const total = products.reduce((acc, p) => acc + p.valorAtual, 0) || 1;
    const groups = new Map<string, number>();
    for (const p of products) {
      groups.set(p.tipo, (groups.get(p.tipo) || 0) + p.valorAtual);
    }
    return Array.from(groups.entries()).map(([tipo, valor]) => ({
      tipo,
      valor,
      pct: parseFloat(((valor / total) * 100).toFixed(1)),
    }));
  });

  // Class-level summary for the "Meus ativos por classe" table
  classSummary = computed(() => {
    const products = this.products();
    const map = new Map<string, {
      tipo: string; qtd: number; custoTotal: number; valorAtual: number;
      rent30dW: number; rent12mW: number; rentHistW: number;
      weight30: number; weight12: number; weightHist: number;
    }>();

    for (const p of products) {
      const g = map.get(p.tipo) || { tipo: p.tipo, qtd: 0, custoTotal: 0, valorAtual: 0, rent30dW: 0, rent12mW: 0, rentHistW: 0, weight30: 0, weight12: 0, weightHist: 0 };
      g.qtd += p.qtd;
      g.custoTotal += p.custoTotal;
      g.valorAtual += p.valorAtual;
      g.rent30dW += p.rent30d * p.valorAtual;
      g.rent12mW += p.rent12m * p.valorAtual;
      g.rentHistW += p.lucroPrejuizoPct * p.custoTotal;
      g.weight30 += p.valorAtual;
      g.weight12 += p.valorAtual;
      g.weightHist += p.custoTotal;
      map.set(p.tipo, g);
    }

    return Array.from(map.entries()).map(([tipo, g]) => ({
      tipo,
      qtd: g.qtd,
      saldoPM: g.custoTotal,
      saldoCotacao: g.valorAtual,
      rent30d: g.weight30 > 0 ? g.rent30dW / g.weight30 : 0,
      rent12m: g.weight12 > 0 ? g.rent12mW / g.weight12 : 0,
      rentHistorica: g.weightHist > 0 ? (g.rentHistW / g.weightHist) : 0,
    }));
  });

  // Allocation donut chart options
  allocationChartOptions = computed(() => {
    const alloc = this.allocationByType();
    const total = alloc.reduce((acc, a) => acc + a.valor, 0) || 1;
    const labels = alloc.map(a => a.tipo === 'FII' ? 'FIIs' : a.tipo);
    const colors = alloc.map(a => this.allocationColors[a.tipo] || '#8a947f');

    return {
      series: alloc.map(a => a.pct),
      chart: {
        type: 'donut' as const,
        height: 240,
        background: 'transparent',
        foreColor: '#94a3b8'
      },
      labels,
      colors,
      stroke: {
        show: false
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            background: 'transparent',
            labels: {
              show: true,
              name: {
                show: true,
                color: '#94a3b8',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              },
              value: {
                show: true,
                color: '#f8fafc',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 'bold',
                formatter: (val: string) => `${val}%`
              },
              total: {
                show: true,
                label: 'Total',
                color: '#94a3b8',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                formatter: () => `R$ ${this._abbreviate.transform(total)}`
              }
            }
          }
        }
      }
    };
  });
}