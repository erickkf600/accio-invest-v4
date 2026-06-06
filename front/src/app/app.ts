import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "./components/Header/header.component";
import { ToastComponent } from "./components/Toast/toast.component";

@Component({
  imports: [RouterModule, HeaderComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'front';
}
