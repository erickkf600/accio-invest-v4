import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService, DistribuicaoItem, RendimentoMensal } from './service/dashboard.service';
import DashboardEmptyState from './component/dashboard-empty-state/dashboard-empty-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgApexchartsModule, DashboardEmptyState],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard implements OnInit {
  protected readonly title = 'Dashboard';

  private dashboardService = inject(DashboardService);

  protected patrimonioTotal = signal('');
  protected totalProventos = signal('');
  protected totalInvestido = signal(0);

  public chartOptions = signal<any>(null);

  public aportes = signal<{ mes: string; taxas: string; total: string }[]>([]);

  public pagamentos = signal<{ dataDia: string; dataMes: string; ticker: string; tipo: string; valor: string; pago: boolean }[]>([]);

  protected distribuicao = signal<DistribuicaoItem[]>([]);
  protected rendimentos = signal<RendimentoMensal[]>([]);
  protected availableYears = signal<number[]>([]);

  public currentYear = new Date().getFullYear();
  protected selectedYear = signal<number>(this.currentYear);

  get hasData(): boolean {
    return this.totalInvestido() > 0 || this.aportes().length > 0;
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(Number(target.value));
    this.dashboardService.getDashboardData(this.selectedYear()).subscribe({
      next: (data) => {
        this.rendimentos.set(data.rendimentos);
        if (data.rendimentos.length > 0) {
          this.initChart();
        }
      },
    });
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.patrimonioTotal.set(data.patrimonioTotal);
        this.totalProventos.set(data.totalProventos);
        this.totalInvestido.set(data.totalInvestido);
        this.aportes.set(data.aportes);
        this.distribuicao.set(data.distribuicao);
        this.rendimentos.set(data.rendimentos);
        this.availableYears.set(data.availableYears);
        if (data.rendimentos.length > 0) {
          this.initChart();
        }
      },
    });
  }

  private initChart() {
    const yearData = this.rendimentos();
    this.chartOptions.set({
      series: [
        {
          name: 'CDI',
          data: yearData.map((r) => r.cdi ?? null),
        },
        {
          name: 'Minha Carteira',
          data: yearData.map((r) => r.carteira ?? null),
        },
        {
          name: 'Preço Médio',
          data: yearData.map((r) => r.precoMedio ?? null),
        },
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        background: 'transparent',
        foreColor: '#94a3b8',
      },
      colors: ['#60a5fa', '#75d33b', '#a78bfa'],
      stroke: {
        curve: 'smooth',
        width: [1.5, 2, 1.5],
        dashArray: [4, 0, 6],
      },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 0,
          opacityFrom: [0.0, 0.45, 0.2],
          opacityTo: [0.0, 0.0, 0.0],
          stops: [0, 100],
        },
      },
      grid: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
        ],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
        },
      },
      yaxis: {
        show: false,
      },
      legend: {
        show: false,
      },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
          ];
          const cdiVal = series[0][dataPointIndex];
          const carteiraVal = series[1][dataPointIndex];
          const precoMedioVal = series[2][dataPointIndex];
          const fmt = (v: number | null) =>
            v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--';
          return `
            <div class="bg-[#121620] border border-white/10 rounded-lg p-3 shadow-2xl text-xs font-sans">
              <p class="text-[#94a3b8] mb-1 font-medium">${months[dataPointIndex]} ${this.selectedYear()}</p>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#f8fafc]">Carteira</span>
                  <span class="text-[#75d33b] font-bold">${fmt(carteiraVal)}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#f8fafc]">CDI</span>
                  <span class="text-[#60a5fa] font-bold">${fmt(cdiVal)}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#f8fafc]">Preço Médio</span>
                  <span class="text-[#a78bfa] font-bold">${fmt(precoMedioVal)}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
    });
  }
}
