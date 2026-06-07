import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AbbreviateNumberPipe } from '../../../../../pipes/abbreviate-number.pipe';
import { RelatorioAporte } from '../../../../models/relatorios.model';

@Component({
  selector: 'app-detalhes-aporte',
  standalone: true,
  imports: [DecimalPipe, AbbreviateNumberPipe],
  templateUrl: './detalhes-aporte.component.html',
})
export class DetalhesAporteComponent {
  aporte = input.required<RelatorioAporte>();
  close = output<void>();

  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onClose(): void {
    this.close.emit();
  }
}
