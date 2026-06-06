import { Component, output } from '@angular/core';
import { MenuComponent } from '../../../../components/Menu/menu.component';

@Component({
  selector: 'app-movimentacoes-empty-state',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './movimentacoes-empty-state.html',
})
export default class MovimentacoesEmptyState {
  operationTypeChange = output<string>();

  onOperationTypeChange(value: string) {
    this.operationTypeChange.emit(value);
  }
}
