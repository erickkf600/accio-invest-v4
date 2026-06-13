import { Component, inject, signal, computed, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RelatoriosService } from '../../service/relatorios.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from '../filtroRelatorio/filtro-relatorio.component';
import { RelatorioAporte } from '../../../../models/relatorios.model';

@Component({
  selector: 'app-aporte-tab',
  standalone: true,
  imports: [DecimalPipe, AbbreviateNumberPipe, NgApexchartsModule, TableComponent, CellTemplateDirective, PdfButtonComponent, FiltroRelatorioComponent],
  templateUrl: './aporte-tab.component.html',
})
export class AporteTabComponent {
  private relatoriosService = inject(RelatoriosService);

  selectedYear = signal<string>(new Date().getFullYear().toString());
  selectedMonthIndex = signal<number | null>(null);
  months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  aportes = computed(() => this.relatoriosService.state$().aportes);
  chartDataCollection = computed(() => this.relatoriosService.state$().chartData);

  availableYears = computed(() => Object.keys(this.chartDataCollection()).sort());

  readonly viewDetails = output<RelatorioAporte>();

  searchTerm = signal<string>('');

  onFilterApplied(term: string): void {
    this.searchTerm.set(term);
  }

  onFiltersCleared(): void {
    this.searchTerm.set('');
  }

  onYearChange(year: string): void {
    this.selectedYear.set(year);
    this.selectedMonthIndex.set(null);
  }

  tableTitle = computed(() => {
    const idx = this.selectedMonthIndex();
    if (idx === null) return 'Histórico de Aportes';
    return `Histórico detalhado - ${this.months[idx]} de ${this.selectedYear()}`;
  });

  filteredAportes = computed<RelatorioAporte[]>(() => {
    const year = parseInt(this.selectedYear());
    const monthIdx = this.selectedMonthIndex();
    const term = this.searchTerm().toLowerCase().trim();
    let list = this.aportes().filter(a => a.ano === year);
    if (monthIdx !== null) {
      const monthName = this.monthsFull[monthIdx];
      list = list.filter(a => a.mes === monthName);
    }
    if (term) {
      list = list.filter(a =>
        a.detalhes.toLowerCase().includes(term) ||
        a.data.toLowerCase().includes(term) ||
        a.mes.toLowerCase().includes(term)
      );
    }
    return list;
  });

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
              this.selectedMonthIndex.set(null);
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
        show: false
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `R$ ${val.toFixed(2)}`
        }
      }
    } as any;
  });

  aportesColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'mes', label: 'Mês de Referência' },
    { key: 'valor', label: 'Valor Aportado', align: 'right' },
    { key: 'taxas', label: 'Taxas da Operação', align: 'right' },
    { key: 'actions', label: '', align: 'right' }
  ];

  currentPage = signal<number>(1);
  pageSize = 10;

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
    }
  }

  totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.filteredAportes().length / this.pageSize) : 0;
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const list: number[] = [];
    for (let i = 1; i <= total; i++) list.push(i);
    if (total <= 5) return list;
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  }
}
