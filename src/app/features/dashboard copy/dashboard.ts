import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth';


interface MenuItem {
  label: string;
  icon: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  sidenavOpened = true;

  username = localStorage.getItem('username') || 'User';
  role = localStorage.getItem('role') || 'USER';

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Hotels',
      icon: 'hotel',
      route: '/hotels'
    },
    {
      label: 'Hotel Rooms',
      icon: 'bed',
      route: '/hotel-rooms'
    },
    {
      label: 'Hotel Amenities',
      icon: 'room_service',
      route: '/hotel-amenities'
    },
    {
      label: 'Destinations',
      icon: 'location_on',
      route: '/destinations'
    },
    {
      label: 'Travel Packages',
      icon: 'luggage',
      route: '/travel-packages'
    },
    {
      label: 'Package Itineraries',
      icon: 'map',
      route: '/package-itineraries'
    }
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  navigate(route?: string): void {

    if (route) {
      this.router.navigate([route]);
    }
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}