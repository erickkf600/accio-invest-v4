import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatoriosService } from '../../service/relatorios.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';
import { PdfButtonComponent } from '../../../../components/pdfButton/pdf-button.component';
import { FiltroRelatorioComponent } from '../filtroRelatorio/filtro-relatorio.component';
import { TooltipDirective } from '../../../../components/Tooltip/tooltip.directive';

@Component({
  selector: 'app-renda-fixa-tab',
  standalone: true,
  imports: [FiltroRelatorioComponent, DecimalPipe, AbbreviateNumberPipe, TableComponent, CellTemplateDirective, PdfButtonComponent, TooltipDirective],
  templateUrl: './renda-fixa-tab.component.html',
})
export class RendaFixaTabComponent {
  private relatoriosService = inject(RelatoriosService);

  rendaFixa = computed(() => this.relatoriosService.state$().rendaFixa);

  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 10;

  filteredRendaFixa = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    let list = this.rendaFixa();
    if (term) {
      list = list.filter(rf =>
        rf.emissor.toLowerCase().includes(term) || rf.indexador.toLowerCase().includes(term)
      );
    }
    return list;
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onFilterApplied(term: string): void {
    this.currentPage.set(1);
    this.searchTerm.set(term);
  }

  onFiltersCleared(): void {
    this.currentPage.set(1);
    this.searchTerm.set('');
  }

  rfColumns: TableColumn[] = [
    { key: 'emissor', label: 'Emissor' },
    { key: 'tipoInvestimento', label: 'T. Invest.' },
    { key: 'tipoTitulo', label: 'T. Título' },
    { key: 'dataCompra', label: 'D. Compra' },
    { key: 'vencimento', label: 'D. Venc.' },
    { key: 'formaRend', label: 'F. Rend' },
    { key: 'indexador', label: 'Indexador' },
    { key: 'grossUp', label: 'Gross Up' },
    { key: 'taxaJuros', label: 'Tx. Juros', align: 'right' },
    { key: 'valorAplicado', label: 'V. Invest', align: 'right' },
    { key: 'rentabilidade', label: 'Rent.', align: 'right' },
    { key: 'expirado', label: 'Expirado', align: 'center' },
  ];
}
