import {
  Component,
  Inject,
  Input,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../service/login.service';
interface MenuItem {
  moduleId?: number;
  label: string;
  icon?: string;
  route?: string;
  expanded?: boolean;
  children?: MenuItem[];
  title?: string;
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuTrigger,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  @Input()
  opened = true;

  modules: any[] = [];
  menuItems: MenuItem[] = [];
  selectedModuleId: number | null = null; //Track selected submenu
  constructor(private router: Router, private loginService: LoginService, @Inject(PLATFORM_ID) private platformId: Object) { }

  username: string = '';



  ngOnInit(): void {


    if (isPlatformBrowser(this.platformId)) {
      this.username =
        sessionStorage.getItem('username') || '';

      const storedModules = sessionStorage.getItem('modules');
      if (storedModules) {
        this.modules = JSON.parse(storedModules);
      }

      // Restore previously selected submenu from session
      const storedSelected = sessionStorage.getItem('selectedModuleDetail');
      if (storedSelected) {
        const parsed = JSON.parse(storedSelected);
        this.selectedModuleId = parsed?.moduleId || null;
      }
    }

    const allowedModuleIds = this.modules.map((m) => m.moduleId);
    this.menuItems = this.filterMenuItems(
      this.getInitialMenu(),
      allowedModuleIds,
    );

    // Auto-expand parents if child route is active
    this.expandActiveParents(this.menuItems);
  }
  isSubItemActive(subItem: MenuItem): boolean {
    return (
      subItem.moduleId === this.selectedModuleId ||
      (subItem.route
        ? !!this.router.isActive(subItem.route, {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })
        : false)
    );
  }

  private expandActiveParents(items: MenuItem[]) {
    items.forEach((item) => {
      if (item.children) {
        if (item.children.some((child) => this.isSubItemActive(child))) {
          item.expanded = true;
        }
        this.expandActiveParents(item.children);
      }
    });
  }
  private filterMenuItems(items: MenuItem[], allowedIds: number[]): MenuItem[] {
    return items
      .map((item) => {
        if (item.moduleId === -1) {
          return { ...item };
        }
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterMenuItems(
            item.children,
            allowedIds,
          );
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        if (item.moduleId !== undefined && allowedIds.includes(item.moduleId)) {
          return { ...item };
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }
  activeMenu = 'Dashboard';

  private getInitialMenu(): MenuItem[] {

    return [
      {
        moduleId: -1,
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard'
      },
      {
        moduleId: 2,
        label: 'Department',
        icon: 'groups',
        route: '/department-master'
      },
      {
        moduleId: 3,

        label: 'Designation',

        icon: 'badge',

        route: '/designation-master'
      },
      {
        moduleId: 1,
        label: 'My team',
        icon: 'groups',
        route: '/my-team'
      },
      {
        moduleId: 5,
        label: 'Task Category',
        icon: 'task_alt',
        route: '/task-category-index'
      },
      {
        moduleId: 9,
        label: 'Tasks',
        icon: 'task_alt',
        route: '/task-index'
      },
      {
        moduleId: 8,
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
      },

      {
          moduleId: 8,
        label: 'State',
        icon: 'bar_chart',
        route: '/state-index'
      }
    ];
  }
  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some((child) => this.isSubItemActive(child));
  }


  // selectMenu(item: any): void {
  //   this.activeMenu = item.label;
  //   this.router.navigate([item.route]);
  // }

  openSettings(): void {
    this.router.navigate(['/settings']);
  }

  onLogout() {
    const logoutRequest = this.loginService.logout();

    if (!logoutRequest) {
      this.loginService.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    logoutRequest.subscribe({
      next: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }


  getModuleDetail(moduleId: any) {
    return this.modules.find((m) => m.moduleId === moduleId) || null;
  }

  selectMenu(item: MenuItem): void {
    this.activeMenu = item.label;

    // Set selected module ID
    this.selectedModuleId = item.moduleId ?? null;

    // Get complete module detail from session modules
    const moduleDetail = this.getModuleDetail(item.moduleId);

    // Store selected module detail in session
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(
        'selectedModuleDetail',
        JSON.stringify(moduleDetail)
      );
    }

    // Navigate
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }


  getShortName(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0];
    }

    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}`;
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