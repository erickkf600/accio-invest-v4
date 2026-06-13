import { Component, inject, computed, output } from '@angular/core';
import { RelatoriosService } from '../../service/relatorios.service';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';

@Component({
  selector: 'app-notas-tab',
  standalone: true,
  imports: [TableComponent, CellTemplateDirective],
  templateUrl: './notas-tab.component.html',
})
export class NotasTabComponent {
  private relatoriosService = inject(RelatoriosService);

  notas = computed(() => this.relatoriosService.state$().notas);

  readonly adicionarNota = output<void>();

  notasColumns: TableColumn[] = [
    { key: 'data', label: 'Data da Nota' },
    { key: 'documento', label: 'Nome do Documento' },
    { key: 'tipo', label: 'Tipo de Nota' },
    { key: 'tamanho', label: 'Tamanho' }
  ];
}
