import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';

export function formatCurrencyBRL(raw: string | number): string {
  if (raw === undefined || raw === null) return '';
  let str = raw.toString();
  
  // If number, convert to string with commas
  if (typeof raw === 'number') {
    str = raw.toString().replace('.', ',');
  }

  // Remove everything except digits and comma
  let clean = str.replace(/[^\d,]/g, '');
  
  // Keep only the first comma
  const commaIndex = clean.indexOf(',');
  if (commaIndex !== -1) {
    const integerPart = clean.slice(0, commaIndex);
    const decimalPart = clean.slice(commaIndex + 1).replace(/,/g, '');
    clean = integerPart + ',' + decimalPart;
  }
  
  const parts = clean.split(',');
  let integer = parts[0];
  
  // Remove leading zeros
  integer = integer.replace(/^0+(?=\d)/, '');
  if (integer === '') integer = '0';
  
  // Thousands separators
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (parts.length > 1) {
    return 'R$ ' + integer + ',' + parts[1];
  }
  return 'R$ ' + integer;
}

export function parseCurrencyBRL(formatted: string): number {
  if (!formatted) return 0;
  const clean = formatted
    .replace(/R\$\s?/, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>);

  ngOnInit(): void {
    setTimeout(() => {
      const input = this.el.nativeElement;
      if (input.value) {
        input.value = formatCurrencyBRL(input.value);
      }
    });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    const originalValue = input.value;
    const start = input.selectionStart;

    const formatted = formatCurrencyBRL(originalValue);
    input.value = formatted;

    if (start !== null) {
      const addedChars = formatted.length - originalValue.length;
      input.setSelectionRange(start + addedChars, start + addedChars);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    if (input.value && !input.value.startsWith('R$ ')) {
      input.value = formatCurrencyBRL(input.value);
    }
  }
}
