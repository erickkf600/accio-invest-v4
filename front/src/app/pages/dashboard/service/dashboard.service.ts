import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ApiResponse } from '../../../core/models/auth.models';

export interface Aporte {
  mes: string;
  taxas: string;
  total: string;
}

export interface Pagamento {
  dataDia: string;
  dataMes: string;
  ticker: string;
  tipo: string;
  valor: string;
  pago: boolean;
}

export interface DistribuicaoItem {
  tipo: string;
  percentual: number;
  valor: string;
  cor: string;
}

export interface RendimentoMensal {
  mes: number;
  carteira: number | null;
  cdi: number | null;
  precoMedio: number | null;
}

export interface DashboardData {
  patrimonioTotal: string;
  totalInvestido: number;
  totalProventos: string;
  aportes: Aporte[];
  distribuicao: DistribuicaoItem[];
  rendimentos: RendimentoMensal[];
  availableYears: number[];
  pagamentos: Pagamento[];
}

interface AporteInfoDto {
  mes: number;
  ano: number;
  valor: number;
  taxa: number;
}

interface DistribuicaoItemDto {
  tipo: string;
  percentual: number;
  valor: number;
  cor: string;
}

interface RendimentoMensalDto {
  mes: number;
  carteira: number | null;
  cdi: number | null;
  precoMedio: number | null;
}

interface DashboardDataDto {
  patrimonioTotal: number;
  totalInvestido: number;
  totalProventos: number;
  aportes: AporteInfoDto[];
  distribuicao: DistribuicaoItemDto[];
  rendimentos: RendimentoMensalDto[];
  availableYears: number[];
}

interface ProximoPagamentoItemDto {
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

  private readonly MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  private readonly MESES_ABREV = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
  ];

  getDashboardData(ano?: number): Observable<DashboardData> {
    let params = new HttpParams();
    if (ano) {
      params = params.set('ano', ano.toString());
    }

    return this.http.get<ApiResponse<DashboardDataDto>>(this.apiUrl, { params }).pipe(
      map((res) => {
        const dto = res.data;
        return {
          patrimonioTotal: this.formatCurrency(dto.patrimonioTotal),
          totalInvestido: dto.totalInvestido,
          totalProventos: this.formatCurrency(dto.totalProventos),
          aportes: dto.aportes.map((a) => ({
            mes: this.MESES[a.mes - 1] || String(a.mes),
            taxas: this.formatCurrency(a.taxa),
            total: this.formatCurrency(a.valor),
          })),
          distribuicao: dto.distribuicao.map((d) => ({
            ...d,
            valor: this.formatCurrency(d.valor),
          })),
          rendimentos: dto.rendimentos,
          availableYears: dto.availableYears,
          pagamentos: [],
        };
      }),
    );
  }

  getProximosPagamentos(): Observable<Pagamento[]> {
    const hoje = new Date();
    return this.http.get<ApiResponse<ProximoPagamentoItemDto[]>>(`${this.apiUrl}/proximos-pagamentos`).pipe(
      map((res) =>
        res.data.map((item) => {
          const [dia, mes, ano] = item.dataPagamento.split('/');
          const dataPagamento = new Date(+ano, +mes - 1, +dia);

          return {
            ticker: item.ticker,
            tipo: item.tipo,
            valor: this.formatCurrency(item.valor),
            dataDia: dia,
            dataMes: this.MESES_ABREV[parseInt(mes) - 1],
            pago: dataPagamento <= hoje,
          };
        }),
      ),
    );
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
