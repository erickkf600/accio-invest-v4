import { Component, signal, computed, output, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormField, form, submit, required, min } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { MovimentacoesService } from '../../service/movimentacoes.service';

interface VendaAsset {
  ticker: string;
  quantidade: number;
  precoUnitario: string; // formatted with mask
  taxas: string; // formatted with mask, empty when not provided
  data: string; // dd/MM/yyyy
}

/**
 * NovaVendaComponent – modal for creating a single sale operation.
 * Uses Angular Signal Forms, Tailwind CSS styling and custom mask directives.
 * Calculates total value (quantity * unit price + optional fees) and emits the result.
 */
@Component({
  selector: 'app-nova-venda',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective],
  templateUrl: './nova-venda.component.html',
})
export class NovaVendaComponent {
  private movimentacoesService = inject(MovimentacoesService);

  /** Emits when the modal should close */
  close = output<void>();
  /** Emits when the sale is successfully created */
  confirmed = output<void>();

  // List of available assets – in a real app this would come from a service
  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  // Signal model matching the form structure
  model = signal<VendaAsset>({
    ticker: '',
    quantidade: 1,
    precoUnitario: '',
    taxas: '',
    data: ''
  });

  /** Signal Form definition with required validation rules */
  vendaForm = form(this.model, (s) => {
    required(s.ticker, { message: 'Ativo é obrigatório' });
    required(s.quantidade, { message: 'Quantidade é obrigatória' });
    min(s.quantidade, 1, { message: 'Deve ser maior que zero' });
    required(s.precoUnitario, { message: 'Preço unitário é obrigatório' });
    required(s.data, { message: 'Data é obrigatória' });
    // Optional fees – if present, must be a valid currency string
    // No extra validation needed; mask directive will format it.
  });

  /** Total value – computed from model values */
  totalValor = computed(() => {
    const m = this.model();
    const preco = parseCurrencyBRL(m.precoUnitario);
    const qtd = m.quantidade;
    const taxas = m.taxas ? parseCurrencyBRL(m.taxas) : 0;
    return preco * qtd + taxas;
  });

  /** Submit handler – validates, calculates summary and emits */
  onSubmit(): void {
    submit(this.vendaForm, async () => {
      // Here we could call a service to persist the operation
      // For now we just emit the confirmation and close the modal
      this.confirmed.emit();
      this.close.emit();
    });
  }

  /** Close button handler */
  onClose(): void {
    this.close.emit();
  }
}
