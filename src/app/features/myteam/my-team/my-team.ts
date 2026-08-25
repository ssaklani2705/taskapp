<<<<<<< HEAD
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';

interface User {
=======
import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';

import {
  isPlatformBrowser,
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatIconModule } from '@angular/material/icon';

interface User {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  userId: number;

  firstName: string;

  email: string;

  mobile: string;

  status: number;
<<<<<<< HEAD
=======
  departmentName:string;
  designationName:string;

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
}

@Component({
  selector: 'app-my-team',
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
=======
  imports: [CommonModule,
    FormsModule,MatIconModule],
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  templateUrl: './my-team.html',
  styleUrl: './my-team.scss',
})
export class MyTeam implements OnInit {
<<<<<<< HEAD
=======
apiResponseDepartmentDetails: any = {};
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // USER DATA
  // =========================================================

  users: User[] = [];

  apiResponseUserDetails: any;

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SEARCH
  // =========================================================

  searchQuery = '';

  search = '';

  selectedStatus = '';

  statusIndex = 0;

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  page = 0;

  size = 5;

  totalRecords = 0;

  totalPages = 1;

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SORTING
  // =========================================================

  sortColumn = '';

  sortDirection: 'asc' | 'desc' = 'asc';

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible = true;

<<<<<<< HEAD
  // =========================================================
  // PERMISSIONS
  // =========================================================

  addPer = 'Y';

  editPer = 'Y';

  deletePer = 'Y';

=======

  // =========================================================
  // PERMISSIONS
  // =========================================================
  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  moduleName: string = '';
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // LOADING
  // =========================================================

  isLoading = false;

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SESSION STORAGE KEY
  // =========================================================

  filterKey = 'userManagementFilter';

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  columns = [
<<<<<<< HEAD
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
=======

    {
      key: 'firstName',
      label: 'Name',
      sortable: true
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    },

    {
      key: 'email',
      label: 'Email Id',
<<<<<<< HEAD
      sortable: true,
=======
      sortable: true
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    },

    {
      key: 'mobile',
      label: 'Mobile No.',
<<<<<<< HEAD
      sortable: true,
    },

    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

  constructor(
=======
      sortable: true
    },
    {
      key: 'departmenname',
      label: 'Department Name',
      sortable: true
    },
     {
      key: 'designationName',
      label: 'Designation Name',
      sortable: true
    },
      
    {
      key: 'status',
      label: 'Status',
      sortable: true
    }

  ];


  constructor(

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    private dataprovider: DataProviderService,

    private router: Router,

    @Inject(PLATFORM_ID)
<<<<<<< HEAD
    private platformId: Object,
  ) {}
=======
    private platformId: Object

  ) { }

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
<<<<<<< HEAD
    this.restoreFilterState();

    this.getUserDetails();
  }

