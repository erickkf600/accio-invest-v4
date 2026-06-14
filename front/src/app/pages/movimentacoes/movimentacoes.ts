import { Component, inject, signal, computed, linkedSignal, effect, OnInit } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableComponent, TableColumn } from '../../components/Table/table.component';
import { CellTemplateDirective } from '../../components/Table/cell-template.directive';
import { FilterCardComponent } from '../../components/FilterCard/filter-card.component';
import { MenuComponent } from '../../components/Menu/menu.component';
import { MovimentacoesService } from './service/movimentacoes.service';
import { ToastService } from '../../components/Toast/toast.service';
import MovimentacoesEmptyState from './component/movimentacoes-empty-state/movimentacoes-empty-state';
import { NovaCompraComponent } from './modais/nova-compra/nova-compra.component';
import { NovoProventoComponent } from './modais/novo-provento/novo-provento.component';
import { NovaRendaFixaComponent } from './modais/nova-renda-fixa/nova-renda-fixa.component';
import { NovaVendaComponent } from './modais/nova-venda/nova-venda.component';
import { NovaPosicaoComponent } from './modais/nova-posicao/nova-posicao.component';
import { AbbreviateNumberPipe } from '../../../pipes/abbreviate-number.pipe';
import { OperationTypeEnum } from '../../models/enums';

export interface Operation {
  id: string;
  data: string;
  dataIso: string;
  ativo: string;
  tipoOperacao: OperationTypeEnum;
  tipo?: string;
  qtd: number | null;
  precoUn: number;
  taxas: number | null;
  total: number;
  observacoes?: string;
  vencimento?: string;
  fileId?: number;
}

export interface OperationTypeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [UpperCasePipe, TableComponent, CellTemplateDirective, FilterCardComponent, MenuComponent, MovimentacoesEmptyState, NovaCompraComponent, NovoProventoComponent, NovaRendaFixaComponent, NovaVendaComponent, NovaPosicaoComponent, AbbreviateNumberPipe],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.scss',
})
export default class Movimentacoes implements OnInit {
  protected readonly OperationTypeEnum = OperationTypeEnum;
  protected readonly title = 'Movimentações';

  protected movimentacoesService = inject(MovimentacoesService);
  protected toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected hasData = signal(false);

  protected activeModalType = signal<number | null>(null);
  protected editingOperation = signal<Operation | null>(null);
  protected deletingOperation = signal<Operation | null>(null);

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
    effect(() => {
      const state = this.movimentacoesService.state$();
      this.hasData.set(state.data.temDados);
      this.operations.set(state.data.operations);
    });
  }

  ngOnInit(): void {
    this.movimentacoesService.loadOperations();

    const openModal = this.route.snapshot.queryParamMap.get('openModal');
    if (openModal) {
      this.activeModalType.set(Number(openModal));
      this.router.navigate([], { queryParams: { openModal: null }, queryParamsHandling: 'merge' });
    }
  }

  // Filtered operations based on applied search and type
  public filteredOperations = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase().trim();
    const type = this.appliedSelectedType();

    return this.operations().filter((op) => {
      const matchesSearch = term === '' || op.ativo.toLowerCase().includes(term);
      const matchesType = type === 'Todos' || op.tipoOperacao === type;
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
    this.activeModalType.set(Number(value));
  }

  protected closeModal(): void {
    this.activeModalType.set(null);
    this.editingOperation.set(null);
  }

  protected refreshOperations(): void {
    this.movimentacoesService.loadOperations();
  }

  protected onModalConfirmed(): void {
    this.refreshOperations();
    this.closeModal();
  }

  // Action methods
  public onEdit(row: Operation) {
    console.log('edit', row)
    const tipoMap: Record<string, number> = {
      [OperationTypeEnum.Compra]: 1,
      [OperationTypeEnum.Proventos]: 2,
      [OperationTypeEnum.RendaFixa]: 3,
      [OperationTypeEnum.RendaFixaRendimento]: 3,
      [OperationTypeEnum.Venda]: 4,
      [OperationTypeEnum.Reposicionamento]: 5,
    };
    const modalType = tipoMap[row.tipoOperacao];
    if (modalType !== undefined) {
      this.editingOperation.set(row);
      this.activeModalType.set(modalType);
    }
  }

  public onDelete(row: Operation) {
    this.deletingOperation.set(row);
  }

  protected confirmDelete(): void {
    const op = this.deletingOperation();
    if (!op) return;

    this.movimentacoesService.deleteOperation(op.id).subscribe({
      next: () => {
        this.operations.update((list) => list.filter((item) => item.id !== op.id));
        this.deletingOperation.set(null);
        this.toastService.success({
          title: 'Excluído',
          message: `Operação ${op.ativo} excluída com sucesso.`,
        });
      },
      error: () => {
        this.toastService.error({
          title: 'Erro',
          message: 'Não foi possível excluir a operação.',
        });
      },
    });
  }

  protected cancelDelete(): void {
    this.deletingOperation.set(null);
  }
}
