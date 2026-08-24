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

}