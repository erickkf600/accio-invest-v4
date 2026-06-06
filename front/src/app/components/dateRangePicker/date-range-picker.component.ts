import { Component, signal, output } from '@angular/core';
import { DateMaskDirective } from '../../directives/date-mask.directive';
import { FormField, form } from '@angular/forms/signals';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [DateMaskDirective, FormField],
  templateUrl: './date-range-picker.component.html',
})
export class DateRangePickerComponent {
  rangeSelected = output<{ startDate: string; endDate: string }>();

  model = signal({
    startDate: '',
    endDate: '',
  });

  dateForm = form(this.model);
  isOpen = signal(false);

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  close(): void {
    this.isOpen.set(false);
  }

  confirm(): void {
    const val = this.model();
    if (val.startDate && val.endDate) {
      this.rangeSelected.emit({
        startDate: val.startDate,
        endDate: val.endDate,
      });
      this.close();
    }
  }
}
