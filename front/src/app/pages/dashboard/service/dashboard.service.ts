import { Injectable, signal } from '@angular/core';

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
  aportes: Aporte[];
  pagamentos: Pagamento[];
}

export interface DashboardState {
  data: DashboardData;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private state = signal<DashboardState>({
    data: {
      temDados: false,
      patrimonioTotal: 'R$ 0,00',
      rentabilidadeMes: '--%',
      saldoDisponivel: 'R$ 0,00',
      aportes: [],
      pagamentos: [],
    },
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  private readonly mockDataComDados: DashboardData = {
    temDados: true,
    patrimonioTotal: 'R$ 142.845,20',
    rentabilidadeMes: '+3.2%',
    saldoDisponivel: 'R$ 12.450,00',
    aportes: [
      { mes: 'Maio', taxas: 'R$ 12,50', total: 'R$ 3.842' },
      { mes: 'Abril', taxas: 'R$ 8,20', total: 'R$ 3.125' },
      { mes: 'Março', taxas: 'R$ 15,40', total: 'R$ 5.400' },
      { mes: 'Fevereiro', taxas: 'R$ 5,10', total: 'R$ 1.710' },
    ],
    pagamentos: [
      { dataDia: '15', dataMes: 'MAI', ticker: 'PETR4', tipo: 'Dividendos', valor: 'R$ 145,20', pago: true },
      { dataDia: '22', dataMes: 'MAI', ticker: 'ITUB4', tipo: 'JCP', valor: 'R$ 82,15', pago: false },
      { dataDia: '05', dataMes: 'JUN', ticker: 'XPML11', tipo: 'Rendimento', valor: 'R$ 14,80', pago: false },
      { dataDia: '12', dataMes: 'JUN', ticker: 'BBAS3', tipo: 'Dividendos', valor: 'R$ 210,00', pago: false },
      { dataDia: '20', dataMes: 'JUN', ticker: 'VALE3', tipo: 'JCP', valor: 'R$ 95,50', pago: false },
    ],
  };

  private readonly mockDataSemDados: DashboardData = {
    temDados: false,
    patrimonioTotal: 'R$ 0,00',
    rentabilidadeMes: '--%',
    saldoDisponivel: 'R$ 0,00',
    aportes: [],
    pagamentos: [],
  };

  carregarComDados(): void {
    this.state.set({ data: this.mockDataComDados, loading: false });
  }

  carregarSemDados(): void {
    this.state.set({ data: this.mockDataSemDados, loading: false });
  }

  async carregarAsync(comDados: boolean): Promise<DashboardData> {
    this.state.set({ data: this.state().data, loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = comDados ? this.mockDataComDados : this.mockDataSemDados;
    this.state.set({ data, loading: false });
    return data;
  }
}
