import { Component, signal, computed, output, inject, input, effect } from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';
import { FormField, form, submit, required, applyEach, disabled } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL, formatCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { DateRangePickerComponent } from '../../../../components/dateRangePicker/date-range-picker.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';
import { AssetsService } from '../../service/assets.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import { AutocompleteComponent } from '../../../../components/autocomplete/autocomplete.component';
import { AssetTypeEnum, OperationTypeEnum } from '../../../../models/enums';
import type { Operation } from '../../movimentacoes';
import type { AssetDto } from '../../service/assets.service';

interface ProventoAsset {
  tipo: AssetTypeEnum | null;
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
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateMaskDirective, DateRangePickerComponent, AbbreviateNumberPipe, AutocompleteComponent],
  providers: [DatePipe],
  templateUrl: './novo-provento.component.html',
})

export class NovoProventoComponent {
  private movimentacoesService = inject(MovimentacoesService);
  private assetsService = inject(AssetsService);
  private toast = inject(ToastService);
  private datePipe = inject(DatePipe);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);

  assetsByIndex = signal<Record<number, AssetDto[]>>({});

  tickersByIndex = computed(() => {
    const result: Record<number, string[]> = {};
    for (const [key, assets] of Object.entries(this.assetsByIndex())) {
      result[Number(key)] = assets.map(a => a.ticker);
    }
    return result;
  });

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
      disabled(item.ticker, (ctx) =>{
        const tipoValido = ctx.valueOf(item.tipo);
        
        // Se NÃO houver um tipo válido, retorna uma string (motivo) ou true para desabilitar
        if (!tipoValido) {
          return 'Selecione um tipo antes de definir o ticker';
        }
        
        // Se o tipo for válido, retorna obrigatoriamente FALSE para habilitar o campo
        return false;
      });
    });
  });

  constructor() {
    effect(() => {
      const op = this.operation();
      if (op) {
        this.model.set({
          dataOperacao: this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string,
          tipoProvento: 1,
          observacoes: '',
          ativos: [{
            tipo: AssetTypeEnum.ACOES,
            ticker: op.ativo,
            quantidade: op.qtd ?? 1,
            valorUnitario: formatCurrencyBRL(op.precoUn),
            data: this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string,
          }],
        });
        this.onTipoChange(0, '1');
      }
    });
  }

  onTipoChange(index: number, tipoValue: string): void {
    const assetType = tipoValue as AssetTypeEnum;
    if (!Object.values(AssetTypeEnum).includes(assetType)) {
      this.assetsByIndex.update(m => ({ ...m, [index]: [] }));
      return;
    }
    this.assetsService.list({ tipo: assetType }).subscribe({
      next: (res) => {
        const assets = res.data.data.map(a => ({ ...a, ticker: a.ticker.toUpperCase() }));
        this.assetsByIndex.update(m => ({ ...m, [index]: assets }));
      },
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
      { tipo: AssetTypeEnum.ACOES, ticker: 'PETR4', quantidade: 100, valorUnitario: 'R$ 1,45', data: range.startDate },
      { tipo: AssetTypeEnum.FII, ticker: 'ITUB4', quantidade: 80, valorUnitario: 'R$ 1,02', data: range.startDate },
      { tipo: AssetTypeEnum.FII, ticker: 'MXRF11', quantidade: 50, valorUnitario: 'R$ 0,90', data: range.endDate },
    ];
    this.calculateSummaryFrom(simulatedDividends);
    this.fromAutoSearch.set(true);
    this.showSubmodal.set(true);
  }

  onSubmit(): void {
    submit(this.proventoForm, async () => {
      if (this.isEditing()) {
        const op = this.operation()!;
        const raw = this.model();
        const ativo = raw.ativos[0];
        const [dia, mes, ano] = raw.dataOperacao.split('/');
        const dataIso = `${ano}-${mes}-${dia}`;
        const precoUn = parseCurrencyBRL(ativo.valorUnitario);
        const qtd = ativo.quantidade ?? 0;
        const total = precoUn * qtd;

        this.movimentacoesService.updateOperation(op.id, {
          ticker: ativo.ticker.toUpperCase(),
          tipo: OperationTypeEnum.Proventos,
          data: dataIso,
          qtd,
          precoUn,
          taxas: 0,
          total,
          observacoes: raw.observacoes || '',
        }).subscribe({
          next: () => {
            this.confirmed.emit();
            this.close.emit();
          },
          error: () => {
            this.toast.error({ title: 'Erro', message: 'Erro ao atualizar a operação.' });
          },
        });
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
      if (a.tipo === AssetTypeEnum.FII) label = 'JCP';
      if (a.tipo === AssetTypeEnum.BDR) label = 'Rendimento';
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
      tipo: OperationTypeEnum.Proventos as const,
      data: this.toDateIso(a.data || this.model().dataOperacao),
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

  private toDateIso(ddmmyyyy: string): string {
    const [dia, mes, ano] = ddmmyyyy.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  onTickerSelected(index: number, ticker: string): void {
    const assets = this.assetsByIndex()[index] ?? [];
    const asset = assets.find(a => a.ticker === ticker);
    if (asset?.quantidade) {
      this.model.update(m => {
        const ativos = [...m.ativos];
        ativos[index] = { ...ativos[index], quantidade: asset.quantidade! };
        return { ...m, ativos };
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
