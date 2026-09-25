import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataProviderService } from '../../service/data-provider.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  constructor(
    private router: Router,

    private loginService: LoginService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private dataProvider: DataProviderService,

    // private elementRef: ElementRef
  ) {}

  @Output()
  menuToggle = new EventEmitter<void>();

  username: string = '';
  showProfileMenu: boolean = false;
  clientAssignmentMessage: string = '';

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username') || '';

    // this.checkClientAssignment();
  }

  // ============================================================
  // CLIENT ASSIGNMENT CHECK
  // ============================================================

  private checkClientAssignment(): void {
    const managerId = Number(sessionStorage.getItem('userId'));

    if (!managerId) {
      return;
    }

    this.dataProvider.checkClientAssignment(managerId).subscribe({
      next: (response: { assigned: boolean; message: string }) => {
        this.clientAssignmentMessage = response.assigned ? '' : response.message;
      },

      error: (err) => {
        console.error('Failed to check client assignment', err);
      },
    });
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  getInitials(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  onLogout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // ---------------------------------------------
    // Get login type BEFORE clearing session
    // ---------------------------------------------

    const loginType = sessionStorage.getItem('loginType') || 'other';

    // ---------------------------------------------
    // Redirect URL
    // ---------------------------------------------

    const redirectUrl = loginType === 'manager' ? '/manager-login' : '/login';

    // ---------------------------------------------
    // Logout API
    // ---------------------------------------------

    const logoutRequest = this.loginService.logout();

    // ---------------------------------------------
    // No logout request
    // ---------------------------------------------

    if (!logoutRequest) {
      this.loginService.clearSession();

      this.router.navigate([redirectUrl]);

      return;
    }

    // ---------------------------------------------
    // Logout request
    // ---------------------------------------------

    logoutRequest.subscribe({
      next: () => {
        this.loginService.clearSession();

        this.router.navigate([redirectUrl]);
      },

      error: () => {
        this.loginService.clearSession();

        this.router.navigate([redirectUrl]);
      },
    });
  }

  onProfileClick(): void {
    this.closeProfileMenu();
    // Navigate to a profile page if you have one, e.g.:
    // this.router.navigate(['/profile']);
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }
}
