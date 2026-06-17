import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { PortfolioService, type DividendDto } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { PortfolioDividend } from '../../../../models/portfolio.model';

const MESES: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

function formatShortDate(d: string): string {
  const date = new Date(d);
  return `${date.getDate()} ${MESES[date.getMonth() + 1] || ''}, ${date.getFullYear()}`;
}

@Component({
  selector: 'app-proventos-tab',
  standalone: true,
  imports: [DecimalPipe, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule, CommonModule],
  templateUrl: './proventos-tab.component.html',
})
export class ProventosTabComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);

  selectedYear = signal<string>(new Date().getFullYear().toString());
  selectedMonthIndex = signal<number | null>(null);

  dividends = signal<PortfolioDividend[]>([]);

  private loadSub: Subscription | null = null;

  ngOnInit(): void {
    this.loadSub = this.portfolioService.loadDividends().subscribe({
      next: (res) => {
        this.dividends.set(
          res.data.data.map((d: DividendDto) => ({
            id: String(d.id),
            data: formatShortDate(d.data),
            ticker: d.ticker,
            tipo: d.tipo,
            qtd: d.qtd,
            valorUn: d.valorUn,
            total: d.total,
            status: d.status as PortfolioDividend['status'],
          })),
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
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
  }

  chartSeries = computed(() => {
    const year = this.selectedYear();
    const monthlyTotals = this.months.map(month =>
      this.dividends()
        .filter(d => d.data.includes(month) && d.data.includes(year))
        .reduce((sum, d) => sum + d.total, 0)
    );

    return [{
      name: 'Proventos',
      data: monthlyTotals
    }];
  });

  columns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'valorUn', label: 'Valor Un.', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' }
  ];

  filteredDividends = computed<PortfolioDividend[]>(() => {
    const idx = this.selectedMonthIndex();
    if (idx === null) return [];

    const monthAbbr = this.months[idx];
    const yearStr = this.selectedYear();

    return this.dividends().filter(d => {
      return d.data.includes(monthAbbr) && d.data.includes(yearStr);
    });
  });

  totalMonthlySum = computed(() =>
    this.filteredDividends().reduce((acc, d) => acc + d.total, 0)
  );

  onColumnSelect(index: number): void {
    if (this.selectedMonthIndex() === index) {
      this.selectedMonthIndex.set(null);
    } else {
      this.selectedMonthIndex.set(index);
      this.currentPage.set(1);
    }
  }

  classBreakdown = computed(() => {
    const year = this.selectedYear();
    const dividendsInYear = this.dividends().filter(d => d.data.includes(year));

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
