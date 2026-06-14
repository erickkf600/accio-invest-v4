import { Component, signal, output, inject } from '@angular/core';
import { FormField, form, submit, required } from '@angular/forms/signals';
import { DragDropDirective } from '../../../../directives/drag-drop.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { RelatoriosService } from '../../service/relatorios.service';

@Component({
  selector: 'app-adicionar-nota',
  standalone: true,
  imports: [DragDropDirective, DateMaskDirective, FormField],
  templateUrl: './adicionar-nota.component.html',
})
export class AdicionarNotaComponent {
  private relatoriosService = inject(RelatoriosService);

  fechar = output<void>();
  notaAdicionada = output<void>();

  saving = signal(false);

  arquivo = signal<File | null>(null);

  model = signal({
    nomeArquivo: '',
    documento: '',
    data: '',
    tipo: '',
    path: '',
  });

  notaForm = form(this.model, (s) => {
    required(s.nomeArquivo, { message: 'Nome do arquivo é obrigatório' });
    required(s.documento, { message: 'Documento é obrigatório' });
    required(s.data, { message: 'Data é obrigatória' });
    required(s.tipo, { message: 'Tipo é obrigatório' });
  });

  onFileDropped(files: FileList): void {
    if (files.length > 0) {
      this.arquivo.set(files[0]);
      this.model.update((m) => ({
        ...m,
        documento: files[0].name,
      }));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.arquivo.set(file);
      this.model.update((m) => ({
        ...m,
        documento: file.name,
      }));
    }
  }

  onSubmit(): void {
    submit(this.notaForm, async () => {
      const data = this.model();
      const file = this.arquivo();
      if (!file) return;

      this.saving.set(true);
      this.relatoriosService.uploadNota(file, data.nomeArquivo).subscribe({
        next: () => {
          this.saving.set(false);
          this.notaAdicionada.emit();
        },
        error: () => {
          this.saving.set(false);
        },
      });
    });
  }

  onClose(): void {
    this.fechar.emit();
  }
}
