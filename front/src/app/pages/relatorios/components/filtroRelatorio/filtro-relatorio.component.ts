import { Component, signal, computed, output } from '@angular/core';

@Component({
  selector: 'app-filtro-relatorio',
  standalone: true,
  templateUrl: './filtro-relatorio.component.html',
})
export class FiltroRelatorioComponent {
  protected searchTerm = signal<string>('');

  readonly filterApplied = output<string>();
  readonly filtersCleared = output<void>();

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected canClear = computed(() => this.searchTerm().trim() !== '');

  protected onInput(value: string): void {
    this.searchTerm.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterApplied.emit(value);
    }, 500);
  }

  protected onClear(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.searchTerm.set('');
    this.filtersCleared.emit();
  }
}
