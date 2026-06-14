export enum MonthEnum {
  JANEIRO = 1,
  FEVEREIRO = 2,
  MARCO = 3,
  ABRIL = 4,
  MAIO = 5,
  JUNHO = 6,
  JULHO = 7,
  AGOSTO = 8,
  SETEMBRO = 9,
  OUTUBRO = 10,
  NOVEMBRO = 11,
  DEZEMBRO = 12
}

export enum AssetTypeEnum {
  ACOES = 'ACOES',
  FII = 'FII',
  BDR = 'BDR',
  ETF = 'ETF',
  CRIPTO = 'CRIPTO',
}

export enum OperationTypeEnum {
  Compra = 'Compra',
  Venda = 'Venda',
  Proventos = 'Proventos',
  RendaFixa = 'Renda Fixa',
  Reposicionamento = 'Reposicionamento',
  RendaFixaRendimento = 'Renda Fixa - Rendimento',
}

export enum TipoValorEnum {
  ACOES = 'ACOES',
  FII = 'FII',
  BDR = 'BDR',
  ETF = 'ETF',
  CRIPTO = 'CRIPTO',
}

export const AssetTypeLabel: Record<string, string> = {
  '1': 'Ações',
  '2': 'FII',
  '3': 'BDR',
  '4': 'ETF',
  '5': 'Cripto',
};

export enum IndexerEnum {
  CDI = 'CDI',
  IPCA = 'IPCA',
  SELIC = 'SELIC'
}

export enum FixedIncomeTypeEnum {
  POS_FIXADO = 'Pós-fixado',
  PRE_FIXADO = 'Pré-fixado'
}

export enum RepositioningFactorEnum {
  DESDOBRAMENTO = 'Desdobramento',
  AGRUPAMENTO = 'Agrupamento'
}
