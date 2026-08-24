import {
  Component,
  EventEmitter,
  OnInit,
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
export class Header implements OnInit {

  @Output()
  menuToggle = new EventEmitter<void>();

  username: string = '';

   ngOnInit(): void {
    this.username =
      sessionStorage.getItem('username') || '';
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

}