import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';
import { PortfolioProduct, PortfolioDividend, PortfolioYield } from '../../../models/portfolio.model';
import { CHART_DATA_PORTFOLIO } from './mock/portfolio.mock';

export interface PortfolioState {
  products: PortfolioProduct[];
  dividends: PortfolioDividend[];
  yields: PortfolioYield[];
  chartData: Record<string, { dividends: number[]; yields: number[] }>;
  loading: boolean;
}

interface PositionDto {
  id: number;
  ticker: string;
  tipo: string;
  qtd: number;
  precoMedio: number;
  custoTotal: number;
  precoAtual: number;
  valorAtual: number;
  lucroPrejuizo: number;
  lucroPrejuizoPct: number;
  participacao: number;
}

interface DividendDto {
  id: number;
  data: string;
  ticker: string;
  tipo: string;
  qtd: number;
  valorUn: number;
  total: number;
  status: string;
}

interface YieldDto {
  id: number;
  emissor: string;
  tipo: string;
  indexador: string;
  taxaJuros: number;
  valorAplicado: number;
  dataCompra: string;
  vencimento?: string;
  liquidezDiaria: boolean;
  possuiImposto: boolean;
}

interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const MESES: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

function formatShortDate(d: string): string {
  const date = new Date(d);
  return `${date.getDate()} ${MESES[date.getMonth() + 1] || ''}, ${date.getFullYear()}`;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  private state = signal<PortfolioState>({
    products: [],
    dividends: [],
    yields: [],
    chartData: CHART_DATA_PORTFOLIO,
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  constructor() {
    this.loadPositions();
    this.loadDividends();
    this.loadYields();
  }

  loadPositions(): void {
    this.http.get<ApiResponse<{ data: PositionDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/positions`, {
      params: { limit: 100 },
    }).subscribe({
      next: (res) => {
        const products: PortfolioProduct[] = res.data.data.map((p) => ({
          ticker: p.ticker,
          tipo: p.tipo,
          qtd: p.qtd,
          precoMedio: p.precoMedio,
          custoTotal: p.custoTotal,
          precoAtual: p.precoAtual,
          valorAtual: p.valorAtual,
          lucroPrejuizo: p.lucroPrejuizo,
          lucroPrejuizoPct: p.lucroPrejuizoPct,
          participacao: p.participacao,
          rent30d: 0,
          rent12m: 0,
        }));
        this.state.update((s) => ({ ...s, products, loading: false }));
      },
      error: () => {
        this.state.update((s) => ({ ...s, loading: false }));
      },
    });
  }

  loadDividends(): void {
    this.http.get<ApiResponse<{ data: DividendDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/dividends`, {
      params: { limit: 100 },
    }).subscribe({
      next: (res) => {
        const dividends: PortfolioDividend[] = res.data.data.map((d) => ({
          id: String(d.id),
          data: formatShortDate(d.data),
          ticker: d.ticker,
          tipo: d.tipo,
          qtd: d.qtd,
          valorUn: d.valorUn,
          total: d.total,
          status: d.status as PortfolioDividend['status'],
        }));
        this.state.update((s) => ({ ...s, dividends, loading: false }));
      },
      error: () => {
        this.state.update((s) => ({ ...s, loading: false }));
      },
    });
  }

  loadYields(): void {
    this.http.get<ApiResponse<{ data: YieldDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/yields`, {
      params: { limit: 100 },
    }).subscribe({
      next: (res) => {
        const yields: PortfolioYield[] = res.data.data.map((y) => ({
          id: String(y.id),
          data: formatShortDate(y.dataCompra),
          emissor: y.emissor,
          tipo: y.tipo,
          valorUn: y.valorAplicado,
          total: y.valorAplicado,
          tipoInvestimento: 'Renda Fixa',
          tipoTitulo: y.liquidezDiaria ? 'LCA/LCI' : 'CDB',
          dataCompra: formatShortDate(y.dataCompra),
          dataVencimento: y.vencimento ? formatShortDate(y.vencimento) : '-',
          indexador: y.indexador,
          grossUp: `${y.taxaJuros}%`,
          txJuros: `${y.taxaJuros}%`,
        }));
        this.state.update((s) => ({ ...s, yields, loading: false }));
      },
      error: () => {
        this.state.update((s) => ({ ...s, loading: false }));
      },
    });
  }

}