=======

    this.restoreFilterState();

    this.getUserDetails();

      if (
          isPlatformBrowser(
            this.platformId
          )
        ) {

          const storedModules =
            sessionStorage.getItem(
              'selectedModuleDetail'
            );
          // alert(storedModules);
          if (storedModules) {

            const parsed =
              JSON.parse(
                storedModules
              );

            this.moduleName =
              parsed.name ?? '';

            this.addPer =
              parsed.addPer ?? 'N';

            this.editPer =
              parsed.editPer ?? 'N';

            this.deletePer =
              parsed.deletePer ?? 'N';

            this.viewPer =
              parsed.viewPer ?? 'N';

            this.approvePer =
              parsed.approvePer ?? 'N';

            this.adminApprovePer =
              parsed.adminApprovePer ?? 'N';
          }
        }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // GET USERS
  // =========================================================

  getUserDetails(): void {
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    this.isLoading = true;

    console.log('GET USERS PARAMS:', {
      page: this.page,
      size: this.size,
      statusIndex: this.statusIndex,
<<<<<<< HEAD
      search: this.search,
    });

    this.dataprovider
      .getUserManagementDetails(this.page, this.size, this.statusIndex, this.search)
      .subscribe({
        next: (response: any) => {
=======
      search: this.search
    });

    this.dataprovider
      .getUserManagementDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search
      )
      .subscribe({

        next: (response: any) => {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
          console.log('API RESPONSE:', response);

          this.apiResponseUserDetails = response;

          // -----------------------------------------
          // USERS
          // -----------------------------------------

          this.users = response?.data ?? [];

          console.log('USERS:', this.users);
          console.log('USERS LENGTH:', this.users.length);

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
          // -----------------------------------------
          // TOTAL RECORDS
          // Backend returns totalElements
          // -----------------------------------------

<<<<<<< HEAD
          this.totalRecords = Number(response?.totalElements ?? 0);
=======
          this.totalRecords =
            Number(response?.totalElements ?? 0);

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

          // -----------------------------------------
          // TOTAL PAGES
          // -----------------------------------------

<<<<<<< HEAD
          this.totalPages = Math.ceil(this.totalRecords / this.size);
=======
          this.totalPages =
            Math.ceil(
              this.totalRecords / this.size
            );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

          if (this.totalPages < 1) {
            this.totalPages = 1;
          }

<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
          // -----------------------------------------
          // SAFETY CHECK
          // -----------------------------------------

<<<<<<< HEAD
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;

            this.page = this.currentPage - 1;
          }

=======
          if (
            this.currentPage >
            this.totalPages
          ) {

            this.currentPage =
              this.totalPages;

            this.page =
              this.currentPage - 1;
          }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
          // -----------------------------------------
          // PROCESS LIST
          // -----------------------------------------

<<<<<<< HEAD
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('processList', JSON.stringify(response?.processList ?? []));
          }

=======
          if (
            isPlatformBrowser(this.platformId)
          ) {

            sessionStorage.setItem(
              'processList',
              JSON.stringify(
                response?.processList ?? []
              )
            );

          }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
          // -----------------------------------------
          // STOP LOADING
          // -----------------------------------------

          this.isLoading = false;

<<<<<<< HEAD
          console.log('LOADING:', this.isLoading);

          console.log('TOTAL RECORDS:', this.totalRecords);

          console.log('TOTAL PAGES:', this.totalPages);
        },

        error: (error: any) => {
          console.error('Error fetching user details:', error);
=======
          console.log(
            'LOADING:',
            this.isLoading
          );

          console.log(
            'TOTAL RECORDS:',
            this.totalRecords
          );

          console.log(
            'TOTAL PAGES:',
            this.totalPages
          );

        },

        error: (error: any) => {

          console.error(
            'Error fetching user details:',
            error
          );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

          this.users = [];

          this.totalRecords = 0;

          this.totalPages = 1;

          this.isLoading = false;
<<<<<<< HEAD
        },
      });
  }

=======

        }

      });
  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
<<<<<<< HEAD
    this.search = this.searchQuery.trim();

    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
=======

    this.search =
      this.searchQuery
        .trim();


    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    // Reset pagination
    this.currentPage = 1;

    this.page = 0;

<<<<<<< HEAD
    this.saveFilterState();

    this.getUserDetails();
  }

=======

    this.saveFilterState();


    this.getUserDetails();

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // STATUS CHANGE
  // =========================================================

  onStatusChange(): void {
<<<<<<< HEAD
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);

    this.search = this.searchQuery.trim();
=======

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);


    this.search =
      this.searchQuery
        .trim();

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    // Reset pagination
    this.currentPage = 1;

    this.page = 0;

<<<<<<< HEAD
    this.saveFilterState();

    this.getUserDetails();
  }

=======

    this.saveFilterState();


    this.getUserDetails();

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  goToPage(pageNumber: number): void {
<<<<<<< HEAD
    // Invalid page
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    // Same page
    if (pageNumber === this.currentPage) {
      return;
    }

    this.currentPage = pageNumber;
=======


    // Invalid page
    if (
      pageNumber < 1 ||
      pageNumber > this.totalPages
    ) {

      return;

    }


    // Same page
    if (
      pageNumber === this.currentPage
    ) {

      return;

    }


    this.currentPage =
      pageNumber;

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    /*
     * Backend usually expects zero-based page.
     *
     * Angular:
     * page 1 => backend 0
     * page 2 => backend 1
     * page 3 => backend 2
     */

<<<<<<< HEAD
    this.page = pageNumber - 1;

    this.saveFilterState();

=======
    this.page =
      pageNumber - 1;


    this.saveFilterState();


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    /*
     * IMPORTANT:
     *
     * Don't use router.navigate() here.
     *
     * Just call the API.
     */

    this.getUserDetails();
<<<<<<< HEAD
  }

=======

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // FIRST PAGE
  // =========================================================

  goToFirstPage(): void {
<<<<<<< HEAD
    if (this.currentPage !== 1) {
      this.goToPage(1);
    }
  }

