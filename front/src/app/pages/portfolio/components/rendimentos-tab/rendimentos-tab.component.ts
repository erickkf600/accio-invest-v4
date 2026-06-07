import { Component, inject, signal, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { TooltipDirective } from '../../../../components/Tooltip/tooltip.directive';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const abbreviatePipe = new AbbreviateNumberPipe();

@Component({
  selector: 'app-rendimentos-tab',
  standalone: true,
  imports: [NgApexchartsModule, TableComponent, CellTemplateDirective, PdfButtonComponent, TooltipDirective],
  templateUrl: './rendimentos-tab.component.html',
})
export class RendimentosTabComponent {
  private portfolioService = inject(PortfolioService);

  yields = computed(() => this.portfolioService.state$().yields);
  chartDataCollection = computed(() => this.portfolioService.state$().chartData);

  selectedYear = signal<string>(new Date().getFullYear().toString());

  rendaFixaCurrentPage = signal<number>(1);
  rentabilidadeCurrentPage = signal<number>(1);

  availableYears = computed(() => {
    return Object.keys(this.chartDataCollection()).sort();
  });

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(target.value);
  }

  onRendaFixaPageChange(page: number): void {
    this.rendaFixaCurrentPage.set(page);
  }

  onRentabilidadePageChange(page: number): void {
    this.rentabilidadeCurrentPage.set(page);
  }

  rendaFixaColumns: TableColumn[] = [
    { key: 'emissor', label: 'Emissor' },
    { key: 'tipoInvestimento', label: 'T. Invest.' },
    { key: 'tipoTitulo', label: 'T. Título' },
    { key: 'dataCompra', label: 'D. Compra' },
    { key: 'dataVencimento', label: 'D. Venc.' },
    { key: 'formaRendimento', label: 'F. Rend' },
    { key: 'indexador', label: 'Indexador' },
    { key: 'grossUp', label: 'Gross Up' },
    { key: 'txJuros', label: 'Tx. Juros' },
    { key: 'valorInvestido', label: 'V. Invest', align: 'right' },
    { key: 'rentabilidade', label: 'Rent.', align: 'right' },
  ];

  rentabilidadeColumns: TableColumn[] = [
    { key: 'mes', label: 'Mês' },
    { key: 'patrimonio', label: 'Patrimônio' },
    { key: 'patrimonioMedio', label: 'Patrimônio P. Médio' },
    { key: 'proventos', label: 'Proventos Pagos' },
    { key: 'rentabilidade', label: 'Rentabilidade', align: 'right' },
  ];

  rendaFixaData = computed(() => {
    return this.yields().map(y => ({
      id: y.id,
      emissor: y.emissor,
      tipoInvestimento: y.tipoInvestimento,
      tipoTitulo: y.tipoTitulo,
      dataCompra: y.dataCompra,
      dataVencimento: y.dataVencimento,
      formaRendimento: y.tipo === 'Pós-fixado' ? 'PÓS FIX' : 'PRÉ FIX',
      indexador: y.indexador,
      grossUp: y.grossUp,
      txJuros: y.txJuros,
      valorInvestido: `R$ ${y.total.toFixed(2)}`,
      rentabilidade: `R$ ${(y.total - y.valorUn).toFixed(2)}`,
    }));
  });

  private rentabilidadeYear = new Date().getFullYear().toString();

  monthlyProfitability = computed(() => {
    const data = this.chartDataCollection()[this.rentabilidadeYear];
    if (!data) return [];
    const months = data.yields;
    const dividends = data.dividends;
    let runningPatrimonio = 0;
    return months.map((val, i) => {
      runningPatrimonio += val;
      const medio = runningPatrimonio - val + val / 2;
      const rentPct = val > 0 ? ((dividends[i] || 0) / (runningPatrimonio || 1)) * 100 : 0;
      return {
        mes: `${String(i + 1).padStart(2, '0')}/${this.rentabilidadeYear.slice(2)}`,
        patrimonio: `R$ ${runningPatrimonio.toFixed(2)}`,
        patrimonioMedio: `R$ ${medio.toFixed(2)}`,
        proventos: `R$ ${(dividends[i] || 0).toFixed(2)}`,
        rentabilidade: `${rentPct >= 0 ? '+' : ''}${rentPct.toFixed(3)}%`,
        rentabilidadeValue: rentPct,
      };
    }).reverse();
  });

  currentYearLabel = computed(() => this.selectedYear());
  previousYearLabel = computed(() => {
    const data = this.chartDataCollection();
    const yearKeys = Object.keys(data).sort();
    const curIdx = yearKeys.indexOf(this.selectedYear());
    return curIdx > 0 ? yearKeys[curIdx - 1] : yearKeys[yearKeys.length - 1];
  });

  dividendChartOptions = computed(() => {
    const data = this.chartDataCollection();
    const currentYear = this.selectedYear();
    const yearKeys = Object.keys(data).sort();
    const curIdx = yearKeys.indexOf(currentYear);
    const prevYear = curIdx > 0 ? yearKeys[curIdx - 1] : yearKeys[yearKeys.length - 1];

    const current = data[currentYear]?.dividends || [];
    const previous = data[prevYear]?.dividends || [];

    return {
      series: [
        { name: prevYear, data: previous },
        { name: currentYear, data: current },
      ],
      chart: {
        type: 'bar' as const,
        height: 220,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
      },
      colors: ['#6b7280', '#75d33b'],
      legend: { show: false },
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: '55%',
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: MONTHS,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#94a3b8',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
        },
      },
      yaxis: {
        labels: { show: false },
      },
      states: {
        active: {
          allowMultipleDataPointsSelection: false,
          filter: { type: 'darken' },
        },
        hover: {
          filter: { type: 'darken', value: 0.15 },
        },
      },
      tooltip: {
        theme: 'dark' as const,
        y: {
          formatter: (val: number) => `R$ ${val.toFixed(2)}`,
        },
      },
    } as any;
  });

  evolutionChartOptions = computed(() => {
    const data = this.chartDataCollection();
    const years = Object.keys(data).sort();
    const yearlyTotals = years.map(year =>
      data[year].yields.reduce((a: number, b: number) => a + b, 0)
    );

    return {
      series: [{
        name: 'Patrimônio',
        data: yearlyTotals,
      }],
      chart: {
        type: 'area' as const,
        height: 280,
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout' as const, speed: 800 },
        background: 'transparent',
        foreColor: '#94a3b8',
      },
      colors: ['#75d33b'],
      stroke: {
        curve: 'smooth' as const,
        width: 2,
      },
      fill: {
        type: 'gradient' as const,
        gradient: {
          type: 'vertical' as const,
          shadeIntensity: 0,
          opacityFrom: 0.45,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      grid: {
        show: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4,
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: years,
        axisBorder: { show: false },
        axisTicks: { show: false },
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
      tooltip: {
        theme: 'dark' as const,
        y: {
          formatter: (val: number) => `R$ ${abbreviatePipe.transform(val)}`,
        },
      },
    };
  });
}
