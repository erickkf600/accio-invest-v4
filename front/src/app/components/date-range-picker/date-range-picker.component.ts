import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [],
  template: `
    <div class="flex space-x-2 items-center">
      <label class="text-sm font-medium text-gray-200">De</label>
      <input type="date" [value]="startDateSignal()" (change)="onStartChange($event)"
        class="rounded-md border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      <label class="text-sm font-medium text-gray-200">Até</label>
      <input type="date" [value]="endDateSignal()" (change)="onEndChange($event)"
        class="rounded-md border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
    </div>
  `,
  styles: []
})
export class DateRangePickerComponent {
  @Input() startDate!: string | null;
  @Input() endDate!: string | null;

  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();

  // Signal wrappers for reactivity
  startDateSignal = signal<string | null>(null);
  endDateSignal = signal<string | null>(null);

  ngOnInit() {
    this.startDateSignal.set(this.startDate ?? null);
    this.endDateSignal.set(this.endDate ?? null);
  }

  onStartChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.startDateSignal.set(value);
    this.startDateChange.emit(value);
  }

  onEndChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.endDateSignal.set(value);
    this.endDateChange.emit(value);
  }
}
