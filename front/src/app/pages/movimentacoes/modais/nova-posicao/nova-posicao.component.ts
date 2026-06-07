import { Component, signal, output, inject, input, computed, effect } from '@angular/core';
import { FormField, form, submit, required } from '@angular/forms/signals';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import type { Operation } from '../../movimentacoes';

@Component({
  selector: 'app-nova-posicao',
  standalone: true,
  imports: [FormField, DateMaskDirective],
  templateUrl: './nova-posicao.component.html',
})
export class NovaPosicaoComponent {
  private movimentacoesService = inject(MovimentacoesService);

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

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          ticker: op.ativo,
          dataOperacao: op.data,
          tipo: 'Desdobramento',
          fator: 'Desdobramento',
          ratioDe: '1',
          ratioPara: '2',
          observacoes: '',
        });
      }
    });
  }

  onSubmit(): void {
    submit(this.novaPosicaoForm, async () => {
      const data = this.model();
      console.log('Nova Posição Saved:', data);
      this.confirmed.emit();
      this.close.emit();
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
