import {
  Component,
  EventEmitter,
<<<<<<< HEAD
=======
  OnInit,
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
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
<<<<<<< HEAD
export class Header {
=======
export class Header implements OnInit {
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

  @Output()
  menuToggle = new EventEmitter<void>();

<<<<<<< HEAD
=======
  username: string = '';

   ngOnInit(): void {
    this.username =
      sessionStorage.getItem('username') || '';
  }
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

  toggleMenu(): void {
    this.menuToggle.emit();
  }

<<<<<<< HEAD
=======

  getInitials(name: string): string {
  if (!name) {
    return '';
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
}