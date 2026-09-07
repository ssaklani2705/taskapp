import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  ActivatedRoute,
  Router,
  RouterModule,
} from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';

import Swal from 'sweetalert2';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";


interface TaskCategory {
  taskcategoryId: number;
  departmentId: number;
  departmentName: string;
  name: string;
  status: number;
  userId?: number;
  regdate?: any;
  moddate?: any;
}

interface Department {
  departmentId: number;
  name: string;
}

@Component({
  selector: 'app-index-task-category',

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIcon,
    MatDivider
  ],

  templateUrl: './task-category-index.html',
  styleUrl: './task-category-index.scss',
})
export class IndexTaskCategory {

  taskCategories: TaskCategory[] = [];

  apiResponseTaskCategoryDetails: any = {};

  searchQuery: string = '';
  search: string = '';

  /* Pagination */
  currentPage: number = 1;
  page: number = 0;

  recordsPerPage: number =
    environment.recordsPerPage;

  size: number =
    environment.size;

  /* Status */
  selectedStatus: string = '';
  statusIndex: number = 0;

  /* Department */
  selectedDepartment: string = '';

  departments: Department[] = [];

  /* Permissions */
  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';

  selectedmodules: any[] = [];

  createdBy: any;
  userId: any;

  moduleName: string = '';

  common = new Common();

  taskCategory: any = {};

  isPanelVisible: boolean = true;

  showHeaderBar: boolean = true;

  filterKey =
    SESSION_KEYS.TASK_CATEGORY_MASTER_FILTER;

  constructor(
    private dataprovider: DataProviderService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private router: Router,

    private route: ActivatedRoute,

    private sessionService: SessionStorageService,
  ) { }

  ngOnInit(): void {

    this.sessionService.clearOtherSessions(
      this.filterKey
    );

    this.route.queryParams.subscribe(params => {
     this.currentPage =
  +(params['currentPage'] || 1);

this.statusIndex =
  +(params['statusIndex'] || 0);

this.selectedStatus =
  this.statusIndex === 0
    ? ''
    : String(this.statusIndex);

this.search =
  params['searchText'] || '';

this.searchQuery =
  this.search;

this.selectedDepartment =
  params['departmentId'] || '';

this.page =
  +(params['page'] ?? (this.currentPage - 1));

this.size =
  +(params['size'] || 5);

this.recordsPerPage =
  this.size;

      /* User ID */
      if (
        isPlatformBrowser(
          this.platformId
        )
      ) {
        this.userId =
          sessionStorage.getItem(
            'userId'
          );
      }

      /* Permissions */
      if (
        isPlatformBrowser(
          this.platformId
        )
      ) {

        const storedModules =
          sessionStorage.getItem(
            'selectedModuleDetail'
          );

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

      /* Restore filter state */
      let stateData: any = null;

      const nav =
        this.router.getCurrentNavigation();

      stateData =
        nav?.extras?.state;

      if (!stateData) {

        const saved =
          sessionStorage.getItem(
            this.filterKey
          );

        if (saved) {

          stateData =
            JSON.parse(saved);
        }
      }

     
      if (
  stateData &&
  !params['searchText'] &&
  !params['statusIndex'] &&
  !params['departmentId']
) {

  this.currentPage =
    stateData.currentPage || 1;

  this.page =
    stateData.page ??
    (this.currentPage - 1);

  this.statusIndex =
    Number(
      stateData.statusIndex || 0
    );

  this.selectedStatus =
    this.statusIndex === 0
      ? ''
      : String(this.statusIndex);

  this.search =
    stateData.searchText || '';

  this.searchQuery =
    this.search;

  this.size =
    stateData.size || this.size;

  this.recordsPerPage =
    this.size;

  this.selectedDepartment =
    stateData.departmentId
      ? String(stateData.departmentId)
      : '';
}


      this.getDepartments();

      this.getTaskCategoryDetails();
    });
  }

  /* Panel */
  togglePanel(): void {

    this.isPanelVisible =
      !this.isPanelVisible;
  }

  /* Departments */
  getDepartments(): void {

    this.dataprovider
      .getActiveDepartments()
      .subscribe({
        next: (response: any) => {

          if (Array.isArray(response)) {

            this.departments =
              response;

          } else if (
            response?.data &&
            Array.isArray(
              response.data
            )
          ) {

            this.departments =
              response.data;

          } else {

            this.departments = [];
          }
        },

        error: (error) => {

          console.error(
            'Error fetching departments:',
            error
          );

          this.departments = [];
        },
      });
  }

  /* Get Task Categories */
  getTaskCategoryDetails(): void {

    this.dataprovider
      .getTaskCategoryDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search,
        this.selectedDepartment
      )
      .subscribe({

        next: (response: any) => {

          this.apiResponseTaskCategoryDetails =
            response;

          this.taskCategories =
            response?.data || [];
        },

        error: (error) => {

          console.error(
            'Error fetching task category details:',
            error
          );

          this.taskCategories = [];

          this.apiResponseTaskCategoryDetails =
          {
            totalElements: 0,
            data: [],
          };
        },
      });
  }

