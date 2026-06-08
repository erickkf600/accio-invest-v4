import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../components/Toast/toast.service';
import { environment } from '../../../environments/environment';
import type { ApiResponse, User } from '../../core/models/auth.models';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.scss',
})
export default class MeuPerfil implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/users`;

  protected user: User | null = null;
  protected saving = signal(false);
  protected showPasswordModal = signal(false);
  protected senhaAtual = '';
  protected novaSenha = '';
  protected confirmacaoSenha = '';

  protected get isPasswordFormValid(): boolean {
    return !!this.senhaAtual && !!this.novaSenha && !!this.confirmacaoSenha && this.novaSenha === this.confirmacaoSenha;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).subscribe({
      next: (res) => {
        this.user = res.data;
      },
    });
  }

  saveChanges(): void {
    if (!this.user) return;
    this.saving.set(true);

    this.http
      .patch<ApiResponse<User>>(`${this.apiUrl}/profile`, {
        name: this.user.name,
        email: this.user.email,
      })
      .subscribe({
        next: (res) => {
          this.user = res.data;
          this.toast.success({ message: 'Perfil atualizado com sucesso!' });
        },
        error: () => {
          this.toast.error({ message: 'Erro ao atualizar perfil.' });
        },
        complete: () => this.saving.set(false),
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  changePassword(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmacaoSenha) return;
    if (this.novaSenha !== this.confirmacaoSenha) return;

    this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/change-password`, {
        currentPassword: this.senhaAtual,
        newPassword: this.novaSenha,
      })
      .subscribe({
        next: () => {
          this.toast.success({ message: 'Senha alterada com sucesso!' });
          this.showPasswordModal.set(false);
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmacaoSenha = '';
        },
        error: (err) => {
          if (err.status === 401) {
            this.toast.error({ message: 'Senha atual incorreta.' });
          } else {
            this.toast.error({ message: 'Erro ao alterar senha.' });
          }
        },
      });
  }
}
