import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { PortfolioService, type PositionDto, type ClassSummaryItem } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { TooltipDirective } from '../../../../components/Tooltip/tooltip.directive';
import { AssetTypeEnum } from '../../../../models/enums';
import type { PortfolioProduct } from '../../../../models/portfolio.model';

function mapPosition(p: PositionDto): PortfolioProduct {
  return {
    ticker: p.ticker,
    tipo: p.tipo,
    qtd: p.qtd,
    precoMedio: p.precoMedio,
    custoTotal: p.custoTotal,
    precoAtual: p.precoAtual,
    valorAtual: p.valorAtual,
    lucroPrejuizo: p.lucroPrejuizo,
    lucroPrejuizoPct: p.lucroPrejuizoPct,
    participacao: p.participacao,
  };
}

@Component({
  selector: 'app-meus-produtos',
  standalone: true,
  imports: [DecimalPipe, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule, TooltipDirective],
  templateUrl: './meus-produtos.component.html',
})
export class MeusProdutosComponent implements OnInit, OnDestroy {
  protected readonly AssetTypeEnum = AssetTypeEnum;
  private _abbreviate = new AbbreviateNumberPipe();
  private portfolioService = inject(PortfolioService);

  products = signal<PortfolioProduct[]>([]);
  classSummaryData = signal<ClassSummaryItem[]>([]);
  currentPage = signal(1);

  private loadSub: Subscription | null = null;
  private classSummarySub: Subscription | null = null;

  ngOnInit(): void {
    this.loadSub = this.portfolioService.loadPositions().subscribe({
      next: (res) => this.products.set(res.data.data.map(mapPosition)),
    });
    this.classSummarySub = this.portfolioService.loadClassSummary().subscribe({
      next: (res) => this.classSummaryData.set(res.data),
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.classSummarySub?.unsubscribe();
  }

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
    { key: 'precoMedio', label: 'P. Médio', align: 'right' },
    { key: 'custoTotal', label: 'C. Total', align: 'right' },
    { key: 'precoAtual', label: 'P. Atual', align: 'right' },
    { key: 'valorAtual', label: 'V. Atual', align: 'right' },
    { key: 'lucroPrejuizo', label: 'Lucro/Prejuízo', align: 'right' },
    { key: 'participacao', label: 'Part. (%)', align: 'right' },
  ];

  allocationColors: Record<string, string> = {
    [AssetTypeEnum.ACOES]: '#75d33b',
    [AssetTypeEnum.FII]: '#60a5fa',
    [AssetTypeEnum.BDR]: '#8b5cf6',
    [AssetTypeEnum.ETF]: '#06b6d4',
    [AssetTypeEnum.CRIPTO]: '#f97316',
    'RF': '#f59e0b',
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

  allocationChartOptions = computed(() => {
    const alloc = this.allocationByType();
    const total = alloc.reduce((acc, a) => acc + a.valor, 0) || 1;
    const labels = alloc.map(a => a.tipo === AssetTypeEnum.FII ? 'FIIs' : a.tipo);
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
