import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar-component/navbar-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  public router = inject(Router)

  protected readonly title = signal('SatMed-Frontend');
}
