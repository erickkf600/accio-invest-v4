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
  { id: 'd15', data: '10 Jun, 2026', ticker: 'XPML11', tipo: 'Rendimento', qtd: 30, valorUn: 0.55, total: 16.50, status: 'Pago' },
];

export const MOCK_YIELDS: PortfolioYield[] = [
  { id: 'y1', data: '15 Jan, 2024', emissor: 'BANCO ITAÚ', tipo: 'Pós-fixado', valorUn: 1000.00, total: 1250.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCA', dataCompra: '15/01/2024', dataVencimento: '16/06/2025', indexador: 'CDI', grossUp: '95% CDI', txJuros: '9.8%' },
  { id: 'y2', data: '10 Fev, 2024', emissor: 'BANCO SANTANDER', tipo: 'Pós-fixado', valorUn: 2000.00, total: 2320.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCI', dataCompra: '10/02/2024', dataVencimento: '10/02/2027', indexador: 'CDI', grossUp: '92% CDI', txJuros: '9.2%' },
  { id: 'y3', data: '20 Mar, 2024', emissor: 'TESOURO NACIONAL', tipo: 'Pré-fixado', valorUn: 5000.00, total: 5800.00, tipoInvestimento: 'Tesouro Direto', tipoTitulo: 'Tesouro Prefixado', dataCompra: '20/03/2024', dataVencimento: '01/01/2029', indexador: 'Prefixado', grossUp: '13.20%', txJuros: '13.2%' },
  { id: 'y4', data: '15 Abr, 2024', emissor: 'BANCO BRADESCO', tipo: 'Pós-fixado', valorUn: 3000.00, total: 3450.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'CDB', dataCompra: '15/04/2024', dataVencimento: '15/04/2026', indexador: 'CDI', grossUp: '100% CDI', txJuros: '10.5%' },
  { id: 'y5', data: '01 Mai, 2024', emissor: 'SELIC 2030', tipo: 'Pós-fixado', valorUn: 1500.00, total: 1725.00, tipoInvestimento: 'Tesouro Direto', tipoTitulo: 'Tesouro Selic', dataCompra: '01/05/2024', dataVencimento: '01/03/2030', indexador: 'Selic', grossUp: '100% Selic', txJuros: '10.2%' },
  { id: 'y6', data: '10 Jun, 2024', emissor: 'CAIXA ECONÔMICA', tipo: 'Pré-fixado', valorUn: 2500.00, total: 2875.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCA', dataCompra: '10/06/2024', dataVencimento: '10/06/2028', indexador: 'CDI', grossUp: '90% CDI', txJuros: '9.0%' },
  { id: 'y7', data: '05 Jul, 2024', emissor: 'BANCO DO BRASIL', tipo: 'Pós-fixado', valorUn: 4000.00, total: 4600.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'CDB', dataCompra: '05/07/2024', dataVencimento: '05/07/2027', indexador: 'CDI', grossUp: '98% CDI', txJuros: '10.1%' },
  { id: 'y8', data: '15 Ago, 2024', emissor: 'TESOURO NACIONAL', tipo: 'Pós-fixado', valorUn: 3500.00, total: 4025.00, tipoInvestimento: 'Tesouro Direto', tipoTitulo: 'Tesouro IPCA+', dataCompra: '15/08/2024', dataVencimento: '15/08/2034', indexador: 'IPCA', grossUp: 'IPCA+5.5%', txJuros: '5.5%' },
  { id: 'y9', data: '20 Set, 2024', emissor: 'BANCO SAFRA', tipo: 'Pré-fixado', valorUn: 1800.00, total: 2070.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCI', dataCompra: '20/09/2024', dataVencimento: '20/09/2026', indexador: 'CDI', grossUp: '93% CDI', txJuros: '9.5%' },
  { id: 'y10', data: '01 Out, 2024', emissor: 'BANCO INTER', tipo: 'Pós-fixado', valorUn: 2200.00, total: 2530.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'CDB', dataCompra: '01/10/2024', dataVencimento: '01/10/2028', indexador: 'CDI', grossUp: '102% CDI', txJuros: '10.8%' },
  { id: 'y11', data: '15 Nov, 2024', emissor: 'BANCO ORIGINAL', tipo: 'Pré-fixado', valorUn: 1600.00, total: 1840.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCA', dataCompra: '15/11/2024', dataVencimento: '15/11/2026', indexador: 'CDI', grossUp: '91% CDI', txJuros: '9.3%' },
  { id: 'y12', data: '10 Dez, 2024', emissor: 'BANCO BTG', tipo: 'Pós-fixado', valorUn: 2800.00, total: 3220.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'CDB', dataCompra: '10/12/2024', dataVencimento: '10/12/2029', indexador: 'CDI', grossUp: '105% CDI', txJuros: '11.2%' },
  { id: 'y13', data: '15 Out, 2023', emissor: 'BANCO ITAÚ', tipo: 'Pós-fixado', valorUn: 1000.00, total: 1120.00, tipoInvestimento: 'Renda Fixa', tipoTitulo: 'LCA', dataCompra: '15/10/2023', dataVencimento: '16/06/2025', indexador: 'CDI', grossUp: '95% CDI', txJuros: '9.8%' },
  { id: 'y14', data: '10 Set, 2023', emissor: 'TESOURO NACIONAL', tipo: 'Pré-fixado', valorUn: 2000.00, total: 2180.00, tipoInvestimento: 'Tesouro Direto', tipoTitulo: 'Tesouro Prefixado', dataCompra: '10/09/2023', dataVencimento: '01/01/2028', indexador: 'Prefixado', grossUp: '12.80%', txJuros: '12.8%' },
];

export const CHART_DATA_PORTFOLIO: Record<string, { dividends: number[]; yields: number[] }> = {
  '2022': {
    dividends: [15.0, 22.0, 30.0, 38.0, 45.0, 50.0, 55.0, 60.0, 65.0, 70.0, 75.0, 80.0],
    yields: [320, 340, 360, 380, 410, 430, 450, 470, 490, 510, 540, 570],
  },
  '2023': {
    dividends: [30.0, 42.0, 50.0, 65.0, 80.0, 90.0, 95.0, 110.0, 120.0, 76.0, 13.5, 135.0],
    yields: [580, 600, 630, 650, 680, 710, 740, 770, 800, 830, 860, 900],
  },
  '2024': {
    dividends: [45.2, 58.0, 75.5, 92.0, 227.35, 14.8, 85.0, 95.0, 110.0, 130.0, 125.0, 150.0],
    yields: [920, 950, 980, 1020, 1060, 1100, 1140, 1180, 1220, 1260, 1300, 1350],
  },
  '2025': {
    dividends: [60, 70, 85, 100, 120, 135, 140, 160, 175, 190, 200, 220],
    yields: [1380, 1420, 1460, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900],
  },
  '2026': {
    dividends: [80, 95, 110, 130, 150, 170, 185, 200, 220, 240, 260, 290],
    yields: [1920, 1950, 1980, 2020, 2060, 2100, 2150, 2200, 2250, 2300, 2350, 2400],
  },
};
