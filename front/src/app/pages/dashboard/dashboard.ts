import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ToastService } from '../../components/Toast/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  protected readonly title = 'Dashboard';

  // Configurações do gráfico
  public chartOptions = signal<any>(null);

  // Dados das tabelas
  public aportes = signal([
    { mes: 'Maio', taxas: 'R$ 12,50', total: 'R$ 3.842' },
    { mes: 'Abril', taxas: 'R$ 8,20', total: 'R$ 3.125' },
    { mes: 'Março', taxas: 'R$ 15,40', total: 'R$ 5.400' },
    { mes: 'Fevereiro', taxas: 'R$ 5,10', total: 'R$ 1.710' },
  ]);

  public pagamentos = signal([
    { dataDia: '15', dataMes: 'MAI', ticker: 'PETR4', tipo: 'Dividendos', valor: 'R$ 145,20', pago: true },
    { dataDia: '22', dataMes: 'MAI', ticker: 'ITUB4', tipo: 'JCP', valor: 'R$ 82,15', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
    { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
  ]);

  
  constructor() {
    this.initChart();
  }

  private initChart() {
    this.chartOptions.set({
      series: [
        {
          name: 'CDI',
          data: [1.1, 2.2, 3.3, 4.4, 5.48, 6.5, 7.6, 8.7, 9.8, 10.9, 12.0, 13.1]
        },
        {
          name: 'Minha Carteira',
          data: [2.5, 5.8, 4.2, 9.0, 14.2, 11.5, 17.2, 19.8, 15.0, 23.4, 28.6, 36.2]
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
          opacityFrom: [0.0, 0.45], // 0 para o CDI (sem fill), 0.2 para a Carteira
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
            'Março',
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
              <p class="text-[#94a3b8] mb-1 font-medium">${months[dataPointIndex]} 2024</p>
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