  /* Current page records */
  get paginatedTaskCategories(): TaskCategory[] {

    return this.taskCategories;
  }

  /* Search */
  onSearch(): void {

  // ============================================================
  // SEARCH
  // ============================================================

  this.search =
    this.searchQuery
      ? this.searchQuery.trim()
      : '';


  // ============================================================
  // STATUS
  // ============================================================

  this.statusIndex =
    this.selectedStatus === ''
      ? 0
      : Number(this.selectedStatus);


  // ============================================================
  // RESET PAGE
  // ============================================================

  this.currentPage = 1;

  this.page = 0;


  // ============================================================
  // FILTER STATE
  // ============================================================

  const state = {

    currentPage:
      this.currentPage,

    statusIndex:
      this.statusIndex,

    searchText:
      this.search,

    departmentId:
      this.selectedDepartment || '',

    page:
      this.page,

    size:
      this.size
  };


  // ============================================================
  // SAVE FILTER STATE
  // ============================================================

  this.sessionService.setItem(
    this.filterKey,
    JSON.stringify(state)
  );


  // ============================================================
  // NAVIGATE
  // ============================================================

  this.router
    .navigate(
      ['/task-category-index'],
      {
        queryParams: state
      }
    )
    .then(() => {

      this.getTaskCategoryDetails();

    });

}


  /* Pagination */
 goToPage(pageNumber: number): void {

  if (
    pageNumber < 1 ||
    pageNumber > this.totalPages
  ) {
    return;
  }


  this.currentPage =
    pageNumber;

  this.page =
    pageNumber - 1;


  const state = {

    currentPage:
      this.currentPage,

    statusIndex:
      this.statusIndex,

    searchText:
      this.search,

    departmentId:
      this.selectedDepartment || '',

    page:
      this.page,

    size:
      this.size
  };


  this.sessionService.setItem(
    this.filterKey,
    JSON.stringify(state)
  );


  this.router.navigate(
    ['/task-category-index'],
    {
      queryParams: state
    }
  ).then(() => {

    this.getTaskCategoryDetails();

  });

}


  goToFirstPage(): void {

    this.goToPage(1);
  }

  goToLastPage(): void {

    this.goToPage(
      this.totalPages
    );
  }

