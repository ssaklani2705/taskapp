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

import {
  DataProviderService,
  DepartmentDTO,
  DesignationDTO
} from '../../../service/data-provider.service';

import {
  MatIconModule
} from '@angular/material/icon';
import Swal from 'sweetalert2';


interface User {

  userId: number;

  firstName: string;

  email: string;

  mobile: string;

  status: number;

  departmentName: string;

  designationName: string;

}


@Component({

  selector: 'app-my-team',

  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],

  templateUrl: './my-team.html',

  styleUrl: './my-team.scss',

})
export class MyTeam implements OnInit {


  // =========================================================
  // API RESPONSE
  // =========================================================

  apiResponseDepartmentDetails: any = {};

  apiResponseUserDetails: any;


  // =========================================================
  // USER DATA
  // =========================================================

  users: User[] = [];


  // =========================================================
  // SEARCH
  // =========================================================

  searchQuery: string = '';

  search: string = '';

  selectedStatus: string = '';

  statusIndex: number = 0;


  // =========================================================
  // DEPARTMENT / DESIGNATION
  // =========================================================

  departmentList: DepartmentDTO[] = [];

  designationList: DesignationDTO[] = [];

  selectedDepartmentId: number | null = null;

  selectedDesignationId: number | null = null;


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage: number = 1;

  page: number = 0;

  size: number = 5;

  totalRecords: number = 0;

  totalPages: number = 1;


  // =========================================================
  // SORTING
  // =========================================================

  sortColumn: string = '';

  sortDirection: 'asc' | 'desc' = 'asc';


  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible: boolean = true;


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

  isLoading: boolean = false;


  // =========================================================
  // SESSION STORAGE KEY
  // =========================================================

  filterKey: string = 'userManagementFilter';


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
      key: 'departmentName',
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


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private dataprovider: DataProviderService,

    private router: Router,

    @Inject(PLATFORM_ID)
    private platformId: Object

  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * First restore all filters
     */
    this.restoreFilterState();


    /*
     * Load dropdowns
     */
    this.loadDepartments();

    this.loadDesignations();


    /*
     * Load users
     */
    this.getUserDetails();


    /*
     * Load permissions
     */
    if (
      isPlatformBrowser(this.platformId)
    ) {

      const storedModules =
        sessionStorage.getItem(
          'selectedModuleDetail'
        );


      if (storedModules) {

        try {

          const parsed =
            JSON.parse(storedModules);


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
        catch (error) {

          console.error(
            'Error parsing selectedModuleDetail:',
            error
          );

        }

      }

    }

  }


  // =========================================================
  // GET USERS
  // =========================================================

  getUserDetails(): void {

    this.isLoading = true;


    console.log(
      'GET USERS PARAMS:',
      {
        page: this.page,
        size: this.size,
        statusIndex: this.statusIndex,
        search: this.search,
        departmentId: this.selectedDepartmentId,
        designationId: this.selectedDesignationId
      }
    );


    this.dataprovider
      .getUserManagementDetails(

        this.page,

        this.size,

        this.statusIndex,

        this.search,

        this.selectedDepartmentId,

        this.selectedDesignationId

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'API RESPONSE:',
            response
          );


          this.apiResponseUserDetails =
            response;


          // =================================================
          // USERS
          // =================================================

          this.users =
            response?.data ?? [];


          // =================================================
          // TOTAL RECORDS
          // =================================================

          this.totalRecords =
            Number(
              response?.totalElements ?? 0
            );


          // =================================================
          // TOTAL PAGES
          // =================================================

          this.totalPages =
            Math.ceil(
              this.totalRecords / this.size
            );


          if (
            this.totalPages < 1
          ) {

            this.totalPages = 1;

          }


          // =================================================
          // PAGE SAFETY
          // =================================================

          if (
            this.currentPage >
            this.totalPages
          ) {

            this.currentPage =
              this.totalPages;

            this.page =
              this.currentPage - 1;

          }


          // =================================================
          // PROCESS LIST
          // =================================================

          if (
            isPlatformBrowser(
              this.platformId
            )
          ) {

            sessionStorage.setItem(

              'processList',

              JSON.stringify(
                response?.processList ?? []
              )

            );

          }


          this.isLoading = false;

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
      this.searchQuery.trim();


    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);


    /*
     * Reset pagination
     */
    this.currentPage = 1;

    this.page = 0;


    /*
     * Save ALL filters
     */
    this.saveFilterState();


    /*
     * Load users
     */
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
      this.searchQuery.trim();


    /*
     * Reset pagination
     */
    this.currentPage = 1;

    this.page = 0;


