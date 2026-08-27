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
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


interface Designation {
  desigmationId: number;
  name: string;
  sequence: number;
  status: number;
  userId?: number;
  regdate?: any;
  moddate?: any;
}

@Component({
  selector: 'app-index-designation',

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],

  templateUrl: './designation-index.html',

  styleUrl: './designation-index.scss',
})
export class DesignationIndexComponent {

  // =========================================================
  // DATA
  // =========================================================

  designations: Designation[] = [];

  apiResponseDesignationDetails: any = {};

  designation: any = {};

  // =========================================================
  // SEARCH
  // =========================================================

  searchQuery: string = '';

  search: string = '';

  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage: number = 1;

  page: number = 0;

  recordsPerPage: number =
    environment.recordsPerPage;

  size: number =
    environment.size;

  // =========================================================
  // STATUS
  // =========================================================

  selectedStatus: string = '';

  statusIndex: number = 0;

  // =========================================================
  // USER
  // =========================================================

  userId: any;

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

  showHeaderBar: boolean = true;

  selectedmodules: any[] = [];

  // =========================================================
  // COMMON
  // =========================================================

  common = new Common();

  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible: boolean = true;

  // =========================================================
  // SESSION FILTER
  // =========================================================

  filterKey =
    SESSION_KEYS.DESIGNATION_MASTER_FILTER;

  // =========================================================
  // SORTING
  // =========================================================

  sortColumn: string = '';

  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [

      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },

      {
        key: 'sequence',
        label: 'Sequence',
        sortable: true,
      },

      {
        key: 'status',
        label: 'Status',
        sortable: true,
      },

    ];

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private dataprovider: DataProviderService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private router: Router,

    private route: ActivatedRoute,

    private sessionService: SessionStorageService,
  ) { }

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.sessionService.clearOtherSessions(
      this.filterKey
    );

    // USER ID
    if (isPlatformBrowser(this.platformId)) {

      this.userId =
        sessionStorage.getItem('userId');

    }

    // PERMISSIONS
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

    // RESTORE FILTERS FROM URL
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

      this.getDesignationDetails();
    });
  }

  // =========================================================
  // TOGGLE PANEL
  // =========================================================

  togglePanel(): void {

    this.isPanelVisible =
      !this.isPanelVisible;

  }

  // =========================================================
  // GET DESIGNATION DETAILS
  // =========================================================

  getDesignationDetails(): void {

    this.dataprovider
      .getDesigmationDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search
      )
      .subscribe({

        next: (response) => {

          this.apiResponseDesignationDetails =
            response;

          this.designations =
            response.data || [];

        },

        error: (error) => {

          console.error(
            'Error fetching designation details:',
            error
          );

        },

      });

  }

  // =========================================================
  // PAGINATED DATA
  // =========================================================

  get paginatedDesignations(): Designation[] {

    return this.designations;

  }

  // =========================================================
  // PAGE CHANGE
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

    this.currentPage =
      pageNumber;

    this.page =
      pageNumber - 1;

    this.router
      .navigate(
        ['/designation-master'],
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

        this.getDesignationDetails();

      });

  }

  // =========================================================
  // FIRST PAGE
  // =========================================================

  goToFirstPage(): void {

    this.goToPage(1);

  }

  // =========================================================
  // LAST PAGE
  // =========================================================

  goToLastPage(): void {

    this.goToPage(
      this.totalPages
    );

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
        : +this.selectedStatus;

    this.currentPage = 1;
    this.page = 0;

    this.router.navigate(
      ['/designation-master'],
      {
        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.search,

          page:
            this.page,

          size:
            this.size
        }
      }
    );
  }

  // =========================================================
  // DELETE DESIGNATION
  // =========================================================

  onDeleteDesignation(
    desigmationId: any
  ): void {

    this.designation.desigmationId =
      desigmationId;

    this.designation.userId =
      this.userId
        ? Number(this.userId)
        : null;

    Swal.fire({

      title: 'Are you sure?',

      text:
        'Do you really want to delete this designation?',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Yes, delete it!',

      cancelButtonText:
        'No, keep it',

    }).then((result) => {

      if (
        result.isConfirmed
      ) {

        this.dataprovider
          .deleteDesigmation(
            this.designation
          )
          .subscribe({

            next: (response) => {

              if (
                response.success
              ) {

                Swal.fire(
                  'Deleted!',
                  response.message,
                  'success'
                );

                this.getDesignationDetails();

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
                'Error deleting designation:',
                error
              );

              Swal.fire(
                'Error',
                'Something went wrong while deleting the designation.',
                'error'
              );

            },

          });

      }

    });

  }

  // =========================================================
  // VIEW DESIGNATION
  // =========================================================

  viewDesignation(
    desigmationId: any
  ): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.searchQuery.trim(),

      page:
        this.page,

      size:
        this.size

    };

    sessionStorage.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/view-designation',
        desigmationId,
      ],
      {
        queryParams: filterState,
      }
    );

  }

  // =========================================================
  // EDIT DESIGNATION
  // =========================================================

  editDesignation(
    desigmationId: any
  ): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      size:
        this.size,

    };

    sessionStorage.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      [
        '/edit-designation',
        desigmationId,
      ],
      {
        state: filterState,
      }
    );

  }

  // =========================================================
  // ADD DESIGNATION
  // =========================================================

  addDesignation(): void {

    const filterState = {

      currentPage:
        this.currentPage,

      statusIndex:
        this.statusIndex,

      searchText:
        this.searchQuery.trim(),

      page:
        this.page,

      size:
        this.size
    };

    sessionStorage.setItem(
      this.filterKey,
      JSON.stringify(
        filterState
      )
    );

    this.router.navigate(
      ['/add-designation'],
      {
        queryParams: filterState,
      }
    );

  }

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

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

  // =========================================================
  // RECORD SUMMARY
  // =========================================================

  get recordSummary(): string {

    const totalRecords =
      this.apiResponseDesignationDetails
        ?.totalElements || 0;

    const startRecord =
      totalRecords === 0
        ? 0
        : (
          (this.currentPage - 1) *
          this.recordsPerPage
        ) + 1;

    const endRecord =
      Math.min(
        this.currentPage *
        this.recordsPerPage,
        totalRecords
      );

    return `Page ${this.currentPage} of ${this.totalPages
      }, (${startRecord} - ${endRecord} of ${totalRecords
      } record${totalRecords > 1
        ? 's'
        : ''
      })`;

  }

  // =========================================================
  // TOTAL PAGES
  // =========================================================

  get totalPages(): number {

    const total =
      this.apiResponseDesignationDetails
        ?.totalElements || 0;

    return Math.max(
      1,
      Math.ceil(
        total /
        this.recordsPerPage
      )
    );

  }

  // =========================================================
  // SORT
  // =========================================================

  sortData(
    column: string
  ): void {

    if (!column) {

      return;

    }

    // Toggle direction

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';

    }

    // Client-side sorting

    this.designations.sort(
      (
        a: any,
        b: any
      ) => {

        let valA =
          a[column];

        let valB =
          b[column];

        // Null handling

        valA =
          valA ?? '';

        valB =
          valB ?? '';

        // Number handling

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
}
