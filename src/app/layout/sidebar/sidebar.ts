import {
  Component,
  Input
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  @Input()
  opened = true;

  activeMenu = 'Dashboard';

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'My team',
      icon: 'groups',
      route: '/my-team'
    },
    {
      label: 'Tasks',
      icon: 'task_alt',
      route: '/tasks'
    },
    {
      label: 'Clients',
      icon: 'business',
      route: '/clients'
    },
    {
      label: 'Approvals',
      icon: 'fact_check',
      route: '/approvals'
    },
    {
      label: 'Attendance',
      icon: 'event_available',
      route: '/attendance'
    },
    {
      label: 'Helpdesk',
      icon: 'support_agent',
      route: '/helpdesk'
    },
    {
      label: 'Reports',
      icon: 'bar_chart',
      route: '/reports'
    }
  ];

  constructor(private router: Router) {}

  selectMenu(item: any): void {
    this.activeMenu = item.label;
    this.router.navigate([item.route]);
  }
}