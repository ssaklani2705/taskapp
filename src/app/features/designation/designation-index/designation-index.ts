import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
    MatDividerModule,
  ],
  templateUrl: './designation-index.html',
  styleUrl: './designation-index.scss',
})
export class DesignationIndexComponent {
  designations: Designation[] = [];
  apiResponseDesignationDetails: any = {};
  designation: any = {};

  searchQuery: string = '';
  search: string = '';

  currentPage: number = 1;
  page: number = 0;
  recordsPerPage: number = environment.recordsPerPage;
  size: number = environment.size;

  selectedStatus: string = '';
  statusIndex: number = 0;

  userId: any;

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  moduleName: string = '';
  showHeaderBar: boolean = true;

  selectedmodules: any[] = [];

  common = new Common();
  isPanelVisible: boolean = true;

  filterKey = SESSION_KEYS.DESIGNATION_MASTER_FILTER;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'name',
      label: 'Designation Name',
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

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('selectedModuleDetail');

      if (storedModules) {
        const parsed = JSON.parse(storedModules);

        this.moduleName = parsed.name ?? '';
        this.addPer = parsed.addPer ?? 'N';
        this.editPer = parsed.editPer ?? 'N';
        this.deletePer = parsed.deletePer ?? 'N';
        this.viewPer = parsed.viewPer ?? 'N';
        this.approvePer = parsed.approvePer ?? 'N';
        this.adminApprovePer = parsed.adminApprovePer ?? 'N';
      }
    }

    // this.route.queryParams.subscribe((params) => {
    //   this.currentPage = +(params['currentPage'] || 1);
    //   this.page = +(params['page'] || this.currentPage - 1);
    //   this.size = +(params['size'] || environment.size);
    //   this.searchQuery = params['searchText'] || '';
    //   this.search = this.searchQuery;
    //   this.statusIndex = +(params['statusIndex'] || 0);
    //   this.selectedStatus = this.statusIndex > 0 ? String(this.statusIndex) : '';
    //   this.recordsPerPage = this.size;

    //   this.getDesignationDetails();
    // });

    this.restoreFilterState();
    this.getDesignationDetails();
  }

  restoreFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedFilter = sessionStorage.getItem(this.filterKey);

    if (!storedFilter) {
      return;
    }

    try {
      const filterState = JSON.parse(storedFilter);

      this.currentPage = filterState.currentPage ?? 1;
      this.page = filterState.page ?? this.currentPage - 1;
      this.size = filterState.size ?? environment.size;
      this.recordsPerPage = this.size;

      this.searchQuery = filterState.searchText ?? '';
      this.search = this.searchQuery;

      this.statusIndex = filterState.statusIndex ?? 0;
      this.selectedStatus = this.statusIndex > 0 ? String(this.statusIndex) : '';
    } catch (error) {
      console.error('Failed to restore designation filter state:', error);
    }
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getDesignationDetails(): void {
    this.dataprovider
      .getDesigmationDetails(this.page, this.size, this.statusIndex, this.search)
      .subscribe({
        next: (response) => {
          this.apiResponseDesignationDetails = response;
          this.designations = response.data || [];
        },

        error: (error) => {
          console.error('Error fetching designation details:', error);
        },
      });
  }

  get paginatedDesignations(): Designation[] {
    return this.designations;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    // this.router
    //   .navigate(['/designation-master'], {
    //     queryParams: {
    //       currentPage: this.currentPage,
    //       statusIndex: this.statusIndex || 0,
    //       searchText: this.search || '',
    //       page: this.page,
    //       size: this.size || 5,
    //     },
    //   })
    //   .then(() => {
    //     this.getDesignationDetails();
    //   });

    this.saveFilterState();
    this.getDesignationDetails();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;

    this.currentPage = 1;
    this.page = 0;

    // this.router.navigate(['/designation-master'], {
    //   queryParams: {
    //     currentPage: this.currentPage,
    //     statusIndex: this.statusIndex,
    //     searchText: this.search,
    //     page: this.page,
    //     size: this.size,
    //   },
    // });

    this.saveFilterState();
    this.getDesignationDetails();
  }

  saveFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
  }

  onDeleteDesignation(desigmationId: any): void {
    this.designation.desigmationId = desigmationId;
    this.designation.userId = this.userId ? Number(this.userId) : null;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this designation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'small-confirm-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteDesigmation(this.designation).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', response.message, 'success');

              this.getDesignationDetails();
            } else {
              Swal.fire('Error', response.message, 'error');
            }
          },

          error: (err) => {
            console.error('error:', err);

            const message = err?.error?.message || 'Something went wrong';

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: message,
            });
          },
        });
      }
    });
  }

  viewDesignation(desigmationId: any): void {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-designation', desigmationId]);
  }

  editDesignation(desigmationId: any): void {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-designation', desigmationId]);
  }

  addDesignation(): void {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.searchQuery.trim(),
      page: this.page,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-designation']);
  }

  pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 5;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const arr: number[] = [];

    for (let i = start; i <= end; i++) {
      arr.push(i);
    }

    return arr;
  }

  get recordSummary(): string {
    const totalRecords = this.apiResponseDesignationDetails?.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${
      totalRecords
    } record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseDesignationDetails?.totalElements || 0;

    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  sortData(column: string): void {
    if (!column) {
      return;
    }

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.designations.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      valA = valA ?? '';
      valB = valB ?? '';

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);

        valB = Number(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.currentPage = 1;

    this.onSearch();
  }
}
