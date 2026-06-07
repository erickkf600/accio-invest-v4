import { Component } from '@angular/core';

@Component({
  selector: 'app-ferramentas',
  standalone: true,
  imports: [],
  templateUrl: './ferramentas.html',
  styleUrl: './ferramentas.scss',
})
export default class Ferramentas {
  protected resultTotal = 'R$ 0,00';
  protected resultJuros = 'R$ 0,00';
  protected precoMedio = 'R$ 0,00';
  protected valorJusto = 'R$ 0,00';
  protected p1Res = '0';
  protected p2Res = '0%';
  protected p3Res = '0% (Aumento)';
  protected p4Res = '0% (Queda)';

  formatBRL(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  calculateFinancialFreedom(
    inicial: string,
    aporte: string,
    taxa: string,
    meses: string
  ): void {
    const P = parseFloat(inicial) || 0;
    const PMT = parseFloat(aporte) || 0;
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

  calculatePM(entries: { qtd: number; price: number }[]): void {
    let totalCost = 0;
    let totalQtd = 0;

    for (const e of entries) {
      totalCost += e.qtd * e.price;
      totalQtd += e.qtd;
    }

    const result = totalQtd > 0 ? totalCost / totalQtd : 0;
    this.precoMedio = this.formatBRL(result);
  }

  calculateGraham(lpa: string, vpa: string): void {
    const lpaVal = parseFloat(lpa) || 0;
    const vpaVal = parseFloat(vpa) || 0;

    if (lpaVal <= 0 || vpaVal <= 0) {
      this.valorJusto = 'R$ 0,00';
      return;
    }

    const result = Math.sqrt(22.5 * lpaVal * vpaVal);
    this.valorJusto = this.formatBRL(result);
  }

  addPMRow(container: HTMLElement): void {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-2 gap-4 pb-4 border-b border-white/5';
    row.innerHTML = `
      <div>
        <input type="number" class="pm-qtd w-full bg-[#32353C] border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-1 focus:ring-secondary" placeholder="0">
      </div>
      <div>
        <input type="number" class="pm-price w-full bg-[#32353C] border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-1 focus:ring-secondary" placeholder="0,00">
      </div>
    `;
    container.appendChild(row);
  }

  calcPM(container: HTMLElement): void {
    const qtds = container.querySelectorAll('.pm-qtd');
    const prices = container.querySelectorAll('.pm-price');
    const entries: { qtd: number; price: number }[] = [];
    for (let i = 0; i < qtds.length; i++) {
      const q = parseFloat((qtds[i] as HTMLInputElement).value) || 0;
      const p = parseFloat((prices[i] as HTMLInputElement).value) || 0;
      entries.push({ qtd: q, price: p });
    }
    this.calculatePM(entries);
  }

  updatePercentages(
    p1x: string, p1y: string,
    p2x: string, p2y: string,
    p3x: string, p3y: string,
    p4x: string, p4y: string
  ): void {
    const p1xVal = parseFloat(p1x) || 0;
    const p1yVal = parseFloat(p1y) || 0;
    this.p1Res = ((p1xVal / 100) * p1yVal).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

    const p2xVal = parseFloat(p2x) || 0;
    const p2yVal = parseFloat(p2y) || 0;
    this.p2Res = (p2yVal !== 0 ? (p2xVal / p2yVal) * 100 : 0).toFixed(2) + '%';

    const p3xVal = parseFloat(p3x) || 0;
    const p3yVal = parseFloat(p3y) || 0;
    const p3Res = p3xVal !== 0 ? ((p3yVal - p3xVal) / p3xVal) * 100 : 0;
    this.p3Res = p3Res.toFixed(2) + '% (Aumento)';

    const p4xVal = parseFloat(p4x) || 0;
    const p4yVal = parseFloat(p4y) || 0;
    const p4Res = p4xVal !== 0 ? ((p4xVal - p4yVal) / p4xVal) * 100 : 0;
    this.p4Res = p4Res.toFixed(2) + '% (Queda)';
  }
}
