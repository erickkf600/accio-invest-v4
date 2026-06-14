import { Component, output } from '@angular/core';
import { MenuComponent } from '../../../../components/Menu/menu.component';

@Component({
  selector: 'app-dashboard-empty-state',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './dashboard-empty-state.html',
})
export default class DashboardEmptyState {
  operationTypeChange = output<string>();

  onOperationTypeChange(value: string) {
    this.operationTypeChange.emit(value);
  }
}
