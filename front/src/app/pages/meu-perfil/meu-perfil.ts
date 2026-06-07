import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.scss',
})
export default class MeuPerfil implements OnInit {
  private router = inject(Router);

  protected user: { name: string; email: string; avatar: string } | null = null;
  protected saving = false;

  ngOnInit(): void {
    const stored = sessionStorage.getItem('auth_user');
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  saveChanges(): void {
    this.saving = true;
    setTimeout(() => {
      if (this.user) {
        sessionStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      this.saving = false;
    }, 1200);
  }

  logout(): void {
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
