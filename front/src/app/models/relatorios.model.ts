export interface RelatorioAporte {
  id: string;
  mes: string;
  ano: number;
  data: string;
  valor: number;
  taxas: number;
  detalhes: string;
}

export interface RelatorioAluguel {
  id: string;
  ticker: string;
  data: string;
  qtd: number;
  precoUn: number;
  total: number;
}

export interface RelatorioVenda {
  id: string;
  ticker: string;
  data: string;
  qtd: number;
  precoUn: number;
  total: number;
  taxas: number;
  resultado: number;
}

export interface RelatorioReposicionamento {
  id: string;
  ticker: string;
  data: string;
  tipo: string;
  fator: 'Desdobramento' | 'Agrupamento';
  proporcaoDe: number;
  proporcaoPara: number;
}

export interface RelatorioNotaCorretagem {
  id: string;
  documento: string;
  data: string;
  tipo: 'Compra - Renda variável' | 'Venda - Renda variável' | 'Renda Fixa';
  tamanho?: string;
}

export interface RelatorioPrecoMedio {
  id: string;
  ticker: string;
  tipo: string;
  qtd: number;
  precoMedio: number;
  custoTotal: number;
}

export interface RelatorioRendaFixa {
  id: string;
  emissor: string;
  tipo: 'Pós-fixado' | 'Pré-fixado';
  indexador: 'CDI' | 'IPCA' | 'SELIC';
  taxaJuros: number;
  liquidezDiaria: boolean;
  vencimento?: string;
  possuiImposto: boolean;
  valorAplicado: number;
}
