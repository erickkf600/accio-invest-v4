import { PortfolioProduct, PortfolioDividend, PortfolioYield } from '../../../../models/portfolio.model';

export const MOCK_PRODUCTS: PortfolioProduct[] = [
  { ticker: 'AAPL', tipo: 'Ações', qtd: 10, precoMedio: 180.00, custoTotal: 1800.00, precoAtual: 183.05, valorAtual: 1830.50, lucroPrejuizo: 30.50, lucroPrejuizoPct: 1.69, participacao: 15.2, rent30d: 0.4, rent12m: 5.2 },
  { ticker: 'TSLA', tipo: 'Ações', qtd: 5, precoMedio: 170.00, custoTotal: 850.00, precoAtual: 171.89, valorAtual: 859.45, lucroPrejuizo: 9.45, lucroPrejuizoPct: 1.11, participacao: 7.1, rent30d: -1.2, rent12m: 3.8 },
  { ticker: 'MSFT', tipo: 'Ações', qtd: 20, precoMedio: 410.00, custoTotal: 8200.00, precoAtual: 415.50, valorAtual: 8310.00, lucroPrejuizo: 110.00, lucroPrejuizoPct: 1.34, participacao: 38.4, rent30d: 0.8, rent12m: 8.5 },
  { ticker: 'PETR4', tipo: 'Ações', qtd: 100, precoMedio: 38.00, custoTotal: 3800.00, precoAtual: 41.20, valorAtual: 4120.00, lucroPrejuizo: 320.00, lucroPrejuizoPct: 8.42, participacao: 18.5, rent30d: 2.1, rent12m: 15.3 },
  { ticker: 'VALE3', tipo: 'Ações', qtd: 50, precoMedio: 60.00, custoTotal: 3000.00, precoAtual: 62.40, valorAtual: 3120.00, lucroPrejuizo: 120.00, lucroPrejuizoPct: 4.00, participacao: 12.3, rent30d: -0.5, rent12m: 2.1 },
  { ticker: 'ITUB4', tipo: 'Ações', qtd: 80, precoMedio: 26.00, custoTotal: 2080.00, precoAtual: 27.50, valorAtual: 2200.00, lucroPrejuizo: 120.00, lucroPrejuizoPct: 5.77, participacao: 8.5, rent30d: 1.5, rent12m: 11.4 },
  { ticker: 'MXRF11', tipo: 'FII', qtd: 150, precoMedio: 9.80, custoTotal: 1470.00, precoAtual: 10.15, valorAtual: 1522.50, lucroPrejuizo: 52.50, lucroPrejuizoPct: 3.57, participacao: 6.8, rent30d: 0.6, rent12m: 4.8 },
  { ticker: 'XPML11', tipo: 'FII', qtd: 30, precoMedio: 110.00, custoTotal: 3300.00, precoAtual: 115.00, valorAtual: 3450.00, lucroPrejuizo: 150.00, lucroPrejuizoPct: 4.55, participacao: 15.4, rent30d: 0.9, rent12m: 7.2 },
  { ticker: 'BABA34', tipo: 'BDR', qtd: 40, precoMedio: 52.00, custoTotal: 2080.00, precoAtual: 55.30, valorAtual: 2212.00, lucroPrejuizo: 132.00, lucroPrejuizoPct: 6.35, participacao: 6.2, rent30d: 1.8, rent12m: 10.5 },
  { ticker: 'IVVB11', tipo: 'ETF', qtd: 15, precoMedio: 220.00, custoTotal: 3300.00, precoAtual: 235.00, valorAtual: 3525.00, lucroPrejuizo: 225.00, lucroPrejuizoPct: 6.82, participacao: 8.1, rent30d: 1.1, rent12m: 9.3 },
  { ticker: 'BTC', tipo: 'Cripto', qtd: 0.5, precoMedio: 180000.00, custoTotal: 90000.00, precoAtual: 195000.00, valorAtual: 97500.00, lucroPrejuizo: 7500.00, lucroPrejuizoPct: 8.33, participacao: 18.5, rent30d: 3.5, rent12m: 22.4 },
  { ticker: 'SELIC', tipo: 'Renda Fixa', qtd: 15000, precoMedio: 1.00, custoTotal: 15000.00, precoAtual: 1.00, valorAtual: 15930.00, lucroPrejuizo: 930.00, lucroPrejuizoPct: 6.20, participacao: 6.8, rent30d: 0.8, rent12m: 9.4 },
];

