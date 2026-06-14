import { Component, signal, inject } from '@angular/core';
import { TabsComponent, TabOption } from '../../components/tabs/tabs.component';
import { AporteTabComponent } from './components/aporte-tab/aporte-tab.component';
import { AlugueisTabComponent } from './components/alugueis-tab/alugueis-tab.component';
import { VendasTabComponent } from './components/vendas-tab/vendas-tab.component';
import { ReposicionamentoTabComponent } from './components/reposicionamento-tab/reposicionamento-tab.component';
import { NotasTabComponent } from './components/notas-tab/notas-tab.component';
import { PrecoMedioTabComponent } from './components/preco-medio-tab/preco-medio-tab.component';
import { RendaFixaTabComponent } from './components/renda-fixa-tab/renda-fixa-tab.component';
import { DetalhesAporteComponent } from './modais/detalhes-aporte/detalhes-aporte.component';
import { AdicionarNotaComponent } from './modais/adicionar-nota/adicionar-nota.component';
import { RemoverNotaComponent } from './modais/remover-nota/remover-nota.component';
import { RelatoriosService } from './service/relatorios.service';
import { RelatorioAporte, RelatorioNotaCorretagem } from '../../models/relatorios.model';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    TabsComponent,
    AporteTabComponent,
    AlugueisTabComponent,
    VendasTabComponent,
    ReposicionamentoTabComponent,
    NotasTabComponent,
    PrecoMedioTabComponent,
    RendaFixaTabComponent,
    DetalhesAporteComponent,
    AdicionarNotaComponent,
    RemoverNotaComponent,
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export default class Relatorios {
  private relatoriosService = inject(RelatoriosService);

  protected readonly title = 'Relatórios';

  tabOptions = signal<TabOption[]>([
    { id: 'aportes', label: 'Histórico de Aportes', icon: 'history' },
    { id: 'alugueis', label: 'Recebidos de Aluguéis', icon: 'domain' },
    { id: 'vendas', label: 'Vendas', icon: 'sell' },
    { id: 'reposicionamento', label: 'Reposicionamento', icon: 'published_with_changes' },
    { id: 'notas', label: 'Notas de Corretagem', icon: 'receipt_long' },
    { id: 'preco-medio', label: 'Preço Médio Histórico', icon: 'analytics' },
    { id: 'renda-fixa', label: 'Renda Fixa', icon: 'account_balance' },
  ]);

  activeTabId = signal<string>('aportes');
  notasRefreshKey = signal(0);

  selectedAporte = signal<RelatorioAporte | null>(null);
  showAdicionarNota = signal<boolean>(false);
  notaParaRemover = signal<RelatorioNotaCorretagem | null>(null);
  notaHasLinks = signal(false);
  removing = signal(false);

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  closeDetailsModal(): void {
    this.selectedAporte.set(null);
  }

  openNotaModal(): void {
    this.showAdicionarNota.set(true);
  }

  closeNotaModal(): void {
    this.showAdicionarNota.set(false);
  }

  onNotaRemovida(): void {
    this.notaParaRemover.set(null);
    this.notasRefreshKey.update(v => v + 1);
  }

  onNotaAdicionada(): void {
    this.showAdicionarNota.set(false);
    this.notasRefreshKey.update(v => v + 1);
  }

  onRemoverNota(nota: RelatorioNotaCorretagem): void {
    this.relatoriosService.checkNotaLinks(Number(nota.id)).subscribe({
      next: (res) => {
        this.notaHasLinks.set(res.data.hasLinks);
        this.notaParaRemover.set(nota);
      },
    });
  }

  onDeleteNota(mode: 'unlink' | 'cascade'): void {
    const nota = this.notaParaRemover();
    if (!nota || this.removing()) return;
    this.removing.set(true);
    this.relatoriosService.deleteNota(Number(nota.id), mode).subscribe({
      next: () => {
        this.removing.set(false);
        this.onNotaRemovida();
      },
      error: () => {
        this.removing.set(false);
      },
    });
  }
}
