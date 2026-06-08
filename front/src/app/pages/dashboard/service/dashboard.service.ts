import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

export interface DashboardData {
  temDados: boolean;
  patrimonioTotal: string;
  rentabilidadeMes: string;
  saldoDisponivel: string;
  totalProventos: string;
  aportes: Aporte[];
  pagamentos: Pagamento[];
}

export interface DashboardState {
  data: DashboardData;
  loading: boolean;
}

interface AporteInfoDto {
  mes: number;
  ano: number;
  valor: number;
}

interface DashboardDataDto {
  temDados: boolean;
  patrimonioTotal: number;
  rentabilidadeMes: number;
  saldoDisponivel: number;
  aportes: AporteInfoDto[];
  totalInvestido: number;
  totalProventos: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  private state = signal<DashboardState>({
    data: {
      temDados: false,
      patrimonioTotal: 'R$ 0,00',
      rentabilidadeMes: '--%',
      saldoDisponivel: 'R$ 0,00',
      totalProventos: 'R$ 0,00',
      aportes: [],
      pagamentos: [],
    },
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  private readonly MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  loadDashboard(): void {
    this.state.update((s) => ({ ...s, loading: true }));

    this.http.get<ApiResponse<DashboardDataDto>>(this.apiUrl).subscribe({
      next: (res) => {
        const dto = res.data;
        const data: DashboardData = {
          temDados: dto.temDados,
          patrimonioTotal: this.formatCurrency(dto.patrimonioTotal),
          rentabilidadeMes: this.formatPercent(dto.rentabilidadeMes),
          saldoDisponivel: this.formatCurrency(dto.saldoDisponivel),
          totalProventos: this.formatCurrency(dto.totalProventos),
          aportes: dto.aportes.map((a) => ({
            mes: this.MESES[a.mes - 1] || String(a.mes),
            taxas: '--',
            total: this.formatCurrency(a.valor),
          })),
          pagamentos: [],
        };
        this.state.set({ data, loading: false });
      },
      error: () => {
        this.state.set({ data: this.state().data, loading: false });
      },
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private formatPercent(value: number): string {
    const signal = value >= 0 ? '+' : '';
    return `${signal}${value.toFixed(1)}%`;
  }
}
