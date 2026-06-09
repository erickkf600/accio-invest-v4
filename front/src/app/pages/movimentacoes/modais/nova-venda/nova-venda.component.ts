import { Component, signal, computed, output, inject, input, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { FormField, form, submit, required, min, disabled } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { AutocompleteComponent } from '../../../../components/autocomplete/autocomplete.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import { AssetsService } from '../../service/assets.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import type { Operation } from '../../movimentacoes';
import type { AssetDto } from '../../service/assets.service';

interface VendaAsset {
  tipo: number | null;
  ticker: string;
  quantidade: number;
  precoUnitario: string;
  taxas: string;
  data: string;
  observacoes: string;
  anexo: { file: File | null; nome: string };
}

const TIPO_MAP: Record<number, string> = {
  1: 'ACOES',
  2: 'FII',
  3: 'BDR',
  4: 'ETF',
  5: 'CRIPTO',
};

/**
 * NovaVendaComponent – modal for creating a single sale operation.
 * Uses Angular Signal Forms, Tailwind CSS styling and custom mask directives.
 * Calculates total value (quantity * unit price - tax).
 */
@Component({
  selector: 'app-nova-venda',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective, AbbreviateNumberPipe, FileUploadComponent, AutocompleteComponent],
  providers: [DatePipe],
  templateUrl: './nova-venda.component.html',
})
export class NovaVendaComponent {
  private movimentacoesService = inject(MovimentacoesService);
  private assetsService = inject(AssetsService);
  private toast = inject(ToastService);
  private datePipe = inject(DatePipe);

  /** Emits when the modal should close */
  close = output<void>();
  /** Emits when the sale is successfully created */
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  protected currentAssets = signal<AssetDto[]>([]);
  protected tickerOptions = computed(() => this.currentAssets().map(a => a.ticker));

  // Signal model matching the form structure
  model = signal<VendaAsset>({
    tipo: null,
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
    required(s.tipo, { message: 'Selecione o tipo' });
    required(s.ticker, { message: 'Ativo é obrigatório' });
    required(s.quantidade, { message: 'Quantidade é obrigatória' });
    min(s.quantidade, 1, { message: 'Deve ser maior que zero' });
    required(s.precoUnitario, { message: 'Preço unitário é obrigatório' });
    required(s.data, { message: 'Data é obrigatória' });
    disabled(s.ticker, (ctx) =>{
        const tipoValido = ctx.valueOf(s.tipo);
        
        // Se NÃO houver um tipo válido, retorna uma string (motivo) ou true para desabilitar
        if (!tipoValido) {
          return 'Selecione um tipo antes de definir o ticker';
        }
        
        // Se o tipo for válido, retorna obrigatoriamente FALSE para habilitar o campo
        return false;
      });
  });

  onTipoChange(tipoValue: string): void {
    const tipoKey = Number(tipoValue);
    const assetType = TIPO_MAP[tipoKey];
    if (!assetType) {
      this.currentAssets.set([]);
      return;
    }
    this.assetsService.list({ tipo: assetType }).subscribe({
      next: (res) => {
        this.currentAssets.set(res.data.data.map(a => ({ ...a, ticker: a.ticker.toUpperCase() })));
      },
    });
  }

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          tipo: null,
          ticker: op.ativo,
          quantidade: op.qtd ?? 1,
          precoUnitario: formatCurrencyBRL(op.precoUn),
          taxas: op.taxas !== null ? formatCurrencyBRL(op.taxas) : '',
          data: this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string,
          observacoes: '',
          anexo: { file: null, nome: '' },
        });
        this.assetsService.list({}).subscribe({
          next: (res) => {
            const asset = res.data.data.find(a => a.ticker.toUpperCase() === op.ativo.toUpperCase());
            if (asset?.tipo) {
              const tipoKey = Object.entries(TIPO_MAP).find(([, v]) => v === asset.tipo)?.[0];
              if (tipoKey) {
                this.model.update(m => ({ ...m, tipo: Number(tipoKey) }));
                this.onTipoChange(tipoKey);
              }
            }
          },
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
      this.toast.error({ title: 'Erro', message: 'Erro ao salvar a venda.' });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Close button handler */
  onClose(): void {
    this.close.emit();
  }
}
