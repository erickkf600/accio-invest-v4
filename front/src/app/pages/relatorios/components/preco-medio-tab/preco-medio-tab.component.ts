import { Component, inject, signal, computed } from '@angular/core';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService } from '../../service/relatorios.service';
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

  precoMedio = computed(() => this.relatoriosService.state$().precoMedio);

  searchTerm = signal<string>('');
  selectedType = signal<string>('Todos');

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
