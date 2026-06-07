import { Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';

function formatDate(raw: string, monthYear: boolean): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, monthYear ? 6 : 8);
  if (monthYear) {
    let month = digits.slice(0, 2);
    if (month.length === 2) {
      const num = parseInt(month, 10);
      if (num > 12) month = '12';
    }
    if (digits.length <= 2) return month;
    return `${month}/${digits.slice(2)}`;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseDateBRL(formatted: string): string {
  return formatted.replace(/\//g, '');
}

@Directive({
  selector: '[appDateMask]',
  standalone: true,
})
export class DateMaskDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>);

  readonly appDateMask = input<string | boolean>(true);

  private get monthYear(): boolean {
    return this.appDateMask() === 'monthYear';
  }

  ngOnInit(): void {
    setTimeout(() => {
      const input = this.el.nativeElement;
      if (input.value) {
        input.value = formatDate(input.value, this.monthYear);
      }
    });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    const originalValue = input.value;
    const start = input.selectionStart;

    const formatted = formatDate(originalValue, this.monthYear);
    input.value = formatted;

    if (start !== null) {
      const addedChars = formatted.length - originalValue.length;
      input.setSelectionRange(start + addedChars, start + addedChars);
    }
  }
}
