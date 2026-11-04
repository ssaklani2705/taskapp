// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet } from '@angular/router';

// import { Header } from '../header/header';
// import { Sidebar } from '../sidebar/sidebar';
// import { FooterComponent } from '../footer/footer';

// @Component({
//   selector: 'app-main-layout',

//   standalone: true,

//   imports: [CommonModule, RouterOutlet, Header, Sidebar, FooterComponent],

//   templateUrl: './main-layout.html',

//   styleUrl: './main-layout.scss',
// })
// export class MainLayout {
//   sidebarOpened = true;

//   // =======================================================
//   // TOGGLE SIDEBAR
//   // =======================================================

//   toggleSidebar(): void {
//     this.sidebarOpened = !this.sidebarOpened;
//   }

//   // =======================================================
//   // CLOSE SIDEBAR
//   // =======================================================

//   closeSidebar(): void {
//     this.sidebarOpened = false;
//   }

//   // =======================================================
//   // SIDEBAR STATE CHANGE
//   // =======================================================

//   onSidebarOpenedChange(opened: boolean): void {
//     this.sidebarOpened = opened;
//   }
// }
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Sidebar, FooterComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly MOBILE_BREAKPOINT = 900;

  isMobile = false;
  sidebarOpened = true;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
      this.sidebarOpened = !this.isMobile;   // mobile: closed, desktop: open
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const nowMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;

    // Only react when crossing the breakpoint (ignores mobile keyboard resizes)
    if (nowMobile !== this.isMobile) {
      this.isMobile = nowMobile;
      this.sidebarOpened = !nowMobile;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
  }

  closeSidebar(): void {
    this.sidebarOpened = false;
  }

  onSidebarOpenedChange(opened: boolean): void {
    this.sidebarOpened = opened;
  }
}