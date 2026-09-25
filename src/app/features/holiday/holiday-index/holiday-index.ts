import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { SessionStorageService } from '../../../service/session-storage.service';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { MatIconModule } from '@angular/material/icon';

interface Holiday {
  holidayId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: number;
}

@Component({
  selector: 'app-holiday-index',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatIconModule],
  templateUrl: './holiday-index.html',
  styleUrl: './holiday-index.scss',
})
export class HolidayIndexComponent {
  // =========================================================
  // DATA
  // =========================================================
  holidays: Holiday[] = [];
  apiResponseHolidayDetails: any = {};
  searchQuery: string = '';
  search: string = '';
  currentPage: number = 1;
  page: number = 0;
  recordsPerPage: number = environment.recordsPerPage;

  size: number = environment.size;

  // =========================================================
  // STATUS FILTER
  // =========================================================

  selectedStatus: string = '';
  statusIndex: number = 1;

  // =========================================================
  // OTHER VARIABLES
  // =========================================================

  createdBy: any;

  common = new Common();

  holiday: any = {};

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

  // =========================================================
  // SESSION FILTER
  // =========================================================

  filterKey = SESSION_KEYS.HOLIDAY_MASTER_FILTER;

  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible = true;

  // =========================================================
  // SORT
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
      label: 'Holiday Name',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
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
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit() {
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

    let stateData: any = null;

    const nav = this.router.getCurrentNavigation();

    stateData = nav?.extras?.state;

    if (!stateData) {
      const saved = sessionStorage.getItem(this.filterKey);

      if (saved) {
        stateData = JSON.parse(saved);
      }
    }

    if (stateData) {
      this.currentPage = stateData.currentPage || 1;

      this.page = this.currentPage - 1;

      this.statusIndex = stateData.statusIndex || 0;

      this.search = stateData.searchText || '';
      this.size = stateData.size || this.size;
      this.recordsPerPage = this.size;
      this.searchQuery = this.search;
      this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';
    }

    this.getHolidayDetails();
  }

  togglePanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getHolidayDetails() {
    this.dataprovider
      .getHolidayDetails(this.page, this.size, this.statusIndex, this.search)
      .subscribe(
        (response) => {
          this.apiResponseHolidayDetails = response;

          this.holidays = response.data;
        },

        (error) => {
          console.error('Error fetching holiday details:', error);
        },
      );
  }

  // =========================================================
  // PAGINATED HOLIDAYS
  // =========================================================

  get paginatedHolidays(): Holiday[] {
    return this.holidays;
  }

  // =========================================================
  // GO TO PAGE
  // =========================================================

  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;

    this.page = pageNumber - 1;

    this.router
      .navigate(
        ['/hodiday-index'],

        {
          replaceUrl: true,
          state: {
            currentPage: this.currentPage,

            statusIndex: this.statusIndex || 0,

            searchText: this.search || '',

            page: this.page,

            size: this.size || 5,
          },
        },
      )
      .then(() => {
        this.getHolidayDetails();
      });
  }

  // =========================================================
  // FIRST PAGE
  // =========================================================

  goToFirstPage() {
    this.goToPage(1);
  }

  // =========================================================
  // LAST PAGE
  // =========================================================

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch() {
    this.search = this.searchQuery.trim();

    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;

    this.currentPage = 1;

    this.page = 0;

    this.router
      .navigate(['/hodiday-index'], {
        state: {
          currentPage: this.currentPage,

          statusIndex: this.statusIndex || 0,

          searchText: this.search || '',

          page: this.page,

          size: this.size || 5,
        },
      })
      .then(() => {
        this.getHolidayDetails();
      });
  }

  // =========================================================
  // CHANGE RECORDS PER PAGE
  // =========================================================

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;

    this.search = this.searchQuery.trim();

    if (!this.search) {
      this.search = '';

      this.searchQuery = '';
    }

    this.currentPage = 1;

    this.page = 0;

    this.getHolidayDetails();
  }

  // =========================================================
  // DELETE HOLIDAY
  // =========================================================

  onDeleteHoliday(holidayId: any) {
    this.holiday.holidayId = holidayId;

    this.holiday.userId = this.userId ? Number(this.userId) : null;

    Swal.fire({
      title: 'Are you sure?',

      text: 'Do you really want to delete this holiday?',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Yes, delete it!',

      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'small-confirm-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteHoliday(this.holiday).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', response.message, 'success');

              this.getHolidayDetails();
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

  // =========================================================
  // VIEW HOLIDAY
  // =========================================================

  viewHoliday(holidayId: any) {
    const filterState = {
      currentPage: this.currentPage,

      statusIndex: this.statusIndex,

      searchText: this.search,

      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-holiday', holidayId], {
      state: filterState,
    });
  }

  // =========================================================
  // EDIT HOLIDAY
  // =========================================================

  editHoliday(holidayId: any) {
    const filterState = {
      currentPage: this.currentPage,

      statusIndex: this.statusIndex,

      searchText: this.search,

      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-holiday', holidayId], {
      state: filterState,
    });
  }

  // =========================================================
  // ADD HOLIDAY
  // =========================================================

  addHoliday() {
    const filterState = {
      currentPage: this.currentPage,

      statusIndex: this.statusIndex,

      searchText: this.search,

      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-holiday'], {
      state: filterState,
    });
  }

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

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

  // =========================================================
  // RECORD SUMMARY
  // =========================================================

  get recordSummary(): string {
    const totalRecords = this.apiResponseHolidayDetails.totalElements || 0;

    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;

    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${
      totalRecords
    } record${totalRecords > 1 ? 's' : ''})`;
  }

  // =========================================================
  // TOTAL PAGES
  // =========================================================

  get totalPages(): number {
    const total = this.apiResponseHolidayDetails.totalElements || 0;

    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  // =========================================================
  // SORT DATA
  // =========================================================

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

    this.holidays.sort((a: any, b: any) => {
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