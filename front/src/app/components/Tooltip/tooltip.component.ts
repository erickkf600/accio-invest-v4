import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  template: `
    <div class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl bg-[#1a1d26] text-white border border-[#262b3a]">
      {{ text() }}
    </div>
  `,
})
export class TooltipComponent {
  text = input.required<string>();
}
