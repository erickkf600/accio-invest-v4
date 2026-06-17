import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface PositionDto {
  id: number;
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

export interface DividendDto {
  id: number;
  data: string;
  ticker: string;
  tipo: string;
  qtd: number;
  valorUn: number;
  total: number;
  status: string;
}

export interface YieldDto {
  id: number;
  emissor: string;
  tipo: string;
  indexador: string;
  taxaJuros: number;
  valorAplicado: number;
  dataCompra: string;
  vencimento?: string;
  liquidezDiaria: boolean;
  possuiImposto: boolean;
}

export interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const MESES: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

function formatShortDate(d: string): string {
  const date = new Date(d);
  return `${date.getDate()} ${MESES[date.getMonth() + 1] || ''}, ${date.getFullYear()}`;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  loadPositions(): Observable<ApiResponse<{ data: PositionDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: PositionDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/positions`, {
      params: { limit: 100 },
    });
  }

  loadDividends(): Observable<ApiResponse<{ data: DividendDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: DividendDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/dividends`, {
      params: { limit: 100 },
    });
  }

  loadYields(): Observable<ApiResponse<{ data: YieldDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: YieldDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/yields`, {
      params: { limit: 100 },
    });
  }
}
