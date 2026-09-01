import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';


@Component({
  selector: 'app-main-layout',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Sidebar,
    FooterComponent
  ],

  templateUrl: './main-layout.html',

  styleUrl: './main-layout.scss'
})
export class MainLayout {

  sidebarOpened = true;


  // =======================================================
  // TOGGLE SIDEBAR
  // =======================================================

  toggleSidebar(): void {

    this.sidebarOpened =
      !this.sidebarOpened;
  }


  // =======================================================
  // CLOSE SIDEBAR
  // =======================================================

  closeSidebar(): void {

    this.sidebarOpened = false;
  }


  // =======================================================
  // SIDEBAR STATE CHANGE
  // =======================================================

  onSidebarOpenedChange(
    opened: boolean
  ): void {

    this.sidebarOpened = opened;
  }

}
