import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  @Output()
  menuToggle = new EventEmitter<void>();


  toggleMenu(): void {
    this.menuToggle.emit();
  }

}