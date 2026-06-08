import { Component, signal, computed, output, inject, input, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { FormField, form, submit, required, min } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import type { Operation } from '../../movimentacoes';

interface VendaAsset {
  ticker: string;
  quantidade: number;
  precoUnitario: string;
  taxas: string;
  data: string;
  observacoes: string;
  anexo: { file: File | null; nome: string };
}

/**
 * NovaVendaComponent – modal for creating a single sale operation.
 * Uses Angular Signal Forms, Tailwind CSS styling and custom mask directives.
 * Calculates total value (quantity * unit price - tax).
 */
@Component({
  selector: 'app-nova-venda',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective, AbbreviateNumberPipe, FileUploadComponent],
  templateUrl: './nova-venda.component.html',
})
export class NovaVendaComponent {
  private movimentacoesService = inject(MovimentacoesService);

  /** Emits when the modal should close */
  close = output<void>();
  /** Emits when the sale is successfully created */
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  // List of available assets – in a real app this would come from a service
  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  // Signal model matching the form structure
  model = signal<VendaAsset>({
    ticker: '',
    quantidade: 1,
    precoUnitario: '',
    taxas: '',
    data: '',
    observacoes: '',
    anexo: { file: null, nome: '' },
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

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          ticker: op.ativo,
          quantidade: op.qtd ?? 1,
          precoUnitario: formatCurrencyBRL(op.precoUn),
          taxas: op.taxas !== null ? formatCurrencyBRL(op.taxas) : '',
          data: op.dataIso,
          observacoes: '',
          anexo: { file: null, nome: '' },
        });
      }
    });
  }

  /** Total value – computed from model values */
  totalValor = computed(() => {
    const m = this.model();
    const preco = parseCurrencyBRL(m.precoUnitario);
    const qtd = m.quantidade;
    const taxas = m.taxas ? parseCurrencyBRL(m.taxas) : 0;
    return preco * qtd - taxas;
  });

  isSubmitting = signal(false);
  submitError = signal('');

  onFileSelected(file: File): void {
    this.model.update(m => ({
      ...m,
      anexo: { file, nome: file.name },
    }));
  }

  onFileRemoved(): void {
    this.model.update(m => ({
      ...m,
      anexo: { file: null, nome: '' },
    }));
  }

  private toIsoDate(ddmmyyyy: string): string {
    const [dia, mes, ano] = ddmmyyyy.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  /** Submit handler – validates, calculates summary and emits */
  async onSubmit(): Promise<void> {
    const isValid = await submit(this.vendaForm);
    if (!isValid) return;

    this.submitError.set('');
    this.isSubmitting.set(true);

    const m = this.model();
    const precoUn = parseCurrencyBRL(m.precoUnitario);
    const taxas = m.taxas ? parseCurrencyBRL(m.taxas) : 0;
    const qtd = m.quantidade;
    const total = precoUn * qtd - taxas;

    try {
      await lastValueFrom(this.movimentacoesService.createBatchWithFile([{
        ticker: m.ticker,
        tipo: 'Venda',
        data: this.toIsoDate(m.data),
        qtd,
        precoUn,
        taxas,
        total,
        observacoes: m.observacoes || '',
      }], m.anexo.file ?? undefined));

      this.confirmed.emit();
      this.close.emit();
    } catch {
      this.submitError.set('Erro ao salvar a venda. Tente novamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Close button handler */
  onClose(): void {
    this.close.emit();
  }
}
