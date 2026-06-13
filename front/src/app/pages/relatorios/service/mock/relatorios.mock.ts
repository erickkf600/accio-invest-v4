import {
  RelatorioAporte,
  AporteAtivo,
  RelatorioAluguel,
  RelatorioVenda,
  RelatorioReposicionamento,
  RelatorioNotaCorretagem,
  RelatorioPrecoMedio,
  RelatorioRendaFixa
} from '../../../../models/relatorios.model';
import { AssetTypeEnum } from '../../../../models/enums';

function ap(ticker: string, tipo: string, qtd: number, vu: number, total: number, taxa: number): AporteAtivo {
  return { ticker, tipo, quantidade: qtd, valorUnitario: vu, total, taxa };
}

function makeAtivos(...items: AporteAtivo[]): AporteAtivo[] {
  return items;
}

export const MOCK_APORTES: RelatorioAporte[] = [
  // 2024
  { id: 'ap1', mes: 'Janeiro', ano: 2024, data: '05/01/2024', valor: 1500.00, taxas: 4.20, detalhes: 'Aporte RV (AAPL)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.20)) },
  { id: 'ap2', mes: 'Janeiro', ano: 2024, data: '20/01/2024', valor: 1000.00, taxas: 2.60, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', AssetTypeEnum.FII, 10, 60.00, 600.00, 1.56), ap('MXRF11', AssetTypeEnum.FII, 20, 20.00, 400.00, 1.04)) },
  { id: 'ap3', mes: 'Fevereiro', ano: 2024, data: '10/02/2024', valor: 1010.00, taxas: 2.90, detalhes: 'Aporte RV (PETR4, VALE3)', ativos: makeAtivos(ap('PETR4', AssetTypeEnum.ACOES, 20, 25.25, 505.00, 1.45), ap('VALE3', AssetTypeEnum.ACOES, 5, 101.00, 505.00, 1.45)) },
  { id: 'ap4', mes: 'Fevereiro', ano: 2024, data: '25/02/2024', valor: 700.00, taxas: 2.20, detalhes: 'Aporte FIIs (HGLG11)', ativos: makeAtivos(ap('HGLG11', 'FII', 7, 100.00, 700.00, 2.20)) },
  { id: 'ap5', mes: 'Março', ano: 2024, data: '08/03/2024', valor: 2000.00, taxas: 5.80, detalhes: 'Aporte RV (BBDC4, ITUB4)', ativos: makeAtivos(ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 2.90), ap('ITUB4', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 2.90)) },
  { id: 'ap6', mes: 'Março', ano: 2024, data: '15/03/2024', valor: 2000.00, taxas: 5.40, detalhes: 'Aporte bônus RV (MSFT, TSLA)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 2, 600.00, 1200.00, 3.24), ap('TSLA', AssetTypeEnum.ACOES, 4, 200.00, 800.00, 2.16)) },
  { id: 'ap7', mes: 'Março', ano: 2024, data: '28/03/2024', valor: 1400.00, taxas: 4.20, detalhes: 'Aporte RF (CDB Banco Itaú)', ativos: makeAtivos(ap('CDB Itaú', 'Renda Fixa', 1, 1400.00, 1400.00, 4.20)) },
  { id: 'ap8', mes: 'Abril', ano: 2024, data: '12/04/2024', valor: 1625.00, taxas: 4.10, detalhes: 'Aporte RV (AAPL, PETR4)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 2.52), ap('PETR4', AssetTypeEnum.ACOES, 25, 25.00, 625.00, 1.58)) },
  { id: 'ap9', mes: 'Abril', ano: 2024, data: '25/04/2024', valor: 1500.00, taxas: 4.10, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', 'FII', 15, 60.00, 900.00, 2.46), ap('MXRF11', 'FII', 30, 20.00, 600.00, 1.64)) },
  { id: 'ap10', mes: 'Maio', ano: 2024, data: '08/05/2024', valor: 2000.00, taxas: 6.50, detalhes: 'Aporte RV (VALE3, BBDC4)', ativos: makeAtivos(ap('VALE3', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.25), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.25)) },
  { id: 'ap11', mes: 'Maio', ano: 2024, data: '22/05/2024', valor: 1842.00, taxas: 6.00, detalhes: 'Aporte RF (Tesouro SELIC)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 1842.00, 1842.00, 6.00)) },
  { id: 'ap12', mes: 'Junho', ano: 2024, data: '10/06/2024', valor: 3500.00, taxas: 10.80, detalhes: 'Aporte RV (MSFT, TSLA, AAPL)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 3, 600.00, 1800.00, 5.56), ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.08), ap('AAPL', AssetTypeEnum.ACOES, 2, 350.00, 700.00, 2.16)) },
  { id: 'ap13', mes: 'Junho', ano: 2024, data: '25/06/2024', valor: 2100.00, taxas: 6.50, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 15, 80.00, 1200.00, 3.72), ap('KNRI11', 'FII', 10, 90.00, 900.00, 2.78)) },
  { id: 'ap14', mes: 'Julho', ano: 2024, data: '12/07/2024', valor: 2800.00, taxas: 8.20, detalhes: 'Aporte RV (PETR4, ITUB4)', ativos: makeAtivos(ap('PETR4', AssetTypeEnum.ACOES, 30, 50.00, 1500.00, 4.38), ap('ITUB4', AssetTypeEnum.ACOES, 13, 100.00, 1300.00, 3.82)) },
  { id: 'ap15', mes: 'Julho', ano: 2024, data: '28/07/2024', valor: 1800.00, taxas: 5.40, detalhes: 'Aporte RF (CDB Bradesco)', ativos: makeAtivos(ap('CDB Bradesco', 'Renda Fixa', 1, 1800.00, 1800.00, 5.40)) },
  { id: 'ap16', mes: 'Agosto', ano: 2024, data: '15/08/2024', valor: 2200.00, taxas: 6.80, detalhes: 'Aporte RV (AAPL, MSFT)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 400.00, 1200.00, 3.70), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.10)) },
  { id: 'ap17', mes: 'Agosto', ano: 2024, data: '30/08/2024', valor: 1600.00, taxas: 4.90, detalhes: 'Aporte FIIs (MXRF11, XPML11)', ativos: makeAtivos(ap('MXRF11', 'FII', 40, 20.00, 800.00, 2.45), ap('XPML11', 'FII', 10, 80.00, 800.00, 2.45)) },
  { id: 'ap18', mes: 'Setembro', ano: 2024, data: '10/09/2024', valor: 3200.00, taxas: 9.40, detalhes: 'Aporte RV (VALE3, BBDC4, PETR4)', ativos: makeAtivos(ap('VALE3', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 2.94), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 2.94), ap('PETR4', AssetTypeEnum.ACOES, 20, 60.00, 1200.00, 3.52)) },
  { id: 'ap19', mes: 'Setembro', ano: 2024, data: '25/09/2024', valor: 1800.00, taxas: 5.20, detalhes: 'Aporte RF (Tesouro IPCA+)', ativos: makeAtivos(ap('Tesouro IPCA+', 'Renda Fixa', 1, 1800.00, 1800.00, 5.20)) },
  { id: 'ap20', mes: 'Outubro', ano: 2024, data: '12/10/2024', valor: 2500.00, taxas: 7.50, detalhes: 'Aporte RV (ITUB4, TSLA)', ativos: makeAtivos(ap('ITUB4', AssetTypeEnum.ACOES, 15, 100.00, 1500.00, 4.50), ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.00)) },
  { id: 'ap21', mes: 'Outubro', ano: 2024, data: '28/10/2024', valor: 1500.00, taxas: 4.30, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 10, 80.00, 800.00, 2.30), ap('KNRI11', 'FII', 7, 100.00, 700.00, 2.00)) },
  { id: 'ap22', mes: 'Novembro', ano: 2024, data: '10/11/2024', valor: 3000.00, taxas: 9.00, detalhes: 'Aporte RV (AAPL, MSFT, VALE3)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.50), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.00), ap('VALE3', AssetTypeEnum.ACOES, 5, 100.00, 500.00, 1.50)) },
  { id: 'ap23', mes: 'Novembro', ano: 2024, data: '28/11/2024', valor: 2000.00, taxas: 6.00, detalhes: 'Aporte RF (CDB Banco Itaú)', ativos: makeAtivos(ap('CDB Itaú', 'Renda Fixa', 1, 2000.00, 2000.00, 6.00)) },
  { id: 'ap24', mes: 'Dezembro', ano: 2024, data: '15/12/2024', valor: 4500.00, taxas: 14.10, detalhes: 'Aporte 13º salário (RF + RV)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 2500.00, 2500.00, 7.84), ap('AAPL', AssetTypeEnum.ACOES, 4, 500.00, 2000.00, 6.26)) },

  // 2025
  { id: 'ap25', mes: 'Janeiro', ano: 2025, data: '08/01/2025', valor: 1800.00, taxas: 5.20, detalhes: 'Aporte RV (AAPL, MSFT)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 2.88), ap('MSFT', AssetTypeEnum.ACOES, 2, 400.00, 800.00, 2.32)) },
  { id: 'ap26', mes: 'Janeiro', ano: 2025, data: '22/01/2025', valor: 1200.00, taxas: 3.60, detalhes: 'Aporte FIIs (XPML11)', ativos: makeAtivos(ap('XPML11', 'FII', 15, 80.00, 1200.00, 3.60)) },
  { id: 'ap27', mes: 'Fevereiro', ano: 2025, data: '12/02/2025', valor: 2000.00, taxas: 6.20, detalhes: 'Aporte RV (PETR4, VALE3)', ativos: makeAtivos(ap('PETR4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.10), ap('VALE3', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.10)) },
  { id: 'ap28', mes: 'Fevereiro', ano: 2025, data: '26/02/2025', valor: 1200.00, taxas: 3.80, detalhes: 'Aporte RF (CDB Bradesco)', ativos: makeAtivos(ap('CDB Bradesco', 'Renda Fixa', 1, 1200.00, 1200.00, 3.80)) },
  { id: 'ap29', mes: 'Março', ano: 2025, data: '10/03/2025', valor: 2200.00, taxas: 6.80, detalhes: 'Aporte RV (ITUB4, BBDC4)', ativos: makeAtivos(ap('ITUB4', AssetTypeEnum.ACOES, 12, 100.00, 1200.00, 3.70), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.10)) },
  { id: 'ap30', mes: 'Março', ano: 2025, data: '25/03/2025', valor: 1300.00, taxas: 4.00, detalhes: 'Aporte FIIs (MXRF11, HGLG11)', ativos: makeAtivos(ap('MXRF11', 'FII', 30, 20.00, 600.00, 1.84), ap('HGLG11', 'FII', 7, 100.00, 700.00, 2.16)) },
  { id: 'ap31', mes: 'Abril', ano: 2025, data: '12/04/2025', valor: 2500.00, taxas: 7.50, detalhes: 'Aporte RV (TSLA, AAPL)', ativos: makeAtivos(ap('TSLA', AssetTypeEnum.ACOES, 6, 200.00, 1200.00, 3.60), ap('AAPL', AssetTypeEnum.ACOES, 3, 433.33, 1300.00, 3.90)) },
  { id: 'ap32', mes: 'Abril', ano: 2025, data: '28/04/2025', valor: 1200.00, taxas: 3.80, detalhes: 'Aporte RF (Tesouro SELIC)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 1200.00, 1200.00, 3.80)) },
  { id: 'ap33', mes: 'Maio', ano: 2025, data: '10/05/2025', valor: 2800.00, taxas: 8.40, detalhes: 'Aporte RV (MSFT, VALE3, PETR4)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.00), ap('VALE3', AssetTypeEnum.ACOES, 8, 100.00, 800.00, 2.40), ap('PETR4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.00)) },
  { id: 'ap34', mes: 'Maio', ano: 2025, data: '25/05/2025', valor: 1200.00, taxas: 3.60, detalhes: 'Aporte FIIs (KNRI11)', ativos: makeAtivos(ap('KNRI11', 'FII', 12, 100.00, 1200.00, 3.60)) },
  { id: 'ap35', mes: 'Junho', ano: 2025, data: '10/06/2025', valor: 3000.00, taxas: 9.20, detalhes: 'Aporte RV (AAPL, TSLA, ITUB4)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.60), ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.06), ap('ITUB4', AssetTypeEnum.ACOES, 5, 100.00, 500.00, 1.54)) },
  { id: 'ap36', mes: 'Junho', ano: 2025, data: '25/06/2025', valor: 1200.00, taxas: 3.80, detalhes: 'Aporte RF (CDB Itaú)', ativos: makeAtivos(ap('CDB Itaú', 'Renda Fixa', 1, 1200.00, 1200.00, 3.80)) },
  { id: 'ap37', mes: 'Julho', ano: 2025, data: '12/07/2025', valor: 3200.00, taxas: 9.80, detalhes: 'Aporte RV (BBDC4, MSFT, AAPL)', ativos: makeAtivos(ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.06), ap('MSFT', AssetTypeEnum.ACOES, 2, 600.00, 1200.00, 3.68), ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.06)) },
  { id: 'ap38', mes: 'Julho', ano: 2025, data: '28/07/2025', valor: 1200.00, taxas: 3.60, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', 'FII', 10, 80.00, 800.00, 2.40), ap('MXRF11', 'FII', 20, 20.00, 400.00, 1.20)) },
  { id: 'ap39', mes: 'Agosto', ano: 2025, data: '10/08/2025', valor: 3200.00, taxas: 9.60, detalhes: 'Aporte RV (VALE3, PETR4)', ativos: makeAtivos(ap('VALE3', AssetTypeEnum.ACOES, 15, 100.00, 1500.00, 4.50), ap('PETR4', AssetTypeEnum.ACOES, 34, 50.00, 1700.00, 5.10)) },
  { id: 'ap40', mes: 'Agosto', ano: 2025, data: '25/08/2025', valor: 1400.00, taxas: 4.20, detalhes: 'Aporte RF (Tesouro IPCA+)', ativos: makeAtivos(ap('Tesouro IPCA+', 'Renda Fixa', 1, 1400.00, 1400.00, 4.20)) },
  { id: 'ap41', mes: 'Setembro', ano: 2025, data: '12/09/2025', valor: 3500.00, taxas: 10.50, detalhes: 'Aporte RV (TSLA, AAPL, ITUB4)', ativos: makeAtivos(ap('TSLA', AssetTypeEnum.ACOES, 7, 200.00, 1400.00, 4.20), ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.50), ap('ITUB4', AssetTypeEnum.ACOES, 6, 100.00, 600.00, 1.80)) },
  { id: 'ap42', mes: 'Setembro', ano: 2025, data: '28/09/2025', valor: 1300.00, taxas: 4.00, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 8, 100.00, 800.00, 2.46), ap('KNRI11', 'FII', 5, 100.00, 500.00, 1.54)) },
  { id: 'ap43', mes: 'Outubro', ano: 2025, data: '10/10/2025', valor: 3800.00, taxas: 11.40, detalhes: 'Aporte RV (MSFT, BBDC4, VALE3)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 3, 600.00, 1800.00, 5.40), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.00), ap('VALE3', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.00)) },
  { id: 'ap44', mes: 'Outubro', ano: 2025, data: '25/10/2025', valor: 1200.00, taxas: 3.60, detalhes: 'Aporte RF (CDB Bradesco)', ativos: makeAtivos(ap('CDB Bradesco', 'Renda Fixa', 1, 1200.00, 1200.00, 3.60)) },
  { id: 'ap45', mes: 'Novembro', ano: 2025, data: '10/11/2025', valor: 3800.00, taxas: 11.60, detalhes: 'Aporte RV (AAPL, PETR4, TSLA)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.58), ap('PETR4', AssetTypeEnum.ACOES, 26, 50.00, 1300.00, 3.96), ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.06)) },
  { id: 'ap46', mes: 'Novembro', ano: 2025, data: '25/11/2025', valor: 1400.00, taxas: 4.20, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', 'FII', 10, 80.00, 800.00, 2.40), ap('MXRF11', 'FII', 30, 20.00, 600.00, 1.80)) },
  { id: 'ap47', mes: 'Dezembro', ano: 2025, data: '15/12/2025', valor: 4000.00, taxas: 12.50, detalhes: 'Aporte 13º salário (RF + RV)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 2000.00, 2000.00, 6.26), ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.12), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.12)) },
  { id: 'ap48', mes: 'Dezembro', ano: 2025, data: '28/12/2025', valor: 1500.00, taxas: 4.60, detalhes: 'Aporte final de ano (FIIs)', ativos: makeAtivos(ap('XPML11', 'FII', 10, 80.00, 800.00, 2.46), ap('HGLG11', 'FII', 7, 100.00, 700.00, 2.14)) },

  // 2026
  { id: 'ap49', mes: 'Janeiro', ano: 2026, data: '10/01/2026', valor: 2500.00, taxas: 7.80, detalhes: 'Aporte RV (AAPL, MSFT, ITUB4)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.12), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.12), ap('ITUB4', AssetTypeEnum.ACOES, 5, 100.00, 500.00, 1.56)) },
  { id: 'ap50', mes: 'Janeiro', ano: 2026, data: '25/01/2026', valor: 1500.00, taxas: 4.60, detalhes: 'Aporte RF (Tesouro SELIC)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 1500.00, 1500.00, 4.60)) },
  { id: 'ap51', mes: 'Fevereiro', ano: 2026, data: '10/02/2026', valor: 2800.00, taxas: 8.50, detalhes: 'Aporte RV (VALE3, PETR4, BBDC4)', ativos: makeAtivos(ap('VALE3', AssetTypeEnum.ACOES, 8, 100.00, 800.00, 2.42), ap('PETR4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.04), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.04)) },
  { id: 'ap52', mes: 'Fevereiro', ano: 2026, data: '25/02/2026', valor: 1400.00, taxas: 4.20, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 8, 100.00, 800.00, 2.40), ap('KNRI11', 'FII', 6, 100.00, 600.00, 1.80)) },
  { id: 'ap53', mes: 'Março', ano: 2026, data: '10/03/2026', valor: 3000.00, taxas: 9.20, detalhes: 'Aporte RV (TSLA, AAPL, MSFT)', ativos: makeAtivos(ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.06), ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.06), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.08)) },
  { id: 'ap54', mes: 'Março', ano: 2026, data: '25/03/2026', valor: 1500.00, taxas: 4.60, detalhes: 'Aporte RF (CDB Itaú)', ativos: makeAtivos(ap('CDB Itaú', 'Renda Fixa', 1, 1500.00, 1500.00, 4.60)) },
  { id: 'ap55', mes: 'Abril', ano: 2026, data: '12/04/2026', valor: 3200.00, taxas: 9.80, detalhes: 'Aporte RV (ITUB4, VALE3, PETR4)', ativos: makeAtivos(ap('ITUB4', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.06), ap('VALE3', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.06), ap('PETR4', AssetTypeEnum.ACOES, 24, 50.00, 1200.00, 3.68)) },
  { id: 'ap56', mes: 'Abril', ano: 2026, data: '28/04/2026', valor: 1600.00, taxas: 4.80, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', 'FII', 12, 80.00, 960.00, 2.88), ap('MXRF11', 'FII', 32, 20.00, 640.00, 1.92)) },
  { id: 'ap57', mes: 'Maio', ano: 2026, data: '10/05/2026', valor: 3500.00, taxas: 10.60, detalhes: 'Aporte RV (AAPL, TSLA, BBDC4)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.54), ap('TSLA', AssetTypeEnum.ACOES, 6, 200.00, 1200.00, 3.64), ap('BBDC4', AssetTypeEnum.ACOES, 16, 50.00, 800.00, 2.42)) },
  { id: 'ap58', mes: 'Maio', ano: 2026, data: '25/05/2026', valor: 1500.00, taxas: 4.60, detalhes: 'Aporte RF (Tesouro IPCA+)', ativos: makeAtivos(ap('Tesouro IPCA+', 'Renda Fixa', 1, 1500.00, 1500.00, 4.60)) },
  { id: 'ap59', mes: 'Junho', ano: 2026, data: '10/06/2026', valor: 3800.00, taxas: 11.60, detalhes: 'Aporte RV (MSFT, AAPL, ITUB4)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 3, 600.00, 1800.00, 5.50), ap('AAPL', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.04), ap('ITUB4', AssetTypeEnum.ACOES, 10, 100.00, 1000.00, 3.06)) },
  { id: 'ap60', mes: 'Junho', ano: 2026, data: '25/06/2026', valor: 1400.00, taxas: 4.20, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 8, 100.00, 800.00, 2.40), ap('KNRI11', 'FII', 6, 100.00, 600.00, 1.80)) },
  { id: 'ap61', mes: 'Julho', ano: 2026, data: '10/07/2026', valor: 3800.00, taxas: 11.40, detalhes: 'Aporte RV (VALE3, PETR4, BBDC4)', ativos: makeAtivos(ap('VALE3', AssetTypeEnum.ACOES, 12, 100.00, 1200.00, 3.60), ap('PETR4', AssetTypeEnum.ACOES, 26, 50.00, 1300.00, 3.90), ap('BBDC4', AssetTypeEnum.ACOES, 26, 50.00, 1300.00, 3.90)) },
  { id: 'ap62', mes: 'Julho', ano: 2026, data: '25/07/2026', valor: 1700.00, taxas: 5.20, detalhes: 'Aporte RF (Tesouro SELIC)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 1700.00, 1700.00, 5.20)) },
  { id: 'ap63', mes: 'Agosto', ano: 2026, data: '10/08/2026', valor: 4000.00, taxas: 12.20, detalhes: 'Aporte RV (AAPL, MSFT, TSLA)', ativos: makeAtivos(ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.58), ap('MSFT', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.56), ap('TSLA', AssetTypeEnum.ACOES, 5, 200.00, 1000.00, 3.06)) },
  { id: 'ap64', mes: 'Agosto', ano: 2026, data: '25/08/2026', valor: 1800.00, taxas: 5.40, detalhes: 'Aporte FIIs (XPML11, MXRF11)', ativos: makeAtivos(ap('XPML11', 'FII', 12, 80.00, 960.00, 2.88), ap('MXRF11', 'FII', 42, 20.00, 840.00, 2.52)) },
  { id: 'ap65', mes: 'Setembro', ano: 2026, data: '10/09/2026', valor: 4200.00, taxas: 12.80, detalhes: 'Aporte RV (ITUB4, BBDC4, VALE3)', ativos: makeAtivos(ap('ITUB4', AssetTypeEnum.ACOES, 12, 100.00, 1200.00, 3.66), ap('BBDC4', AssetTypeEnum.ACOES, 20, 50.00, 1000.00, 3.04), ap('VALE3', AssetTypeEnum.ACOES, 20, 100.00, 2000.00, 6.10)) },
  { id: 'ap66', mes: 'Setembro', ano: 2026, data: '25/09/2026', valor: 1800.00, taxas: 5.60, detalhes: 'Aporte RF (CDB Itaú)', ativos: makeAtivos(ap('CDB Itaú', 'Renda Fixa', 1, 1800.00, 1800.00, 5.60)) },
  { id: 'ap67', mes: 'Outubro', ano: 2026, data: '10/10/2026', valor: 4500.00, taxas: 13.60, detalhes: 'Aporte RV (PETR4, AAPL, TSLA)', ativos: makeAtivos(ap('PETR4', AssetTypeEnum.ACOES, 30, 50.00, 1500.00, 4.54), ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.52), ap('TSLA', AssetTypeEnum.ACOES, 7, 214.29, 1500.00, 4.54)) },
  { id: 'ap68', mes: 'Outubro', ano: 2026, data: '25/10/2026', valor: 1700.00, taxas: 5.20, detalhes: 'Aporte FIIs (HGLG11, KNRI11)', ativos: makeAtivos(ap('HGLG11', 'FII', 10, 100.00, 1000.00, 3.06), ap('KNRI11', 'FII', 7, 100.00, 700.00, 2.14)) },
  { id: 'ap69', mes: 'Novembro', ano: 2026, data: '10/11/2026', valor: 4800.00, taxas: 14.40, detalhes: 'Aporte RV (MSFT, AAPL, ITUB4)', ativos: makeAtivos(ap('MSFT', AssetTypeEnum.ACOES, 3, 600.00, 1800.00, 5.40), ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.50), ap('ITUB4', AssetTypeEnum.ACOES, 15, 100.00, 1500.00, 4.50)) },
  { id: 'ap70', mes: 'Novembro', ano: 2026, data: '25/11/2026', valor: 1700.00, taxas: 5.20, detalhes: 'Aporte RF (Tesouro IPCA+)', ativos: makeAtivos(ap('Tesouro IPCA+', 'Renda Fixa', 1, 1700.00, 1700.00, 5.20)) },
  { id: 'ap71', mes: 'Dezembro', ano: 2026, data: '15/12/2026', valor: 5000.00, taxas: 15.50, detalhes: 'Aporte 13º salário (RF + RV)', ativos: makeAtivos(ap('Tesouro SELIC', 'Renda Fixa', 1, 2500.00, 2500.00, 7.76), ap('AAPL', AssetTypeEnum.ACOES, 3, 500.00, 1500.00, 4.64), ap('MSFT', AssetTypeEnum.ACOES, 2, 500.00, 1000.00, 3.10)) },
  { id: 'ap72', mes: 'Dezembro', ano: 2026, data: '28/12/2026', valor: 2000.00, taxas: 6.20, detalhes: 'Aporte final de ano (FIIs)', ativos: makeAtivos(ap('XPML11', 'FII', 15, 80.00, 1200.00, 3.72), ap('HGLG11', 'FII', 8, 100.00, 800.00, 2.48)) },
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
  { id: 're1', ticker: 'VALE3', data: '25/04/2024', tipo: AssetTypeEnum.ACOES, fator: 'Agrupamento', proporcaoDe: 10, proporcaoPara: 1 },
  { id: 're2', ticker: 'PETR4', data: '12/03/2024', tipo: AssetTypeEnum.ACOES, fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 2 },
  { id: 're3', ticker: 'MXRF11', data: '18/10/2023', tipo: AssetTypeEnum.FII, fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 10 },
  { id: 're4', ticker: 'BABA34', data: '22/05/2024', tipo: AssetTypeEnum.BDR, fator: 'Desdobramento', proporcaoDe: 1, proporcaoPara: 5 },
  { id: 're5', ticker: 'IVVB11', data: '10/02/2024', tipo: AssetTypeEnum.ETF, fator: 'Agrupamento', proporcaoDe: 10, proporcaoPara: 1 }
];

export const MOCK_NOTAS: RelatorioNotaCorretagem[] = [
  { id: 'no1', nomeArquivo: 'XP_Nota_Janeiro_2024', documento: 'Nota_Corretagem_12052024.pdf', data: '12/05/2024', tipo: 'Compra - Renda variável', tamanho: '142 KB' },
  { id: 'no2', nomeArquivo: 'XP_Nota_Fevereiro_2024', documento: 'Nota_Corretagem_18042024.pdf', data: '18/04/2024', tipo: 'Compra - Renda variável', tamanho: '138 KB' },
  { id: 'no3', nomeArquivo: 'XP_Venda_Marco_2024', documento: 'Nota_Corretagem_10022024.pdf', data: '10/02/2024', tipo: 'Venda - Renda variável', tamanho: '145 KB' }
];

export const MOCK_PRECO_MEDIO: RelatorioPrecoMedio[] = [
  { id: 'pm1', ticker: 'AAPL', tipo: AssetTypeEnum.ACOES, qtd: 10, precoMedio: 180.00, custoTotal: 1800.00 },
  { id: 'pm2', ticker: 'TSLA', tipo: AssetTypeEnum.ACOES, qtd: 5, precoMedio: 170.00, custoTotal: 850.00 },
  { id: 'pm3', ticker: 'MSFT', tipo: AssetTypeEnum.ACOES, qtd: 20, precoMedio: 410.00, custoTotal: 8200.00 },
  { id: 'pm4', ticker: 'PETR4', tipo: AssetTypeEnum.ACOES, qtd: 100, precoMedio: 38.00, custoTotal: 3800.00 },
  { id: 'pm5', ticker: 'MXRF11', tipo: AssetTypeEnum.FII, qtd: 150, precoMedio: 9.80, custoTotal: 1470.00 },
  { id: 'pm6', ticker: 'BABA34', tipo: AssetTypeEnum.BDR, qtd: 40, precoMedio: 52.00, custoTotal: 2080.00 },
  { id: 'pm7', ticker: 'IVVB11', tipo: AssetTypeEnum.ETF, qtd: 15, precoMedio: 220.00, custoTotal: 3300.00 },
  { id: 'pm8', ticker: 'BTC', tipo: AssetTypeEnum.CRIPTO, qtd: 0.5, precoMedio: 180000.00, custoTotal: 90000.00 }
];

export const MOCK_RENDA_FIXA: RelatorioRendaFixa[] = [
  { id: 'rf1', emissor: 'CDI BANCO MASTER 2027', tipo: 'Pós-fixado', indexador: 'CDI', taxaJuros: 98, liquidezDiaria: true, possuiImposto: true, valorAplicado: 1008.17, tipoInvestimento: 'Renda fixa', tipoTitulo: 'LCA', dataCompra: '15/01/2024', vencimento: '16/06/2025', grossUp: '95% CDI', rentabilidade: 0.45, expirado: true },
  { id: 'rf2', emissor: 'CDB BANCO DA CHINA', tipo: 'Pós-fixado', indexador: 'CDI', taxaJuros: 98, liquidezDiaria: true, possuiImposto: true, valorAplicado: 1008.17, tipoInvestimento: 'Renda fixa', tipoTitulo: 'LCA', dataCompra: '15/01/2024', vencimento: '16/06/2030', grossUp: '95% CDI', rentabilidade: 0.45, expirado: false },
  { id: 'rf3', emissor: 'Selic 2030', tipo: 'Pré-fixado', indexador: 'SELIC', taxaJuros: 98, liquidezDiaria: false, vencimento: '16/06/2025', possuiImposto: false, valorAplicado: 1008.17, tipoInvestimento: 'Selic', tipoTitulo: 'Selic', dataCompra: '15/01/2024', grossUp: '95% CDI', rentabilidade: 0.45, expirado: true },
];

export const CHART_DATA_APORTES: Record<string, number[]> = {
  '2024': [2500, 1710, 5400, 3125, 3842, 5600, 4600, 3800, 5000, 4000, 5000, 4500],
  '2023': [1500, 1800, 2000, 2200, 2400, 2600, 2700, 2800, 3000, 3100, 2800, 4500],
  '2025': [3000, 3200, 3500, 3700, 4000, 4200, 4400, 4600, 4800, 5000, 5200, 5500],
  '2026': [4000, 4200, 4500, 4800, 5000, 5200, 5500, 5800, 6000, 6200, 6500, 7000]
};
