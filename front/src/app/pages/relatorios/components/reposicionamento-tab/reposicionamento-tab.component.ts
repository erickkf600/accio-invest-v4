import { Component, signal, computed } from '@angular/core';
import { RelatorioReposicionamento } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from '../filtroRelatorio/filtro-relatorio.component';
import { MOCK_REPOSICIONAMENTOS } from '../../service/mock/relatorios.mock';

@Component({
  selector: 'app-reposicionamento-tab',
  standalone: true,
  imports: [FiltroRelatorioComponent, TableComponent, CellTemplateDirective, PdfButtonComponent],
  templateUrl: './reposicionamento-tab.component.html',
})
export class ReposicionamentoTabComponent {
  reposicionamentos = signal<RelatorioReposicionamento[]>(MOCK_REPOSICIONAMENTOS);

  searchTerm = signal<string>('');

  filteredReposicionamentos = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.reposicionamentos();
    return this.reposicionamentos().filter(r => r.ticker.toLowerCase().includes(term));
  });

  onFilterApplied(term: string): void {
    this.searchTerm.set(term);
  }

  onFiltersCleared(): void {
    this.searchTerm.set('');
  }

  reposicionamentosColumns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ticker', label: 'Ticker' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'fator', label: 'Fator' },
    { key: 'proporcao', label: 'Proporção', align: 'center' }
  ];
}
