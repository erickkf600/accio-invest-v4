import { Injectable, signal } from '@angular/core';
import { PortfolioProduct, PortfolioDividend, PortfolioYield } from '../../../models/portfolio.model';
import { MOCK_PRODUCTS, MOCK_DIVIDENDS, MOCK_YIELDS, CHART_DATA_PORTFOLIO } from './mock/portfolio.mock';

export interface PortfolioState {
  products: PortfolioProduct[];
  dividends: PortfolioDividend[];
  yields: PortfolioYield[];
  chartData: Record<string, { dividends: number[]; yields: number[] }>;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private state = signal<PortfolioState>({
    products: [],
    dividends: [],
    yields: [],
    chartData: {},
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.state.set({
      products: MOCK_PRODUCTS,
      dividends: MOCK_DIVIDENDS,
      yields: MOCK_YIELDS,
      chartData: CHART_DATA_PORTFOLIO,
      loading: false,
    });
  }
}
