import { Component, signal, computed, output, input } from '@angular/core';
import { DateMaskDirective } from '../../directives/date-mask.directive';
import { FormField, form } from '@angular/forms/signals';

function parseMonthYear(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 6) return 0;
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2), 10);
  return year * 12 + month;
}

function parseDate(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return 0;
  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4), 10);
  return year * 12 + month; // day precision not needed for range
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [DateMaskDirective, FormField],
  templateUrl: './date-range-picker.component.html',
})
export class DateRangePickerComponent {
  rangeSelected = output<{ startDate: string; endDate: string }>();

  mode = input<'date' | 'monthYear'>('date');

  model = signal({
    startDate: '',
    endDate: '',
  });

  dateForm = form(this.model);
  isOpen = signal(false);

  dateError = computed(() => {
    const s = this.model().startDate;
    const e = this.model().endDate;
    if (!s || !e) return '';
    const parse = this.mode() === 'monthYear' ? parseMonthYear : parseDate;
    const startVal = parse(s);
    const endVal = parse(e);
    if (startVal === 0 || endVal === 0) return '';
    if (startVal >= endVal) return 'Data inicial deve ser anterior à data final';
    return '';
  });

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  close(): void {
    this.isOpen.set(false);
  }

  confirm(): void {
    const val = this.model();
    if (val.startDate && val.endDate && !this.dateError()) {
      this.rangeSelected.emit({
        startDate: val.startDate,
        endDate: val.endDate,
      });
      this.close();
    }
  }
}
