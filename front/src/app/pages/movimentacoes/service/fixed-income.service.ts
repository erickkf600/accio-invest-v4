import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface FixedIncomeDetails {
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
  observacoes?: string;
  notaNome?: string;
}

@Injectable({ providedIn: 'root' })
export class FixedIncomeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio/fixed-income`;

  getFixedIncomeById(id: string): Observable<ApiResponse<FixedIncomeDetails>> {
    return this.http.get<ApiResponse<FixedIncomeDetails>>(`${this.apiUrl}/${id}`);
  }

  getEmissores(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/emissores`);
  }

  createFixedIncomeWithFile(data: Record<string, any>, file?: File): Observable<ApiResponse<any>> {
    const formData = this.buildFormData(data, file);
    return this.http.post<ApiResponse<any>>(this.apiUrl, formData);
  }

  updateFixedIncomeWithFile(id: string, data: Record<string, any>, file?: File): Observable<ApiResponse<any>> {
    const formData = this.buildFormData(data, file);
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteFixedIncome(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getYieldById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/yield/${id}`);
  }

  createYield(data: Record<string, any>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/yield`, data);
  }

  updateYield(id: string, data: Record<string, any>): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/yield/${id}`, data);
  }

  deleteYield(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/yield/${id}`);
  }

  private buildFormData(data: Record<string, any>, file?: File): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
      }
    }
    if (file) {
      formData.append('arquivo', file, file.name);
    }
    return formData;
  }
}
