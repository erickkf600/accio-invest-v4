import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from './service/dashboard.service';
import DashboardEmptyState from './component/dashboard-empty-state/dashboard-empty-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgApexchartsModule, DashboardEmptyState],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  protected readonly title = 'Dashboard';

  protected dashboardService = inject(DashboardService);
  protected hasData = signal(false);

  public chartOptions = signal<any>(null);

  public aportes = signal<{ mes: string; taxas: string; total: string }[]>([]);

  public pagamentos = signal<{ dataDia: string; dataMes: string; ticker: string; tipo: string; valor: string; pago: boolean }[]>([]);
  public currentYear = new Date().getFullYear().toString();
  protected selectedYear = signal<string>(this.currentYear);
  protected availableYears = ['2022', '2023', '2024', '2025', '2026'];

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(target.value);
    if (this.hasData()) {
      this.initChart();
    }
  }

  private readonly chartDataByYear: Record<string, { cdi: number[]; carteira: number[] }> = {
    '2022': { cdi: [0.7, 1.3, 2.0, 2.6, 3.3, 4.1, 4.9, 5.8, 6.5, 7.2, 8.0, 8.5], carteira: [1.8, 3.5, 5.0, 6.8, 8.2, 10.0, 11.5, 13.2, 15.8, 18.0, 20.5, 22.0] },
    '2023': { cdi: [0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3, 7.2, 8.1, 9.0, 10.0, 11.0], carteira: [2.0, 4.5, 6.0, 8.5, 11.0, 13.5, 16.0, 18.5, 21.0, 23.5, 26.0, 28.5] },
    '2024': { cdi: [1.1, 2.2, 3.3, 4.4, 5.48, 6.5, 7.6, 8.7, 9.8, 10.9, 12.0, 13.1], carteira: [2.5, 5.8, 4.2, 9.0, 14.2, 11.5, 17.2, 19.8, 15.0, 23.4, 28.6, 36.2] },
    '2025': { cdi: [1.0, 2.0, 3.1, 4.2, 5.3, 6.4, 7.5, 8.6, 9.7, 10.8, 11.9, 13.0], carteira: [3.0, 6.2, 9.5, 12.8, 16.0, 19.5, 23.0, 26.5, 30.0, 33.5, 37.0, 40.5] },
    '2026': { cdi: [1.2, 2.4, 3.6, 4.8, 6.0, 7.2, 8.4, 9.6, 10.8, 12.0, 13.2, 14.4], carteira: [3.5, 7.0, 10.5, 14.0, 17.5, 21.0, 24.5, 28.0, 31.5, 35.0, 38.5, 42.0] },
  };

  constructor() {
    this.dashboardService.loadDashboard();
    const data = this.dashboardService.state$().data;
    this.hasData.set(data.temDados);
    this.aportes.set(data.aportes);
    this.pagamentos.set(data.pagamentos);
    if (data.temDados) {
      this.initChart();
    }
  }

  private initChart() {
    const yearData = this.chartDataByYear[this.selectedYear()] || this.chartDataByYear['2024'];
    this.chartOptions.set({
      series: [
        {
          name: 'CDI',
          data: yearData.cdi
        },
        {
          name: 'Minha Carteira',
          data: yearData.carteira
        }
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        background: 'transparent',
        foreColor: '#94a3b8'
      },
      colors: ['#60a5fa', '#75d33b'],
      stroke: {
        curve: 'smooth',
        width: [1.5, 2],
        dashArray: [4, 0]
      },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 0,
          opacityFrom: [0.0, 0.45],
          opacityTo: [0.0, 0.0],
          stops: [0, 100]
        }
      },
      grid: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }
      },
      yaxis: {
        show: false
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const months = [
            'Janeiro',
            'Fevereiro',
            'Mar\u00e7o',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
          ];
          const cdiVal = series[0][dataPointIndex];
          const carteiraVal = series[1][dataPointIndex];
          return `
            <div class="bg-[#121620] border border-white/10 rounded-lg p-3 shadow-2xl text-xs font-sans">
              <p class="text-[#94a3b8] mb-1 font-medium">${months[dataPointIndex]} ${this.selectedYear()}</p>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#f8fafc]">Carteira</span>
                  <span class="text-[#75d33b] font-bold">+${carteiraVal.toFixed(1)}%</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#f8fafc]">CDI</span>
                  <span class="text-[#60a5fa] font-bold">+${cdiVal.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          `;
        }
      }
    });
  }
}
