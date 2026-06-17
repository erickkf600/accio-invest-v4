import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = signal(0);
  private debouncedVisible = signal(false);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly visible = this.debouncedVisible.asReadonly();

  constructor() {
    effect(() => {
      const count = this.requestCount();

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      if (count > 0) {
        this.timeoutId = setTimeout(() => {
          this.debouncedVisible.set(true);
        }, 200);
      } else {
        this.debouncedVisible.set(false);
      }
    });
  }

  show(): void {
    this.requestCount.update((c) => c + 1);
  }

  hide(): void {
    this.requestCount.update((c) => Math.max(0, c - 1));
  }
}
