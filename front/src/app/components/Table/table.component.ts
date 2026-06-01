import { Component, ContentChildren, QueryList, TemplateRef, input, output, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CellTemplateDirective } from './cell-template.directive';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  data = input.required<any[]>();
  columns = input.required<TableColumn[]>();

  // Pagination inputs (optional)
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  currentPage = input<number>(1);

  // Pagination output
  pageChange = output<number>();

  @ContentChildren(CellTemplateDirective) cellTemplates!: QueryList<CellTemplateDirective>;

  getTemplate(columnKey: string): TemplateRef<any> | null {
    if (!this.cellTemplates) return null;
    const match = this.cellTemplates.find((t) => t.columnName === columnKey);
    return match ? match.templateRef : null;
  }

  totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return size > 0 ? Math.ceil(total / size) : 0;
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const list: number[] = [];
    for (let i = 1; i <= total; i++) {
      list.push(i);
    }
    if (total <= 5) return list;
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  });

  onPageClick(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
