import { Component, signal, computed, output } from '@angular/core';
import { FormField, form, submit } from '@angular/forms/signals';

interface FilterModel {
  searchTerm: string;
}

@Component({
  selector: 'app-filtro-relatorio',
  standalone: true,
  imports: [FormField],
  templateUrl: './filtro-relatorio.component.html',
})
export class FiltroRelatorioComponent {
  protected filterModel = signal<FilterModel>({
    searchTerm: '',
  });

  protected filterForm = form(this.filterModel);

  readonly filterApplied = output<FilterModel>();
  readonly filtersCleared = output<void>();

  protected canClear = computed(() => {
    return this.filterModel().searchTerm.trim() !== '';
  });

  protected onSubmit(): void {
    submit(this.filterForm, async () => {
      this.filterApplied.emit({ ...this.filterModel() });
    });
  }

  protected onClear(): void {
    this.filterModel.set({ searchTerm: '' });
    this.filtersCleared.emit();
  }
}
