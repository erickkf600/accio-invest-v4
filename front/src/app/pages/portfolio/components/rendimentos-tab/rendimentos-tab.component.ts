import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-rendimentos-tab',
  standalone: true,
  imports: [DecimalPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule],
  templateUrl: './rendimentos-tab.component.html',
})
export class RendimentosTabComponent {
  private portfolioService = inject(PortfolioService);

  yields = computed(() => this.portfolioService.state$().yields);
  chartDataCollection = computed(() => this.portfolioService.state$().chartData);

  selectedYear = signal<string>('2024');
  availableYears = ['2023', '2024', '2025', '2026'];

  onYearChange(year: string): void {
    this.selectedYear.set(year);
  }

  columns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'emissor', label: 'Emissor' },
    { key: 'tipo', label: 'Tipo de Renda Fixa' },
    { key: 'valorUn', label: 'Valor Aplicado', align: 'right' },
    { key: 'total', label: 'Valor Final (Bruto)', align: 'right' },
    { key: 'lucro', label: 'Rendimento Líquido Est.', align: 'right' }
  ];

  chartSeries = computed(() => {
    const data = this.chartDataCollection()[this.selectedYear()];
    return [
      {
        name: 'Rendimentos',
        data: data ? data.yields : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    ];
  });

  chartOptions = computed(() => {
    const seriesData = this.chartSeries();

    return {
      series: seriesData,
      chart: {
        type: 'area' as const,
        height: 280,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8'
      },
      colors: ['#60a5fa'],
      stroke: {
        curve: 'smooth' as const,
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0,
          opacityFrom: 0.2,
          opacityTo: 0.0,
          stops: [0, 100]
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
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
          formatter: (val: number) => `R$ ${val.toFixed(0)}`,
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `R$ ${val.toFixed(2)}`
        }
      }
    };
  });

  // Dynamic yields data mapping for the table including calculated profit
  tableData = computed(() => {
    return this.yields().map(y => ({
      ...y,
      lucro: y.total - y.valorUn
    }));
  });
}
