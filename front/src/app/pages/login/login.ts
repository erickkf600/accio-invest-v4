import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../components/Toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected showPassword = signal(false);
  protected loading = signal(false);

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const { email, password } = this.form.value;

    this.auth
      .login({ email: email!, password: password! })
      .subscribe({
        next: () => {
          this.toast.success({ message: 'Login realizado com sucesso!' });
          this.router.navigate(['/dashboard']);
          this.loading.set(false);
        },
        error: (err) => {
          const msg =
            err.status === 401
              ? 'E-mail ou senha inválidos'
              : 'Erro ao conectar ao servidor. Tente novamente.';
          this.toast.error({ message: msg });
          this.loading.set(false);
        },
      });
  }
}