    /*
     * Save ALL filters
     */
    this.saveFilterState();


    /*
     * Load users
     */
    this.getUserDetails();

  }


  // =========================================================
  // DEPARTMENT / DESIGNATION FILTER
  // =========================================================

  onDepartmentChange(): void {

    this.currentPage = 1;

    this.page = 0;

    this.search =
      this.searchQuery.trim();

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);

    this.saveFilterState();

    this.getUserDetails();

  }


  onDesignationChange(): void {

    this.currentPage = 1;

    this.page = 0;

    this.search =
      this.searchQuery.trim();

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);

    this.saveFilterState();

    this.getUserDetails();

  }


  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  goToPage(
    pageNumber: number
  ): void {

    if (
      pageNumber < 1 ||
      pageNumber > this.totalPages
    ) {

      return;

    }


    if (
      pageNumber === this.currentPage
    ) {

      return;

    }


    this.currentPage =
      pageNumber;


    /*
     * Backend is zero based
     */
    this.page =
      pageNumber - 1;


    this.saveFilterState();


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


    if (
      this.totalPages <= 0
    ) {

      return pages;

    }


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


    this.currentPage = 1;

    this.page = 0;


    this.saveFilterState();


    this.getUserDetails();

  }


  // =========================================================
  // SORT
  // =========================================================

  sortData(
    column: string
  ): void {

    /*
     * Same column
     */
    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    }


    /*
     * New column
     */
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


          /*
           * Status
           */
          if (
            column === 'status'
          ) {

            valueA =
              Number(valueA);

            valueB =
              Number(valueB);

          }


          /*
           * Null handling
           */
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


          /*
           * String comparison
           */
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
  // GET CURRENT FILTER STATE
  // =========================================================

  private getCurrentFilterState(): any {

    return {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      size:
        this.size,

      departmentId:
        this.selectedDepartmentId,

      designationId:
        this.selectedDesignationId

    };

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


    const filterState =
      this.getCurrentFilterState();


    sessionStorage.setItem(

      this.filterKey,

      JSON.stringify(
        filterState
      )

    );

  }


  // =========================================================
  // RESTORE FILTER STATE
  // =========================================================

