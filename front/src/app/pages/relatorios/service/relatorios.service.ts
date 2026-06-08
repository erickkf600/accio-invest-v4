import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';
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
  MOCK_REPOSICIONAMENTOS,
  MOCK_NOTAS,
  CHART_DATA_APORTES
} from './mock/relatorios.mock';

interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface AporteAtivoDto {
  ticker: string;
  qtd: number;
  precoUn: number;
  total: number;
}

interface RelatorioAporteDto {
  id: number;
  data: string;
  mes: number;
  ano: number;
  valor: number;
  taxas?: number;
  ativos: AporteAtivoDto[];
}

interface RelatorioVendaDto {
  id: number;
  ticker: string;
  data: string;
  qtd: number;
  precoUn: number;
  total: number;
  taxas?: number;
  resultado?: number;
}

interface RelatorioAluguelDto {
  id: number;
  ticker: string;
  data: string;
  qtd: number;
  precoUn: number;
  total: number;
}

interface PrecoMedioDto {
  ticker: string;
  tipo: string;
  qtd: number;
  precoMedio: number;
  custoTotal: number;
}

interface FixedIncomePositionDto {
  id: number;
  emissor: string;
  tipo: string;
  indexador: string;
  taxaJuros: number;
  liquidezDiaria: boolean;
  possuiImposto: boolean;
  valorAplicado: number;
  dataCompra: string;
  vencimento?: string;
}

const MESES_FULL: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
  5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
  9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro',
};

function toDmy(d: string): string {
  const date = new Date(d);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

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
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

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
    this.state.update(s => ({ ...s, loading: true }));

    this.http.get<ApiResponse<{ data: RelatorioAporteDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/aportes`, { params: { limit: 100 } })
      .subscribe({
        next: (res) => {
          const aportes: RelatorioAporte[] = (res.data.data || []).map(a => ({
            id: String(a.id),
            data: toDmy(a.data),
            mes: MESES_FULL[a.mes] || String(a.mes),
            ano: a.ano,
            valor: a.valor,
            taxas: a.taxas ?? 0,
            detalhes: a.ativos.map(av => `${av.qtd}x ${av.ticker}`).join(', '),
            ativos: a.ativos.map(av => ({
              ticker: av.ticker,
              tipo: '',
              quantidade: av.qtd,
              valorUnitario: av.precoUn,
              total: av.total,
              taxa: 0,
            })),
          }));
          this.state.update(s => ({ ...s, aportes, loading: false }));
        },
        error: () => this.state.update(s => ({ ...s, loading: false })),
      });

    this.http.get<ApiResponse<{ data: RelatorioAluguelDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/alugueis`, { params: { limit: 100 } })
      .subscribe({
        next: (res) => {
          const alugueis: RelatorioAluguel[] = (res.data.data || []).map(a => ({
            id: String(a.id),
            ticker: a.ticker,
            data: toDmy(a.data),
            qtd: a.qtd,
            precoUn: a.precoUn,
            total: a.total,
          }));
          this.state.update(s => ({ ...s, alugueis }));
        },
        error: () => {},
      });

    this.http.get<ApiResponse<{ data: RelatorioVendaDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/vendas`, { params: { limit: 100 } })
      .subscribe({
        next: (res) => {
          const vendas: RelatorioVenda[] = (res.data.data || []).map(v => ({
            id: String(v.id),
            ticker: v.ticker,
            data: toDmy(v.data),
            qtd: v.qtd,
            precoUn: v.precoUn,
            total: v.total,
            taxas: v.taxas ?? 0,
            resultado: v.resultado ?? 0,
          }));
          this.state.update(s => ({ ...s, vendas }));
        },
        error: () => {},
      });

    this.http.get<ApiResponse<{ data: PrecoMedioDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/preco-medio`, { params: { limit: 100 } })
      .subscribe({
        next: (res) => {
          const precoMedio: RelatorioPrecoMedio[] = (res.data.data || []).map((p, idx) => ({
            id: String(idx + 1),
            ticker: p.ticker,
            tipo: p.tipo,
            qtd: p.qtd,
            precoMedio: p.precoMedio,
            custoTotal: p.custoTotal,
          }));
          this.state.update(s => ({ ...s, precoMedio }));
        },
        error: () => {},
      });

    this.http.get<ApiResponse<{ data: FixedIncomePositionDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/renda-fixa`, { params: { limit: 100 } })
      .subscribe({
        next: (res) => {
          const rendaFixa: RelatorioRendaFixa[] = (res.data.data || []).map(r => ({
            id: String(r.id),
            emissor: r.emissor,
            tipo: r.tipo as RelatorioRendaFixa['tipo'],
            indexador: r.indexador,
            taxaJuros: r.taxaJuros,
            liquidezDiaria: r.liquidezDiaria,
            possuiImposto: r.possuiImposto,
            valorAplicado: r.valorAplicado,
            tipoInvestimento: 'Renda Fixa',
            tipoTitulo: r.tipo,
            dataCompra: toDmy(r.dataCompra),
            vencimento: r.vencimento ? toDmy(r.vencimento) : undefined,
            grossUp: r.liquidezDiaria ? 'DI' : 'Pré',
            rentabilidade: 0,
            expirado: r.vencimento ? new Date(r.vencimento) < new Date() : false,
          }));
          this.state.update(s => ({ ...s, rendaFixa }));
        },
        error: () => {},
      });

    this.state.update(s => ({
      ...s,
      reposicionamentos: MOCK_REPOSICIONAMENTOS,
      notas: MOCK_NOTAS,
      chartData: CHART_DATA_APORTES,
    }));
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
