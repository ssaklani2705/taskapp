import { Component, EventEmitter, HostListener, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
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
  username: string = '';
  designationName: string = '';
  isAdmin: string = 'N';
  isHod: string = 'N';

  showProfileMenu: boolean = false;
  showProfileModal: boolean = false;

  clientAssignmentMessage: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private dataProvider: DataProviderService,
  ) {}

  @Output()
  menuToggle = new EventEmitter<void>();

  // username: string = '';
  // showProfileMenu: boolean = false;

  // ngOnInit(): void {
  //   this.username = sessionStorage.getItem('username') || '';
  // }

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username') || '';
    this.designationName = sessionStorage.getItem('designationName') || '';
    this.isAdmin = sessionStorage.getItem('isAdmin') || 'N';
    this.isHod = sessionStorage.getItem('isHod') || 'N';
  }

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

    const loginType = sessionStorage.getItem('loginType') || 'other';

    const redirectUrl = loginType === 'manager' ? '/manager-login' : '/login';

    const logoutRequest = this.loginService.logout();

    if (!logoutRequest) {
      this.loginService.clearSession();

      this.router.navigate([redirectUrl]);

      return;
    }

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

  // onProfileClick(): void {
  //   this.closeProfileMenu();
  // }
  onProfileClick(): void {
    this.closeProfileMenu();
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-wrapper')) {
      this.closeProfileMenu();
    }
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }
}