=======

    if (
      this.currentPage !== 1
    ) {

      this.goToPage(1);

    }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  goToPreviousPage(): void {
<<<<<<< HEAD
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

=======

    if (
      this.currentPage > 1
    ) {

      this.goToPage(
        this.currentPage - 1
      );

    }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // NEXT PAGE
  // =========================================================

  goToNextPage(): void {
<<<<<<< HEAD
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

=======

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.goToPage(
        this.currentPage + 1
      );

    }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // LAST PAGE
  // =========================================================

  goToLastPage(): void {
<<<<<<< HEAD
    if (this.currentPage !== this.totalPages) {
      this.goToPage(this.totalPages);
    }
  }

=======

    if (
      this.currentPage !==
      this.totalPages
    ) {

      this.goToPage(
        this.totalPages
      );

    }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  pages(): number[] {
<<<<<<< HEAD
    const pages: number[] = [];

    // No pages
    if (this.totalPages <= 0) {
      return pages;
    }

    // Five or fewer pages
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

=======

    const pages: number[] = [];


    // No pages
    if (
      this.totalPages <= 0
    ) {

      return pages;

    }


    // Five or fewer pages
    if (
      this.totalPages <= 5
    ) {

      for (
        let i = 1;
        i <= this.totalPages;
        i++
      ) {

        pages.push(i);

      }

      return pages;

    }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    // -----------------------------------------------
    // More than five pages
    // -----------------------------------------------

<<<<<<< HEAD
    let start = Math.max(1, this.currentPage - 2);

    let end = Math.min(this.totalPages, start + 4);

    // Adjust start when near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

=======
    let start =
      Math.max(
        1,
        this.currentPage - 2
      );


    let end =
      Math.min(
        this.totalPages,
        start + 4
      );


    // Adjust start when near the end
    if (
      end - start < 4
    ) {

      start =
        Math.max(
          1,
          end - 4
        );

    }


    for (
      let i = start;
      i <= end;
      i++
    ) {

      pages.push(i);

    }


    return pages;

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // RECORD SUMMARY
  // =========================================================

  get recordSummary(): string {
<<<<<<< HEAD
    if (this.totalRecords === 0) {
      return 'Page 0 of 0, (0 - 0 of 0 records)';
    }

    const start = (this.currentPage - 1) * this.size + 1;

    const end = Math.min(this.currentPage * this.size, this.totalRecords);
=======


    if (
      this.totalRecords === 0
    ) {

      return 'Page 0 of 0, (0 - 0 of 0 records)';

    }


    const start =
      (
        (this.currentPage - 1)
        * this.size
      ) + 1;


    const end =
      Math.min(
        this.currentPage * this.size,
        this.totalRecords
      );

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    return (
      `Page ${this.currentPage} of ${this.totalPages}, ` +
      `(${start} - ${end} of ${this.totalRecords} records)`
    );
<<<<<<< HEAD
  }

=======

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // RECORDS PER PAGE
  // =========================================================

  onChangeRecordsPerPage(): void {
<<<<<<< HEAD
    this.size = Number(this.size);

    if (!this.size || this.size < 1) {
      this.size = 5;
    }

=======

    this.size =
      Number(this.size);


    if (
      !this.size ||
      this.size < 1
    ) {

      this.size = 5;

    }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    // Reset page
    this.currentPage = 1;

    this.page = 0;

<<<<<<< HEAD
    this.saveFilterState();

    this.getUserDetails();
  }

=======

    this.saveFilterState();


    this.getUserDetails();

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SORT
  // =========================================================

  sortData(column: string): void {
<<<<<<< HEAD
    // Same column
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
=======


    // Same column
    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    }

    // New column
    else {
<<<<<<< HEAD
      this.sortColumn = column;

      this.sortDirection = 'asc';
    }

    this.users = [...this.users].sort((a: any, b: any) => {
      let valueA = a[column];

      let valueB = b[column];

      // Status
      if (column === 'status') {
        valueA = Number(valueA);

        valueB = Number(valueB);
      }

      // Convert null
      if (valueA === null || valueA === undefined) {
        valueA = '';
      }

      if (valueB === null || valueB === undefined) {
        valueB = '';
      }

      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();

        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

=======

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';

    }


    this.users =
      [...this.users].sort(
        (a: any, b: any) => {

          let valueA =
            a[column];

          let valueB =
            b[column];


          // Status
          if (
            column === 'status'
          ) {

            valueA =
              Number(valueA);

            valueB =
              Number(valueB);

          }


          // Convert null
          if (
            valueA === null ||
            valueA === undefined
          ) {

            valueA = '';

          }


          if (
            valueB === null ||
            valueB === undefined
          ) {

            valueB = '';

          }


          // String comparison
          if (
            typeof valueA === 'string' &&
            typeof valueB === 'string'
          ) {

            valueA =
              valueA.toLowerCase();

            valueB =
              valueB.toLowerCase();

          }


          if (
            valueA < valueB
          ) {

            return this.sortDirection === 'asc'
              ? -1
              : 1;

          }


          if (
            valueA > valueB
          ) {

            return this.sortDirection === 'asc'
              ? 1
              : -1;

          }


          return 0;

        }
      );

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // PANEL TOGGLE
  // =========================================================

  togglePanel(): void {
<<<<<<< HEAD
    this.isPanelVisible = !this.isPanelVisible;
  }

=======

    this.isPanelVisible =
      !this.isPanelVisible;

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // SAVE FILTER STATE
  // =========================================================

  private saveFilterState(): void {
<<<<<<< HEAD
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const filterState = {
      currentPage: this.currentPage,

      statusIndex: this.statusIndex,

      searchText: this.search,

      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
  }

=======


    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      size:
        this.size

    };


    sessionStorage.setItem(
      this.filterKey,
      JSON.stringify(filterState)
    );

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // RESTORE FILTER STATE
  // =========================================================

  private restoreFilterState(): void {
<<<<<<< HEAD
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = sessionStorage.getItem(this.filterKey);

    if (!stored) {
      return;
    }

    try {
      const filterState = JSON.parse(stored);

      // Page
      if (filterState.currentPage) {
        this.currentPage = Number(filterState.currentPage);
      }

      // Backend page
      this.page = this.currentPage - 1;

      // Status
      if (filterState.statusIndex !== undefined) {
        this.statusIndex = Number(filterState.statusIndex);
      }

      // Search
      if (filterState.searchText !== undefined) {
        this.search = filterState.searchText;

        this.searchQuery = filterState.searchText;
      }

      // Size
      if (filterState.size) {
        this.size = Number(filterState.size);
      }

      // Select status value
      if (this.statusIndex > 0) {
        this.selectedStatus = String(this.statusIndex);
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
  }

=======


    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    const stored =
      sessionStorage.getItem(
        this.filterKey
      );


    if (!stored) {

      return;

    }


    try {

      const filterState =
        JSON.parse(stored);


      // Page
      if (
        filterState.currentPage
      ) {

        this.currentPage =
          Number(
            filterState.currentPage
          );

      }


      // Backend page
      this.page =
        this.currentPage - 1;


      // Status
      if (
        filterState.statusIndex !==
        undefined
      ) {

        this.statusIndex =
          Number(
            filterState.statusIndex
          );

      }


      // Search
      if (
        filterState.searchText !==
        undefined
      ) {

        this.search =
          filterState.searchText;

        this.searchQuery =
          filterState.searchText;

      }


      // Size
      if (
        filterState.size
      ) {

        this.size =
          Number(
            filterState.size
          );

      }


      // Select status value
      if (
        this.statusIndex > 0
      ) {

        this.selectedStatus =
          String(
            this.statusIndex
          );

      }

    }

    catch (error) {

      console.error(
        'Error restoring filter state:',
        error
      );

    }

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // ADD USER
  // =========================================================

  addUser() {
<<<<<<< HEAD
=======


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
<<<<<<< HEAD
      size: this.size,
=======
      size: this.size
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    };

    // Save in sessionStorage (for refresh support)
    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    // Pass via router state (no URL params)
    this.router.navigate(['/add-team'], {
<<<<<<< HEAD
      state: filterState,
    });
  }

=======
      state: filterState
    });

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // VIEW USER
  // =========================================================

  // viewUser(userId: number): void {

  //   // Keep your existing implementation here.

  //   // Example:
  //   // this.router.navigate([
  //   //   '/user-management/view',
  //   //   userId
  //   // ]);

  // }
  viewUser(userId: any) {
<<<<<<< HEAD
=======
    // console.log('View', userId);

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
<<<<<<< HEAD
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-team', userId], {
      state: filterState,
    });
  }

=======
      size: this.size
    };

    // Save in sessionStorage (for refresh support)
    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
    // alert("in");
    // Pass via router state (no URL params)
    this.router.navigate(['/view-team', userId], {
      state: filterState
    });
  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // EDIT USER
  // =========================================================

  editUser(userId: any) {
<<<<<<< HEAD
=======
    // console.log('View', userId);

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
<<<<<<< HEAD
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-team', userId], {
      state: filterState,
    });
  }

=======
      size: this.size
    };

    // Save in sessionStorage (for refresh support)
    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    // Pass via router state (no URL params)
    this.router.navigate(['/edit-team', userId], {
      state: filterState
    });

  }


>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  // =========================================================
  // DELETE USER
  // =========================================================

  onDeleteUser(userId: number): void {
<<<<<<< HEAD
=======

    // Keep your existing delete implementation here.

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  getStatusLabel(status: number | string): string {
    switch (+status) {
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

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'status-badge active';
      case 2:
        return 'status-badge inactive';
      case 3:
        return 'status-badge deleted';
      default:
        return 'status-badge';
    }
  }
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
}
