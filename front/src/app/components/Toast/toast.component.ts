import { Component, computed, inject } from '@angular/core';
import { ToastService, ToastPosition, ToastType, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  readonly positions: ToastPosition[] = [
    'bottom-right',
    'bottom-left',
    'top-right',
    'top-left',
  ];

  protected toastsByPosition = computed(() => {
    const toasts = this.toastService.toasts();
    const map: Record<ToastPosition, Toast[]> = {
      'bottom-right': [],
      'bottom-left': [],
      'top-right': [],
      'top-left': [],
    };
    for (const t of toasts) {
      map[t.position].push(t);
    }
    return map;
  });

  protected positionClass(pos: ToastPosition): string {
    const map: Record<ToastPosition, string> = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
    };
    return map[pos];
  }

  protected borderClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'border-primary/30',
      warning: 'border-[#f59e0b]/30',
      error: 'border-error/30',
    };
    return map[type];
  }

  protected iconContainerClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'bg-primary text-on-primary',
      warning: 'bg-[#f59e0b] text-[#78350f]',
      error: 'bg-error text-on-error',
    };
    return map[type];
  }

  protected iconName(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    };
    return map[type];
  }
}
