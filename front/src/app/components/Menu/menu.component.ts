import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: [':host { display: none; }'],
})
export class MenuComponent {
  private readonly overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;

  readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');

  protected readonly isOpen = signal(false);

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    const trigger = document.activeElement as HTMLElement;
    if (!trigger) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetY: 8,
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetY: -8,
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.detachments().subscribe(() => this.close());

    const portal = new DomPortal(this.contentRef());
    this.overlayRef.attach(portal);
    this.isOpen.set(true);
  }

  close(): void {
    const ref = this.overlayRef;
    if (ref) {
      this.overlayRef = null;
      ref.detach();
      ref.dispose();
    }
    this.isOpen.set(false);
  }
}
