import { Component, signal, computed, output, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormField, form, submit, required, applyEach } from '@angular/forms/signals';
import { CurrencyMaskDirective, parseCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateRangePickerComponent } from '../../../../components/dateRangePicker/date-range-picker.component';
import { MovimentacoesService } from '../../service/movimentacoes.service';

interface ProventoAsset {
  tipo: number; // 1 = Dividendos, 2 = JCP, 3 = Rendimento
  ticker: string;
  quantidade: number;
  valorUnitario: string;
}

interface SummaryProventoAsset {
  ticker: string;
  tipoLabel: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

@Component({
  selector: 'app-novo-provento',
  standalone: true,
  imports: [DecimalPipe, FormField, CurrencyMaskDirective, DateRangePickerComponent],
  templateUrl: './novo-provento.component.html',
})
export class NovoProventoComponent {
  private movimentacoesService = inject(MovimentacoesService);

  close = output<void>();
  confirmed = output<void>();

  tickerDatalist = ['AAPL', 'TSLA', 'MSFT', 'PETR4', 'VALE3', 'ITUB4', 'MXRF11', 'XPML11'];

  model = signal({
    ativos: [
      { tipo: 1, ticker: '', quantidade: 1, valorUnitario: '' }
    ] as ProventoAsset[],
  });

  proventoForm = form(this.model, (s) => {
    applyEach(s.ativos, (item) => {
      required(item.tipo, { message: 'Obrigatório' });
      required(item.ticker, { message: 'Obrigatório' });
      required(item.quantidade, { message: 'Obrigatório' });
      required(item.valorUnitario, { message: 'Obrigatório' });
    });
  });

  showSubmodal = signal(false);
  confirmationAtivos = signal<SummaryProventoAsset[]>([]);
  operationTotal = signal<number>(0);

  addAtivo(): void {
    this.model.update((m) => ({
      ...m,
      ativos: [...m.ativos, { tipo: 1, ticker: '', quantidade: 1, valorUnitario: '' }],
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

  // Action for DateRangePicker "Buscar Dividendos"
  onDateRangeSelected(range: { startDate: string; endDate: string }): void {
    // Simulate fetching dividends from service
    const simulatedDividends: ProventoAsset[] = [
      { tipo: 1, ticker: 'PETR4', quantidade: 100, valorUnitario: 'R$ 1,45' },
      { tipo: 2, ticker: 'ITUB4', quantidade: 80, valorUnitario: 'R$ 1,02' }
    ];
    this.model.set({
      ativos: simulatedDividends
    });
  }

  onSubmit(): void {
    submit(this.proventoForm, async () => {
      this.calculateSummary();
      this.showSubmodal.set(true);
    });
  }

  calculateSummary(): void {
    const rawForm = this.model();
    let totalVal = 0;
    
    const summaryList: SummaryProventoAsset[] = rawForm.ativos.map(a => {
      const preco = parseCurrencyBRL(a.valorUnitario);
      const sub = a.quantidade * preco;
      totalVal += sub;
      
      let label = 'Dividendos';
      if (a.tipo === 2) label = 'JCP';
      if (a.tipo === 3) label = 'Rendimento';

      return {
        ticker: a.ticker,
        tipoLabel: label,
        quantidade: a.quantidade,
        valorUnitario: preco,
        total: sub
      };
    });

    this.confirmationAtivos.set(summaryList);
    this.operationTotal.set(totalVal);
  }

  confirmFinal(): void {
    this.confirmed.emit();
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
