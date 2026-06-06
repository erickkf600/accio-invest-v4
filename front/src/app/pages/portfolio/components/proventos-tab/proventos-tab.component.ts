import { Component, inject, signal, computed, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PortfolioDividend } from '../../../../models/portfolio.model';

@Component({
  selector: 'app-proventos-tab',
  standalone: true,
  imports: [DecimalPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule],
  templateUrl: './proventos-tab.component.html',
})
export class ProventosTabComponent {
  private portfolioService = inject(PortfolioService);

  selectedYear = signal<string>('2024');
  selectedMonthIndex = signal<number | null>(null);

  // Month names for mapping and display
  months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Load state and raw data from service
  dividends = computed(() => this.portfolioService.state$().dividends);
  chartDataCollection = computed(() => this.portfolioService.state$().chartData);

  // Year filter options
  availableYears = ['2023', '2024', '2025', '2026'];

  onYearChange(year: string): void {
    this.selectedYear.set(year);
    this.selectedMonthIndex.set(null); // Reset month selection
  }

  // Filtered chart series data based on selected year
  chartSeries = computed(() => {
    const data = this.chartDataCollection()[this.selectedYear()];
    return [
      {
        name: 'Proventos',
        data: data ? data.dividends : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    ];
  });

  // Table columns for monthly dividends
  columns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'valorUn', label: 'Valor Un.', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' }
  ];

  // Dividends filtered by both selected year and selected month
  filteredDividends = computed<PortfolioDividend[]>(() => {
    const idx = this.selectedMonthIndex();
    if (idx === null) return [];

    const monthAbbr = this.months[idx];
    const yearStr = this.selectedYear();

    return this.dividends().filter(d => {
      // Date pattern in mock is like '15 Mai, 2024'
      return d.data.includes(monthAbbr) && d.data.includes(yearStr);
    });
  });

  totalMonthlySum = computed(() =>
    this.filteredDividends().reduce((acc, d) => acc + d.total, 0)
  );

  onColumnSelect(index: number): void {
    if (this.selectedMonthIndex() === index) {
      this.selectedMonthIndex.set(null); // Toggle hide if click again
    } else {
      this.selectedMonthIndex.set(index);
    }
  }

  // ApexCharts Config options
  chartOptions = computed(() => {
    const selectedIdx = this.selectedMonthIndex();
    const seriesData = this.chartSeries();

    return {
      series: seriesData,
      chart: {
        type: 'bar' as const,
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            this.onColumnSelect(config.dataPointIndex);
          }
        }
      },
      colors: ['#75d33b'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '45%',
          dataLabels: { position: 'top' }
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
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
          formatter: (val: number) => `R$ ${val}`,
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      states: {
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none'
          }
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
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
