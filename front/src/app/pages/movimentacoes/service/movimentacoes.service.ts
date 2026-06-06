import { Injectable, signal } from '@angular/core';
import type { Operation } from '../movimentacoes';

export interface MovimentacoesData {
  temDados: boolean;
  operations: Operation[];
}

export interface MovimentacoesState {
  data: MovimentacoesData;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MovimentacoesService {
  private state = signal<MovimentacoesState>({
    data: {
      temDados: false,
      operations: [],
    },
    loading: false,
  });

  readonly state$ = this.state.asReadonly();

  private readonly mockDataComDados: MovimentacoesData = {
    temDados: true,
    operations: [
      { id: '1', data: '12 Mai, 2024', ativo: 'AAPL', tipo: 'Compra', qtd: 10, precoUn: 183.05, taxas: 0.54, total: 1831.04 },
      { id: '2', data: '10 Mai, 2024', ativo: 'TSLA', tipo: 'Venda', qtd: 5, precoUn: 171.89, taxas: 0.26, total: 859.19 },
      { id: '3', data: '08 Mai, 2024', ativo: 'MSFT', tipo: 'Proventos', qtd: null, precoUn: 0.75, taxas: null, total: 45.20 },
      { id: '4', data: '05 Mai, 2024', ativo: 'PETR4', tipo: 'Compra', qtd: 100, precoUn: 41.20, taxas: 1.23, total: 4121.23 },
      { id: '5', data: '02 Mai, 2024', ativo: 'VALE3', tipo: 'Compra', qtd: 50, precoUn: 62.40, taxas: 0.75, total: 3120.75 },
      { id: '6', data: '28 Abr, 2024', ativo: 'ITUB4', tipo: 'Proventos', qtd: null, precoUn: 0.25, taxas: null, total: 125.00 },
      { id: '7', data: '25 Abr, 2024', ativo: 'BBAS3', tipo: 'Compra', qtd: 80, precoUn: 27.50, taxas: 0.90, total: 2200.90 },
      { id: '8', data: '20 Abr, 2024', ativo: 'MXRF11', tipo: 'Proventos', qtd: null, precoUn: 0.10, taxas: null, total: 100.00 },
      { id: '9', data: '15 Abr, 2024', ativo: 'BBDC4', tipo: 'Venda', qtd: 120, precoUn: 14.20, taxas: 0.45, total: 1703.55 },
      { id: '10', data: '10 Abr, 2024', ativo: 'XPML11', tipo: 'Compra', qtd: 30, precoUn: 115.00, taxas: 1.10, total: 3451.10 },
    ],
  };

  private readonly mockDataSemDados: MovimentacoesData = {
    temDados: false,
    operations: [],
  };

  carregarComDados(): void {
    this.state.set({ data: this.mockDataComDados, loading: false });
  }

  carregarSemDados(): void {
    this.state.set({ data: this.mockDataSemDados, loading: false });
  }

  async carregarAsync(comDados: boolean): Promise<MovimentacoesData> {
    this.state.set({ data: this.state().data, loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = comDados ? this.mockDataComDados : this.mockDataSemDados;
    this.state.set({ data, loading: false });
    return data;
  }
}
