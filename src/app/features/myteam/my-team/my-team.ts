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

  userId: number;

  firstName: string;

  email: string;

  mobile: string;

  status: number;
  departmentName:string;

}

@Component({
  selector: 'app-my-team',
  imports: [CommonModule,
    FormsModule,MatIconModule],
  templateUrl: './my-team.html',
  styleUrl: './my-team.scss',
})
export class MyTeam implements OnInit {
apiResponseDepartmentDetails: any = {};
  // =========================================================
  // USER DATA
  // =========================================================

  users: User[] = [];

  apiResponseUserDetails: any;


  // =========================================================
  // SEARCH
  // =========================================================

  searchQuery = '';

  search = '';

  selectedStatus = '';

  statusIndex = 0;


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  page = 0;

  size = 5;

  totalRecords = 0;

  totalPages = 1;


  // =========================================================
  // SORTING
  // =========================================================

  sortColumn = '';

  sortDirection: 'asc' | 'desc' = 'asc';


  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible = true;


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
  // =========================================================
  // LOADING
  // =========================================================

  isLoading = false;


  // =========================================================
  // SESSION STORAGE KEY
  // =========================================================

  filterKey = 'userManagementFilter';


  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  columns = [

    {
      key: 'firstName',
      label: 'Name',
      sortable: true
    },

    {
      key: 'email',
      label: 'Email Id',
      sortable: true
    },

    {
      key: 'mobile',
      label: 'Mobile No.',
      sortable: true
    },
    {
      key: 'departmenname',
      label: 'Department Name',
      sortable: true
    },

    {
      key: 'status',
      label: 'Status',
      sortable: true
    }

  ];


  constructor(

    private dataprovider: DataProviderService,

    private router: Router,

    @Inject(PLATFORM_ID)
    private platformId: Object

  ) { }


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

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


  // =========================================================
  // GET USERS
  // =========================================================

  getUserDetails(): void {

    this.isLoading = true;

    console.log('GET USERS PARAMS:', {
      page: this.page,
      size: this.size,
      statusIndex: this.statusIndex,
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

          console.log('API RESPONSE:', response);

          this.apiResponseUserDetails = response;

          // -----------------------------------------
          // USERS
          // -----------------------------------------

          this.users = response?.data ?? [];

          console.log('USERS:', this.users);
          console.log('USERS LENGTH:', this.users.length);


          // -----------------------------------------
          // TOTAL RECORDS
          // Backend returns totalElements
          // -----------------------------------------

          this.totalRecords =
            Number(response?.totalElements ?? 0);


          // -----------------------------------------
          // TOTAL PAGES
          // -----------------------------------------

          this.totalPages =
            Math.ceil(
              this.totalRecords / this.size
            );

          if (this.totalPages < 1) {
            this.totalPages = 1;
          }


          // -----------------------------------------
          // SAFETY CHECK
          // -----------------------------------------

          if (
            this.currentPage >
            this.totalPages
          ) {

            this.currentPage =
              this.totalPages;

            this.page =
              this.currentPage - 1;
          }


          // -----------------------------------------
          // PROCESS LIST
          // -----------------------------------------

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


          // -----------------------------------------
          // STOP LOADING
          // -----------------------------------------

          this.isLoading = false;

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

          this.users = [];

          this.totalRecords = 0;

          this.totalPages = 1;

          this.isLoading = false;

        }

      });
  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {

    this.search =
      this.searchQuery
        .trim();


    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);


    // Reset pagination
    this.currentPage = 1;

    this.page = 0;


    this.saveFilterState();


    this.getUserDetails();

  }


  // =========================================================
  // STATUS CHANGE
  // =========================================================

  onStatusChange(): void {

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);


    this.search =
      this.searchQuery
        .trim();


    // Reset pagination
    this.currentPage = 1;

    this.page = 0;


    this.saveFilterState();


    this.getUserDetails();

  }


  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  goToPage(pageNumber: number): void {


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


    /*
     * Backend usually expects zero-based page.
     *
     * Angular:
     * page 1 => backend 0
     * page 2 => backend 1
     * page 3 => backend 2
     */

    this.page =
      pageNumber - 1;


    this.saveFilterState();


    /*
     * IMPORTANT:
     *
     * Don't use router.navigate() here.
     *
     * Just call the API.
     */

    this.getUserDetails();

  }


  // =========================================================
  // FIRST PAGE
  // =========================================================

  goToFirstPage(): void {

    if (
      this.currentPage !== 1
    ) {

      this.goToPage(1);

    }

  }


  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  goToPreviousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.goToPage(
        this.currentPage - 1
      );

    }

  }


  // =========================================================
  // NEXT PAGE
  // =========================================================

  goToNextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.goToPage(
        this.currentPage + 1
      );

    }

  }


  // =========================================================
  // LAST PAGE
  // =========================================================

  goToLastPage(): void {

    if (
      this.currentPage !==
      this.totalPages
    ) {

      this.goToPage(
        this.totalPages
      );

    }

  }


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  pages(): number[] {

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


    // -----------------------------------------------
    // More than five pages
    // -----------------------------------------------

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


  // =========================================================
  // RECORD SUMMARY
  // =========================================================

  get recordSummary(): string {


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


    return (
      `Page ${this.currentPage} of ${this.totalPages}, ` +
      `(${start} - ${end} of ${this.totalRecords} records)`
    );

  }


  // =========================================================
  // RECORDS PER PAGE
  // =========================================================

  onChangeRecordsPerPage(): void {

    this.size =
      Number(this.size);


    if (
      !this.size ||
      this.size < 1
    ) {

      this.size = 5;

    }


    // Reset page
    this.currentPage = 1;

    this.page = 0;


    this.saveFilterState();


    this.getUserDetails();

  }


  // =========================================================
  // SORT
  // =========================================================

  sortData(column: string): void {


    // Same column
    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    }

    // New column
    else {

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


  // =========================================================
  // PANEL TOGGLE
  // =========================================================

  togglePanel(): void {

    this.isPanelVisible =
      !this.isPanelVisible;

  }


  // =========================================================
  // SAVE FILTER STATE
  // =========================================================

  private saveFilterState(): void {


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


  // =========================================================
  // RESTORE FILTER STATE
  // =========================================================

  private restoreFilterState(): void {


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


  // =========================================================
  // ADD USER
  // =========================================================

  addUser() {


    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size
    };

    // Save in sessionStorage (for refresh support)
    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    // Pass via router state (no URL params)
    this.router.navigate(['/add-team'], {
      state: filterState
    });

  }


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
    // console.log('View', userId);

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
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


  // =========================================================
  // EDIT USER
  // =========================================================

  editUser(userId: any) {
    // console.log('View', userId);

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size
    };

    // Save in sessionStorage (for refresh support)
    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    // Pass via router state (no URL params)
    this.router.navigate(['/edit-team', userId], {
      state: filterState
    });

  }


  // =========================================================
  // DELETE USER
  // =========================================================

  onDeleteUser(userId: number): void {

    // Keep your existing delete implementation here.

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

}
