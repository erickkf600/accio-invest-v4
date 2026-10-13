import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RelatorioReposicionamento } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from '../filtroRelatorio/filtro-relatorio.component';
import { RelatoriosService, toDmy } from '../../service/relatorios.service';

@Component({
  selector: 'app-reposicionamento-tab',
  standalone: true,
  imports: [FiltroRelatorioComponent, TableComponent, CellTemplateDirective, PdfButtonComponent],
  templateUrl: './reposicionamento-tab.component.html',
})
export class ReposicionamentoTabComponent {
  private relatoriosService = inject(RelatoriosService);
  private destroyRef = inject(DestroyRef);

  reposicionamentos = signal<RelatorioReposicionamento[]>([]);

  searchTerm = signal<string>('');

  constructor() {
    this.relatoriosService.getReposicionamentos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.reposicionamentos.set(
          (res.data || []).map((r) => {
            const de = Number(r.ratioDe);
            const para = Number(r.ratioPara);
            return {
              id: String(r.id),
              ticker: r.ticker,
              data: toDmy(r.dataOperacao),
              tipo: r.tipo ?? '',
              fator: para > de ? 'Desdobramento' : 'Agrupamento',
              proporcaoDe: de,
              proporcaoPara: para,
            };
          }),
        );
      },
    });
  }

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
