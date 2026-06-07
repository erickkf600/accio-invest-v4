import {
  RelatorioAporte,
  RelatorioAluguel,
  RelatorioVenda,
  RelatorioReposicionamento,
  RelatorioNotaCorretagem,
  RelatorioPrecoMedio,
  RelatorioRendaFixa
} from '../../../../models/relatorios.model';

export const MOCK_APORTES: RelatorioAporte[] = [
  { id: 'ap1', mes: 'Maio', ano: 2024, data: '12/05/2024', valor: 3842.00, taxas: 12.50, detalhes: 'Aporte mensal em Renda Variável (AAPL, PETR4)' },
  { id: 'ap2', mes: 'Abril', ano: 2024, data: '18/04/2024', valor: 3125.00, taxas: 8.20, detalhes: 'Aporte mensal em Renda Variável e FIIs' },
  { id: 'ap3', mes: 'Março', ano: 2024, data: '15/03/2024', valor: 5400.00, taxas: 15.40, detalhes: 'Aporte de bônus em Renda Variável e Renda Fixa' },
  { id: 'ap4', mes: 'Fevereiro', ano: 2024, data: '10/02/2024', valor: 1710.00, taxas: 5.10, detalhes: 'Aporte menor focado em FIIs (XPML11)' },
  { id: 'ap5', mes: 'Janeiro', ano: 2024, data: '05/01/2024', valor: 2500.00, taxas: 6.80, detalhes: 'Aporte de início de ano' },
  { id: 'ap6', mes: 'Dezembro', ano: 2023, data: '15/12/2023', valor: 4500.00, taxas: 14.10, detalhes: 'Aporte de 13º salário' },
  { id: 'ap7', mes: 'Novembro', ano: 2023, data: '10/11/2023', valor: 2800.00, taxas: 8.50, detalhes: 'Aporte mensal padrão' }
];

export const MOCK_ALUGUEIS: RelatorioAluguel[] = [
  { id: 'al1', ticker: 'XPML11', data: '15/05/2024', qtd: 30, precoUn: 0.90, total: 27.00 },
  { id: 'al2', ticker: 'MXRF11', data: '10/05/2024', qtd: 150, precoUn: 0.10, total: 15.00 },
  { id: 'al3', ticker: 'XPML11', data: '15/04/2024', qtd: 30, precoUn: 0.85, total: 25.50 },
  { id: 'al4', ticker: 'MXRF11', data: '10/04/2024', qtd: 150, precoUn: 0.10, total: 15.00 },
  { id: 'al5', ticker: 'XPML11', data: '15/03/2024', qtd: 20, precoUn: 0.85, total: 17.00 },
  { id: 'al6', ticker: 'MXRF11', data: '10/03/2024', qtd: 100, precoUn: 0.11, total: 11.00 }
];

export const MOCK_VENDAS: RelatorioVenda[] = [
  { id: 've1', ticker: 'TSLA', data: '10/05/2024', qtd: 5, precoUn: 171.89, total: 859.45, taxas: 0.26, resultado: 9.45 },
  { id: 've2', ticker: 'BBDC4', data: '15/04/2024', qtd: 120, precoUn: 14.20, total: 1704.00, taxas: 0.45, resultado: -36.00 },
  { id: 've3', ticker: 'VALE3', data: '12/11/2023', qtd: 10, precoUn: 68.50, total: 685.00, taxas: 0.20, resultado: 85.00 }
];

export const MOCK_REPOSICIONAMENTOS: RelatorioReposicionamento[] = [
  { id: 're1', ticker: 'VALE3', data: '25/04/2024', tipo: 'Ações', fator: 'Agrupamento', proporcaoDe: 10, proporcaoPara: 1 },
  { id: 're2', ticker: 'PETR4', data: '12/03/2024', tipo: 'Ações', fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 2 },
  { id: 're3', ticker: 'MXRF11', data: '18/10/2023', tipo: 'FII', fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 10 },
  { id: 're4', ticker: 'BABA34', data: '22/05/2024', tipo: 'BDR', fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 5 },
  { id: 're5', ticker: 'IVVB11', data: '10/02/2024', tipo: 'ETF', fator: 'Agrupamento', proporcaoDe: 10, proporcaoPara: 1 }
];

export const MOCK_NOTAS: RelatorioNotaCorretagem[] = [
  { id: 'no1', documento: 'Nota_Corretagem_12052024.pdf', data: '12/05/2024', tipo: 'Compra - Renda variável', tamanho: '142 KB' },
  { id: 'no2', documento: 'Nota_Corretagem_18042024.pdf', data: '18/04/2024', tipo: 'Compra - Renda variável', tamanho: '138 KB' },
  { id: 'no3', documento: 'Nota_Corretagem_10022024.pdf', data: '10/02/2024', tipo: 'Venda - Renda variável', tamanho: '145 KB' }
];

export const MOCK_PRECO_MEDIO: RelatorioPrecoMedio[] = [
  { id: 'pm1', ticker: 'AAPL', tipo: 'Ações', qtd: 10, precoMedio: 180.00, custoTotal: 1800.00 },
  { id: 'pm2', ticker: 'TSLA', tipo: 'Ações', qtd: 5, precoMedio: 170.00, custoTotal: 850.00 },
  { id: 'pm3', ticker: 'MSFT', tipo: 'Ações', qtd: 20, precoMedio: 410.00, custoTotal: 8200.00 },
  { id: 'pm4', ticker: 'PETR4', tipo: 'Ações', qtd: 100, precoMedio: 38.00, custoTotal: 3800.00 },
  { id: 'pm5', ticker: 'MXRF11', tipo: 'FII', qtd: 150, precoMedio: 9.80, custoTotal: 1470.00 },
  { id: 'pm6', ticker: 'BABA34', tipo: 'BDR', qtd: 40, precoMedio: 52.00, custoTotal: 2080.00 },
  { id: 'pm7', ticker: 'IVVB11', tipo: 'ETF', qtd: 15, precoMedio: 220.00, custoTotal: 3300.00 },
  { id: 'pm8', ticker: 'BTC', tipo: 'Cripto', qtd: 0.5, precoMedio: 180000.00, custoTotal: 90000.00 }
];

export const MOCK_RENDA_FIXA: RelatorioRendaFixa[] = [
  { id: 'rf1', emissor: 'BANCO ITAU', tipo: 'Pós-fixado', indexador: 'CDI', taxaJuros: 110.00, liquidezDiaria: true, possuiImposto: true, valorAplicado: 5000.00 },
  { id: 'rf2', emissor: 'TESOURO NACIONAL', tipo: 'Pré-fixado', indexador: 'SELIC', taxaJuros: 10.75, liquidezDiaria: false, vencimento: '15/12/2026', possuiImposto: false, valorAplicado: 10000.00 },
  { id: 'rf3', emissor: 'BANCO BRADESCO', tipo: 'Pós-fixado', indexador: 'IPCA', taxaJuros: 6.20, liquidezDiaria: false, vencimento: '10/06/2028', possuiImposto: true, valorAplicado: 8000.00 }
];

export const CHART_DATA_APORTES: Record<string, number[]> = {
  '2024': [2500, 1710, 5400, 3125, 3842, 0, 0, 0, 0, 0, 0, 0],
  '2023': [1500, 1800, 2000, 2200, 2400, 2600, 2700, 2800, 3000, 3100, 2800, 4500],
  '2025': [3000, 3200, 3500, 3700, 4000, 4200, 4400, 4600, 4800, 5000, 5200, 5500],
  '2026': [4000, 4200, 4500, 4800, 5000, 5200, 5500, 5800, 6000, 6200, 6500, 7000]
};
