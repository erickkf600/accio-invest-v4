import { Component, inject, signal, computed, linkedSignal, effect, OnInit, OnDestroy } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableComponent, TableColumn } from '../../components/Table/table.component';
import { CellTemplateDirective } from '../../components/Table/cell-template.directive';
import { FilterCardComponent } from '../../components/FilterCard/filter-card.component';
import { MenuComponent } from '../../components/Menu/menu.component';
import { MovimentacoesService, type OperationResponseDto, type PaginationMeta } from './service/movimentacoes.service';
import { ToastService } from '../../components/Toast/toast.service';
import MovimentacoesEmptyState from './component/movimentacoes-empty-state/movimentacoes-empty-state';
import { NovaCompraComponent } from './modais/nova-compra/nova-compra.component';
import { NovoProventoComponent } from './modais/novo-provento/novo-provento.component';
import { NovaRendaFixaComponent } from './modais/nova-renda-fixa/nova-renda-fixa.component';
import { NovaVendaComponent } from './modais/nova-venda/nova-venda.component';
import { NovaPosicaoComponent } from './modais/nova-posicao/nova-posicao.component';
import { AbbreviateNumberPipe } from '../../../pipes/abbreviate-number.pipe';
import { OperationTypeEnum } from '../../models/enums';
import { formatDateIso } from '../../utils/format-date.utils';

function mapOperation(op: OperationResponseDto): Operation {
  return {
    id: String(op.id),
    data: formatDateIso(op.data),
    dataIso: op.data,
    ativo: op.ticker,
    tipoOperacao: op.tipoOperacao as Operation['tipoOperacao'],
    tipo: op.tipo,
    qtd: op.qtd ?? null,
    precoUn: op.precoUn,
    taxas: op.taxas ?? null,
    total: op.total,
    observacoes: op.observacoes ?? '',
    fileId: op.fileId ?? undefined,
    vencimento: op.vencimento ?? undefined,
    isRepositioning: (op as any).isRepositioning ?? false,
    ratioDe: (op as any).ratioDe,
    ratioPara: (op as any).ratioPara,
  };
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function convertFilterDate(value: string, isEnd = false): string {
  if (!value) return '';
  const parts = value.split('/');
  if (parts.length === 2) {
    const month = parts[0].padStart(2, '0');
    const year = parts[1];
    if (isEnd) {
      const day = getLastDayOfMonth(Number(year), Number(month));
      return `${year}-${month}-${String(day).padStart(2, '0')}`;
    }
    return `${year}-${month}-01`;
  }
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return value;
}

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
  isRepositioning?: boolean;
  ratioDe?: string;
  ratioPara?: string;
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
export default class Movimentacoes implements OnInit, OnDestroy {
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
  public appliedStartDate = signal('');
  public appliedEndDate = signal('');

  private filterTrigger = computed(() => ({
    term: this.appliedSearchTerm(),
    type: this.appliedSelectedType(),
    startDate: this.appliedStartDate(),
    endDate: this.appliedEndDate(),
  }));

  public currentPage = linkedSignal(() => {
    this.filterTrigger();
    return 1;
  });

  public pageSize = 10;
  public totalItems = signal(0);
  public totalPages = signal(0);

  public operations = signal<Operation[]>([]);

  private loadSub: Subscription | null = null;

  private filterEffect = effect(() => {
    this.filterTrigger();
    const page = this.currentPage();
    this.loadOperations();
  });

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

  ngOnInit(): void {
    const openModal = this.route.snapshot.queryParamMap.get('openModal');
    if (openModal) {
      this.activeModalType.set(Number(openModal));
      this.router.navigate([], { queryParams: { openModal: null }, queryParamsHandling: 'merge' });
    }
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  public onFilterApplied(model: { searchTerm: string; selectedType: string; startDate: string; endDate: string }) {
    this.appliedSearchTerm.set(model.searchTerm);
    this.appliedSelectedType.set(model.selectedType);
    this.appliedStartDate.set(model.startDate);
    this.appliedEndDate.set(model.endDate);
  }

  public onFiltersCleared() {
    this.appliedSearchTerm.set('');
    this.appliedSelectedType.set('Todos');
    this.appliedStartDate.set('');
    this.appliedEndDate.set('');
  }

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

  private loadOperations(): void {
    this.loadSub?.unsubscribe();
    this.loadSub = this.movimentacoesService
      .loadOperations({
        page: this.currentPage(),
        limit: this.pageSize,
        ticker: this.appliedSearchTerm() || undefined,
        tipoOperacao: this.appliedSelectedType() !== 'Todos' ? this.appliedSelectedType() : undefined,
        dataInicio: convertFilterDate(this.appliedStartDate()) || undefined,
        dataFim: convertFilterDate(this.appliedEndDate(), true) || undefined,
      })
      .subscribe({
        next: (res) => {
          const items = res.data.data;
          const meta = res.data.meta;
          const operations = items.map(mapOperation);
          this.operations.set(operations);
          this.totalItems.set(meta.total);
          this.totalPages.set(meta.totalPages);
          this.hasData.set(true);
        },
        error: () => {
          this.hasData.set(false);
          this.operations.set([]);
          this.totalItems.set(0);
          this.totalPages.set(0);
        },
      });
  }

  protected refreshOperations(): void {
    this.loadOperations();
  }

  protected onModalConfirmed(): void {
    this.refreshOperations();
    this.closeModal();
  }

  // Action methods
  public onEdit(row: Operation) {
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

    const delete$ = op.tipoOperacao === OperationTypeEnum.Reposicionamento
      ? this.movimentacoesService.deleteRepositioning(op.id)
      : this.movimentacoesService.deleteOperation(op.id);

    delete$.subscribe({
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
