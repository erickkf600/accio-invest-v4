import { Component, inject, signal, computed } from '@angular/core';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService } from '../../service/relatorios.service';
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

  alugueis = computed(() => this.relatoriosService.state$().alugueis);

  searchTerm = signal<string>('');
  selectedType = signal<string>('Todos');

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
