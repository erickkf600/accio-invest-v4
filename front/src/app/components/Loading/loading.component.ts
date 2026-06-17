import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (loadingService.visible()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0e14]/90 backdrop-blur-xl">
        <div class="w-10 h-10 border-4 border-[#262b3a] border-t-[#16A34A] rounded-full animate-spin"></div>
      </div>
    }
  `,
})
export class LoadingComponent {
  protected readonly loadingService = inject(LoadingService);
}
