import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective, parseCurrencyBRL } from '../../directives/currency-mask.directive';

@Component({
  selector: 'app-ferramentas',
  standalone: true,
  imports: [FormsModule, CurrencyMaskDirective],
  templateUrl: './ferramentas.html',
  styleUrl: './ferramentas.scss',
})
export default class Ferramentas {
  protected resultTotal = 'R$ 0,00';
  protected resultJuros = 'R$ 0,00';
  protected precoMedio = 'R$ 0,00';
  protected precoTeto = 'R$ 0,00';
  protected rentabilidade = '0,00';
  protected get rentabilidadeValor(): number {
    const clean = this.rentabilidade.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }
  protected p1Res = '0';
  protected p2Res = '0%';
  protected p3Res = '0% (Aumento)';
  protected p4Res = '0% (Queda)';

  protected pmEntries: { qtd: number | null; price: string }[] = [
    { qtd: null, price: '' },
  ];

  formatBRL(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  calculateFinancialFreedom(
    inicial: string,
    aporte: string,
    taxa: string,
    meses: string
  ): void {
    const P = parseCurrencyBRL(inicial);
    const PMT = parseCurrencyBRL(aporte);
    const i = (parseFloat(taxa) || 0) / 100;
    const n = parseInt(meses) || 0;

    if (n === 0) return;

    let futureValue: number;
    if (i === 0) {
      futureValue = P + PMT * n;
    } else {
      futureValue = P * Math.pow(1 + i, n) + PMT * ((Math.pow(1 + i, n) - 1) / i);
    }

    const totalInvested = P + PMT * n;
    const totalInterest = futureValue - totalInvested;

    this.resultTotal = this.formatBRL(futureValue);
    this.resultJuros = this.formatBRL(totalInterest);
  }

  calcPM(): void {
    let totalCost = 0;
    let totalQtd = 0;

    for (const entry of this.pmEntries) {
      const qtd = entry.qtd || 0;
      const price = parseCurrencyBRL(entry.price);
      totalCost += qtd * price;
      totalQtd += qtd;
    }

    const result = totalQtd > 0 ? totalCost / totalQtd : 0;
    this.precoMedio = this.formatBRL(result);
  }

  calcularPrecoTeto(rendimento: string, taxa: string): void {
    const rend = parseCurrencyBRL(rendimento);
    const tx = parseFloat(taxa) || 0;

    if (rend <= 0 || tx <= 0) {
      this.precoTeto = 'R$ 0,00';
      return;
    }

    const result = rend / (tx / 100);
    this.precoTeto = this.formatBRL(result);
  }

  calcularRentabilidade(inicial: string, atual: string): void {
    const vi = parseCurrencyBRL(inicial);
    const va = parseCurrencyBRL(atual);

    if (vi <= 0) {
      this.rentabilidade = '0,00';
      return;
    }

    this.rentabilidade = (((va - vi) / vi) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  addPMRow(): void {
    this.pmEntries.push({ qtd: null, price: '' });
  }

  removePMRow(index: number): void {
    if (this.pmEntries.length > 1) {
      this.pmEntries.splice(index, 1);
    }
  }

  calcP1(percent: string, value: string): void {
    const p = parseFloat(percent) || 0;
    const v = parseFloat(value) || 0;
    this.p1Res = ((p / 100) * v).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  calcP2(x: string, y: string): void {
    const xv = parseFloat(x) || 0;
    const yv = parseFloat(y) || 0;
    this.p2Res = (yv !== 0 ? (xv / yv) * 100 : 0).toFixed(2) + '%';
  }

  calcP3(x: string, y: string): void {
    const xv = parseFloat(x) || 0;
    const yv = parseFloat(y) || 0;
    const res = xv !== 0 ? ((yv - xv) / xv) * 100 : 0;
    this.p3Res = res.toFixed(2) + '% (Aumento)';
  }

  calcP4(x: string, y: string): void {
    const xv = parseFloat(x) || 0;
    const yv = parseFloat(y) || 0;
    const res = xv !== 0 ? ((xv - yv) / xv) * 100 : 0;
    this.p4Res = res.toFixed(2) + '% (Queda)';
  }
}
