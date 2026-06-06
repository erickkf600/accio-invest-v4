import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TabsComponent, TabOption } from '../../components/tabs/tabs.component';
import { TableComponent, TableColumn } from '../../components/Table/table.component';
import { CellTemplateDirective } from '../../components/Table/cell-template.directive';
import { FilterCardComponent } from '../../components/FilterCard/filter-card.component';
import { PdfButtonComponent } from '../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from './components/filtroRelatorio/filtro-relatorio.component';
import { DetalhesAporteComponent } from './modais/detalhes-aporte/detalhes-aporte.component';
import { AdicionarNotaComponent } from './modais/adicionar-nota/adicionar-nota.component';
import { RelatoriosService } from './service/relatorios.service';
import {
  RelatorioAporte,
  RelatorioAluguel,
  RelatorioVenda,
  RelatorioReposicionamento,
  RelatorioNotaCorretagem,
  RelatorioPrecoMedio,
  RelatorioRendaFixa
} from '../../models/relatorios.model';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    NgClass,
    DecimalPipe,
    NgApexchartsModule,
    TabsComponent,
    TableComponent,
    CellTemplateDirective,
    FilterCardComponent,
    PdfButtonComponent,
    FiltroRelatorioComponent,
    DetalhesAporteComponent,
    AdicionarNotaComponent,
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export default class Relatorios {
  protected readonly title = 'Relatórios';
  private relatoriosService = inject(RelatoriosService);

  // Sub-tabs configuration
  tabOptions = signal<TabOption[]>([
    { id: 'aportes', label: 'Histórico de Aportes', icon: 'history' },
    { id: 'alugueis', label: 'Recebidos de Aluguéis', icon: 'domain' },
    { id: 'vendas', label: 'Vendas', icon: 'sell' },
    { id: 'reposicionamento', label: 'Reposicionamento', icon: 'published_with_changes' },
    { id: 'notas', label: 'Notas de Corretagem', icon: 'receipt_long' },
    { id: 'preco-medio', label: 'Preço Médio Histórico', icon: 'analytics' },
    { id: 'renda-fixa', label: 'Renda Fixa', icon: 'account_balance' },
  ]);

  activeTabId = signal<string>('aportes');

  // Search/Filters State
  generalSearchTerm = signal<string>('');
  generalSelectedType = signal<string>('Todos'); // 'Todos', 'Compra', 'Venda', 'Proventos'
  relatorioSearchTerm = signal<string>(''); // Used by FiltroRelatorio

  // Modals state
  selectedAporte = signal<RelatorioAporte | null>(null);
  showAdicionarNota = signal<boolean>(false);

  // Tab 1: Aportes Chart interactive state
  selectedYear = signal<string>('2024');
  selectedMonthIndex = signal<number | null>(null);
  availableYears = ['2023', '2024', '2025', '2026'];
  months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Tab 7: Renda Fixa columns customization toggles
  rfShowLiquidez = signal<boolean>(true);
  rfShowVencimento = signal<boolean>(true);
  rfShowImposto = signal<boolean>(true);

  // Services references
  aportes = computed(() => this.relatoriosService.state$().aportes);
  alugueis = computed(() => this.relatoriosService.state$().alugueis);
  vendas = computed(() => this.relatoriosService.state$().vendas);
  reposicionamentos = computed(() => this.relatoriosService.state$().reposicionamentos);
  notas = computed(() => this.relatoriosService.state$().notas);
  precoMedio = computed(() => this.relatoriosService.state$().precoMedio);
  rendaFixa = computed(() => this.relatoriosService.state$().rendaFixa);
  chartDataCollection = computed(() => this.relatoriosService.state$().chartData);

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
    this.clearFilters();
  }

  // General filter card callbacks (Recebidos de Alugueis, Preço Médio)
  onGeneralFilterApplied(model: { searchTerm: string; selectedType: string }): void {
    this.generalSearchTerm.set(model.searchTerm);
    this.generalSelectedType.set(model.selectedType);
  }

  onGeneralFiltersCleared(): void {
    this.generalSearchTerm.set('');
    this.generalSelectedType.set('Todos');
  }

  // FiltroRelatorio callbacks (Vendas, Reposicionamento, Renda Fixa)
  onRelatorioFilterApplied(model: { searchTerm: string }): void {
    this.relatorioSearchTerm.set(model.searchTerm);
  }

  onRelatorioFiltersCleared(): void {
    this.relatorioSearchTerm.set('');
  }

  clearFilters(): void {
    this.onGeneralFiltersCleared();
    this.onRelatorioFiltersCleared();
    this.selectedMonthIndex.set(null);
  }

  // Dynamic lists calculations
  // Tab 1: Aportes Filtered
  filteredAportes = computed<RelatorioAporte[]>(() => {
    const year = parseInt(this.selectedYear());
    const monthIdx = this.selectedMonthIndex();
    
    let list = this.aportes().filter(a => a.ano === year);
    if (monthIdx !== null) {
      const monthName = this.monthsFull[monthIdx];
      list = list.filter(a => a.mes === monthName);
    }
    return list;
  });

  // Tab 2: Alugueis Filtered
  filteredAlugueis = computed<RelatorioAluguel[]>(() => {
    const term = this.generalSearchTerm().toLowerCase().trim();
    if (!term) return this.alugueis();
    return this.alugueis().filter(a => a.ticker.toLowerCase().includes(term));
  });

  // Tab 3: Vendas Filtered
  filteredVendas = computed<RelatorioVenda[]>(() => {
    const term = this.relatorioSearchTerm().toLowerCase().trim();
    if (!term) return this.vendas();
    return this.vendas().filter(v => v.ticker.toLowerCase().includes(term));
  });

  // Tab 4: Reposicionamentos Filtered
  filteredReposicionamentos = computed<RelatorioReposicionamento[]>(() => {
    const term = this.relatorioSearchTerm().toLowerCase().trim();
    if (!term) return this.reposicionamentos();
    return this.reposicionamentos().filter(r => r.ticker.toLowerCase().includes(term));
  });

  // Tab 5: Notas Filtered (No filters needed, standard list)
  filteredNotas = computed<RelatorioNotaCorretagem[]>(() => this.notas());

  // Tab 6: Preco Medio Filtered
  filteredPrecoMedio = computed<RelatorioPrecoMedio[]>(() => {
    const term = this.generalSearchTerm().toLowerCase().trim();
    if (!term) return this.precoMedio();
    return this.precoMedio().filter(pm => pm.ticker.toLowerCase().includes(term));
  });

  // Tab 7: Renda Fixa Filtered
  filteredRendaFixa = computed<RelatorioRendaFixa[]>(() => {
    const term = this.relatorioSearchTerm().toLowerCase().trim();
    if (!term) return this.rendaFixa();
    return this.rendaFixa().filter(rf =>
      rf.emissor.toLowerCase().includes(term) || rf.indexador.toLowerCase().includes(term)
    );
  });

  // Chart configuration for Tab 1 (Aportes)
  aportesChartOptions = computed(() => {
    const data = this.chartDataCollection()[this.selectedYear()];
    const seriesData = data ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    return {
      series: [
        {
          name: 'Total Aportado',
          data: seriesData
        }
      ],
      chart: {
        type: 'bar' as const,
        height: 250,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: '#94a3b8',
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const idx = config.dataPointIndex;
            if (this.selectedMonthIndex() === idx) {
              this.selectedMonthIndex.set(null); // Click again to clear
            } else {
              this.selectedMonthIndex.set(idx);
            }
          }
        }
      },
      colors: ['#75d33b'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '40%',
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val > 0 ? `R$ ${val}` : '',
        offsetY: -15,
        style: {
          fontSize: '9px',
          colors: ['#f8fafc']
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        categories: this.months,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `R$ ${val}`
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

  // Dynamic columns configuration for Renda Fixa (Tab 7)
  rfColumns = computed<TableColumn[]>(() => {
    const cols: TableColumn[] = [
      { key: 'emissor', label: 'Emissor' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'indexador', label: 'Indexador' },
      { key: 'taxaJuros', label: 'Taxa Juros', align: 'right' }
    ];

    if (this.rfShowLiquidez()) {
      cols.push({ key: 'liquidezDiaria', label: 'Liquidez Diária', align: 'center' });
    }
    if (this.rfShowVencimento()) {
      cols.push({ key: 'vencimento', label: 'Vencimento', align: 'center' });
    }
    if (this.rfShowImposto()) {
      cols.push({ key: 'possuiImposto', label: 'Possui Imposto', align: 'center' });
    }

    cols.push({ key: 'valorAplicado', label: 'Valor Aplicado', align: 'right' });
    return cols;
  });

  // Table Headers
  aportesColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'mes', label: 'Mês de Referência' },
    { key: 'valor', label: 'Valor Aportado', align: 'right' },
    { key: 'taxas', label: 'Taxas da Operação', align: 'right' },
    { key: 'actions', label: '', align: 'right' }
  ];

  alugueisColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoUn', label: 'Valor Unitário', align: 'right' },
    { key: 'total', label: 'Valor Total', align: 'right' }
  ];

  vendasColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoUn', label: 'Preço Venda Un.', align: 'right' },
    { key: 'total', label: 'Custo Total', align: 'right' },
    { key: 'taxas', label: 'Taxas', align: 'right' },
    { key: 'resultado', label: 'Resultado Líquido', align: 'right' }
  ];

  reposicionamentosColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'fator', label: 'Fator' },
    { key: 'proporcao', label: 'Proporção', align: 'center' }
  ];

  notasColumns: TableColumn[] = [
    { key: 'data', label: 'Data da Nota' },
    { key: 'documento', label: 'Nome do Documento' },
    { key: 'tipo', label: 'Tipo de Nota' },
    { key: 'tamanho', label: 'Tamanho' }
  ];

  precoMedioColumns: TableColumn[] = [
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Quantidade acumulada', align: 'right' },
    { key: 'precoMedio', label: 'Preço Médio Histórico', align: 'right' },
    { key: 'custoTotal', label: 'Custo Total Acumulado', align: 'right' }
  ];

  viewDetails(row: RelatorioAporte): void {
    this.selectedAporte.set(row);
  }

  closeDetailsModal(): void {
    this.selectedAporte.set(null);
  }

  openNotaModal(): void {
    this.showAdicionarNota.set(true);
  }

  closeNotaModal(): void {
    this.showAdicionarNota.set(false);
  }
}
