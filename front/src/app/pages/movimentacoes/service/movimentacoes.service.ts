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
          ativo: op.ticker,
          tipo: op.tipo as Operation['tipo'],
          qtd: op.qtd ?? null,
          precoUn: op.precoUn,
          taxas: op.taxas ?? null,
          total: op.total,
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
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }

  createWithFile(data: Record<string, any>, file?: File): Observable<any> {
    const formData = this.buildFormData(data, file);
    return this.http.post(this.apiUrl, formData);
  }

  updateWithFile(id: string, data: Record<string, any>, file?: File): Observable<any> {
    const formData = this.buildFormData(data, file);
    return this.http.patch(`${this.apiUrl}/${id}`, formData);
  }

  createFixedIncomeWithFile(data: Record<string, any>, file?: File): Observable<any> {
    const formData = this.buildFormData(data, file);
    return this.http.post(`${environment.apiUrl}/portfolio/fixed-income`, formData);
  }

  updateFixedIncomeWithFile(id: string, data: Record<string, any>, file?: File): Observable<any> {
    const formData = this.buildFormData(data, file);
    return this.http.patch(`${environment.apiUrl}/portfolio/fixed-income/${id}`, formData);
  }

  private buildFormData(data: Record<string, any>, file?: File): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    if (file) {
      formData.append('arquivo', file, file.name);
    }
    return formData;
  }
}
