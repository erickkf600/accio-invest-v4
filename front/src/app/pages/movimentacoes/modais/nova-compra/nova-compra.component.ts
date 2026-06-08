import { Component, signal, computed, output, inject, input, effect } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { FormField, form, submit, required, applyEach } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import { AssetTypeEnum } from '../../../../models/enums';
import type { Operation } from '../../movimentacoes';

const TIPO_LABEL_MAP: Record<number, string> = {
  [AssetTypeEnum.ACOES]: 'Ações',
  [AssetTypeEnum.FII]: 'FII',
  [AssetTypeEnum.BDR]: 'BDR',
  [AssetTypeEnum.ETF]: 'ETF',
  [AssetTypeEnum.CRIPTO]: 'Cripto',
};

interface CompraAsset {
  tipo: number | null;
  ticker: string;
  quantidade: number | null;
  valorUnitario: string;
}

interface ConfirmacionAsset {
  ticker: string;
  tipoLabel: string;
  quantidade: number | null;
  valorUnitario: number;
  taxa: number;
  total: number;
}

@Component({
  selector: 'app-nova-compra',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective, AbbreviateNumberPipe, FileUploadComponent],
  templateUrl: './nova-compra.component.html',
})
export class NovaCompraComponent {
  private movimentacoesService = inject(MovimentacoesService);
  private toast = inject(ToastService);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  // Mock datalist for tickers
  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  // Signal model matching Signal Forms
  model = signal({
    taxasTotal: '',
    dataOperacao: '',
    observacoes: '',
    anexo: { file: null as File | null, nome: '' },
    ativos: [
      { tipo: null, ticker: '', quantidade: null, valorUnitario: '' }
    ] as CompraAsset[],
  });

  compraForm = form(this.model, (s) => {
    required(s.taxasTotal, { message: 'Campo obrigatório' });
    required(s.dataOperacao, { message: 'Campo obrigatório' });
    applyEach(s.ativos, (item) => {
      required(item.tipo, { message: 'Obrigatório' });
      required(item.ticker, { message: 'Obrigatório' });
      required(item.quantidade, { message: 'Obrigatório' });
      required(item.valorUnitario, { message: 'Obrigatório' });
    });
  });

  // Populate form when editing
  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          taxasTotal: formatCurrencyBRL(op.taxas ?? 0),
          dataOperacao: op.data,
          observacoes: '',
          anexo: { file: null, nome: '' },
          ativos: [{
            tipo: 1,
            ticker: op.ativo,
            quantidade: op.qtd ?? 1,
            valorUnitario: formatCurrencyBRL(op.precoUn),
          }],
        });
      }
    });
  }

  // Modal and submodal states
  showSubmodal = signal(false);
  confirmationAtivos = signal<ConfirmacionAsset[]>([]);
  operationTotalCost = signal<number>(0);
  operationTotalTaxes = signal<number>(0);
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

  addAtivo(): void {
    this.model.update((m) => ({
      ...m,
      ativos: [...m.ativos, { tipo: null, ticker: '', quantidade: null, valorUnitario: '' }],
    }));
  }

  removeAtivo(index: number): void {
    if (this.model().ativos.length > 1) {
      this.model.update((m) => ({
        ...m,
        ativos: m.ativos.filter((_, i) => i !== index),
      }));
    }
  }

  onSubmit(): void {
    submit(this.compraForm, async () => {
      if (this.isEditing()) {
        this.confirmed.emit();
        this.close.emit();
        return;
      }
      this.calculateRatesAndSummary();
      this.showSubmodal.set(true);
    });
  }

  calculateRatesAndSummary(): void {
    const rawForm = this.model();
    const totalTaxes = parseCurrencyBRL(rawForm.taxasTotal);
    
    // Calculate subtotal for each asset (Qtd * Price) and note cost total
    let totalCustoNota = 0;
    const parsedAssets = rawForm.ativos.map(a => {
      const preco = parseCurrencyBRL(a.valorUnitario);
      const sub = (a.quantidade ?? 0) * preco;
      totalCustoNota += sub;
      return {
        ticker: a.ticker,
        tipoLabel: a.tipo ? TIPO_LABEL_MAP[a.tipo] || '-' : '-',
        quantidade: a.quantidade,
        valorUnitario: preco,
        subtotal: sub
      };
    });

    if (totalCustoNota === 0) totalCustoNota = 1; // Avoid div by zero

    // Proportional taxes: Taxa_Proporcional = (Subtotal / Custo_Total_Nota) * Taxa_Total_Nota
    // Rounding to 3 decimal places
    let sumProportionalTaxes = 0;
    const confirmationList: ConfirmacionAsset[] = parsedAssets.map(pa => {
      const rawProportionalTax = (pa.subtotal / totalCustoNota) * totalTaxes;
      const roundedTax = parseFloat(rawProportionalTax.toFixed(3));
      sumProportionalTaxes += roundedTax;

      return {
        ticker: pa.ticker,
        tipoLabel: pa.tipoLabel,
        quantidade: pa.quantidade,
        valorUnitario: pa.valorUnitario,
        taxa: roundedTax,
        total: pa.subtotal + roundedTax
      };
    });

    // Rounding correction to guarantee: sum taxas = total tax
    const diff = totalTaxes - sumProportionalTaxes;
    if (diff !== 0 && confirmationList.length > 0) {
      // Add correction diff to the first asset
      confirmationList[0].taxa = parseFloat((confirmationList[0].taxa + diff).toFixed(3));
      confirmationList[0].total = parseFloat((confirmationList[0].total + diff).toFixed(3));
    }

    this.confirmationAtivos.set(confirmationList);
    this.operationTotalTaxes.set(totalTaxes);
    this.operationTotalCost.set(confirmationList.reduce((acc, c) => acc + c.total, 0));
  }

  private toIsoDate(ddmmyyyy: string): string {
    const [dia, mes, ano] = ddmmyyyy.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  confirmFinal(): void {
    this.submitError.set('');
    this.isSubmitting.set(true);

    const raw = this.model();
    const dataIso = this.toIsoDate(raw.dataOperacao);
    const ativos = this.confirmationAtivos();
    const file = raw.anexo.file ?? undefined;

    const observables = ativos.map(a =>
      this.movimentacoesService.createWithFile({
        ticker: a.ticker,
        tipo: 'Compra',
        data: dataIso,
        qtd: a.quantidade,
        precoUn: a.valorUnitario,
        taxas: a.taxa,
        total: a.total,
        nota: raw.observacoes || '',
      }, file)
    );

    forkJoin(observables).subscribe({
      next: () => {
        this.confirmed.emit();
        this.close.emit();
      },
      error: () => {
        this.toast.error({ title: 'Erro', message: 'Erro ao salvar a operação. Tente novamente.' });
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
