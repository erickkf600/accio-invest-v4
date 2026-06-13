import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error';
export type ToastPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  position: ToastPosition;
  closable: boolean;
}

export interface ToastOptions {
  message: string;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private addToast(type: ToastType, options: ToastOptions): string {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 4000,
      position: options.position ?? 'bottom-right',
      closable: options.closable ?? true,
    };
    this.toasts.update(list => [...list, toast]);
    if (toast.duration > 0) {
      setTimeout(() => this.remove(toast.id), toast.duration);
    }
    return toast.id;
  }

  success(options: ToastOptions): string {
    return this.addToast('success', options);
  }

  warning(options: ToastOptions): string {
    return this.addToast('warning', options);
  }

  error(options: ToastOptions): string {
    return this.addToast('error', options);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
