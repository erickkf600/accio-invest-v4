import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService, toDmy } from '../../service/relatorios.service';
import { RelatorioAluguel } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FilterCardComponent } from '../../../../components/FilterCard/filter-card.component';

type FilterModel = { searchTerm: string; selectedType: string };

@Component({
  selector: 'app-alugueis-tab',
  standalone: true,
  imports: [FilterCardComponent, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent],
  templateUrl: './alugueis-tab.component.html',
})
export class AlugueisTabComponent {
  private relatoriosService = inject(RelatoriosService);
  private destroyRef = inject(DestroyRef);

  alugueis = signal<RelatorioAluguel[]>([]);

  searchTerm = signal<string>('');
  selectedType = signal<string>('Todos');

  constructor() {
    this.relatoriosService.getAlugueis().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const list: RelatorioAluguel[] = (res.data.data || []).map((a) => ({
          id: String(a.id),
          ticker: a.ticker,
          data: toDmy(a.data),
          qtd: a.qtd,
          precoUn: a.precoUn,
          total: a.total,
        }));
        this.alugueis.set(list);
      },
    });
  }

  filteredAlugueis = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.alugueis();
    return this.alugueis().filter(a => a.ticker.toLowerCase().includes(term));
  });

  onFilterApplied(model: FilterModel): void {
    this.searchTerm.set(model.searchTerm);
    this.selectedType.set(model.selectedType);
  }

  onFiltersCleared(): void {
    this.searchTerm.set('');
    this.selectedType.set('Todos');
  }

  alugueisColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoUn', label: 'Valor Unitário', align: 'right' },
    { key: 'total', label: 'Valor Total', align: 'right' }
  ];
}
