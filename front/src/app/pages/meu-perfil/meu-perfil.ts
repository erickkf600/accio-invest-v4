import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from './service/user.service';
import { ToastService } from '../../components/Toast/toast.service';
import type { User } from '../../core/models/auth.models';

const AVATAR_SEEDS = [
  'Avery', 'Bailey', 'Casey', 'Dakota', 'Ellis',
  'Finley', 'Harper', 'Jordan', 'Kendall', 'Logan',
  'Morgan', 'Parker', 'Quinn', 'Reese', 'Skyler',
  'Taylor',
];

const DICEBEAR_STYLE = 'bottts';

function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${seed}`;
}

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.scss',
})
export default class MeuPerfil implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected user = signal<User | null>(null);
  protected saving = signal(false);
  protected showPasswordModal = signal(false);
  protected showAvatarModal = signal(false);
  protected selectedAvatarSeed = signal<string | null>(null);
  protected senhaAtual = '';
  protected novaSenha = '';
  protected confirmacaoSenha = '';

  protected readonly avatarSeeds = AVATAR_SEEDS;

  protected currentAvatarUrl = computed(() => {
    const u = this.user();
    const seed = u?.avatar || u?.name || 'default';
    return avatarUrl(seed);
  });

  protected get isPasswordFormValid(): boolean {
    return !!this.senhaAtual && !!this.novaSenha && !!this.confirmacaoSenha && this.novaSenha === this.confirmacaoSenha;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  protected avatarUrlFor(seed: string): string {
    return avatarUrl(seed);
  }

  private loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
      },
    });
  }

  protected openAvatarModal(): void {
    this.selectedAvatarSeed.set(null);
    this.showAvatarModal.set(true);
  }

  protected selectAvatarSeed(seed: string): void {
    this.selectedAvatarSeed.set(seed);
  }

  protected confirmAvatar(): void {
    const currentUser = this.user();
    const seed = this.selectedAvatarSeed();
    if (!currentUser || !seed) return;

    this.userService.updateProfile(currentUser.name, seed).subscribe({
      next: (user) => {
        this.user.set(user);
        this.auth.updateUser(user);
        this.showAvatarModal.set(false);
        this.toast.success({ message: 'Avatar atualizado!' });
      },
      error: () => {
        this.toast.error({ message: 'Erro ao atualizar avatar.' });
      },
    });
  }

  saveChanges(): void {
    const currentUser = this.user();
    if (!currentUser) return;
    this.saving.set(true);

    this.userService.updateProfile(currentUser.name, currentUser.avatar).subscribe({
      next: (user) => {
        this.user.set(user);
        this.auth.updateUser(user);
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

    this.userService.changePassword(this.senhaAtual, this.novaSenha).subscribe({
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
