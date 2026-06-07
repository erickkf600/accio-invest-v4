import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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

  onClose(): void {
    this.close.emit();
  }
}
