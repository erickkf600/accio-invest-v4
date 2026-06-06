import { Component, signal, output, inject } from '@angular/core';
import { FormField, form, submit, required, pattern } from '@angular/forms/signals';
import { CurrencyMaskDirective } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { MovimentacoesService } from '../../service/movimentacoes.service';

@Component({
  selector: 'app-nova-renda-fixa',
  standalone: true,
  imports: [FormField, CurrencyMaskDirective, DateMaskDirective],
  templateUrl: './nova-renda-fixa.component.html',
})
export class NovaRendaFixaComponent {
  private movimentacoesService = inject(MovimentacoesService);

  close = output<void>();
  confirmed = output<void>();

  // Modal active tab: 'compra' or 'rendimento'
  activeTab = signal<'compra' | 'rendimento'>('compra');

  // Signal Forms model
  model = signal({
    emissor: '',
    tipo: 'Pós-fixado',
    indexador: 'CDI',
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

  rendaFixaForm = form(this.model, (s) => {
    // Shared / Compra validations
    required(s.emissor, { message: 'Emissor é obrigatório' });
    required(s.tipo, { message: 'Tipo é obrigatório' });
    required(s.indexador, { message: 'Indexador é obrigatório' });
    required(s.taxaJuros, { message: 'Taxa de juros é obrigatória' });
    pattern(s.taxaJuros, /^\d+(?:[.,]\d{2})?$/, { message: 'Ex: 10,50' });

    required(s.valorAplicado, { message: 'Valor aplicado é obrigatório' });
    required(s.dataCompra, { message: 'Data de compra é obrigatória' });

    // Conditional validation for Vencimento: only required if liquidezDiaria is FALSE
    required(s.vencimento, {
      message: 'Vencimento é obrigatório quando não há liquidez diária',
      when({ valueOf }) {
        return !valueOf(s.liquidezDiaria);
      },
    });

    // Rendimento tab validations (only active if tab is rendimento)
    required(s.dataRendimento, {
      message: 'Data de rendimento é obrigatória',
      when({ valueOf }) {
        return false;
      },
    });
    required(s.valorRendimento, {
      message: 'Valor do rendimento é obrigatório',
      when({ valueOf }) {
        return false;
      },
    });
  });

  setTab(tab: 'compra' | 'rendimento'): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    submit(this.rendaFixaForm, async () => {
      // Process payload
      const data = this.model();
      console.log('Renda Fixa Saved:', {
        ...data,
        // Remove BRL formatting
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
