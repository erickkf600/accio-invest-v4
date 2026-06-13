import { Component, signal, computed, output } from '@angular/core';
import { FormField, form, submit } from '@angular/forms/signals';

interface FilterModel {
  searchTerm: string;
  selectedType: string;
}

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [FormField],
  templateUrl: './filter-card.component.html',
})
export class FilterCardComponent {
  protected filterModel = signal<FilterModel>({
    searchTerm: '',
    selectedType: 'Todos',
  });

  protected filterForm = form(this.filterModel);

  readonly filterApplied = output<FilterModel>();
  readonly filtersCleared = output<void>();

  protected canClear = computed(() => {
    const m = this.filterModel();
    return m.searchTerm.trim() !== '' || m.selectedType !== 'Todos';
  });

  protected onSubmit(): void {
    submit(this.filterForm, async () => {
      this.filterApplied.emit({ ...this.filterModel() });
    });
  }

  protected onClear(): void {
    this.filterModel.set({ searchTerm: '', selectedType: 'Todos' });
    this.filtersCleared.emit();
  }
}
