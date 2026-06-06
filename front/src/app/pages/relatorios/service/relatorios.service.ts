import { Injectable, signal } from '@angular/core';
import {
  RelatorioAporte,
  RelatorioAluguel,
  RelatorioVenda,
  RelatorioReposicionamento,
  RelatorioNotaCorretagem,
  RelatorioPrecoMedio,
  RelatorioRendaFixa
} from '../../../models/relatorios.model';
import {
  MOCK_APORTES,
  MOCK_ALUGUEIS,
  MOCK_VENDAS,
  MOCK_REPOSICIONAMENTOS,
  MOCK_NOTAS,
  MOCK_PRECO_MEDIO,
  MOCK_RENDA_FIXA,
  CHART_DATA_APORTES
} from './mock/relatorios.mock';

export interface RelatoriosState {
  aportes: RelatorioAporte[];
  alugueis: RelatorioAluguel[];
  vendas: RelatorioVenda[];
  reposicionamentos: RelatorioReposicionamento[];
  notas: RelatorioNotaCorretagem[];
  precoMedio: RelatorioPrecoMedio[];
  rendaFixa: RelatorioRendaFixa[];
  chartData: Record<string, number[]>;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private state = signal<RelatoriosState>({
    aportes: [],
    alugueis: [],
    vendas: [],
    reposicionamentos: [],
    notas: [],
    precoMedio: [],
    rendaFixa: [],
    chartData: {},
    loading: false
  });

  readonly state$ = this.state.asReadonly();

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.state.set({
      aportes: MOCK_APORTES,
      alugueis: MOCK_ALUGUEIS,
      vendas: MOCK_VENDAS,
      reposicionamentos: MOCK_REPOSICIONAMENTOS,
      notas: MOCK_NOTAS,
      precoMedio: MOCK_PRECO_MEDIO,
      rendaFixa: MOCK_RENDA_FIXA,
      chartData: CHART_DATA_APORTES,
      loading: false
    });
  }

  adicionarNota(nota: Omit<RelatorioNotaCorretagem, 'id'>): void {
    const nova: RelatorioNotaCorretagem = {
      ...nota,
      id: crypto.randomUUID()
    };
    this.state.update(s => ({
      ...s,
      notas: [nova, ...s.notas]
    }));
  }
}
