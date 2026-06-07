import { Component, signal, output, inject, input, computed, effect } from '@angular/core';
import { FormField, form, submit, required, pattern } from '@angular/forms/signals';
import { CurrencyMaskDirective, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { TabsComponent } from '../../../../components/tabs/tabs.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import type { Operation } from '../../movimentacoes';

@Component({
  selector: 'app-nova-renda-fixa',
  standalone: true,
  imports: [FormField, CurrencyMaskDirective, DateMaskDirective, TabsComponent],
  templateUrl: './nova-renda-fixa.component.html',
})
export class NovaRendaFixaComponent {
  private movimentacoesService = inject(MovimentacoesService);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  // Modal active tab: 'compra' or 'rendimento'
  activeTab = signal<'compra' | 'rendimento'>('compra');

  // Signal Forms model
  model = signal({
    emissor: '',
    tipo: '',
    indexador: '',
    taxaJuros: '', // Format 10.50%
    liquidezDiaria: false,
    vencimento: '',
    possuiImposto: true,
    valorAplicado: '',
    dataCompra: '',
    // Yield tab model fields
    dataRendimento: '',
    valorRendimento: '',
  });

  compraForm = form(this.model, (s) => {
    required(s.emissor, { message: 'Emissor é obrigatório' });
    required(s.tipo, { message: 'Tipo é obrigatório' });
    required(s.indexador, { message: 'Indexador é obrigatório' });
    required(s.taxaJuros, { message: 'Taxa de juros é obrigatória' });
    pattern(s.taxaJuros, /^\d+(?:[.,]\d{2})?$/, { message: 'Ex: 10,50' });

    required(s.valorAplicado, { message: 'Valor aplicado é obrigatório' });
    required(s.dataCompra, { message: 'Data de compra é obrigatória' });

    required(s.vencimento, {
      message: 'Vencimento é obrigatório quando não há liquidez diária',
      when({ valueOf }) {
        return !valueOf(s.liquidezDiaria);
      },
    });
  });

  rendimentoForm = form(this.model, (s) => {
    required(s.dataRendimento, { message: 'Data de rendimento é obrigatória' });
    required(s.valorRendimento, { message: 'Valor do rendimento é obrigatório' });
  });

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          emissor: op.ativo,
          tipo: 'Pós-fixado',
          indexador: 'CDI',
          taxaJuros: '10,00',
          liquidezDiaria: false,
          vencimento: '',
          possuiImposto: true,
          valorAplicado: formatCurrencyBRL(op.precoUn),
          dataCompra: op.data,
          dataRendimento: '',
          valorRendimento: '',
        });
      }
    });
  }

  setTab(tab: string): void {
    if (tab === 'compra' || tab === 'rendimento') {
      this.activeTab.set(tab);
    }
  }

  onSubmit(): void {
    const form = this.activeTab() === 'compra' ? this.compraForm : this.rendimentoForm;
    submit(form, async () => {
      const data = this.model();
      console.log('Renda Fixa Saved:', {
        ...data,
        liquidezDiaria: data.liquidezDiaria,
        possuiImposto: data.possuiImposto,
      });
      this.confirmed.emit();
      this.close.emit();
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
