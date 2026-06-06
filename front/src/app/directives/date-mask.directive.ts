import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';

export function formatDateBRL(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
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

  ngOnInit(): void {
    setTimeout(() => {
      const input = this.el.nativeElement;
      if (input.value) {
        input.value = formatDateBRL(input.value);
      }
    });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    const originalValue = input.value;
    const start = input.selectionStart;

    const formatted = formatDateBRL(originalValue);
    input.value = formatted;

    if (start !== null) {
      const addedChars = formatted.length - originalValue.length;
      input.setSelectionRange(start + addedChars, start + addedChars);
    }
  }
}
