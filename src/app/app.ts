import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SlideMenuComponent } from './shared/slide-menu/slide-menu.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SlideMenuComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('dacs-fe');
}
