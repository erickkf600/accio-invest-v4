import { Component, signal } from '@angular/core';
import { TableComponent, TableColumn } from '../../../../components/Table/table.component';
import { CellTemplateDirective } from '../../../../components/Table/cell-template.directive';

interface FiiAnalysis {
  ticker: string;
  pvp: number;
  cotacao: number;
  div12m: number;
  ipca: string;
  ipcaMais: string;
  premio: string;
  yieldAlvo: string;
  precoTeto: number;
  margemSeguranca: number;
  yieldBruto: string;
  tetoBruto: number;
  margemSegurancaBruta: number;
}

const MOCK_DATA: FiiAnalysis[] = [
  { ticker: 'MXRF11', pvp: 1.04, cotacao: 9.68, div12m: 1.20, ipca: '4,39%', ipcaMais: '5,80%', premio: '1,00%', yieldAlvo: '11,55%', precoTeto: 10.39, margemSeguranca: 7.30, yieldBruto: '13,42%', tetoBruto: 8.95, margemSegurancaBruta: -7.59 },
  { ticker: 'KNCR11', pvp: 1.04, cotacao: 105.96, div12m: 14.54, ipca: '4,39%', ipcaMais: '5,80%', premio: '1,00%', yieldAlvo: '11,55%', precoTeto: 125.86, margemSeguranca: 18.78, yieldBruto: '13,42%', tetoBruto: 108.38, margemSegurancaBruta: 2.29 },
  { ticker: 'KNSC11', pvp: 1.03, cotacao: 9.03, div12m: 1.13, ipca: '4,39%', ipcaMais: '5,80%', premio: '1,00%', yieldAlvo: '11,55%', precoTeto: 9.78, margemSeguranca: 8.32, yieldBruto: '13,42%', tetoBruto: 8.42, margemSegurancaBruta: -6.72 },
  { ticker: 'XPLG11', pvp: 0.89, cotacao: 91.47, div12m: 9.84, ipca: '0,00%', ipcaMais: '5,80%', premio: '2,00%', yieldAlvo: '7,92%', precoTeto: 124.25, margemSeguranca: 35.83, yieldBruto: '9,72%', tetoBruto: 101.22, margemSegurancaBruta: 10.66 },
  { ticker: 'HGLG11', pvp: 0.93, cotacao: 150.26, div12m: 13.20, ipca: '0,00%', ipcaMais: '5,80%', premio: '1,00%', yieldAlvo: '6,86%', precoTeto: 192.37, margemSeguranca: 28.03, yieldBruto: '8,65%', tetoBruto: 152.68, margemSegurancaBruta: 1.61 },
  { ticker: 'XPML11', pvp: 0.96, cotacao: 104.03, div12m: 11.04, ipca: '0,00%', ipcaMais: '5,80%', premio: '2,00%', yieldAlvo: '7,92%', precoTeto: 139.40, margemSeguranca: 34.00, yieldBruto: '9,72%', tetoBruto: 113.56, margemSegurancaBruta: 9.16 },
  { ticker: 'VISC11', pvp: 0.89, cotacao: 100.65, div12m: 9.87, ipca: '0,00%', ipcaMais: '5,80%', premio: '2,00%', yieldAlvo: '7,92%', precoTeto: 124.62, margemSeguranca: 23.82, yieldBruto: '9,72%', tetoBruto: 101.53, margemSegurancaBruta: 0.87 },
];

interface TituloReferencia {
  nome: string;
  taxaReal: string;
  ipca: string;
  bruto: string;
  liquido: string;
  equivalente: string;
}

@Component({
  selector: 'app-analises-tab',
  standalone: true,
  imports: [TableComponent, CellTemplateDirective],
  templateUrl: './analises-tab.component.html',
})
export class AnalisesTabComponent {
  data = signal<FiiAnalysis[]>(MOCK_DATA);

  columns: TableColumn[] = [
    { key: 'ticker', label: 'Ativo' },
    { key: 'pvp', label: 'P/VP' },
    { key: 'cotacao', label: 'Cotação' },
    { key: 'div12m', label: 'Div. 12M' },
    { key: 'ipca', label: 'IPCA' },
    { key: 'ipcaMais', label: 'IPCA+' },
    { key: 'premio', label: 'Prêmio' },
    { key: 'yieldAlvo', label: 'Yield Alvo' },
    { key: 'precoTeto', label: 'Preço Teto' },
    { key: 'margemSeguranca', label: 'M. Seg.' },
    { key: 'yieldBruto', label: 'Yield' },
    { key: 'tetoBruto', label: 'Teto' },
    { key: 'margemSegurancaBruta', label: 'M. Seg.' },
  ];

  tituloReferencia = signal<TituloReferencia>({
    nome: 'IPCA + 2035',
    taxaReal: '7,57%',
    ipca: '4,39%',
    bruto: '12,29%',
    liquido: '10,45%',
    equivalente: '5,80%',
  });

  showModal = signal(false);
  editNome = signal('');
  editTaxa = signal('');

  openModal(): void {
    this.editNome.set(this.tituloReferencia().nome);
    this.editTaxa.set(this.tituloReferencia().taxaReal);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveModal(): void {
    this.tituloReferencia.update(t => ({
      ...t,
      nome: this.editNome(),
      taxaReal: this.editTaxa(),
    }));
    this.showModal.set(false);
  }

  margemClass(value: number): string {
    if (value >= 20) return 'bg-status-success/20 text-status-success';
    if (value >= 10) return 'bg-amber-400/20 text-amber-400';
    if (value >= 0) return 'bg-orange-500/20 text-orange-500';
    return 'bg-status-danger/20 text-status-danger';
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
}
