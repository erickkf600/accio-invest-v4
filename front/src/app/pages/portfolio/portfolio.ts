import { Component } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export default class Portfolio {
  protected readonly title = 'Portfólio';
}