export const MOCK_DIVIDENDS: PortfolioDividend[] = [
  { id: 'd1', data: '15 Mai, 2024', ticker: 'PETR4', tipo: 'Dividendos', qtd: 100, valorUn: 1.45, total: 145.20, status: 'Pago' },
  { id: 'd2', data: '22 Mai, 2024', ticker: 'ITUB4', tipo: 'JCP', qtd: 80, valorUn: 1.02, total: 82.15, status: 'Pago' },
  { id: 'd3', data: '05 Jun, 2024', ticker: 'XPML11', tipo: 'Rendimento', qtd: 30, valorUn: 0.49, total: 14.80, status: 'Pago' },
  { id: 'd4', data: '15 Abr, 2024', ticker: 'MXRF11', tipo: 'Rendimento', qtd: 150, valorUn: 0.10, total: 15.00, status: 'Pago' },
  { id: 'd5', data: '10 Fev, 2024', ticker: 'AAPL', tipo: 'Dividendos', qtd: 10, valorUn: 0.24, total: 2.40, status: 'Pago' },
  { id: 'd6', data: '12 Jan, 2024', ticker: 'MSFT', tipo: 'Dividendos', qtd: 20, valorUn: 0.75, total: 15.00, status: 'Pago' },
  { id: 'd7', data: '15 Set, 2023', ticker: 'PETR4', tipo: 'Dividendos', qtd: 100, valorUn: 1.20, total: 120.00, status: 'Pago' },
  { id: 'd8', data: '22 Out, 2023', ticker: 'ITUB4', tipo: 'JCP', qtd: 80, valorUn: 0.95, total: 76.00, status: 'Pago' },
  { id: 'd9', data: '05 Nov, 2023', ticker: 'XPML11', tipo: 'Rendimento', qtd: 30, valorUn: 0.45, total: 13.50, status: 'Pago' },

  { id: 'd10', data: '15 Jan, 2025', ticker: 'PETR4', tipo: 'Dividendos', qtd: 100, valorUn: 1.50, total: 150.00, status: 'Pago' },
  { id: 'd11', data: '20 Mai, 2025', ticker: 'ITUB4', tipo: 'JCP', qtd: 80, valorUn: 1.10, total: 88.00, status: 'Pago' },
  { id: 'd12', data: '10 Jun, 2025', ticker: 'XPML11', tipo: 'Rendimento', qtd: 30, valorUn: 0.50, total: 15.00, status: 'Pago' },

  { id: 'd13', data: '15 Jan, 2026', ticker: 'PETR4', tipo: 'Dividendos', qtd: 100, valorUn: 1.60, total: 160.00, status: 'Pago' },
  { id: 'd14', data: '20 Mai, 2026', ticker: 'ITUB4', tipo: 'JCP', qtd: 80, valorUn: 1.15, total: 92.00, status: 'Pago' },
  { id: 'd15', data: '10 Jun, 2026', ticker: 'XPML11', tipo: 'Rendimento', qtd: 30, valorUn: 0.55, total: 16.50, status: 'Pago' }
];

export const MOCK_YIELDS: PortfolioYield[] = [
  { id: 'y1', data: '15 Mai, 2024', emissor: 'BANCO ITAU', tipo: 'Pós-fixado', valorUn: 1000.00, total: 1250.00 },
  { id: 'y2', data: '10 Abr, 2024', emissor: 'TESOURO NACIONAL', tipo: 'Pré-fixado', valorUn: 2000.00, total: 2320.00 },
  { id: 'y3', data: '20 Fev, 2024', emissor: 'BANCO BRADESCO', tipo: 'Pós-fixado', valorUn: 5000.00, total: 5800.00 },
  { id: 'y4', data: '15 Out, 2023', emissor: 'BANCO ITAU', tipo: 'Pós-fixado', valorUn: 1000.00, total: 1120.00 },
  { id: 'y5', data: '10 Set, 2023', emissor: 'TESOURO NACIONAL', tipo: 'Pré-fixado', valorUn: 2000.00, total: 2180.00 }
];

// Helper monthly aggregation values for charts per year
export const CHART_DATA_PORTFOLIO: Record<string, { dividends: number[]; yields: number[] }> = {
  '2024': {
    dividends: [45.2, 58.0, 75.5, 92.0, 227.35, 14.8, 85.0, 95.0, 110.0, 130.0, 125.0, 150.0],
    yields: [120, 5800, 150, 2320, 1250, 180, 220, 240, 290, 310, 350, 400]
  },
  '2023': {
    dividends: [30.0, 42.0, 50.0, 65.0, 80.0, 90.0, 95.0, 110.0, 120.0, 76.0, 13.5, 135.0],
    yields: [90, 110, 130, 140, 170, 190, 200, 210, 2180, 1120, 280, 320]
  },
  '2025': {
    dividends: [60, 70, 85, 100, 120, 135, 140, 160, 175, 190, 200, 220],
    yields: [150, 180, 200, 230, 260, 290, 320, 350, 380, 410, 440, 480]
  },
  '2026': {
    dividends: [80, 95, 110, 130, 150, 170, 185, 200, 220, 240, 260, 290],
    yields: [200, 230, 260, 300, 340, 380, 420, 460, 500, 550, 600, 650]
  }
};
