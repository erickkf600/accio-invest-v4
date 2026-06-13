import { Component, input, signal, computed, viewChild, ElementRef, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [FormField, CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent {
  options = input<string[]>([]);
  placeholder = input('');
  inputClass = input('');
  formField = input.required<any>();
  allowCustomValue = input(false);

  optionSelected = output<string>();

  inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  search = signal('');
  isOpen = signal(false);
  invalidOption = signal(false);

  filteredOptions = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(o => o.toLowerCase().includes(q));
  });

  private isValidOption(value: string): boolean {
    return !value || this.options().some(o => o === value);
  }

  onFocus(): void {
    setTimeout(() => this.isOpen.set(true), 100);
  }

  onInput(): void {
    this.search.set(this.inputEl()?.nativeElement.value ?? '');
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
    if (this.invalidOption()) {
      this.invalidOption.set(false);
      this.clearFieldError();
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen.set(false);

      const value = this.inputEl()?.nativeElement.value ?? '';
      const field = this.formField();
      if (typeof (field as any)?.markAsTouched === 'function') {
        (field as any).markAsTouched();
      }

      if (!this.allowCustomValue() && value && !this.isValidOption(value)) {
        this.invalidOption.set(true);
        this.setFieldError('Selecione um emissor válido da lista');
      } else {
        this.invalidOption.set(false);
        this.clearFieldError();
      }
    }, 200);
  }

  selectOption(option: string): void {
    const input = this.inputEl()?.nativeElement;
    if (!input) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set;

    nativeInputValueSetter?.call(input, option);
    input.dispatchEvent(new Event('input', { bubbles: true }));

    this.search.set(option);
    this.isOpen.set(false);
    this.invalidOption.set(false);
    this.clearFieldError();
    this.optionSelected.emit(option);
  }

  get triggerWidth(): number {
    return this.inputEl()?.nativeElement.offsetWidth ?? 200;
  }

  private clearFieldError(): void {
    const field = this.formField();
    if (typeof (field as any)?.setErrors === 'function') {
      (field as any).setErrors([]);
    }
  }

  private setFieldError(message: string): void {
    const field = this.formField();
    if (typeof (field as any)?.setErrors === 'function') {
      (field as any).setErrors([{ message, field: 'emissor' }]);
    }
  }
}
