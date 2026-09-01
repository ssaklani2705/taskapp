import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { DataProviderService } from '../../../service/data-provider.service';
import { SessionStorageService } from '../../../service/session-storage.service';
import Swal from 'sweetalert2';
import { Common } from '../../../classes/common';
import { State } from '../state-add/state-add';





@Component({
  selector: 'app-state-index',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIcon,
    MatDivider
  ],

  templateUrl: './state-index.html',
  styleUrl: './state-index.scss',
})
export class StateIndex {
  states: State[] = [];


  apiResponseState: any = {};

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
    SESSION_KEYS.STATE_FILTER;

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

    /* User ID */
    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    /* Permissions */
    if (isPlatformBrowser(this.platformId)) {

      const storedModules =
        sessionStorage.getItem(
          'selectedModuleDetail'
        );

      if (storedModules) {

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
    }

    /* Restore filters from URL */
    this.route.queryParams.subscribe(params => {

      this.currentPage =
        +(params['currentPage'] || 1);

      this.page =
        +(params['page'] || (this.currentPage - 1));

      this.size =
        +(params['size'] || environment.size);

      this.searchQuery =
        params['searchText'] || '';

      this.search =
        this.searchQuery;

      this.statusIndex =
        +(params['statusIndex'] || 0);

      this.selectedStatus =
        this.statusIndex > 0
          ? String(this.statusIndex)
          : '';

      this.recordsPerPage =
        this.size;

      this.getTaskCategoryDetails();
    });

  }

  /* Panel */
  togglePanel(): void {

    this.isPanelVisible =
      !this.isPanelVisible;
  }


  getTaskCategoryDetails(): void {

    this.dataprovider
      .getStateList(
        this.page,
        this.size,
        this.statusIndex,
        this.search
      )
      .subscribe({

        next: (response: any) => {

          this.apiResponseState =
            response?.data || {};      // ✅ the inner map: { data, totalElements }

          this.states =
            response?.data?.data || [];  // ✅ the actual array

        },

        error: (error) => {

          console.error(
            'Error fetching state details:',
            error
          );

          this.states = [];

          this.apiResponseState = {
            totalElements: 0,
            data: [],
          };
        },
      });
  }

  /* Current page records */
  get paginatedStates(): State[] {

    return this.states;
  }

  /* Search */
  onSearch(): void {

    this.search =
      this.searchQuery.trim();

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : +this.selectedStatus;

    this.currentPage = 1;

    this.page = 0;

    const state = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size
    };
    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(state)
    );
    this.router
      .navigate(
        ['/state-index'],
        {
          queryParams: state,
        }
      )
      .then(() => {

        this.getTaskCategoryDetails();
      });
  }

  /* Pagination */
  goToPage(
    pageNumber: number
  ): void {

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



      page:
        this.page,

      size:
        this.size,
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(state)
    );

    this.router
      .navigate(
        ['/state-index'],
        {
          queryParams: {
            currentPage:
              this.currentPage,

            statusIndex:
              this.statusIndex || 0,

            searchText:
              this.search || '',



            page:
              this.page,

            size:
              this.size || 5,
          },
        }
      )
      .then(() => {

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

  onDeleteState(stateId: number): void {

    const payload = {
      stateId: stateId,
      userId: this.userId ? Number(this.userId) : null
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this state?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {

      if (result.isConfirmed) {

        this.dataprovider.deleteState(payload)
          .subscribe({

            next: (response: any) => {

              if (response.success) {

                Swal.fire(
                  'Deleted!',
                  response.message,
                  'success'
                );

                this.getTaskCategoryDetails(); // or loadStateDetails()

              } else {

                Swal.fire(
                  'Error',
                  response.message,
                  'error'
                );
              }
            },

            error: (error) => {

              console.error(
                'Error deleting state:',
                error
              );

              Swal.fire(
                'Error',
                'Something went wrong while deleting the state.',
                'error'
              );
            }
          });
      }
    });
  }

  /* View */
  viewTaskCategory(
    stateId: number
  ): void {

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/view-state',
        stateId,
      ],
      {
        queryParams: filterState
      }
    );
  }

  /* Edit */
  editTaskCategory(
    stateId: number
  ): void {

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/edit-state',
        stateId,
      ],
      {
        queryParams: filterState
      }
    );
  }

  /* Add */
  addState(): void {

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size
    };

    this.sessionService.setItem(
      this.filterKey,
      JSON.stringify(filterState)
    );

    this.router.navigate(
      ['/add-state'],
      {
        queryParams: filterState
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
      this.apiResponseState
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
      this.apiResponseState
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
          'code',

        label:
          'State Code',

        sortable:
          true,
      },
      {
        key:
          'stateName',

        label:
          'State Name',

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

    this.states.sort(
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
  this.selectedStatus = '';

  this.currentPage = 1;

  this.onSearch();
}

}
