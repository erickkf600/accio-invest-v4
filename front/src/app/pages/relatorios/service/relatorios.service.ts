import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

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

export interface NotaDto {
  id: number;
  nome: string;
  data: string;
  tipo: string;
  path: string;
  createdAt: string;
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

export const MESES_FULL: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
  5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
  9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro',
};

export function toDmy(d: string): string {
  const date = new Date(d);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getAportes(): Observable<ApiResponse<{ data: RelatorioAporteDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: RelatorioAporteDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/aportes`, { params: { limit: 100 } });
  }

  getAlugueis(): Observable<ApiResponse<{ data: RelatorioAluguelDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: RelatorioAluguelDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/alugueis`, { params: { limit: 100 } });
  }

  getVendas(): Observable<ApiResponse<{ data: RelatorioVendaDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: RelatorioVendaDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/vendas`, { params: { limit: 100 } });
  }

  getPrecoMedio(): Observable<ApiResponse<{ data: PrecoMedioDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: PrecoMedioDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/preco-medio`, { params: { limit: 100 } });
  }

  getRendaFixa(): Observable<ApiResponse<{ data: FixedIncomePositionDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: FixedIncomePositionDto[]; meta: PaginationMeta }>>(`${this.apiUrl}/renda-fixa`, { params: { limit: 100 } });
  }

  getNotas(): Observable<ApiResponse<{ data: NotaDto[] }>> {
    return this.http.get<ApiResponse<{ data: NotaDto[] }>>(`${this.apiUrl}/notas`);
  }

  checkNotaLinks(id: number): Observable<{ data: { hasLinks: boolean } }> {
    return this.http.get<{ data: { hasLinks: boolean } }>(`${this.apiUrl}/notas/${id}/links`);
  }

  uploadNota(file: File, notaName?: string): Observable<{ fileId: number; nome: string; path: string }> {
    const formData = new FormData();
    formData.append('arquivo', file);
    if (notaName) {
      formData.append('nota', notaName);
    }
    return this.http.post<{ fileId: number; nome: string; path: string }>(
      `${this.apiUrl}/upload`,
      formData,
    );
  }

  deleteNota(id: number, mode: 'unlink' | 'cascade' = 'unlink'): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/notas/${id}`,
      { params: { mode } },
    );
  }
}