  /* Delete */
  onDeleteTaskCategory(
    taskcategoryId: number
  ): void {

    this.taskCategory.taskcategoryId =
      taskcategoryId;

    this.taskCategory.userId =
      this.userId
        ? Number(this.userId)
        : null;

    Swal.fire({

      title:
        'Are you sure?',

      text:
        'Do you really want to delete this task category?',

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Yes, delete it!',

      cancelButtonText:
        'No, keep it',
        customClass: {
    popup: 'small-confirm-popup'
  }

    }).then((result) => {

      if (
        result.isConfirmed
      ) {

        this.dataprovider
          .deleteTaskCategory(
            this.taskCategory
          )
          .subscribe({

            next:
              (response: any) => {

                if (
                  response.success
                ) {

                  Swal.fire(
                    'Deleted!',
                    response.message,
                    'success'
                  );

                  this.getTaskCategoryDetails();

                } else {

                  Swal.fire(
                    'Error',
                    response.message,
                    'error'
                  );
                }
              },

            error:
              (error) => {
                console.error('error:', error);
                const message =
                  error?.error?.message ||
                  'Something went wrong';

                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: message
                });
              },
          });
      }
    });
  }

  /* View */
  viewTaskCategory(
    taskcategoryId: number
  ): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      departmentId:
        this.selectedDepartment,

      size:
        this.size,

      page: this.page
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/view-task-category',
        taskcategoryId,
      ],
      {
        queryParams:
          filterState,
      }
    );
  }

  /* Edit */
  editTaskCategory(
    taskcategoryId: number
  ): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      departmentId:
        this.selectedDepartment,

      size:
        this.size,

      page: this.page
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/edit-task-category',
        taskcategoryId,
      ],
      {
        queryParams:
          filterState,
      }
    );
  }

  /* Add */
  addTaskCategory(): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      departmentId:
        this.selectedDepartment,

      size:
        this.size,
      page: this.page
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      ['/add-task-category'],
      {
        queryParams:
          filterState,
      }
    );
  }

  /* Page numbers */
  pages(): number[] {

    const total =
      this.totalPages;

    const current =
      this.currentPage;

    const delta = 5;

    const start =
      Math.max(
        1,
        current - delta
      );

    const end =
      Math.min(
        total,
        current + delta
      );

    const arr: number[] = [];

    for (
      let i = start;
      i <= end;
      i++
    ) {

      arr.push(i);
    }

    return arr;
  }

  /* Record summary */
  get recordSummary(): string {

    const totalRecords =
      this.apiResponseTaskCategoryDetails
        ?.totalElements || 0;

    const startRecord =
      totalRecords === 0
        ? 0
        : (this.currentPage - 1) *
        this.recordsPerPage +
        1;

    const endRecord =
      Math.min(
        this.currentPage *
        this.recordsPerPage,
        totalRecords
      );

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1
      ? 's'
      : ''
      })`;
  }

  /* Total pages */
  get totalPages(): number {

    const total =
      this.apiResponseTaskCategoryDetails
        ?.totalElements || 0;

    return Math.max(
      1,
      Math.ceil(
        total /
        this.recordsPerPage
      )
    );
  }

  /* Sorting */
  sortColumn: string = '';

  sortDirection:
    | 'asc'
    | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [



      {
        key:
          'name',

        label:
          'Task Category',

        sortable:
          true,
      },

      {
        key:
          'departmentName',

        label:
          'Department',

        sortable:
          true,
      },

      {
        key:
          'status',

        label:
          'Status',

        sortable:
          true,
      },
    ];

  sortData(
    column: string
  ): void {

    if (!column) {
      return;
    }

    if (
      this.sortColumn ===
      column
    ) {

      this.sortDirection =
        this.sortDirection ===
          'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';
    }

    this.taskCategories.sort(
      (
        a: any,
        b: any
      ) => {

        let valA =
          a[column];

        let valB =
          b[column];

        valA =
          valA ?? '';

        valB =
          valB ?? '';

        if (
          !isNaN(valA) &&
          !isNaN(valB)
        ) {

          valA =
            Number(valA);

          valB =
            Number(valB);

        } else {

          valA =
            valA
              .toString()
              .toLowerCase();

          valB =
            valB
              .toString()
              .toLowerCase();
        }

        if (
          valA < valB
        ) {

          return this.sortDirection ===
            'asc'
            ? -1
            : 1;
        }

        if (
          valA > valB
        ) {

          return this.sortDirection ===
            'asc'
            ? 1
            : -1;
        }

        return 0;
      }
    );
  }


  clearFilters(): void {

    this.searchQuery = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';

    // Reset pagination
    this.currentPage = 1;

    // Reload all records
    this.onSearch();
  }


}
