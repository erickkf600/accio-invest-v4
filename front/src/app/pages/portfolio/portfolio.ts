import { Component, signal } from '@angular/core';
import { TabsComponent, TabOption } from '../../components/tabs/tabs.component';
import { MeusProdutosComponent } from './components/meus-produtos/meus-produtos.component';
import { ProventosTabComponent } from './components/proventos-tab/proventos-tab.component';
import { RendimentosTabComponent } from './components/rendimentos-tab/rendimentos-tab.component';
import { AnalisesTabComponent } from './components/analises-tab/analises-tab.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    TabsComponent,
    MeusProdutosComponent,
    ProventosTabComponent,
    RendimentosTabComponent,
    AnalisesTabComponent,
  ],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export default class Portfolio {
  protected readonly title = 'Portfólio';

  tabOptions = signal<TabOption[]>([
    { id: 'produtos', label: 'Meus Produtos', icon: 'grid_view' },
    { id: 'proventos', label: 'Proventos', icon: 'payments' },
    { id: 'rendimentos', label: 'Rendimentos', icon: 'trending_up' },
    { id: 'analises', label: 'Análises', icon: 'analytics' },
  ]);

  activeTabId = signal<string>('produtos');

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }
}
