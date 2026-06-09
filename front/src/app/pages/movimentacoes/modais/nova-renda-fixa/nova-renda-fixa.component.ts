import { Component, signal, output, inject, input, computed, effect, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormField, form, submit, required, pattern } from '@angular/forms/signals';
import { CurrencyMaskDirective, formatCurrencyBRL, parseCurrencyBRL } from '../../../../directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../directives/date-mask.directive';
import { TabsComponent } from '../../../../components/tabs/tabs.component';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { AutocompleteComponent } from '../../../../components/autocomplete/autocomplete.component';
import { FixedIncomeService } from '../../service/fixed-income.service';
import { ToastService } from '../../../../components/Toast/toast.service';
import type { Operation } from '../../movimentacoes';

@Component({
  selector: 'app-nova-renda-fixa',
  standalone: true,
  imports: [FormField, CurrencyMaskDirective, DateMaskDirective, TabsComponent, FileUploadComponent, AutocompleteComponent],
  providers: [DatePipe],
  templateUrl: './nova-renda-fixa.component.html',
})
export class NovaRendaFixaComponent implements OnInit {
  private fixedIncomeService = inject(FixedIncomeService);
  private toast = inject(ToastService);
  private datePipe = inject(DatePipe);

  close = output<void>();
  confirmed = output<void>();

  operation = input<Operation | null>(null);
  isEditing = computed(() => this.operation() !== null);
  showTabs = computed(() => !this.isEditing());

  activeTab = signal<'compra' | 'rendimento'>('compra');

  emissores = signal<string[]>([]);

  ngOnInit() {
    this.fixedIncomeService.getEmissores().subscribe({
      next: (res) => this.emissores.set(res.data),
    });
  }

  model = signal({
    emissor: '',
    tipo: '',
    indexador: '',
    taxaJuros: '',
    liquidezDiaria: false,
    vencimento: '',
    possuiImposto: true,
    valorAplicado: '',
    dataCompra: '',
    observacoes: '',
    anexo: { file: null as File | null, nome: '' },
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
    required(s.emissor, { message: 'Emissor é obrigatório' });
    required(s.dataRendimento, { message: 'Data de rendimento é obrigatória' });
    required(s.valorRendimento, { message: 'Valor do rendimento é obrigatório' });
  });

  constructor() {
    effect(() => {
      const op = this.operation();
      if (!op) return;

      const dataIso = this.datePipe.transform(op.dataIso, 'dd/MM/yyyy') as string;

      if (op.tipo === 'Renda Fixa') {
        this.activeTab.set('compra');
        this.fixedIncomeService.getFixedIncomeById(op.id).subscribe({
          next: (res) => {
            const fi = res.data;
            this.model.set({
              emissor: fi.emissor,
              tipo: fi.tipo,
              indexador: fi.indexador,
              taxaJuros: String(fi.taxaJuros).replace('.', ','),
              liquidezDiaria: fi.liquidezDiaria,
              vencimento: fi.vencimento ? this.datePipe.transform(fi.vencimento, 'dd/MM/yyyy') as string : '',
              possuiImposto: fi.possuiImposto,
              valorAplicado: formatCurrencyBRL(op.precoUn),
              dataCompra: dataIso,
              observacoes: op.observacoes ?? '',
              anexo: { file: null, nome: '' },
              dataRendimento: dataIso,
              valorRendimento: formatCurrencyBRL(op.precoUn),
            });
          },
        });
      } else if (op.tipo === 'Renda Fixa - Rendimento') {
        this.activeTab.set('rendimento');
        this.fixedIncomeService.getYieldById(op.id).subscribe({
          next: (res) => {
            const y = res.data;
            this.model.set({
              emissor: y.emissor,
              tipo: 'Pós-fixado',
              indexador: 'CDI',
              taxaJuros: '10,00',
              liquidezDiaria: false,
              vencimento: '',
              possuiImposto: true,
              valorAplicado: formatCurrencyBRL(op.precoUn),
              dataCompra: dataIso,
              observacoes: op.observacoes ?? '',
              anexo: { file: null, nome: '' },
              dataRendimento: this.datePipe.transform(y.dataOperacao, 'dd/MM/yyyy') as string,
              valorRendimento: formatCurrencyBRL(y.valor),
            });
          },
        });
      } else {
        this.activeTab.set('rendimento');
        this.model.set({
          emissor: op.ativo,
          tipo: 'Pós-fixado',
          indexador: 'CDI',
          taxaJuros: '10,00',
          liquidezDiaria: !op.vencimento,
          vencimento: op.vencimento ? this.datePipe.transform(op.vencimento, 'dd/MM/yyyy') as string : '',
          possuiImposto: true,
          valorAplicado: formatCurrencyBRL(op.precoUn),
          dataCompra: dataIso,
          observacoes: op.observacoes ?? '',
          anexo: { file: null, nome: '' },
          dataRendimento: dataIso,
          valorRendimento: formatCurrencyBRL(op.precoUn),
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

  onSubmit(): void {
    const formRef = this.activeTab() === 'compra' ? this.compraForm : this.rendimentoForm;

    submit(formRef, async () => {
      this.submitError.set('');
      this.isSubmitting.set(true);

      const data = this.model();

      if (this.activeTab() === 'compra') {
        if (this.isEditing()) {
          const op = this.operation()!;
          this.fixedIncomeService.updateFixedIncomeWithFile(op.id, {
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
          }, data.anexo.file ?? undefined).subscribe({
            next: () => { this.confirmed.emit(); this.close.emit(); },
            error: () => {
              this.toast.error({ title: 'Erro', message: 'Erro ao atualizar a operação.' });
              this.isSubmitting.set(false);
            },
            complete: () => { this.isSubmitting.set(false); },
          });
        } else {
          this.fixedIncomeService.createFixedIncomeWithFile({
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
          }, data.anexo.file ?? undefined).subscribe({
            next: () => { this.confirmed.emit(); this.close.emit(); },
            error: (err) => {
              this.toast.error({ title: 'Erro', message: err.error.message || 'Erro ao salvar a operação.' });
              this.isSubmitting.set(false);
            },
            complete: () => { this.isSubmitting.set(false); },
          });
        }
      } else {
        const valor = parseCurrencyBRL(data.valorRendimento);

        if (this.isEditing()) {
          const op = this.operation()!;
          this.fixedIncomeService.updateYield(op.id, {
            dataOperacao: this.toIsoDate(data.dataRendimento),
            valor,
            observacoes: data.observacoes || '',
          }).subscribe({
            next: () => { this.confirmed.emit(); this.close.emit(); },
            error: (err) => {
              this.toast.error({ title: 'Erro', message: err.error.message || 'Erro ao atualizar o rendimento.' });
              this.isSubmitting.set(false);
            },
            complete: () => { this.isSubmitting.set(false); },
          });
        } else {
          this.fixedIncomeService.createYield({
            emissor: data.emissor,
            dataOperacao: this.toIsoDate(data.dataRendimento),
            valor,
            observacoes: data.observacoes || '',
          }).subscribe({
            next: () => { this.confirmed.emit(); this.close.emit(); },
            error: (err) => {
              this.toast.error({ title: 'Erro', message: err.error.message || 'Erro ao salvar o rendimento.' });
              this.isSubmitting.set(false);
            },
            complete: () => { this.isSubmitting.set(false); },
          });
        }
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
