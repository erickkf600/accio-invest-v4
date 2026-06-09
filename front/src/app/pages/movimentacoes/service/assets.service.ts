import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface AssetDto {
  id: number;
  ticker: string;
  tipo: string;
  quantidade?: number;
}

interface PaginationMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  list(params: { tipo?: string; limit?: number; search?: string }): Observable<ApiResponse<PaginatedResponse<AssetDto>>> {
    return this.http.get<ApiResponse<PaginatedResponse<AssetDto>>>(this.apiUrl, { params: params as any });
  }
}