private restoreFilterState(): void {

  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  const stored = sessionStorage.getItem(this.filterKey);

  if (!stored) {
    return;
  }

  try {

    const filterState = JSON.parse(stored);

    // =====================================================
    // PAGE
    // =====================================================

    if (
      filterState.currentPage !== undefined &&
      filterState.currentPage !== null
    ) {

      const restoredPage = Number(
        filterState.currentPage
      );

      if (
        Number.isFinite(restoredPage) &&
        restoredPage >= 1
      ) {

        this.currentPage = restoredPage;

      } else {

        this.currentPage = 1;

      }

    } else {

      this.currentPage = 1;

    }

    /*
     * Backend page is 0-based
     */
    this.page = this.currentPage - 1;


    // =====================================================
    // STATUS
    // =====================================================

    if (
      filterState.statusIndex !== undefined &&
      filterState.statusIndex !== null
    ) {

      const restoredStatus = Number(
        filterState.statusIndex
      );

      if (Number.isFinite(restoredStatus)) {

        this.statusIndex = restoredStatus;

      } else {

        this.statusIndex = 0;

      }

    } else {

      this.statusIndex = 0;

    }


    // =====================================================
    // SELECTED STATUS
    // =====================================================

    if (this.statusIndex > 0) {

      this.selectedStatus =
        String(this.statusIndex);

    } else {

      this.selectedStatus = '';

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (
      filterState.searchText !== undefined &&
      filterState.searchText !== null
    ) {

      this.search =
        String(filterState.searchText);

      this.searchQuery =
        String(filterState.searchText);

    } else {

      this.search = '';
      this.searchQuery = '';

    }


    // =====================================================
    // PAGE SIZE
    // =====================================================

    if (
      filterState.size !== undefined &&
      filterState.size !== null
    ) {

      const restoredSize =
        Number(filterState.size);

      if (
        Number.isFinite(restoredSize) &&
        restoredSize > 0
      ) {

        this.size = restoredSize;

      }

    }


    // =====================================================
    // DEPARTMENT
    // =====================================================

    if (
      filterState.departmentId !== undefined &&
      filterState.departmentId !== null &&
      filterState.departmentId !== ''
    ) {

      const departmentId =
        Number(filterState.departmentId);

      if (
        Number.isFinite(departmentId) &&
        departmentId > 0
      ) {

        this.selectedDepartmentId =
          departmentId;

      } else {

        this.selectedDepartmentId = null;

      }

    } else {

      this.selectedDepartmentId = null;

    }


    // =====================================================
    // DESIGNATION
    // =====================================================

    if (
      filterState.designationId !== undefined &&
      filterState.designationId !== null &&
      filterState.designationId !== ''
    ) {

      const designationId =
        Number(filterState.designationId);

      if (
        Number.isFinite(designationId) &&
        designationId > 0
      ) {

        this.selectedDesignationId =
          designationId;

      } else {

        this.selectedDesignationId = null;

      }

    } else {

      this.selectedDesignationId = null;

    }


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
      'RESTORED FILTER STATE:',
      {
        currentPage: this.currentPage,
        page: this.page,
        size: this.size,
        search: this.search,
        statusIndex: this.statusIndex,
        selectedStatus: this.selectedStatus,
        departmentId: this.selectedDepartmentId,
        designationId: this.selectedDesignationId
      }
    );

  }
  catch (error) {

    console.error(
      'Error restoring filter state:',
      error
    );

    /*
     * If corrupted JSON is present,
     * remove it so it doesn't keep causing
     * the same problem.
     */
    sessionStorage.removeItem(this.filterKey);

  }

}


  // =========================================================
  // ADD USER
  // =========================================================

  addUser(): void {

    const filterState =
      this.getCurrentFilterState();


    /*
     * Save complete filter state
     */
    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      sessionStorage.setItem(

        this.filterKey,

        JSON.stringify(
          filterState
        )

      );

    }


    /*
     * Navigate
     */
    this.router.navigate(
      ['/add-team'],
      {
        state: filterState
      }
    );

  }


  // =========================================================
  // VIEW USER
  // =========================================================

  viewUser(
    userId: any
  ): void {

    const filterState =
      this.getCurrentFilterState();


    /*
     * Save complete filter state
     */
    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      sessionStorage.setItem(

        this.filterKey,

        JSON.stringify(
          filterState
        )

      );

    }


    /*
     * Navigate
     */
    this.router.navigate(

      [
        '/view-team',
        userId
      ],

      {
        state: filterState
      }

    );

  }


  // =========================================================
  // EDIT USER
  // =========================================================

  editUser(
    userId: any
  ): void {

    const filterState =
      this.getCurrentFilterState();


    /*
     * Save complete filter state
     */
    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      sessionStorage.setItem(

        this.filterKey,

        JSON.stringify(
          filterState
        )

      );

    }


    /*
     * Navigate
     */
    this.router.navigate(

      [
        '/edit-team',
        userId
      ],

      {
        state: filterState
      }

    );

  }


  // =========================================================
  // DELETE USER
  // =========================================================

  // onDeleteUser(
  //   userId: number
  // ): void {

  //   /*
  //    * Keep your existing delete implementation here.
  //    */

  // }

  onDeleteUser(userId: number): void {

  const createdBy = Number(
    sessionStorage.getItem('userId') || 0
  );

  if (!userId) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid User',
      text: 'User ID is missing.'
    });

    return;
  }

  if (!createdBy) {
    Swal.fire({
      icon: 'error',
      title: 'Session Expired',
      text: 'Unable to identify the logged-in user.'
    });

    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this user?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {

    if (!result.isConfirmed) {
      return;
    }

    this.dataprovider
      .deleteUserManagement(userId, String(createdBy))
      .subscribe({

        next: (response: any) => {

          if (response?.success) {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response.message || 'User deleted successfully.',
              timer: 1500,
              showConfirmButton: false
            });

            // Reload user list
            this.getUserDetails();

          } else {

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: response?.message || 'Unable to delete user.'
            });

          }

        },

        error: (error) => {

          console.error(
            'Delete user error:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error?.error?.message ||
              'Something went wrong while deleting the user.'
          });

        }

      });

  });
}


  // =========================================================
  // STATUS LABEL
  // =========================================================

  getStatusLabel(
    status: number | string
  ): string {

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


  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(
    status: number | string
  ): string {

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


  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  loadDepartments(): void {

    this.dataprovider
      .getActiveDepartments()
      .subscribe({

        next:
          (
            response: DepartmentDTO[]
          ) => {

            this.departmentList =
              response;

          },

        error:
          (error) => {

            console.error(
              'Error loading departments',
              error
            );

          }

      });

  }


  // =========================================================
  // LOAD DESIGNATIONS
  // =========================================================

  loadDesignations(): void {

    this.dataprovider
      .getActiveDesigmations()
      .subscribe({

        next:
          (
            response: DesignationDTO[]
          ) => {

            this.designationList =
              response;

          },

        error:
          (error) => {

            console.error(
              'Error loading designations',
              error
            );

          }

      });

  }

}