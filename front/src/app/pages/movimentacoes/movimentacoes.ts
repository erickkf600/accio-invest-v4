import { Component, inject, signal, computed, linkedSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TableComponent, TableColumn } from '../../components/Table/table.component';
import { CellTemplateDirective } from '../../components/Table/cell-template.directive';
import { FilterCardComponent } from '../../components/FilterCard/filter-card.component';
import { MenuComponent } from '../../components/Menu/menu.component';
import { MovimentacoesService } from './service/movimentacoes.service';
import MovimentacoesEmptyState from './component/movimentacoes-empty-state/movimentacoes-empty-state';

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
  imports: [DecimalPipe, TableComponent, CellTemplateDirective, FilterCardComponent, MenuComponent, MovimentacoesEmptyState],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.scss',
})
export default class Movimentacoes {
  protected readonly title = 'Movimentações';

  protected movimentacoesService = inject(MovimentacoesService);
  protected hasData = signal(false);

  public operationTypeOptions = signal<OperationTypeOption[]>([
    { value: 1, label: 'Nova compra' },
    { value: 2, label: 'Novo provento' },
    { value: 3, label: 'Renda fixa' },
    { value: 4, label: 'Venda' },
    { value: 5, label: 'Reposicionamento' },
  ]);

  public appliedSearchTerm = signal('');
  public appliedSelectedType = signal('Todos');
  
  private filterTrigger = computed(() => ({
    term: this.appliedSearchTerm(),
    type: this.appliedSelectedType()
  }));

  public currentPage = linkedSignal(() => {
    this.filterTrigger();
    return 1;
  });

  public pageSize = 10;

  public operations = signal<Operation[]>([]);

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

  constructor() {
    this.movimentacoesService.carregarComDados();
    const data = this.movimentacoesService.state$().data;
    this.hasData.set(data.temDados);
    this.operations.set(data.operations);
  }

  alternarEstado(): void {
    const atual = this.movimentacoesService.state$().data;
    if (atual.temDados) {
      this.movimentacoesService.carregarSemDados();
      this.hasData.set(false);
      this.operations.set([]);
    } else {
      this.movimentacoesService.carregarComDados();
      this.hasData.set(true);
      this.operations.set(this.movimentacoesService.state$().data.operations);
    }
  }

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
