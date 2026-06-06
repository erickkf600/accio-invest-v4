import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-meus-produtos',
  standalone: true,
  imports: [DecimalPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, NgApexchartsModule],
  templateUrl: './meus-produtos.component.html',
})
export class MeusProdutosComponent {
  private portfolioService = inject(PortfolioService);

  products = computed(() => this.portfolioService.state$().products);

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

  // Allocation donut chart options
  allocationChartOptions = computed(() => {
    const acoesVal = this.products().filter(p => p.tipo === 'Ações').reduce((acc, p) => acc + p.valorAtual, 0);
    const fiisVal = this.products().filter(p => p.tipo === 'FII').reduce((acc, p) => acc + p.valorAtual, 0);
    const total = acoesVal + fiisVal || 1;

    return {
      series: [
        parseFloat(((acoesVal / total) * 100).toFixed(1)),
        parseFloat(((fiisVal / total) * 100).toFixed(1))
      ],
      chart: {
        type: 'donut' as const,
        height: 240,
        background: 'transparent',
        foreColor: '#94a3b8'
      },
      labels: ['Ações', 'FIIs'],
      colors: ['#75d33b', '#60a5fa'],
      stroke: {
        show: false
      },
      legend: {
        position: 'bottom' as const,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        labels: {
          colors: '#f8fafc'
        }
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
                label: 'Ações/FIIs',
                color: '#94a3b8',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }
            }
          }
        }
      }
    };
  });
}
