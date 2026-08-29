import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDividerModule
} from '@angular/material/divider';

import {
  DataProviderService
} from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';



@Component({
  selector: 'app-view-team',
    standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './view-team.html',
  styleUrl: './view-team.scss',
})
export class ViewTeam  implements OnInit {


  // =====================================================
  // USER
  // =====================================================

  userId!: number;

  user: any = {};


  // =====================================================
  // PAGINATION / FILTER STATE
  // =====================================================

  currentPage = 0;

  searchText = '';

  statusIndex = 0;

  page = 0;

  size = 5;


  // =====================================================
  // PERMISSIONS
  // =====================================================

  permissions: {
    [moduleName: string]: any
  } = {};


  permissionActions: string[] = [
    'addPer',
    'editPer',
    'deletePer',
    'approvePer',
    'adminApprovePer',
    'viewPer',
    'exportExcel'
  ];


  permissionGroups: {
    name: string;
    modules: string[];
  }[] = [];


  // =====================================================
  // TRANSACTION HISTORY
  // =====================================================

  transactionhistory: any[] = [];


  // =====================================================
  // COMMON
  // =====================================================

  common = new Common();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,

    private dataprovider: DataProviderService,

    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('userId');

    if (!id) {

      console.error(
        'User ID not found in route'
      );

      this.backToIndexPage();

      return;
    }


    this.userId = Number(id);


    // ---------------------------------------------------
    // GET ROUTER STATE
    // ---------------------------------------------------

    let stateData: any = null;


    const navigation =
      this.router.getCurrentNavigation();


    stateData =
      navigation?.extras?.state;


    // ---------------------------------------------------
    // FALLBACK SESSION STORAGE
    // ---------------------------------------------------

    if (!stateData) {

      const saved =
        sessionStorage.getItem('userFilters');


      if (saved) {

        try {

          stateData =
            JSON.parse(saved);

        } catch (error) {

          console.error(
            'Invalid userFilters data',
            error
          );

        }

      }

    }


    // ---------------------------------------------------
    // RESTORE FILTERS
    // ---------------------------------------------------

    if (stateData) {

      this.currentPage =
        stateData.currentPage ?? 1;

      this.statusIndex =
        stateData.statusIndex ?? 0;

      this.searchText =
        stateData.searchText ?? '';

      this.size =
        stateData.size ?? 5;

    }


    // ---------------------------------------------------
    // GET USER
    // ---------------------------------------------------

