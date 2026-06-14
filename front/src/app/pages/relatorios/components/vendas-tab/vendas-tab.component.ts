import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService, toDmy } from '../../service/relatorios.service';
import { RelatorioVenda } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from '../filtroRelatorio/filtro-relatorio.component';

@Component({
  selector: 'app-vendas-tab',
  standalone: true,
  imports: [FiltroRelatorioComponent, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent],
  templateUrl: './vendas-tab.component.html',
})
export class VendasTabComponent {
  private relatoriosService = inject(RelatoriosService);
  private destroyRef = inject(DestroyRef);
  private abbreviatePipe = new AbbreviateNumberPipe();

  vendas = signal<RelatorioVenda[]>([]);

  searchTerm = signal<string>('');

  constructor() {
    this.relatoriosService.getVendas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const list: RelatorioVenda[] = (res.data.data || []).map((v) => ({
          id: String(v.id),
          ticker: v.ticker,
          data: toDmy(v.data),
          qtd: v.qtd,
          precoUn: v.precoUn,
          total: v.total,
          taxas: v.taxas ?? 0,
          resultado: v.resultado ?? 0,
        }));
        this.vendas.set(list);
      },
    });
  }

  filteredVendas = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.vendas();
    return this.vendas().filter(v => v.ticker.toLowerCase().includes(term));
  });

  formatResultado(val: number): string {
    const sign = val >= 0 ? '+' : '-';
    return `${sign}R$ ${this.abbreviatePipe.transform(Math.abs(val))}`;
  }

  onFilterApplied(term: string): void {
    this.searchTerm.set(term);
  }

  onFiltersCleared(): void {
    this.searchTerm.set('');
  }

  vendasColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoUn', label: 'Preço Venda Un.', align: 'right' },
    { key: 'total', label: 'Custo Total', align: 'right' },
    { key: 'taxas', label: 'Taxas', align: 'right' },
    { key: 'resultado', label: 'Resultado Líquido', align: 'right' }
  ];
}
