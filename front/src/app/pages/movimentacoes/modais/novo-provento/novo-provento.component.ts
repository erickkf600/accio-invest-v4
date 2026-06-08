import { Component, signal, computed, output, inject, input, effect } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { FormField, form, submit, required, applyEach } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { DateRangePickerComponent } from '../../../../components/dateRangePicker/date-range-picker.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import type { Operation } from '../../movimentacoes';

interface ProventoAsset {
  tipo: number | null;
  ticker: string;
  quantidade: number | null;
  valorUnitario: string;
  data?: string;
}

interface SummaryProventoAsset {
  ticker: string;
  tipoLabel: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  data: string;
}

@Component({
  selector: 'app-novo-provento',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective, DateRangePickerComponent, AbbreviateNumberPipe],
  templateUrl: './novo-provento.component.html',
})
export class NovoProventoComponent {
  private movimentacoesService = inject(MovimentacoesService);
  private toast = inject(ToastService);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  model = signal({
    dataOperacao: '',
    tipoProvento: null as number | null,
    observacoes: '',
    ativos: [
      { tipo: null, ticker: '', quantidade: null, valorUnitario: '', data: '' }
    ] as ProventoAsset[],
  });

  proventoForm = form(this.model, (s) => {
    required(s.dataOperacao, { message: 'Obrigatório' });
    required(s.tipoProvento, { message: 'Obrigatório' });
    applyEach(s.ativos, (item) => {
      required(item.tipo, { message: 'Obrigatório' });
      required(item.ticker, { message: 'Obrigatório' });
      required(item.quantidade, { message: 'Obrigatório' });
      required(item.valorUnitario, { message: 'Obrigatório' });
    });
  });

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          dataOperacao: op.dataIso,
          tipoProvento: 1,
          observacoes: '',
          ativos: [{
            tipo: 1,
            ticker: op.ativo,
            quantidade: op.qtd ?? 1,
            valorUnitario: formatCurrencyBRL(op.precoUn),
            data: op.dataIso,
          }],
        });
      }
    });
  }

  showSubmodal = signal(false);
  fromAutoSearch = signal(false);
  confirmationAtivos = signal<SummaryProventoAsset[]>([]);
  operationTotal = signal<number>(0);

  addAtivo(): void {
    this.model.update((m) => ({
      ...m,
      ativos: [...m.ativos, { tipo: null, ticker: '', quantidade: null, valorUnitario: '', data: '' }],
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

  onDateRangeSelected(range: { startDate: string; endDate: string }): void {
    const simulatedDividends: ProventoAsset[] = [
      { tipo: 1, ticker: 'PETR4', quantidade: 100, valorUnitario: 'R$ 1,45', data: range.startDate },
      { tipo: 2, ticker: 'ITUB4', quantidade: 80, valorUnitario: 'R$ 1,02', data: range.startDate },
      { tipo: 2, ticker: 'MXRF11', quantidade: 50, valorUnitario: 'R$ 0,90', data: range.endDate },
    ];
    this.calculateSummaryFrom(simulatedDividends);
    this.fromAutoSearch.set(true);
    this.showSubmodal.set(true);
  }

  onSubmit(): void {
    submit(this.proventoForm, async () => {
      if (this.isEditing()) {
        this.confirmed.emit();
        this.close.emit();
        return;
      }
      this.calculateSummary();
      this.fromAutoSearch.set(false);
      this.showSubmodal.set(true);
    });
  }

  private buildSummaryList(ativos: ProventoAsset[]): SummaryProventoAsset[] {
    return ativos.map(a => {
      const preco = parseCurrencyBRL(a.valorUnitario);
      const qtd = a.quantidade ?? 0;
      const sub = qtd * preco;
      let label = 'Dividendos';
      if (a.tipo === 2) label = 'JCP';
      if (a.tipo === 3) label = 'Rendimento';
      if (!a.tipo) label = '-';
      return {
        ticker: a.ticker,
        tipoLabel: label,
        quantidade: qtd,
        valorUnitario: preco,
        total: sub,
        data: a.data || '',
      };
    });
  }

  calculateSummary(): void {
    const list = this.buildSummaryList(this.model().ativos);
    const total = list.reduce((acc, r) => acc + r.total, 0);
    this.confirmationAtivos.set(list);
    this.operationTotal.set(total);
  }

  calculateSummaryFrom(ativos: ProventoAsset[]): void {
    const list = this.buildSummaryList(ativos);
    const total = list.reduce((acc, r) => acc + r.total, 0);
    this.confirmationAtivos.set(list);
    this.operationTotal.set(total);
  }

  confirmFinal(): void {
    const ativos = this.confirmationAtivos();

    const operations = ativos.map((a) => ({
      ticker: a.ticker,
      tipo: 'Proventos' as const,
      data: a.data || this.model().dataOperacao,
      qtd: a.quantidade,
      precoUn: a.valorUnitario,
      taxas: 0,
      total: a.total,
      observacoes: this.model().observacoes || '',
    }));

    this.movimentacoesService.createBatchWithFile(operations).subscribe({
      next: () => {
        this.confirmed.emit();
        this.close.emit();
      },
      error: () => {
        this.toast.error({ title: 'Erro', message: 'Erro ao salvar a operação.' });
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
