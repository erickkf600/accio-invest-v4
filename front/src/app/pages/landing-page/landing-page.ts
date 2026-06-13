import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export default class LandingPage implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  protected activeSection = signal('inicio');
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const sections = this.document.querySelectorAll('section[id]');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => this.observer?.observe(s));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollTo(id: string): void {
    this.activeSection.set(id);
    const el = this.document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}
