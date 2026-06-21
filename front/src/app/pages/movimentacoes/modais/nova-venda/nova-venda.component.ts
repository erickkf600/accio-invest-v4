import { Component, signal, computed, output, inject, input, effect } from '@angular/core';
import { DatePipe } from '@angular/common';

import { FormField, form, submit, required, min, disabled } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { AutocompleteComponent } from '../../../../components/autocomplete/autocomplete.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import { AssetsService } from '../../service/assets.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import { AssetTypeEnum, OperationTypeEnum } from '../../../../models/enums';
import type { Operation } from '../../movimentacoes';
import type { AssetDto } from '../../service/assets.service';

interface VendaAsset {
  tipo: AssetTypeEnum | null;
  ticker: string;
  quantidade: number | null;
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
  imports: [FormField, CurrencyMaskDirective, DateMaskDirective, AbbreviateNumberPipe, FileUploadComponent, AutocompleteComponent],
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
    quantidade: null,
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
    const assetType = tipoValue as AssetTypeEnum;
    if (!Object.values(AssetTypeEnum).includes(assetType)) {
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
          quantidade: op.qtd,
          precoUnitario: formatCurrencyBRL(op.precoUn),
          taxas: op.taxas !== null ? formatCurrencyBRL(op.taxas) : '',
          data: this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string,
          observacoes: '',
          anexo: { file: null, nome: '' },
        });
        this.assetsService.list({}).subscribe({
          next: (res) => {
          const asset = res.data.data.find(a => a.ticker.toUpperCase() === op.ativo.toUpperCase());
          if (asset?.tipo && Object.values(AssetTypeEnum).includes(asset.tipo as AssetTypeEnum)) {
            this.model.update(m => ({ ...m, tipo: asset.tipo as AssetTypeEnum }));
            this.onTipoChange(asset.tipo);
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
    const qtd = m.quantidade ?? 0;
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

  onSubmit(): void {
    this.submitError.set('');
    submit(this.vendaForm, async () => {
      this.isSubmitting.set(true);
      const m = this.model();
      const precoUn = parseCurrencyBRL(m.precoUnitario);
      const taxas = m.taxas ? parseCurrencyBRL(m.taxas) : 0;
      const qtd = m.quantidade ?? 0;
      const total = precoUn * qtd - taxas;

      this.movimentacoesService.createBatchWithFile([{
        ticker: m.ticker,
        tipoOperacao: OperationTypeEnum.Venda,
        tipo: m.tipo ?? undefined,
        data: this.toIsoDate(m.data),
        qtd,
        precoUn,
        taxas,
        total,
        observacoes: m.observacoes || '',
      }], m.anexo.file ?? undefined).subscribe({
        next: () => {
          this.confirmed.emit();
          this.close.emit();
        },
        error: () => {
          this.toast.error({ title: 'Erro', message: 'Erro ao salvar a venda.' });
        },
        complete: () => this.isSubmitting.set(false),
      });
    });
  }

  /** Close button handler */
  onClose(): void {
    this.close.emit();
  }
}
