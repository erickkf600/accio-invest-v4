import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface OperationResponseDto {
  id: number;
  assetId: number;
  ticker: string;
  tipoOperacao: string;
  tipo?: string;
  data: string;
  qtd?: number;
  precoUn: number;
  taxas?: number;
  total: number;
  observacoes?: string;
  fileId?: number;
  vencimento?: string;
}

export interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface DividendStatus {
  ticker: string;
  dataCom: string;
  dataPagamento: string;
  valor: number;
  tipo: string;
  quantidadeCarteira: number;
  status: 'registered' | 'no_registered';
}

@Injectable({
  providedIn: 'root',
})
export class MovimentacoesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operations`;

  loadOperations(): Observable<ApiResponse<{ data: OperationResponseDto[]; meta: PaginationMeta }>> {
    return this.http.get<ApiResponse<{ data: OperationResponseDto[]; meta: PaginationMeta }>>(this.apiUrl, {
      params: { limit: 100 },
    });
  }

  deleteOperation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
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

  listPendingDividends(start: string, end: string): Observable<ApiResponse<DividendStatus[]>> {
    return this.http.get<ApiResponse<DividendStatus[]>>(`${this.apiUrl}/dividends-list`, {
      params: { start, end },
    });
  }
}
