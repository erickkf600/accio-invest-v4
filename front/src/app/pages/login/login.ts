import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private router = inject(Router);

  protected showPassword = signal(false);

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) return;
    const user = {
      name: 'Ricardo Oliveira',
      email: this.form.value.email || 'ricardo.oliveira@qubix.com',
      avatar: 'https://api.dicebear.com/10.x/identicon/svg',
    };
    const token = 'fake-jwt-token-' + Date.now();

    sessionStorage.setItem('auth_user', JSON.stringify(user));
    sessionStorage.setItem('auth_token', token);

    this.router.navigate(['/dashboard']);
  }
}
