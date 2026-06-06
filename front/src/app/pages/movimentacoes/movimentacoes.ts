import { Component, signal, computed, linkedSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TableComponent, TableColumn } from '../../components/Table/table.component';
import { CellTemplateDirective } from '../../components/Table/cell-template.directive';
import { FilterCardComponent } from '../../components/FilterCard/filter-card.component';
import { MenuComponent } from '../../components/Menu/menu.component';

export interface Operation {
  id: string;
  data: string;
  ativo: string;
  tipo: 'Compra' | 'Venda' | 'Proventos';
  qtd: number | null;
  precoUn: number;
  taxas: number | null;
  total: number;
}

export interface OperationTypeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [DecimalPipe, TableComponent, CellTemplateDirective, FilterCardComponent, MenuComponent],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.scss',
})
export default class Movimentacoes {
  protected readonly title = 'Movimentações';

  public operationTypeOptions = signal<OperationTypeOption[]>([
    { value: 1, label: 'Nova compra' },
    { value: 2, label: 'Novo provento' },
    { value: 3, label: 'Renda fixa' },
    { value: 4, label: 'Venda' },
    { value: 5, label: 'Reposicionamento' },
  ]);

  // Applied filter signals
  public appliedSearchTerm = signal('');
  public appliedSelectedType = signal('Todos');
  
  // Combine filters to trigger a reset of current page using linkedSignal
  private filterTrigger = computed(() => ({
    term: this.appliedSearchTerm(),
    type: this.appliedSelectedType()
  }));

  public currentPage = linkedSignal(() => {
    // Read the filter trigger dependency to reset page to 1 when filters change
    this.filterTrigger();
    return 1;
  });

  public pageSize = 10;

  // Mock data matching the design and expanding on it for pagination
  public operations = signal<Operation[]>([
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
    { id: '11', data: '05 Abr, 2024', ativo: 'AAPL', tipo: 'Proventos', qtd: null, precoUn: 0.24, taxas: null, total: 2.40 },
    { id: '12', data: '02 Abr, 2024', ativo: 'PETR4', tipo: 'Venda', qtd: 40, precoUn: 40.50, taxas: 0.60, total: 1619.40 },
    { id: '13', data: '28 Mar, 2024', ativo: 'VALE3', tipo: 'Proventos', qtd: null, precoUn: 1.15, taxas: null, total: 230.00 },
    { id: '14', data: '20 Mar, 2024', ativo: 'TSLA', tipo: 'Compra', qtd: 8, precoUn: 180.00, taxas: 0.40, total: 1440.40 },
    { id: '15', data: '15 Mar, 2024', ativo: 'ITUB4', tipo: 'Compra', qtd: 200, precoUn: 32.10, taxas: 1.50, total: 6421.50 }
  ]);

  // Column headers matching standard/custom designs
  public columns: TableColumn[] = [
    { key: 'data', label: 'Data' },
    { key: 'ativo', label: 'Ativo' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'qtd', label: 'Qtd.', align: 'right' },
    { key: 'precoUn', label: 'Preço Un.', align: 'right' },
    { key: 'taxas', label: 'Taxas', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
    { key: 'actions', label: '', align: 'right' }
  ];

  // Filtered operations based on applied search and type
  public filteredOperations = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase().trim();
    const type = this.appliedSelectedType();

    return this.operations().filter((op) => {
      const matchesSearch = term === '' || op.ativo.toLowerCase().includes(term);
      const matchesType = type === 'Todos' || op.tipo === type;
      return matchesSearch && matchesType;
    });
  });

  // Sliced data based on pagination
  public paginatedOperations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOperations().slice(start, start + this.pageSize);
  });

  // Total count for current filtered set
  public totalItems = computed(() => this.filteredOperations().length);

  // Handles filter applied from FilterCard component
  public onFilterApplied(model: { searchTerm: string; selectedType: string }) {
    this.appliedSearchTerm.set(model.searchTerm);
    this.appliedSelectedType.set(model.selectedType);
  }

  // Handles filters cleared from FilterCard component
  public onFiltersCleared() {
    this.appliedSearchTerm.set('');
    this.appliedSelectedType.set('Todos');
  }

  // Handles page change output from table component
  public onPageChange(page: number) {
    this.currentPage.set(page);
  }

  public onOperationTypeChange(value: string) {
    console.log('Operation type selected:', value);
  }

  // Action methods
  public onEdit(row: Operation) {
    console.log('Editar operação:', row);
  }

  public onDelete(row: Operation) {
    console.log('Excluir operação:', row);
    // Delete operation from list for local reactivity demonstration
    this.operations.update((list) => list.filter((item) => item.id !== row.id));
  }
}
