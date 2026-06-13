import { Directive, ElementRef, inject, input, OnDestroy, HostListener } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input.required<string>();

  private overlay = inject(Overlay);
  private el = inject(ElementRef<HTMLElement>);
  private overlayRef: OverlayRef | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.show(), 300);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.hide();
  }

  private show(): void {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.el)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 6,
      }]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const portal = new ComponentPortal(TooltipComponent);
    const ref = this.overlayRef.attach(portal);
    ref.setInput('text', this.appTooltip());
  }

  private hide(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
}
