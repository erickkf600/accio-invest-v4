import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { PortfolioService } from '../../service/portfolio.service';
import { MovimentacoesService } from '../../../movimentacoes/service/movimentacoes.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AssetTypeEnum, OperationTypeEnum } from '../../../../models/enums';
import { formatDateBr } from '../../../../utils/format-date.utils';
import type { DividendStatus } from '../../../movimentacoes/service/movimentacoes.service';

interface CompleteDividend {
  ticker: string;
  dataCom: string;
  dataPagamento: string;
  valor: number;
  tipo: string;
  qtd: number;
  total: number;
  status: 'registered' | 'no_registered';
}

@Component({
  selector: 'app-proventos-tab',
  standalone: true,
  imports: [AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule],
  templateUrl: './proventos-tab.component.html',
})
export class ProventosTabComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private movimentacoesService = inject(MovimentacoesService);
  private toast = inject(ToastService);

  selectedYear = signal<string>(new Date().getFullYear().toString());
  selectedMonthIndex = signal<number | null>(null);

  dividends = signal<CompleteDividend[]>([]);
  loading = signal<boolean>(true);
  selectedIds = signal<Set<string>>(new Set());
  statusFilter = signal<'all' | 'registered' | 'no_registered'>('all');

  protected readonly formatDateBr = formatDateBr;

  private loadSub: Subscription | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  private loadData(): void {
    this.loadSub?.unsubscribe();
    this.loading.set(true);
    this.loadSub = this.portfolioService.loadDividendsWithStatus(this.selectedYear()).subscribe({
      next: (res) => {
        this.dividends.set(
          res.data.map((d: DividendStatus) => ({
            ticker: d.ticker,
            dataCom: d.dataCom,
            dataPagamento: d.dataPagamento,
            valor: d.valor,
            tipo: d.tipo,
            qtd: d.quantidadeCarteira,
            total: d.valor * d.quantidadeCarteira,
            status: d.status,
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  availableYears = ['2023', '2024', '2025', '2026'];

  onYearChange(year: string): void {
    this.selectedYear.set(year);
    this.selectedMonthIndex.set(null);
    this.currentPage.set(1);
    this.loadData();
  }

  chartSeries = computed(() => {
    const year = this.selectedYear();
    const monthlyTotals = this.months.map((month, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      return this.dividends()
        .filter(d => {
          const parts = d.dataPagamento.split('/');
          return parts[1] === monthStr && parts[2] === year;
        })
        .reduce((sum, d) => sum + d.total, 0);
    });

    return [{
      name: 'Proventos',
      data: monthlyTotals
    }];
  });

  columns: TableColumn[] = [
    { key: 'checkbox', label: '', align: 'center' },
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'valorUn', label: 'Valor Un.', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'actions', label: '', align: 'center' },
  ];

  filteredDividends = computed<CompleteDividend[]>(() => {
    const idx = this.selectedMonthIndex();
    if (idx === null) return [];

    const monthStr = String(idx + 1).padStart(2, '0');
    const yearStr = this.selectedYear();
    const status = this.statusFilter();

    return this.dividends().filter(d => {
      const parts = d.dataPagamento.split('/');
      const matchesMonth = parts[1] === monthStr && parts[2] === yearStr;
      const matchesStatus = status === 'all' || d.status === status;
      return matchesMonth && matchesStatus;
    });
  });

  selectedCount = computed(() => this.selectedIds().size);

  hasSelection = computed(() => this.selectedIds().size > 0);

  hasPendingVisible = computed(() =>
    this.filteredDividends().some(d => d.status === 'no_registered')
  );

  allVisibleSelected = computed(() => {
    const visible = this.filteredDividends().filter(d => d.status === 'no_registered');
    const ids = this.selectedIds();
    return visible.length > 0 && visible.every(d => ids.has(this.rowKey(d)));
  });

  rowKey(d: CompleteDividend): string {
    return `${d.ticker}|${d.dataPagamento}|${d.valor}`;
  }

  toggleRow(d: CompleteDividend): void {
    const key = this.rowKey(d);
    this.selectedIds.update(ids => {
      const next = new Set(ids);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  isRowSelected(d: CompleteDividend): boolean {
    return this.selectedIds().has(this.rowKey(d));
  }

  toggleAllVisible(): void {
    const pending = this.filteredDividends().filter(d => d.status === 'no_registered');
    const ids = this.selectedIds();
    const allSelected = pending.length > 0 && pending.every(d => ids.has(this.rowKey(d)));

    this.selectedIds.set(
      allSelected
        ? new Set([...ids].filter(id => !pending.some(d => this.rowKey(d) === id)))
        : new Set([...ids, ...pending.map(d => this.rowKey(d))])
    );
  }

  setStatusFilter(status: 'all' | 'registered' | 'no_registered'): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  totalMonthlySum = computed(() =>
    this.filteredDividends().reduce((acc, d) => acc + d.total, 0)
  );

  onColumnSelect(index: number): void {
    this.selectedIds.set(new Set());
    if (this.selectedMonthIndex() === index) {
      this.selectedMonthIndex.set(null);
    } else {
      this.selectedMonthIndex.set(index);
      this.currentPage.set(1);
    }
  }

  classBreakdown = computed(() => {
    const year = this.selectedYear();
    const dividendsInYear = this.dividends().filter(d => {
      const parts = d.dataPagamento.split('/');
      return parts[2] === year;
    });

    let fiis = 0, acoes = 0, rf = 0;

    for (const d of dividendsInYear) {
      if (d.ticker.endsWith('11')) {
        fiis += d.total;
      } else if (['TESOURO', 'CDB', 'LCI', 'LCA'].some(s => d.ticker.includes(s))) {
        rf += d.total;
      } else {
        acoes += d.total;
      }
    }

    return { fiis, acoes, rf };
  });

  totalYearDividends = computed(() => {
    const { fiis, acoes, rf } = this.classBreakdown();
    return fiis + acoes + rf;
  });

  conicGradientStyle = computed(() => {
    const { fiis, acoes, rf } = this.classBreakdown();
    const total = fiis + acoes + rf;
    if (total === 0) return { background: '#1e293b' };

    const fiisPct = (fiis / total) * 100;
    const acoesPct = (acoes / total) * 100;
    const rfPct = (rf / total) * 100;

    let gradient = '';
    let current = 0;

    if (fiisPct > 0) {
      gradient += `#a3e635 ${current}% ${current + fiisPct}%`;
      current += fiisPct;
    }
    if (acoesPct > 0) {
      if (gradient) gradient += ', ';
      gradient += `#38bdf8 ${current}% ${current + acoesPct}%`;
      current += acoesPct;
    }
    if (rfPct > 0) {
      if (gradient) gradient += ', ';
      gradient += `#64748b ${current}% 100%`;
    }

    return { background: `conic-gradient(${gradient})` };
  });

  currentPage = signal<number>(1);
  pageSize = 9;

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
    }
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const list: number[] = [];
    for (let i = 1; i <= total; i++) {
      list.push(i);
    }
    if (total <= 5) return list;
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.filteredDividends().length / this.pageSize) : 0;
  }

  registerDividend(d: CompleteDividend): void {
    const [dia, mes, ano] = d.dataPagamento.split('/');
    const dataIso = `${ano}-${mes}-${dia}`;
    const tipoEnum = d.tipo === 'FII' ? AssetTypeEnum.FII : AssetTypeEnum.ACOES;

    this.movimentacoesService.createBatchWithFile([{
      ticker: d.ticker,
      tipoOperacao: OperationTypeEnum.Proventos,
      tipo: tipoEnum,
      data: dataIso,
      qtd: d.qtd,
      precoUn: d.valor,
      taxas: 0,
      total: d.total,
    }]).subscribe({
      next: () => {
        this.toast.success({ title: 'Sucesso', message: `Provento ${d.ticker} cadastrado com sucesso.` });
        this.loadData();
      },
      error: () => {
        this.toast.error({ title: 'Erro', message: 'Erro ao cadastrar provento.' });
      },
    });
  }

  registerSelected(): void {
    const ids = this.selectedIds();
    if (ids.size === 0) return;

    const allDividends = this.dividends();
    const selected = allDividends.filter(d => ids.has(this.rowKey(d)));

    const operations = selected.map(d => {
      const [dia, mes, ano] = d.dataPagamento.split('/');
      const tipoEnum = d.tipo === 'FII' ? AssetTypeEnum.FII : AssetTypeEnum.ACOES;
      return {
        ticker: d.ticker,
        tipoOperacao: OperationTypeEnum.Proventos,
        tipo: tipoEnum,
        data: `${ano}-${mes}-${dia}`,
        qtd: d.qtd,
        precoUn: d.valor,
        taxas: 0,
        total: d.total,
      };
    });

    this.movimentacoesService.createBatchWithFile(operations).subscribe({
      next: () => {
        this.toast.success({ title: 'Sucesso', message: `${selected.length} provento(s) cadastrado(s) com sucesso.` });
        this.selectedIds.set(new Set());
        this.loadData();
      },
      error: () => {
        this.toast.error({ title: 'Erro', message: 'Erro ao cadastrar proventos.' });
      },
    });
  }

  chartOptions = computed(() => {
    const seriesData = this.chartSeries();

    return {
      series: seriesData,
      chart: {
        type: 'bar' as const,
        height: 220,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            this.onColumnSelect(config.dataPointIndex);
          }
        }
      },
      colors: ['#025bd4'],
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: '55%',
          dataLabels: { position: 'top' },
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val > 0 ? `R$ ${val.toFixed(0)}` : '';
        },
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: ['#f8fafc'],
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        }
      },
      grid: {
        show: true,
        borderColor: '#1e293b',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: this.months,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      states: {
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'darken',
          }
        },
        hover: {
          filter: {
            type: 'darken',
            value: 0.15
          }
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `R$ ${val.toFixed(2)}`
        }
      }
    } as any;
  });
}
