import { Component, input, output } from '@angular/core';
import { RelatorioNotaCorretagem } from '../../../../models/relatorios.model';

@Component({
  selector: 'app-remover-nota',
  standalone: true,
  imports: [],
  templateUrl: './remover-nota.component.html',
})
export class RemoverNotaComponent {
  nota = input.required<RelatorioNotaCorretagem>();
  hasLinks = input(false);
  saving = output<'unlink' | 'cascade'>();
  fechar = output<void>();

  onUnlink(): void {
    this.saving.emit('unlink');
  }

  onCascade(): void {
    this.saving.emit('cascade');
  }

  onConfirm(): void {
    this.saving.emit('unlink');
  }

  onClose(): void {
    this.fechar.emit();
  }
}
