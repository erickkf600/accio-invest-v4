import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService } from '../../service/relatorios.service';
import { RelatorioPrecoMedio } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FilterCardComponent } from '../../../../components/FilterCard/filter-card.component';

type FilterModel = { searchTerm: string; selectedType: string };

@Component({
  selector: 'app-preco-medio-tab',
  standalone: true,
  imports: [FilterCardComponent, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent],
  templateUrl: './preco-medio-tab.component.html',
})
export class PrecoMedioTabComponent {
  private relatoriosService = inject(RelatoriosService);
  private destroyRef = inject(DestroyRef);

  precoMedio = signal<RelatorioPrecoMedio[]>([]);

  searchTerm = signal<string>('');
  selectedType = signal<string>('Todos');

  constructor() {
    this.relatoriosService.getPrecoMedio().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const list: RelatorioPrecoMedio[] = (res.data.data || []).map((p, idx) => ({
          id: String(idx + 1),
          ticker: p.ticker,
          tipo: p.tipo,
          qtd: p.qtd,
          precoMedio: p.precoMedio,
          custoTotal: p.custoTotal,
        }));
        this.precoMedio.set(list);
      },
    });
  }

  filteredPrecoMedio = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.precoMedio();
    return this.precoMedio().filter(pm => pm.ticker.toLowerCase().includes(term));
  });

  onFilterApplied(model: FilterModel): void {
    this.searchTerm.set(model.searchTerm);
    this.selectedType.set(model.selectedType);
  }

  onFiltersCleared(): void {
    this.searchTerm.set('');
    this.selectedType.set('Todos');
  }

  precoMedioColumns: TableColumn[] = [
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Quantidade acumulada', align: 'right' },
    { key: 'precoMedio', label: 'Preço Médio Histórico', align: 'right' },
    { key: 'custoTotal', label: 'Custo Total Acumulado', align: 'right' }
  ];
}
