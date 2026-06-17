import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface AporteInfoDto {
  mes: number;
  ano: number;
  valor: number;
  taxa: number;
}

export interface DistribuicaoItemDto {
  tipo: string;
  percentual: number;
  valor: number;
  cor: string;
}

export interface RendimentoMensalDto {
  mes: number;
  carteira: number | null;
  cdi: number | null;
  precoMedio: number | null;
}

export interface DashboardDataDto {
  patrimonioTotal: number;
  totalInvestido: number;
  totalProventos: number;
  aportes: AporteInfoDto[];
  distribuicao: DistribuicaoItemDto[];
  rendimentos: RendimentoMensalDto[];
  availableYears: number[];
}

export interface ProximoPagamentoItemDto {
  ticker: string;
  tipo: string;
  valor: number;
  dataPagamento: string;
  dataCom: string;
  percentual: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardData(ano?: number): Observable<ApiResponse<DashboardDataDto>> {
    let params = new HttpParams();
    if (ano) {
      params = params.set('ano', ano.toString());
    }
    return this.http.get<ApiResponse<DashboardDataDto>>(this.apiUrl, { params });
  }

  getProximosPagamentos(): Observable<ApiResponse<ProximoPagamentoItemDto[]>> {
    return this.http.get<ApiResponse<ProximoPagamentoItemDto[]>>(`${this.apiUrl}/proximos-pagamentos`);
  }
}
