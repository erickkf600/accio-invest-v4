import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
})
export default class EsqueciSenha {
  protected email = '';
  protected sent = false;

  onSubmit(): void {
    this.sent = true;
  }
}
