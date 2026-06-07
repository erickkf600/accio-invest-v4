export interface AporteAtivo {
  ticker: string;
  tipo: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  taxa: number;
}

export interface RelatorioAporte {
  id: string;
  mes: string;
  ano: number;
  data: string;
  valor: number;
  taxas: number;
  detalhes: string;
  ativos: AporteAtivo[];
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
  nomeArquivo: string;
  documento: string;
  data: string;
  tipo: string;
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
  indexador: string;
  taxaJuros: number;
  liquidezDiaria: boolean;
  vencimento?: string;
  possuiImposto: boolean;
  valorAplicado: number;
  tipoInvestimento: string;
  tipoTitulo: string;
  dataCompra: string;
  grossUp: string;
  rentabilidade: number;
  expirado: boolean;
}
