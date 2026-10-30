import { Component, Inject, Input, Output, EventEmitter, PLATFORM_ID, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../service/login.service';
import { filter, Subscription } from 'rxjs';

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
  imports: [CommonModule, MatIconModule, MatMenuTrigger, MatButtonModule, MatMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  @Input() opened = true;
  @Output() openedChange = new EventEmitter<boolean>();

  modules: any[] = [];
  menuItems: MenuItem[] = [];

  selectedModuleId: number | null = null;
  activeMenu = 'Dashboard';
  username = '';
  loginType = '';
  private routerSubscription?: Subscription;
  constructor(private router: Router,private loginService: LoginService,@Inject(PLATFORM_ID) private platformId: object,private elementRef: ElementRef,) {}
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.username = sessionStorage.getItem('username') || '';
    this.loginType = sessionStorage.getItem('loginType') || 'other';

    // Load permitted modules
    const storedModules = sessionStorage.getItem('modules');

    if (storedModules) {
      try {
        this.modules = JSON.parse(storedModules);
      } catch (error) {
        console.error('Unable to parse stored modules', error);
        this.modules = [];
      }
    }

    // Restore selected module
    const storedSelected = sessionStorage.getItem('selectedModuleDetail');

    if (storedSelected) {
      try {
        const parsed = JSON.parse(storedSelected);
        this.selectedModuleId = parsed?.moduleId ?? null;
      } catch (error) {
        console.error('Unable to parse selected module', error);
        this.selectedModuleId = null;
      }
    }

    const allowedModuleIds = this.modules.map((module) => Number(module.moduleId)).filter((id) => Number.isFinite(id));

    this.menuItems = this.filterMenuItems(this.getInitialMenu(), allowedModuleIds);

    this.setActiveMenuFromRoute(this.router.url);
    this.expandActiveParents(this.menuItems);

    // Update selected menu after navigation
    this.routerSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.setActiveMenuFromRoute(event.urlAfterRedirects);
      this.expandActiveParents(this.menuItems);
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.innerWidth > 900 || !this.opened) {
      return;
    }

    const target = event.target as Node;
    const sidebarElement = this.elementRef.nativeElement.querySelector('.sidebar');

    if (sidebarElement?.contains(target)) {
      return;
    }

    this.closeSidebar();
  }

  closeSidebar(): void {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.openedChange.emit(false);
  }

  openSidebar(): void {
    this.opened = true;
    this.openedChange.emit(true);
  }

  toggleSidebar(): void {
    if (this.opened) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  // =========================================================
  // MENU CONFIGURATION
  // =========================================================

//   private getInitialMenu(): MenuItem[] {
//     // MANAGER MENU
//     if (this.loginType === 'manager') {
//       return [
//         {
//           moduleId: -1,
//           label: 'Dashboard',
//           icon: 'dashboard',
//           route: '/dashboard',
//         },
//         {
//           moduleId: 11,
//           label: 'Recurring Master',
//           icon: 'bar_chart',
//           route: '/recurring-index',
//         },
//         {
//           moduleId: 10,
//           label: 'Tasks',
//           icon: 'task_alt',
//           route: '/task-index',
//         },
//       ];
//     }

//     // OTHER USERS MENU
//     return [
//       {
//         moduleId: -1,
//         label: 'Dashboard',
//         icon: 'dashboard',
//         route: '/employee-dashboard',
//       },
//       {
//         moduleId: 12,
//         label: 'Holiday Master',
//         icon: 'event',
//         route: '/hodiday-index',
//       },
//       {
//         moduleId: 2,
//         label: 'Department Master',
//         icon: 'apartment',
//         route: '/department-master',
//       },
//       {
//         moduleId: 3,
//         label: 'Designation Master',
//         icon: 'badge',
//         route: '/designation-master',
//       },
//       {
//         moduleId: 5,
//         label: 'Task Category Master',
//         icon: 'task_alt',
//         route: '/task-category-index',
//       },
//       {
//         moduleId: 1,
//         label: 'User Management',
//         icon: 'groups',
//         route: '/user-management-index',
//       },
//       {
//         moduleId: 4,
//         label: 'State Master',
//         icon: 'location_on',
//         route: '/state-index',
//       },
//       {
//         moduleId: 9,
//         label: 'Plan Master',
//         icon: 'event_note',
//         route: '/plan-index',
//       },
//       {
//         moduleId: 8,
//         label: 'Client Master',
//         icon: 'business',
//         route: '/client-index',
//       },
//       {
//         moduleId: 11,
//         label: 'Recurring Master',
//         icon: 'bar_chart',
//         route: '/recurring-index',
//       },
//       {
//         moduleId: 10,
//         label: 'Tasks',
//         icon: 'task_alt',
//         route: '/task-index',
//       },
//       {
//         moduleId: 16,
//         label: 'Company Master',
//         icon: 'task_alt',
//         route: '/company-index',
//       },
//        {
//         moduleId: 15,
//         label: 'Generic Recurring',
//         icon: 'task_alt',
//         route: '/generic-recurring-index',
//       },
//        {
//         moduleId: 14,
//         label: 'Service Master',
//         icon: 'task_alt',
//         route: '/service-index',
//       },
//       {
//   label: 'Task Reports',
//   icon: 'assessment',
//   expanded: false,
//   children: [
//     {
//       moduleId: 13,
//       label: 'Workload Report',
//       icon: 'insights',
//       route: '/workload-report',
//     },
//     {
//       moduleId: 17,
//       label: 'Rating Report',
//       icon: 'star_rate',
//       route: '/rating-report',
//     },
//     {
//       moduleId: 18,
//       label: 'Reassign Report',
//       icon: 'sync_alt',
//       route: '/reassign-report-index',
//     },
//   ],
// },
      
// {
//   label: 'System Reports',
//   icon: 'admin_panel_settings',
//   expanded: false,
//   children: [
//     {
//       moduleId: 7,
//       label: 'Mail Log Report',
//       icon: 'mail_outline',
//       route: '/mail-log-report',
//     },
//     {
//       moduleId: 6,
//       label: 'Access Report',
//       icon: 'security',
//       route: '/access-report',
//     },
//   ],
// },


//       // {
//       //   label: 'Reports',
//       //   icon: 'assessment',
//       //   expanded: false,
//       //   children: [
//       //     {
//       //       moduleId: 7,
//       //       label: 'Mail Log Report',
//       //       icon: 'mail_outline',
//       //       route: '/mail-log-report',
//       //     },
//       //     {
//       //       moduleId: 6,
//       //       label: 'Access Report',
//       //       icon: 'admin_panel_settings',
//       //       route: '/access-report',
//       //     },
//       //     { moduleId: 13, label: 'Workload Report', icon: 'insights', route: '/workload-report' },
//       //     { moduleId: 17, label: 'Rating Report', icon: 'star_rate', route: '/rating-report' },
//       //       { moduleId: 18, label: 'Reassign Report', icon: 'insights', route: '/reassign-report-index' },
//       //   ],
//       // },
//     ];
//   }

 private getInitialMenu(): MenuItem[] {
    // MANAGER MENU
    if (this.loginType === 'manager') {
      return [
        {
          moduleId: -1,
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard',
        },
        {
          moduleId: 11,
          label: 'Recurring Master',
          icon: 'bar_chart',
          route: '/recurring-index',
        },
        {
          moduleId: 10,
          label: 'Tasks',
          icon: 'task_alt',
          route: '/task-index',
        },
      ];
    }

    // OTHER USERS MENU
   
return [
  {
    moduleId: -1,
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/employee-dashboard',
  },

  // MASTER MENU
  {
    label: 'Masters',
    icon: 'storage',
    expanded: false,
    children: [
      { moduleId: 16, label: 'Company Master', icon: 'business', route: '/company-index' },
      { moduleId: 2, label: 'Department Master', icon: 'apartment', route: '/department-master' },
      { moduleId: 3, label: 'Designation Master', icon: 'badge', route: '/designation-master' },
      { moduleId: 4, label: 'State Master', icon: 'location_on', route: '/state-index' },
      { moduleId: 5, label: 'Task Category Master', icon: 'category', route: '/task-category-index' },
      { moduleId: 14, label: 'Service Master', icon: 'miscellaneous_services', route: '/service-index' },
      { moduleId: 9, label: 'Plan Master', icon: 'event_note', route: '/plan-index' },
      { moduleId: 12, label: 'Holiday Master', icon: 'event', route: '/hodiday-index' },
    ],
  },

  // MANAGEMENT MENU
  {
    label: 'Management',
    icon: 'groups',
    expanded: false,
    children: [
      { moduleId: 1, label: 'User Management', icon: 'people', route: '/user-management-index' },
      { moduleId: 8, label: 'Client Master', icon: 'business_center', route: '/client-index' },
    ],
  },

  // TASK MANAGEMENT MENU
  {
    label: 'Task Management',
    icon: 'task_alt',
    expanded: false,
    children: [
      { moduleId: 10, label: 'Tasks', icon: 'assignment', route: '/task-index' },
      { moduleId: 11, label: 'Recurring Master', icon: 'repeat', route: '/recurring-index' },
      { moduleId: 15, label: 'Generic Recurring', icon: 'autorenew', route: '/generic-recurring-index' },
    ],
  },

   // TASK REPORTS MENU
  {
    label: 'Task Reports',
    icon: 'assessment',
    expanded: false,
    children: [
      { moduleId: 13, label: 'Workload Report', icon: 'insights', route: '/workload-report' },
      { moduleId: 17, label: 'Rating Report', icon: 'star_rate', route: '/rating-report' },
      { moduleId: 18, label: 'Reassign Report', icon: 'sync_alt', route: '/reassign-report-index' },
      { moduleId: 19, label: 'Reassign Summary Report', icon: 'manage_accounts', route: '/reassign-summary-report' },
    ],
  },

  // SYSTEM REPORTS MENU
  {
    label: 'System Reports',
    icon: 'admin_panel_settings',
    expanded: false,
    children: [
      { moduleId: 7, label: 'Mail Log Report', icon: 'mail_outline', route: '/mail-log-report' },
      { moduleId: 6, label: 'Access Report', icon: 'security', route: '/access-report' },
    ],
  },

 
];

  }

  // =========================================================
  // FILTER MENU ITEMS BY PERMISSIONS
  // =========================================================

  private filterMenuItems(items: MenuItem[], allowedIds: number[]): MenuItem[] {
    return items
      .map((item) => {
        // Dashboard / special menu
        if (item.moduleId === -1) {
          return { ...item };
        }

        // Parent menu with children
        if (item.children?.length) {
          const filteredChildren = this.filterMenuItems(item.children, allowedIds);

          if (filteredChildren.length === 0) {
            return null;
          }

          return {
            ...item,
            children: filteredChildren,
          };
        }

        // Normal module
        if (item.moduleId !== undefined && allowedIds.includes(Number(item.moduleId))) {
          return { ...item };
        }

        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  // =========================================================
  // SUBMENU ACTIVE STATE
  // =========================================================

  isSubItemActive(subItem: MenuItem): boolean {
    if (subItem.moduleId !== undefined && subItem.moduleId === this.selectedModuleId) {
      return true;
    }

    if (!subItem.route) {
      return false;
    }

    return this.router.isActive(subItem.route, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  isParentActive(item: MenuItem): boolean {
    return !!item.children?.some((child) => this.activeMenu === child.label || this.isSubItemActive(child));
  }

  private expandActiveParents(items: MenuItem[]): void {
    items.forEach((item) => {
      if (!item.children?.length) {
        return;
      }

      if (item.children.some((child) => this.isSubItemActive(child))) {
        item.expanded = true;
      }

      this.expandActiveParents(item.children);
    });
  }

  // =========================================================
  // SELECT MENU AND NAVIGATE
  // =========================================================

  selectMenu(item: MenuItem): void {
    // Parent menu only expands/collapses
    if (item.children?.length) {
      item.expanded = !item.expanded;
      return;
    }

    this.activeMenu = item.label;
    this.selectedModuleId = item.moduleId ?? null;

    const moduleDetail = item.moduleId !== undefined ? this.getModuleDetail(item.moduleId) : null;

    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('selectedModuleDetail', JSON.stringify(moduleDetail));
    }

    if (item.route) {
      this.router.navigate([item.route]);
    }

    // Close sidebar on mobile
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= 900) {
      this.closeSidebar();
    }
  }

  // =========================================================
  // ACTIVE MENU FROM CURRENT ROUTE
  // =========================================================

  private setActiveMenuFromRoute(url: string): void {
    const currentUrl = url.split('?')[0].split('#')[0];

    // Dashboard routes
    if (currentUrl === '/dashboard' || currentUrl === '/employee-dashboard') {
      this.activeMenu = 'Dashboard';
      this.selectedModuleId = null;
      return;
    }

    // Match direct menu routes, including nested report children
    const allItems = this.flattenMenuItems(this.menuItems);

    const activeItem = allItems.find((item) => !!item.route && (currentUrl === item.route || currentUrl.startsWith(item.route + '/')));

    if (activeItem) {
      this.activeMenu = activeItem.label;
      this.selectedModuleId = activeItem.moduleId ?? null;
      return;
    }

    // Other CRUD routes
    const moduleRoutes: {
      label: string;
      moduleId: number;
      routes: string[];
    }[] = [
      {
        label: 'User Management',
        moduleId: 1,
        routes: ['/user-management-index', '/add-user-management', '/edit-user-management', '/view-user-management', '/my-team', '/add-team', '/edit-team', '/view-team'],
      },
      {
        label: 'Department Master',
        moduleId: 2,
        routes: ['/department-master', '/add-department', '/edit-department', '/view-department'],
      },
      {
        label: 'Designation Master',
        moduleId: 3,
        routes: ['/designation-master', '/add-designation', '/edit-designation', '/view-designation'],
      },
      {
        label: 'Tasks',
        moduleId: 10,
        routes: ['/task-index', '/add-task', '/edit-task', '/view-task'],
      },
      {
        label: 'Task Category Master',
        moduleId: 5,
        routes: ['/task-category-index', '/add-task-category', '/edit-task-category', '/view-task-category'],
      },
      {
        label: 'State Master',
        moduleId: 4,
        routes: ['/state-index', '/add-state', '/edit-state', '/view-state'],
      },
      {
        label: 'Client Master',
        moduleId: 8,
        routes: ['/client-index', '/add-client', '/edit-client', '/view-client'],
      },
      {
        label: 'Recurring Master',
        moduleId: 11,
        routes: ['/recurring-index', '/add-recurring', '/edit-recurring', '/view-recurring'],
      },
      {
        label: 'Plan Master',
        moduleId: 9,
        routes: ['/plan-index', '/add-plan', '/edit-plan', '/view-plan'],
      },
      {
        label: 'Holiday Master',
        moduleId: 12,
        routes: ['/hodiday-index'],
      },
    ];

    const activeModule = moduleRoutes.find((module) => module.routes.some((route) => currentUrl === route || currentUrl.startsWith(route + '/')));

    if (activeModule) {
      this.activeMenu = activeModule.label;
      this.selectedModuleId = activeModule.moduleId;
    }
  }

  private flattenMenuItems(items: MenuItem[]): MenuItem[] {
    return items.flatMap((item) => [item, ...(item.children ? this.flattenMenuItems(item.children) : [])]);
  }

  // =========================================================
  // MODULE DETAILS
  // =========================================================

  getModuleDetail(moduleId: number | undefined): any {
    if (moduleId === undefined) {
      return null;
    }

    return this.modules.find((module) => Number(module.moduleId) === Number(moduleId)) || null;
  }

  // =========================================================
  // SETTINGS
  // =========================================================

  openSettings(): void {
    this.router.navigate(['/settings']);
    this.closeSidebar();
  }

  // =========================================================
  // LOGOUT
  // =========================================================

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

  // =========================================================
  // USER INITIALS
  // =========================================================

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

  // =========================================================
  // SHORT USER NAME
  // =========================================================

  getShortName(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0];
    }

    const lastName = parts[parts.length - 1];

    if (parts.length === 2) {
      return `${parts[0].charAt(0).toUpperCase()}. ${lastName}`;
    }

    const initials = parts
      .slice(0, -1)
      .map((part) => part.charAt(0).toUpperCase())
      .join('.');

    return `${initials}. ${lastName}`;
  }
}
