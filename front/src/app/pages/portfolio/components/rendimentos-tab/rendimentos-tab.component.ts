import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { type IncomeDashboardDto, PortfolioService } from '../../service/portfolio.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { TooltipDirective } from '../../../../components/Tooltip/tooltip.directive';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const abbreviatePipe = new AbbreviateNumberPipe();
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const EMPTY_DASHBOARD: IncomeDashboardDto = { rendaFixa: [], rentabilidadeMensal: [], dividendosPorAno: [] };

function formatShortDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day} ${MONTHS[Number(month) - 1]}, ${year}`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${month}/${year.slice(2)}`;
}

@Component({
  selector: 'app-rendimentos-tab',
  standalone: true,
  imports: [NgApexchartsModule, TableComponent, CellTemplateDirective, PdfButtonComponent, TooltipDirective],
  templateUrl: './rendimentos-tab.component.html',
})
export class RendimentosTabComponent implements OnInit, OnDestroy {
  private readonly portfolioService = inject(PortfolioService);
  private loadSub: Subscription | null = null;

  protected readonly dashboard = signal<IncomeDashboardDto>(EMPTY_DASHBOARD);
  protected readonly selectedYear = signal(String(new Date().getFullYear()));
  protected readonly rendaFixaCurrentPage = signal(1);
  protected readonly rentabilidadeCurrentPage = signal(1);

  readonly availableYears = computed(() => this.dashboard().dividendosPorAno.map(({ ano }) => ano));

  ngOnInit(): void {
    this.loadSub = this.portfolioService.loadIncomeDashboard().subscribe({
      next: ({ data }) => {
        this.dashboard.set(data);
        const years = data.dividendosPorAno.map(({ ano }) => ano);
        if (years.length > 0 && !years.includes(this.selectedYear())) this.selectedYear.set(years[years.length - 1]);
      },
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  onYearChange(event: Event): void {
    this.selectedYear.set((event.target as HTMLSelectElement).value);
  }

  onRendaFixaPageChange(page: number): void { this.rendaFixaCurrentPage.set(page); }
  onRentabilidadePageChange(page: number): void { this.rentabilidadeCurrentPage.set(page); }

  readonly rendaFixaColumns: TableColumn[] = [
    { key: 'emissor', label: 'Emissor' }, { key: 'tipoInvestimento', label: 'T. Invest.' },
    { key: 'tipoTitulo', label: 'T. Título' }, { key: 'dataCompra', label: 'D. Compra' },
    { key: 'dataVencimento', label: 'D. Venc.' }, { key: 'formaRendimento', label: 'F. Rend' },
    { key: 'indexador', label: 'Indexador' }, { key: 'grossUp', label: 'Gross Up' },
    { key: 'txJuros', label: 'Tx. Juros' }, { key: 'valorInvestido', label: 'V. Invest', align: 'right' },
    { key: 'rentabilidade', label: 'Rent.', align: 'right' },
  ];
  readonly rentabilidadeColumns: TableColumn[] = [
    { key: 'mes', label: 'Mês' }, { key: 'patrimonio', label: 'Patrimônio' },
    { key: 'patrimonioMedio', label: 'Patrimônio P. Médio' }, { key: 'proventos', label: 'Proventos Pagos' },
    { key: 'rentabilidade', label: 'Rentabilidade', align: 'right' },
  ];

  readonly rendaFixaData = computed(() => this.dashboard().rendaFixa.map((item) => ({
    id: item.id,
    emissor: item.emissor,
    tipoInvestimento: 'Renda Fixa',
    tipoTitulo: item.tipo,
    dataCompra: formatShortDate(item.dataCompra),
    dataVencimento: item.vencimento ? formatShortDate(item.vencimento) : '-',
    formaRendimento: item.tipo.toLocaleLowerCase('pt-BR').includes('pós') ? 'PÓS FIX' : 'PRÉ FIX',
    indexador: item.indexador,
    grossUp: '-',
    txJuros: `${item.taxaJuros}%`,
    valorInvestido: currencyFormatter.format(item.valorInvestido),
    rentabilidade: currencyFormatter.format(item.rendimento),
  })));

  readonly monthlyProfitability = computed(() => this.dashboard().rentabilidadeMensal.map((item) => ({
    mes: formatMonth(item.mes),
    patrimonio: currencyFormatter.format(item.patrimonio),
    patrimonioMedio: currencyFormatter.format(item.patrimonioMedio),
    proventos: currencyFormatter.format(item.proventos),
    rentabilidade: `${item.rentabilidade >= 0 ? '+' : ''}${item.rentabilidade.toFixed(3)}%`,
    rentabilidadeValue: item.rentabilidade,
  })).reverse());

  readonly currentYearLabel = computed(() => this.selectedYear());
  readonly previousYearLabel = computed(() => String(Number(this.selectedYear()) - 1));

  readonly dividendChartOptions = computed(() => {
    const currentYear = this.selectedYear();
    const previousYear = String(Number(currentYear) - 1);
    const years = new Map(this.dashboard().dividendosPorAno.map((item) => [item.ano, item.valores]));
    return {
      series: [{ name: previousYear, data: years.get(previousYear) ?? Array(12).fill(0) }, { name: currentYear, data: years.get(currentYear) ?? Array(12).fill(0) }],
      chart: { type: 'bar' as const, height: 220, toolbar: { show: false }, background: 'transparent', foreColor: '#94a3b8' },
      colors: ['#6b7280', '#75d33b'], legend: { show: false },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '55%', dataLabels: { position: 'top' } } },
      dataLabels: { enabled: false },
      grid: { show: true, borderColor: 'rgba(255, 255, 255, 0.05)', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
      xaxis: { categories: MONTHS, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94a3b8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: { labels: { show: false } },
      states: { active: { allowMultipleDataPointsSelection: false, filter: { type: 'darken' } }, hover: { filter: { type: 'darken', value: 0.15 } } },
      tooltip: { theme: 'dark' as const, y: { formatter: (value: number) => currencyFormatter.format(value) } },
    } as any;
  });

  readonly evolutionChartOptions = computed(() => {
    const data = this.dashboard().rentabilidadeMensal;
    return {
      series: [{ name: 'Patrimônio', data: data.map(({ patrimonio }) => patrimonio) }],
      chart: { type: 'area' as const, height: 280, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout' as const, speed: 800 }, background: 'transparent', foreColor: '#94a3b8' },
      colors: ['#75d33b'], stroke: { curve: 'smooth' as const, width: 2 },
      fill: { type: 'gradient' as const, gradient: { type: 'vertical' as const, shadeIntensity: 0, opacityFrom: 0.45, opacityTo: 0, stops: [0, 100] } },
      grid: { show: true, borderColor: 'rgba(255, 255, 255, 0.05)', strokeDashArray: 4 }, dataLabels: { enabled: false },
      xaxis: { categories: data.map(({ mes }) => formatMonth(mes)), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94a3b8', fontFamily: 'Plus Jakarta Sans, sans-serif' } } },
      yaxis: { show: false }, tooltip: { theme: 'dark' as const, y: { formatter: (value: number) => `R$ ${abbreviatePipe.transform(value)}` } },
    };
  });
}
