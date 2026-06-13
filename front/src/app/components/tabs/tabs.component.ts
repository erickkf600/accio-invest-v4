import { Component, input, output } from '@angular/core';

export interface TabOption {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [],
  templateUrl: './tabs.component.html',
})
export class TabsComponent {
  options = input.required<TabOption[]>();
  activeTab = input.required<string>();
  tabChange = output<string>();

  selectTab(id: string): void {
    if (this.activeTab() !== id) {
      this.tabChange.emit(id);
    }
  }
}
