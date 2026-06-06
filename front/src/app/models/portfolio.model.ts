export interface PortfolioProduct {
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

export interface PortfolioDividend {
  id: string;
  data: string;
  ticker: string;
  tipo: string;
  qtd: number;
  valorUn: number;
  total: number;
  status: 'Pago' | 'Pendente';
}

export interface PortfolioYield {
  id: string;
  data: string;
  emissor: string;
  tipo: string; // Pós-fixado / Pré-fixado
  valorUn: number;
  total: number;
}
