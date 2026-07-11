import { Component, signal, computed, output } from '@angular/core';
import { FormField, form, submit } from '@angular/forms/signals';
import { DateRangePickerComponent } from '../dateRangePicker/date-range-picker.component';

interface FilterModel {
  searchTerm: string;
  selectedType: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [FormField, DateRangePickerComponent],
  templateUrl: './filter-card.component.html',
})
export class FilterCardComponent {
  protected filterModel = signal<FilterModel>({
    searchTerm: '',
    selectedType: 'Todos',
    startDate: '',
    endDate: '',
  });

  protected filterForm = form(this.filterModel);

  readonly filterApplied = output<FilterModel>();
  readonly filtersCleared = output<void>();

  protected canClear = computed(() => {
    const m = this.filterModel();
    return m.searchTerm.trim() !== '' || m.selectedType !== 'Todos' || m.startDate !== '' || m.endDate !== '';
  });

  protected onDateRangeSelected(range: { startDate: string; endDate: string }): void {
    this.filterModel.update((m) => ({
      ...m,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  }

  protected onSubmit(): void {
    submit(this.filterForm, async () => {
      this.filterApplied.emit({ ...this.filterModel() });
    });
  }

  protected onClear(): void {
    this.filterModel.set({ searchTerm: '', selectedType: 'Todos', startDate: '', endDate: '' });
    this.filtersCleared.emit();
  }
}
