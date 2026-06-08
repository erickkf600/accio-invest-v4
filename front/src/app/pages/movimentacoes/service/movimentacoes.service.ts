import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';
import type { Operation } from '../movimentacoes';

export interface MovimentacoesData {
  temDados: boolean;
  operations: Operation[];
}

export interface MovimentacoesState {
  data: MovimentacoesData;
  loading: boolean;
}

interface OperationResponseDto {
  id: number;
  assetId: number;
  ticker: string;
  tipo: string;
  data: string;
  qtd?: number;
  precoUn: number;
  taxas?: number;
  total: number;
  lucroRealizado?: number;
  observacoes?: string;
  notaNome?: string;
  notaPath?: string;
}

interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const MESES_ABR: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

function formatDate(d: string): string {
  const date = new Date(d);
  const dia = date.getDate();
  const mes = MESES_ABR[date.getMonth() + 1] || '';
  const ano = date.getFullYear();
  return `${dia} ${mes}, ${ano}`;
}

@Injectable({
  providedIn: 'root',
})
export class MovimentacoesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operations`;

  private state = signal<MovimentacoesState>({
    data: {
      temDados: false,
      operations: [],
    },
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  loadOperations(): void {
    this.state.update((s) => ({ ...s, loading: true }));

    this.http.get<ApiResponse<{ data: OperationResponseDto[]; meta: PaginationMeta }>>(this.apiUrl, {
      params: { limit: 100 },
    }).subscribe({
      next: (res) => {
        const items = res.data.data;
        const operations: Operation[] = items.map((op) => ({
          id: String(op.id),
          data: formatDate(op.data),
          dataIso: op.data,
          ativo: op.ticker,
          tipo: op.tipo as Operation['tipo'],
          qtd: op.qtd ?? null,
          precoUn: op.precoUn,
          taxas: op.taxas ?? null,
          total: op.total,
          observacoes: op.observacoes ?? '',
          notaNome: op.notaNome ?? '',
        }));
        this.state.set({
          data: { temDados: operations.length > 0, operations },
          loading: false,
        });
      },
      error: () => {
        this.state.set({ data: this.state().data, loading: false });
      },
    });
  }

  deleteOperation(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }

  createBatchWithFile(operations: Record<string, any>[], file?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('operations', JSON.stringify(operations));
    if (file) {
      formData.append('arquivo', file, file.name);
    }
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/movimentacoes`, formData);
  }

  private repositioningUrl = `${environment.apiUrl}/repositioning`;

  createRepositioning(data: Record<string, any>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.repositioningUrl, data);
  }

  updateRepositioning(id: string, data: Record<string, any>): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.repositioningUrl}/${id}`, data);
  }

  updateOperation(id: string, data: Record<string, any>, file?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    if (file) {
      formData.append('arquivo', file, file.name);
    }
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, formData);
  }
}
