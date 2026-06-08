import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../components/Toast/toast.service';

const passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  return password && confirm && password.value !== confirm.value ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export default class Cadastro {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected loading = signal(false);
  protected success = signal(false);

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordsMatch });

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const { name, email, password } = this.form.value;

    this.auth
      .register({ name: name!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.success.set(true);
          this.toast.success({ message: 'Conta criada com sucesso!' });
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        },
        error: (err) => {
          const msg =
            err.status === 409
              ? 'Este e-mail já está cadastrado'
              : 'Erro ao criar conta. Tente novamente.';
          this.toast.error({ message: msg });
          this.loading.set(false);
        },
      });
  }
}
