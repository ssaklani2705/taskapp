import {
  Component,
  Input,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import {
  filter
} from 'rxjs/operators';


/* =========================================================
   MENU INTERFACE
   ========================================================= */

interface MenuItem {

  moduleId?: number;

  label: string;

  icon?: string;

  route?: string;

  expanded?: boolean;

  children?: MenuItem[];

  title?: string;
}


/* =========================================================
   SIDEBAR
   ========================================================= */

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
export class Sidebar implements OnInit {


  /* =======================================================
     INPUT
     ======================================================= */

  @Input()
  opened = true;


  /* =======================================================
     USER
     ======================================================= */

  username = '';

  userInitials = 'U';


  /* =======================================================
     MODULES FROM SESSION
     ======================================================= */

  modules: any[] = [];


  /* =======================================================
     FINAL SIDEBAR MENU
     ======================================================= */

  menuItems: MenuItem[] = [];


  /* =======================================================
     CURRENT ACTIVE MENU
     ======================================================= */

  activeMenu = '';


  /* =======================================================
     CONSTRUCTOR
     ======================================================= */

  constructor(
    private router: Router,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}


  /* =======================================================
     INIT
     ======================================================= */

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }


    /* =====================================================
       GET USERNAME
       ===================================================== */

    this.username =
      sessionStorage.getItem('username') ||
      'Society 123';


    /* =====================================================
       CREATE USER INITIALS
       ===================================================== */

    this.userInitials =
      this.getInitials(this.username);


    /* =====================================================
       GET MODULES
       ===================================================== */

    const storedModules =
      sessionStorage.getItem('modules');


    if (storedModules) {

      try {

        this.modules =
          JSON.parse(storedModules);

      } catch (error) {

        console.error(
          'Unable to parse modules from sessionStorage',
          error
        );

        this.modules = [];
      }

    }


    /* =====================================================
       GET ALLOWED MODULE IDS
       ===================================================== */

    const allowedModuleIds =
      this.modules.map(
        module => Number(module.moduleId)
      );


    /* =====================================================
       CREATE MENU
       ===================================================== */

    const initialMenu =
      this.getInitialMenu();


    /* =====================================================
       FILTER MENU ACCORDING TO USER PERMISSION
       ===================================================== */

    const filteredMenu =
      this.filterMenuItems(
        initialMenu,
        allowedModuleIds
      );


    /* =====================================================
       FLATTEN MENU FOR NEW SIDEBAR DESIGN
       ===================================================== */

    this.menuItems =
      this.flattenMenu(filteredMenu);


    /* =====================================================
       SET ACTIVE MENU
       ===================================================== */

    this.setActiveMenu();


    /* =====================================================
       LISTEN TO ROUTE CHANGES
       ===================================================== */

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        this.setActiveMenu();

      });

  }


  /* =======================================================
     INITIAL MENU CONFIGURATION
     ======================================================= */

  private getInitialMenu(): MenuItem[] {

    return [

      /* =====================================================
         DASHBOARD
         ===================================================== */

      {
        moduleId: -1,

        label: 'Dashboard',

        icon: 'dashboard',

        route: '/dashboard',

        title: 'Dashboard'
      },


      /* =====================================================
         MASTERS
         ===================================================== */

      {
        label: 'Masters',

        icon: 'business_center',

        expanded: false,

        title: 'Masters',

        children: [

          {
            moduleId: 1,

            label: 'User Management',

            icon: 'people',

            route: '/my-team'
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
            moduleId: 4,

            label: 'State Master',

            icon: 'location_on',

            route: '/state-master'
          },

          {
            moduleId: 5,

            label: 'Task Category',

            icon: 'category',

            route: '/task-category-master'
          },

          {
            moduleId: 8,

            label: 'Client Master',

            icon: 'business',

            route: '/client-master'
          },

          {
            moduleId: 9,

            label: 'Vendor Master',

            icon: 'store',

            route: '/vendor-master'
          }

        ]
      },


      /* =====================================================
         ACTIVITY
         ===================================================== */

      {
        label: 'Activity',

        icon: 'task_alt',

        expanded: false,

        title: 'Activity',

        children: [

          {
            moduleId: 22,

            label: 'Opening Balance',

            icon: 'account_balance',

            route: '/opening-balance'
          },

          {
            moduleId: 17,

            label: 'Purchase Module',

            icon: 'shopping_cart',

            route: '/purchase-master'
          },

          {
            moduleId: 12,

            label: 'Quotation Module',

            icon: 'request_quote',

            route: '/quotation-master'
          },

          {
            moduleId: 19,

            label: 'Issue of Raw Material',

            icon: 'inventory_2',

            route: '/issue-of-raw-material'
          },

          {
            moduleId: 16,

            label: 'Sales Order',

            icon: 'receipt_long',

            route: '/sales-order-master'
          }

        ]
      },


      /* =====================================================
         REPORTS
         ===================================================== */

      {
        label: 'Reports',

        icon: 'bar_chart',

        expanded: false,

        title: 'Reports',

        children: [

          {
            moduleId: 11,

            label: 'Inventory Report',

            icon: 'inventory',

            route: '/inventory-report'
          },

          {
            moduleId: 10,

            label: 'Inventory Transaction',

            icon: 'swap_horiz',

            route: '/inventory-transaction'
          },

          {
            moduleId: 13,

            label: 'Purchase Report',

            icon: 'shopping_cart',

            route: '/purchase-report-index'
          },

          {
            moduleId: 14,

            label: 'GRN Detail Report',

            icon: 'description',

            route: '/grn-report-index'
          },

          {
            moduleId: 15,

            label: 'Dispatch Report',

            icon: 'local_shipping',

            route: '/dispatch-report-index'
          },

          {
            moduleId: 20,

            label: 'Issue Of Raw Material Report',

            icon: 'inventory_2',

            route: '/issue-of-raw-material-report'
          },

          {
            moduleId: 21,

            label: 'Sales Detail Report',

            icon: 'point_of_sale',

            route: '/sales-order-report'
          },

          {
            moduleId: 18,

            label: 'Follow-Up Report',

            icon: 'follow_the_signs',

            route: '/follow-up-report'
          },

          {
            moduleId: 7,

            label: 'Maillog Report',

            icon: 'mail',

            route: '/maillog-report'
          },

          {
            moduleId: 6,

            label: 'Access Report',

            icon: 'security',

            route: '/access-report'
          }

        ]
      }

    ];

  }


  /* =======================================================
     FILTER MENU BASED ON USER MODULE PERMISSIONS
     ======================================================= */

  private filterMenuItems(
    items: MenuItem[],
    allowedIds: number[]
  ): MenuItem[] {

    return items

      .map(item => {

        /* -----------------------------------------------
           Dashboard should always be visible
           ----------------------------------------------- */

        if (item.moduleId === -1) {

          return {
            ...item
          };

        }


        /* -----------------------------------------------
           Parent menu
           ----------------------------------------------- */

        if (
          item.children &&
          item.children.length > 0
        ) {

          const filteredChildren =
            this.filterMenuItems(
              item.children,
              allowedIds
            );


          /*
           * Only show parent if it has
           * at least one permitted child.
           */

          if (filteredChildren.length > 0) {

            return {

              ...item,

              children: filteredChildren

            };

          }

        }


        /* -----------------------------------------------
           Individual module
           ----------------------------------------------- */

        if (
          item.moduleId !== undefined &&
          allowedIds.includes(
            Number(item.moduleId)
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


  /* =======================================================
     FLATTEN PARENT / CHILD MENU
     
     Masters
       User Management
       Department Master

     becomes:

       User Management
       Department Master

     This matches your new sidebar design.
     ======================================================= */

  private flattenMenu(
    items: MenuItem[]
  ): MenuItem[] {

    const result: MenuItem[] = [];


    items.forEach(item => {

      /* -----------------------------------------------
         Item without children
         ----------------------------------------------- */

      if (
        !item.children ||
        item.children.length === 0
      ) {

        result.push({
          ...item
        });

        return;

      }


      /* -----------------------------------------------
         Parent with children
         ----------------------------------------------- */

      item.children.forEach(child => {

        result.push({
          ...child
        });

      });

    });


    return result;

  }


  /* =======================================================
     SELECT MENU
     ======================================================= */

  selectMenu(
    item: MenuItem
  ): void {

    if (!item.route) {
      return;
    }


    /* -----------------------------------------------
       Set active menu
       ----------------------------------------------- */

    this.activeMenu =
      item.label;


    /* -----------------------------------------------
       Save selected module
       ----------------------------------------------- */

    if (
      isPlatformBrowser(this.platformId)
    ) {

      const moduleDetail =
        this.getModuleDetail(
          item.moduleId
        );


      sessionStorage.setItem(
        'selectedModuleDetail',

        JSON.stringify(
          moduleDetail
        )
      );

    }


    /* -----------------------------------------------
       Navigate
       ----------------------------------------------- */

    this.router.navigate([
      item.route
    ]);

  }


  /* =======================================================
     GET MODULE DETAILS
     ======================================================= */

  private getModuleDetail(
    moduleId?: number
  ): any {

    if (
      moduleId === undefined ||
      moduleId === -1
    ) {

      return null;

    }


    return this.modules.find(
      module =>
        Number(module.moduleId) ===
        Number(moduleId)
    ) || null;

  }


  /* =======================================================
     ACTIVE MENU
     ======================================================= */

  isMenuActive(
    item: MenuItem
  ): boolean {

    if (!item.route) {
      return false;
    }


    return this.router.isActive(
      item.route,
      {
        paths: 'exact',

        queryParams: 'ignored',

        fragment: 'ignored',

        matrixParams: 'ignored'
      }
    );

  }


  /* =======================================================
     SET ACTIVE MENU FROM CURRENT ROUTE
     ======================================================= */

  private setActiveMenu(): void {

    const currentUrl =
      this.router.url;


    const activeItem =
      this.menuItems.find(
        item =>
          item.route &&
          currentUrl.startsWith(
            item.route
          )
      );


    if (activeItem) {

      this.activeMenu =
        activeItem.label;

    }

  }


  /* =======================================================
     USER INITIALS
     ======================================================= */

  private getInitials(
    name: string
  ): string {

    if (!name) {
      return 'U';
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
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }

}
