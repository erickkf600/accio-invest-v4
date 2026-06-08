import { Component, signal, output, inject, input, computed, effect } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { FormField, form, submit, required, pattern } from '@angular/forms/signals';
import { CurrencyMaskDirective, formatCurrencyBRL, parseCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { TabsComponent } from '../../../../components/tabs/tabs.component';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { PortfolioService } from '../../../portfolio/service/portfolio.service';
import type { Operation } from '../../movimentacoes';

@Component({
  selector: 'app-nova-renda-fixa',
  standalone: true,
  imports: [FormField, CurrencyMaskDirective, DateMaskDirective, TabsComponent, FileUploadComponent],
  templateUrl: './nova-renda-fixa.component.html',
})
export class NovaRendaFixaComponent {
  private portfolioService = inject(PortfolioService);

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
    observacoes: '',
    anexo: { file: null as File | null, nome: '' },
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
          dataCompra: op.dataIso,
          observacoes: op.observacoes ?? '',
          anexo: { file: null, nome: '' },
          dataRendimento: '',
          valorRendimento: '',
        });
      }
    });
  }

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

  setTab(tab: string): void {
    if (tab === 'compra' || tab === 'rendimento') {
      this.activeTab.set(tab);
    }
  }

  private toIsoDate(ddmmyyyy: string): string {
    const [dia, mes, ano] = ddmmyyyy.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  private parseTaxaJuros(valor: string): number {
    const normalized = valor.replace(',', '.');
    return parseFloat(normalized);
  }

  async onSubmit(): Promise<void> {
    const formRef = this.activeTab() === 'compra' ? this.compraForm : this.rendimentoForm;
    const isValid = await submit(formRef);
    if (!isValid) return;

    this.submitError.set('');
    this.isSubmitting.set(true);

    const data = this.model();

    if (this.activeTab() === 'compra') {
      try {
        await lastValueFrom(this.portfolioService.createFixedIncomeWithFile({
          emissor: data.emissor,
          tipo: data.tipo,
          indexador: data.indexador,
          taxaJuros: this.parseTaxaJuros(data.taxaJuros),
          valorAplicado: parseCurrencyBRL(data.valorAplicado),
          dataCompra: this.toIsoDate(data.dataCompra),
          vencimento: data.vencimento ? this.toIsoDate(data.vencimento) : undefined,
          liquidezDiaria: data.liquidezDiaria,
          possuiImposto: data.possuiImposto,
          observacoes: data.observacoes || '',
        }, data.anexo.file ?? undefined));

        this.confirmed.emit();
        this.close.emit();
      } catch {
        this.submitError.set('Erro ao salvar. Tente novamente.');
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      console.log('Renda Fixa (rendimento) saved:', {
        dataRendimento: data.dataRendimento,
        valorRendimento: data.valorRendimento,
      });
      this.confirmed.emit();
      this.close.emit();
      this.isSubmitting.set(false);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
