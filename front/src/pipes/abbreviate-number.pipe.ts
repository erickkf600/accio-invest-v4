import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbreviateNumber',
  standalone: true,
})
export class AbbreviateNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs < 1_000) {
      return `${sign}${abs.toFixed(2).replace('.', ',')}`;
    }

    const thresholds: { divisor: number; suffix: string }[] = [
      { divisor: 1_000_000_000_000, suffix: 'T' },
      { divisor: 1_000_000_000, suffix: 'B' },
      { divisor: 1_000_000, suffix: 'M' },
      { divisor: 1_000, suffix: 'K' },
    ];

    for (const { divisor, suffix } of thresholds) {
      if (abs >= divisor) {
        const formatted = abs / divisor;
        const decimals = formatted >= 100 ? 0 : formatted >= 10 ? 1 : 2;
        return `${sign}${formatted.toFixed(decimals)}${suffix}`;
      }
    }

    return `${sign}${abs.toFixed(2)}`;
  }
}
