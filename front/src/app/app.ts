import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from "./components/Header/header.component";
import { ToastComponent } from "./components/Toast/toast.component";

@Component({
  imports: [RouterModule, HeaderComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private router = inject(Router);

  protected get hideHeader(): boolean {
    const url = this.router.url.split('#')[0];
    return url === '' || url === '/' || url.startsWith('/login') || url.startsWith('/cadastro') || url.startsWith('/esqueci-senha');
  }
}
