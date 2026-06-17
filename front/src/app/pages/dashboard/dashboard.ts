import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  DashboardService,
  type DistribuicaoItemDto,
  type RendimentoMensalDto,
} from './service/dashboard.service';
import DashboardEmptyState from './component/dashboard-empty-state/dashboard-empty-state';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_ABREV = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

interface AporteView {
  mes: string;
  taxas: string;
  total: string;
}

interface PagamentoView {
  dataDia: string;
  dataMes: string;
  ticker: string;
  tipo: string;
  valor: string;
  pago: boolean;
}

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
  private router = inject(Router);

  protected patrimonioTotal = signal('');
  protected totalProventos = signal('');
  protected totalInvestido = signal(0);

  public chartOptions = signal<any>(null);

  public aportes = signal<AporteView[]>([]);

  public pagamentos = signal<PagamentoView[]>([]);

  protected distribuicao = signal<DistribuicaoItemDto[]>([]);
  protected rendimentos = signal<RendimentoMensalDto[]>([]);
  protected availableYears = signal<number[]>([]);

  public currentYear = new Date().getFullYear();
  protected selectedYear = signal<number>(this.currentYear);

  get hasData(): boolean {
    return this.totalInvestido() > 0 || this.aportes().length > 0;
  }

  onOperationTypeChange(value: string) {
    this.router.navigate(['/movimentacoes'], { queryParams: { openModal: value } });
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(Number(target.value));
    this.dashboardService.getDashboardData(this.selectedYear()).subscribe({
      next: (res) => {
        this.rendimentos.set(res.data.rendimentos);
        if (res.data.rendimentos.length > 0) {
          this.initChart();
        }
      },
    });
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const dto = res.data;
        this.patrimonioTotal.set(fmtCurrency(dto.patrimonioTotal));
        this.totalProventos.set(fmtCurrency(dto.totalProventos));
        this.totalInvestido.set(dto.totalInvestido);
        this.aportes.set(
          dto.aportes.map((a) => ({
            mes: MESES[a.mes - 1] || String(a.mes),
            taxas: fmtCurrency(a.taxa),
            total: fmtCurrency(a.valor),
          })),
        );
        this.distribuicao.set(dto.distribuicao);
        this.rendimentos.set(dto.rendimentos);
        this.availableYears.set(dto.availableYears);
        if (dto.rendimentos.length > 0) {
          this.initChart();
        }
      },
    });

    this.dashboardService.getProximosPagamentos().subscribe({
      next: (res) => {
        const hoje = new Date();
        this.pagamentos.set(
          res.data.map((item) => {
            const [dia, mes, ano] = item.dataPagamento.split('/');
            const dataPagamento = new Date(+ano, +mes - 1, +dia);
            return {
              ticker: item.ticker,
              tipo: item.tipo,
              valor: fmtCurrency(item.valor),
              dataDia: dia,
              dataMes: MESES_ABREV[parseInt(mes) - 1],
              pago: dataPagamento <= hoje,
            };
          }),
        );
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
          const cdiVal = series[0][dataPointIndex];
          const carteiraVal = series[1][dataPointIndex];
          const precoMedioVal = series[2][dataPointIndex];
          const fmt = (v: number | null) =>
            v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--';
          return `
            <div class="bg-[#121620] border border-white/10 rounded-lg p-3 shadow-2xl text-xs font-sans">
              <p class="text-[#94a3b8] mb-1 font-medium">${MESES[dataPointIndex]} ${this.selectedYear()}</p>
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