    this.getUserDetails();
  }


  // =====================================================
  // GET USER DETAILS
  // =====================================================

  getUserDetails(): void {

    this.dataprovider
      .getUserManagementDetailsById(this.userId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'USER DETAILS:',
            response
          );


          // ------------------------------------------------
          // USER INFORMATION
          // ------------------------------------------------

          this.user = {

            name:
              response?.firstName || 'NA',

            expiryDate:
              response?.expiryDate || null,

            telephone:
              response?.telephone || 'NA',

            email:
              response?.email || 'NA',

            mobile:
              response?.mobileNo || 'NA',

            status:
              response?.status,

            processPermission:
              response?.pcbName || 'NA',

            isAdmin:
              response?.isAdmin === 'Y',

            permission:
              response?.permission,

            departmentName:
              response?.departmentName,

            designationName:
              response?.designationName,

          };


          // ------------------------------------------------
          // TRANSACTION HISTORY
          // ------------------------------------------------

          this.transactionhistory =
            Array.isArray(response?.transactionhistory)
              ? [...response.transactionhistory]
              : [];


          this.transactionhistory.sort(
            (a: any, b: any) => {

              const dateA =
                this.parseEntryDate(
                  a?.entryDate
                );

              const dateB =
                this.parseEntryDate(
                  b?.entryDate
                );


              return (
                dateB.getTime() -
                dateA.getTime()
              );

            }
          );


          // ------------------------------------------------
          // MODULES
          // ------------------------------------------------

          const modules =
            Array.isArray(response?.module)
              ? response.module
              : [];


          // Only modules having view permission
          // configured are displayed

          const filteredModules =
            modules.filter(
              (mod: any) =>
                mod?.viewPer !== null &&
                mod?.viewPer !== undefined
            );


          // ------------------------------------------------
          // MAP PERMISSIONS
          // ------------------------------------------------

          this.permissions =
            this.mapPermissions(
              filteredModules
            );


          // ------------------------------------------------
          // GROUP MODULES
          // ------------------------------------------------

          const groupMap: {
            [type: number]: {
              name: string;
              modules: string[];
            }
          } = {

            1: {
              name: 'Masters',
              modules: []
            },

            2: {
              name: 'Activity',
              modules: []
            },

            3: {
              name: 'Reports - 1',
              modules: []
            }

          };


          filteredModules.forEach(
            (mod: any) => {

              const type =
                Number(mod?.type);

              const name =
                String(mod?.name || '')
                  .trim();


              if (
                groupMap[type] &&
                name
              ) {

                groupMap[type]
                  .modules
                  .push(name);

              }

            }
          );


          // ------------------------------------------------
          // FINAL GROUP LIST
          // ------------------------------------------------

          this.permissionGroups =
            Object.keys(groupMap)

              .sort(
                (a, b) =>
                  Number(a) -
                  Number(b)
              )

              .map(
                key =>
                  groupMap[
                    Number(key)
                  ]
              )

              .filter(
                group =>
                  group.modules.length > 0
              );

        },


        error: (error) => {

          console.error(
            'Failed to fetch user details:',
            error
          );

        }

      });

  }


  // =====================================================
  // MAP PERMISSIONS
  // =====================================================

  mapPermissions(
    modules: any[]
  ): {
    [moduleName: string]: any
  } {

    const perms: {
      [moduleName: string]: any
    } = {};


    modules
      .filter(
        mod =>
          mod?.viewPer !== null &&
          mod?.viewPer !== undefined
      )

      .forEach(
        (mod: any) => {

          const moduleName =
            String(
              mod?.name || ''
            ).trim();


          if (!moduleName) {
            return;
          }


          perms[moduleName] = {

            addPer:
              mod?.addPer === 'Y',

            editPer:
              mod?.editPer === 'Y',

            deletePer:
              mod?.deletePer === 'Y',

            approvePer:
              mod?.approvePer === 'Y',

            adminApprovePer:
              mod?.adminApprovePer === 'Y',

            viewPer:
              mod?.viewPer === 'Y',

            exportExcel:
              mod?.exportExcel === 'Y'

          };

        }
      );


    return perms;

  }


  // =====================================================
  // STATUS TEXT
  // =====================================================

  getStatusText(
    status: number | string
  ): string {

    switch (Number(status)) {

      case 1:
        return 'Active';

      case 2:
        return 'Inactive';

      case 3:
        return 'Deleted';

      default:
        return 'Unknown';

    }

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: number | string
  ): string {

    switch (Number(status)) {

      case 1:
        return 'status-active';

      case 2:
        return 'status-inactive';

      case 3:
        return 'status-deleted';

      default:
        return '';

    }

  }


  // =====================================================
  // PARSE TRANSACTION DATE
  //
  // Example:
  // 08-08-2025 05:53 PM
  // =====================================================

  parseEntryDate(
    dateStr: string
  ): Date {

    if (!dateStr) {
      return new Date(0);
    }


    try {

      const parts =
        dateStr.trim().split(/\s+/);


      const datePart =
        parts[0];

      const timePart =
        parts[1];

      const ampm =
        parts[2];


      const [
        day,
        month,
        year
      ] =
        datePart
          .split('-')
          .map(Number);


      const [
        hourString,
        minuteString
      ] =
        timePart
          .split(':');


      let hour =
        Number(hourString);

      const minute =
        Number(minuteString);


      if (
        ampm === 'PM' &&
        hour < 12
      ) {

        hour += 12;

      }


      if (
        ampm === 'AM' &&
        hour === 12
      ) {

        hour = 0;

      }


      return new Date(
        year,
        month - 1,
        day,
        hour,
        minute
      );

    } catch (error) {

      console.error(
        'Unable to parse date:',
        dateStr
      );

      return new Date(0);

    }

  }


  // =====================================================
  // HAS HISTORY
  // =====================================================

  get hasTransactionHistory(): boolean {

    return (
      Array.isArray(
        this.transactionhistory
      ) &&
      this.transactionhistory.length > 0
    );

  }


  // =====================================================
  // BACK TO INDEX
  // =====================================================

  backToIndexPage(): void {

    const state = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.searchText,

      size:
        this.size

    };


    // Save filters for refresh
    sessionStorage.setItem(
      'userFilters',
      JSON.stringify(state)
    );


    this.router.navigate(
      ['/my-team'],
      {
        state
      }
    );

  }


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  confirmResetPassword(
    email: string,
    userId: number
  ): void {

    const confirmed =
      window.confirm(
        'This will reset the user password and an email will be sent to the user. Do you wish to reset?'
      );


    if (confirmed) {

      this.resetPassword(
        email,
        userId
      );

    }

  }


  // =====================================================
  // RESET PASSWORD API
  // =====================================================

  resetPassword(
    email: string,
    userId: number
  ): void {

    // Add your reset password API here

    console.log(
      'Reset password:',
      {
        email,
        userId
      }
    );

  }

}
