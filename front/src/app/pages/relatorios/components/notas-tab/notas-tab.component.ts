import { Component, inject, signal, output, input, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RelatoriosService, NotaDto } from '../../service/relatorios.service';
import { RelatorioNotaCorretagem } from '../../../../models/relatorios.model';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';

function toDmy(d: string): string {
  const date = new Date(d);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

@Component({
  selector: 'app-notas-tab',
  standalone: true,
  imports: [TableComponent, CellTemplateDirective],
  templateUrl: './notas-tab.component.html',
})
export class NotasTabComponent {
  private relatoriosService = inject(RelatoriosService);
  private destroyRef = inject(DestroyRef);

  readonly refreshKey = input(0);

  readonly tipoLabels: Record<string, string> = {
    V_RV: 'VENDA - RENDA VARIÁVEL',
    C_RV: 'COMPRA - RENDA VARIÁVEL',
    RF: 'RENDA FIXA',
  };

  notas = signal<RelatorioNotaCorretagem[]>([]);

  readonly adicionarNota = output<void>();
  readonly removeNota = output<RelatorioNotaCorretagem>();

  constructor() {
    effect(() => {
      this.refreshKey();
      this.loadNotas();
    });
  }

  private loadNotas(): void {
    this.relatoriosService.getNotas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const notas: RelatorioNotaCorretagem[] = (res.data.data || []).map(n => ({
          id: String(n.id),
          nomeArquivo: n.nome,
          documento: n.nome,
          data: toDmy(n.data),
          tipo: n.tipo,
          path: n.path,
        }));
        this.notas.set(notas);
      },
    });
  }

  notasColumns: TableColumn[] = [
    { key: 'data', label: 'Data da Nota' },
    { key: 'documento', label: 'Nome do Documento' },
    { key: 'tipo', label: 'Tipo de Nota' },
    { key: 'acoes', label: '' },
  ];
}
