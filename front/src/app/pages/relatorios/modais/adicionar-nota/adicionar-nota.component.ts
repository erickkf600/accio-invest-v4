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

  close = output<void>();

  model = signal({
    nomeArquivo: '',
    documento: '',
    data: '',
    tipo: '',
  });

  notaForm = form(this.model, (s) => {
    required(s.nomeArquivo, { message: 'Nome do arquivo é obrigatório' });
    required(s.documento, { message: 'Documento é obrigatório' });
    required(s.data, { message: 'Data é obrigatória' });
    required(s.tipo, { message: 'Tipo é obrigatório' });
  });

  onFileDropped(files: FileList): void {
    if (files.length > 0) {
      this.model.update((m) => ({
        ...m,
        documento: files[0].name,
      }));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.model.update((m) => ({
        ...m,
        documento: input.files![0].name,
      }));
    }
  }

  onSubmit(): void {
    submit(this.notaForm, async () => {
      const data = this.model();
      this.relatoriosService.adicionarNota({
        nomeArquivo: data.nomeArquivo,
        documento: data.documento,
        data: data.data,
        tipo: data.tipo as any,
        tamanho: '150 KB',
      });
      this.close.emit();
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
