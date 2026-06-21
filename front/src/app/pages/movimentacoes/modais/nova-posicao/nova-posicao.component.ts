import { Component, signal, output, inject, input, computed, effect } from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormField, form, submit, required } from '@angular/forms/signals';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { ToastService } from '../../../../components/Toast/toast.service';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import type { Operation } from '../../movimentacoes';

@Component({
  selector: 'app-nova-posicao',
  standalone: true,
  imports: [FormField, DateMaskDirective],
  providers: [DatePipe],
  templateUrl: './nova-posicao.component.html',
})
export class NovaPosicaoComponent {
  private movimentacoesService = inject(MovimentacoesService);
  private toast = inject(ToastService);
  private datePipe = inject(DatePipe);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  model = signal({
    ticker: '',
    dataOperacao: '',
    tipo: '',
    fator: '',
    ratioDe: '',
    ratioPara: '',
    observacoes: '',
  });

  novaPosicaoForm = form(this.model, (s) => {
    required(s.ticker, { message: 'Cód. Ativo é obrigatório' });
    required(s.dataOperacao, { message: 'Data da operação é obrigatória' });
    required(s.tipo, { message: 'Tipo é obrigatório' });
    required(s.fator, { message: 'Fator é obrigatório' });
    required(s.ratioDe, { message: 'Proporção (De) é obrigatória' });
    required(s.ratioPara, { message: 'Proporção (Para) é obrigatória' });
  });

  isSubmitting = signal(false);
  submitError = signal('');

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          ticker: op.ativo,
          dataOperacao: this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string,
          tipo: 'Desdobramento',
          fator: 'Desdobramento',
          ratioDe: '1',
          ratioPara: '2',
          observacoes: op.observacoes ?? '',
        });
      }
    });
  }

  onSubmit(): void {
    this.submitError.set('');
    submit(this.novaPosicaoForm, async () => {
      this.isSubmitting.set(true);
      const m = this.model();
      const payload = {
        ticker: m.ticker,
        dataOperacao: this.toDateIso(m.dataOperacao),
        tipo: m.tipo,
        fator: m.fator,
        ratioDe: m.ratioDe,
        ratioPara: m.ratioPara,
        observacoes: m.observacoes || '',
      };

      const request$ = this.isEditing()
        ? this.movimentacoesService.updateRepositioning(this.operation()!.id, payload)
        : this.movimentacoesService.createRepositioning(payload);

      request$.subscribe({
        next: () => {
          this.toast.success({ message: 'Reposicionamento registrado com sucesso!' });
          this.confirmed.emit();
          this.close.emit();
        },
        error: () => {
          this.toast.error({ title: 'Erro', message: 'Erro ao salvar reposicionamento.' });
        },
        complete: () => this.isSubmitting.set(false),
      });
    });
  }

  private toDateIso(ddmmyyyy: string): string {
    const [dia, mes, ano] = ddmmyyyy.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  onClose(): void {
    this.close.emit();
  }
}
