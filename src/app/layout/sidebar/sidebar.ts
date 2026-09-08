import {
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
  PLATFORM_ID,
  HostListener,
  ElementRef,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';

import {
  MatMenuModule,
  MatMenuTrigger
} from '@angular/material/menu';

import { MatButtonModule } from '@angular/material/button';

import { LoginService } from '../../service/login.service';
import { filter } from 'rxjs';


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
    MatMenuModule
  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {

  // =========================================================
  // SIDEBAR INPUT / OUTPUT
  // =========================================================

  @Input()
  opened = true;

  @Output()
  openedChange = new EventEmitter<boolean>();


  // =========================================================
  // DATA
  // =========================================================

  modules: any[] = [];

  menuItems: MenuItem[] = [];

  selectedModuleId: number | null = null;

  activeMenu = 'Dashboard';

  username = '';

  loginType = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private router: Router,

    private loginService: LoginService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private elementRef: ElementRef
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.setActiveMenuFromRoute(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveMenuFromRoute(event.urlAfterRedirects);
      });

    if (isPlatformBrowser(this.platformId)) {

      // ---------------------------------------------
      // Username
      // ---------------------------------------------

      this.username =
        sessionStorage.getItem('username') || '';


      // ---------------------------------------------
      // Modules
      // ---------------------------------------------

      const storedModules =
        sessionStorage.getItem('modules');

      if (storedModules) {

        try {

          this.modules =
            JSON.parse(storedModules);

        } catch (error) {

          console.error(
            'Unable to parse stored modules',
            error
          );

          this.modules = [];
        }
      }


      // ---------------------------------------------
      // Login type
      // ---------------------------------------------

      this.loginType =
        sessionStorage.getItem('loginType') || 'other';


      // ---------------------------------------------
      // Restore selected module
      // ---------------------------------------------

      const storedSelected =
        sessionStorage.getItem(
          'selectedModuleDetail'
        );

      if (storedSelected) {

        try {

          const parsed =
            JSON.parse(storedSelected);

          this.selectedModuleId =
            parsed?.moduleId || null;

        } catch (error) {

          console.error(
            'Unable to parse selected module',
            error
          );

          this.selectedModuleId = null;
        }
      }
    }


    // =====================================================
    // FILTER MENU
    // =====================================================

    const allowedModuleIds =
      this.modules.map(
        (m) => m.moduleId
      );

    this.menuItems =
      this.filterMenuItems(
        this.getInitialMenu(),
        allowedModuleIds
      );


    // =====================================================
    // EXPAND ACTIVE PARENTS
    // =====================================================

    this.expandActiveParents(
      this.menuItems
    );
  }


  // =========================================================
  // OUTSIDE CLICK - MOBILE
  // =========================================================

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    // ---------------------------------------------
    // Only browser
    // ---------------------------------------------

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }


    // ---------------------------------------------
    // Only mobile
    // ---------------------------------------------

    if (window.innerWidth > 900) {
      return;
    }


    // ---------------------------------------------
    // Sidebar already closed
    // ---------------------------------------------

    if (!this.opened) {
      return;
    }


    const target =
      event.target as Node;


    // ---------------------------------------------
    // Check if click is inside sidebar
    // ---------------------------------------------

    const sidebarElement =
      this.elementRef.nativeElement
        .querySelector('.sidebar');


    if (
      sidebarElement &&
      sidebarElement.contains(target)
    ) {

      // Click happened inside sidebar.
      // Do nothing.
      return;
    }


    // ---------------------------------------------
    // Click happened outside
    // ---------------------------------------------

    this.closeSidebar();
  }


  // =========================================================
  // CLOSE SIDEBAR
  // =========================================================

  closeSidebar(): void {

    if (!this.opened) {
      return;
    }

    this.opened = false;

    this.openedChange.emit(false);
  }


  // =========================================================
  // OPEN SIDEBAR
  // =========================================================

  openSidebar(): void {

    this.opened = true;

    this.openedChange.emit(true);
  }


  // =========================================================
  // TOGGLE SIDEBAR
  // =========================================================

  toggleSidebar(): void {

    if (this.opened) {

      this.closeSidebar();

    } else {

      this.openSidebar();
    }
  }


  // =========================================================
  // SUB MENU ACTIVE
  // =========================================================

  isSubItemActive(
    subItem: MenuItem
  ): boolean {

    return (

      subItem.moduleId ===
      this.selectedModuleId

      ||

      (
        subItem.route
          ? !!this.router.isActive(
              subItem.route,
              {
                paths: 'exact',
                queryParams: 'ignored',
                fragment: 'ignored',
                matrixParams: 'ignored'
              }
            )
          : false
      )
    );
  }


  // =========================================================
  // EXPAND ACTIVE PARENTS
  // =========================================================

  private expandActiveParents(
    items: MenuItem[]
  ): void {

    items.forEach((item) => {

      if (item.children) {

        if (
          item.children.some(
            (child) =>
              this.isSubItemActive(child)
          )
        ) {

          item.expanded = true;
        }

        this.expandActiveParents(
          item.children
        );
      }
    });
  }


  // =========================================================
  // FILTER MENU ITEMS
  // =========================================================

  private filterMenuItems(
    items: MenuItem[],
    allowedIds: number[]
  ): MenuItem[] {

    return items

      .map((item) => {

        // Dashboard / special menu
        if (item.moduleId === -1) {

          return {
            ...item
          };
        }


        // Parent with children
        if (
          item.children &&
          item.children.length > 0
        ) {

          const filteredChildren =
            this.filterMenuItems(
              item.children,
              allowedIds
            );


          if (
            filteredChildren.length > 0
          ) {

            return {
              ...item,
              children: filteredChildren
            };
          }
        }


        // Normal module
        if (
          item.moduleId !== undefined &&
          allowedIds.includes(
            item.moduleId
          )
        ) {

          return {
            ...item
          };
        }


        return null;
      })

      .filter(
        (item): item is MenuItem =>
          item !== null
      );
  }


  // =========================================================
  // MENU CONFIGURATION
  // =========================================================

  private getInitialMenu(): MenuItem[] {

    // =====================================================
    // MANAGER
    // =====================================================

    if (this.loginType === 'manager') {

      return [

        {
          moduleId: -1,

          label: 'Dashboard',

          icon: 'dashboard',

          route: '/dashboard'
        },

        {
          moduleId: 11,

          label: 'Recurring Master',

          icon: 'bar_chart',

          route: '/recurring-index'
        },

        {
          moduleId: 10,

          label: 'Tasks',

          icon: 'task_alt',

          route: '/task-index'
        }

      ];
    }


    // =====================================================
    // OTHER USERS
    // =====================================================

    return [

      {
        moduleId: -1,

        label: 'Dashboard',

        icon: 'dashboard',

        route: '/employee-dashboard'
      },

      {
        moduleId: 2,

        label: 'Department Master',

        icon: 'groups',

        route: '/department-master'
      },

      {
        moduleId: 3,

        label: 'Designation Master',

        icon: 'badge',

        route: '/designation-master'
      },

      {
        moduleId: 1,

        label: 'User Management',

        icon: 'groups',

        route: '/my-team'
      },

      {
        moduleId: 5,

        label: 'Task Category Master',

        icon: 'task_alt',

        route: '/task-category-index'
      },

      {
        moduleId: 4,

        label: 'State Master',

        icon: 'bar_chart',

        route: '/state-index'
      },

        {
        moduleId: 9,

        label: 'Plan Master',

        icon: 'bar_chart',

        route: '/plan-index'
      },

       {
        moduleId: 8,

        label: 'Client Master',

        icon: 'business',

        route: '/client-index'
      },

      {
        moduleId: 10,

        label: 'Tasks',

        icon: 'task_alt',

        route: '/task-index'
      },

     

      

    

      {
        label: 'Reports',

        icon: 'bar_chart',

        route: '/reports'
      }

    ];
  }


  // =========================================================
  // PARENT ACTIVE
  // =========================================================

  isParentActive(
    item: MenuItem
  ): boolean {

    if (!item.children) {
      return false;
    }

    return item.children.some(
      (child) =>
        this.isSubItemActive(child)
    );
  }


  // =========================================================
  // SETTINGS
  // =========================================================

  openSettings(): void {

    this.router.navigate([
      '/settings'
    ]);

    this.closeSidebar();
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  onLogout(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }


    // ---------------------------------------------
    // Get login type BEFORE clearing session
    // ---------------------------------------------

    const loginType =
      sessionStorage.getItem(
        'loginType'
      ) || 'other';


    // ---------------------------------------------
    // Redirect URL
    // ---------------------------------------------

    const redirectUrl =
      loginType === 'manager'
        ? '/manager-login'
        : '/login';


    // ---------------------------------------------
    // Logout API
    // ---------------------------------------------

    const logoutRequest =
      this.loginService.logout();


    // ---------------------------------------------
    // No logout request
    // ---------------------------------------------

    if (!logoutRequest) {

      this.loginService.clearSession();

      this.router.navigate([
        redirectUrl
      ]);

      return;
    }


    // ---------------------------------------------
    // Logout request
    // ---------------------------------------------

    logoutRequest.subscribe({

      next: () => {

        this.loginService.clearSession();

        this.router.navigate([
          redirectUrl
        ]);
      },

      error: () => {

        this.loginService.clearSession();

        this.router.navigate([
          redirectUrl
        ]);
      }

    });
  }


  // =========================================================
  // GET MODULE DETAIL
  // =========================================================

  getModuleDetail(
    moduleId: any
  ) {

    return (
      this.modules.find(
        (m) =>
          m.moduleId === moduleId
      ) || null
    );
  }


  // =========================================================
  // SELECT MENU
  // =========================================================

  selectMenu(
    item: MenuItem
  ): void {

    // ---------------------------------------------
    // Active menu
    // ---------------------------------------------

    this.activeMenu =
      item.label;


    // ---------------------------------------------
    // Selected module
    // ---------------------------------------------

    this.selectedModuleId =
      item.moduleId ?? null;


    // ---------------------------------------------
    // Module detail
    // ---------------------------------------------

    const moduleDetail =
      this.getModuleDetail(
        item.moduleId
      );


    // ---------------------------------------------
    // Store selected module
    // ---------------------------------------------

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      sessionStorage.setItem(
        'selectedModuleDetail',
        JSON.stringify(
          moduleDetail
        )
      );
    }


    // ---------------------------------------------
    // Navigate
    // ---------------------------------------------

    if (item.route) {

      this.router.navigate([
        item.route
      ]);
    }


    // ---------------------------------------------
    // Close on mobile
    // ---------------------------------------------

    if (
      isPlatformBrowser(
        this.platformId
      ) &&
      window.innerWidth <= 900
    ) {

      this.closeSidebar();
    }
  }


  // =========================================================
  // GET INITIALS
  // =========================================================

  getInitials(
    name: string
  ): string {

    if (!name) {
      return '';
    }


    const parts =
      name
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }


  // =========================================================
  // GET SHORT NAME
  // =========================================================

  getShortName(
    name: string
  ): string {

    if (!name) {
      return '';
    }


    const parts =
      name
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0];
    }


    const lastName =
      parts[parts.length - 1];


    // ---------------------------------------------
    // Two words
    // Example:
    // S. Saklani
    // ---------------------------------------------

    if (parts.length === 2) {

      return `${parts[0].charAt(0).toUpperCase()}. ${lastName}`;
    }


    // ---------------------------------------------
    // Three or more words
    // Example:
    // A.C. Thakur
    // ---------------------------------------------

    const initials =
      parts
        .slice(0, -1)
        .map(
          part =>
            part
              .charAt(0)
              .toUpperCase()
        )
        .join('.');


    return `${initials}. ${lastName}`;
  }

  // private setActiveMenuFromRoute(url: string): void {
  //   const currentUrl = url.split('?')[0].split('#')[0];

  //   const activeItem = this.menuItems.find((item) => {
  //     return item.route === currentUrl;
  //   });

  //   if (activeItem) {
  //     this.activeMenu = activeItem.label;
  //     this.selectedModuleId = activeItem.moduleId ?? null;
  //   }
  // }

  private setActiveMenuFromRoute(url: string): void {
  const currentUrl = url.split('?')[0].split('#')[0];

  const moduleRoutes: {
    label: string;
    moduleId: number;
    routes: string[];
  }[] = [
    {
      label: 'User Management',
      moduleId: 1,
      routes: [
        '/my-team',
        '/add-team',
        '/edit-team',
        '/view-team',
      ],
    },
    {
      label: 'Department',
      moduleId: 2,
      routes: [
        '/department-master',
        '/add-department',
        '/edit-department',
        '/view-department',
      ],
    },
    {
      label: 'Designation',
      moduleId: 3,
      routes: [
        '/designation-master',
        '/add-designation',
        '/edit-designation',
        '/view-designation',
      ],
    },
    {
      label: 'Tasks',
      moduleId: 10,
      routes: [
        '/task-index',
        '/add-task',
        '/edit-task',
        '/view-task',
      ],
    },
    {
      label: 'Task Category',
      moduleId: 5,
      routes: [
        '/task-category-index',
        '/add-task-category',
        '/edit-task-category',
        '/view-task-category',
      ],
    },
    {
      label: 'State',
      moduleId: 4,
      routes: [
        '/state-index',
        '/add-state',
        '/edit-state',
        '/view-state',
      ],
    },
    {
      label: 'Client',
      moduleId: 8,
      routes: [
        '/client-index',
        '/add-client',
        '/edit-client',
        '/view-client',
      ],
    },
    {
      label: 'Recurring Master',
      moduleId: 11,
      routes: [
        '/recurring-index',
        '/add-recurring',
        '/edit-recurring',
        '/view-recurring',
      ],
    },
    {
      label: 'Plan Master',
      moduleId: 9,
      routes: [
        '/plan-index',
        '/add-plan',
        '/edit-plan',
        '/view-plan',
      ],
    },
  ];

  const activeModule = moduleRoutes.find((module) =>
    module.routes.some(
      (route) =>
        currentUrl === route ||
        currentUrl.startsWith(route + '/')
    )
  );

  if (activeModule) {
    this.activeMenu = activeModule.label;
    this.selectedModuleId = activeModule.moduleId;
    return;
  }

  const activeItem = this.menuItems.find(
    (item) => item.route === currentUrl
  );

  if (activeItem) {
    this.activeMenu = activeItem.label;
    this.selectedModuleId = activeItem.moduleId ?? null;
  }
}

}
