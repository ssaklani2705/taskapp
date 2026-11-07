import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DataProviderService } from '../../service/data-provider.service';
import { SESSION_KEYS } from '../../service/session-storage.keys';
import { SessionStorageService } from '../../service/session-storage.service';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MyDateAdapter } from '../../classes/my-date-adapter';
import { OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { MY_DATE_TIME_FORMATS } from '../../features/task/task-index/task-index';

export interface ReOpenRecord {
  taskId: number;
  title: string | null;
  taskStartDate: string | null;
  taskEndDate: string | null;
  assignedToId: number | null;
  assignedToName: string | null;
  reopenById: number | null;
  reopenByName: string | null;
  reopenDate: string;
  description: string | null;
}

export interface ReopenUser {
  userId: number;
  userName: string;
}

@Component({
  selector: 'app-reopen-report',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatIconModule, MatDividerModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MyDateAdapter,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
    {
      provide: OWL_DATE_TIME_LOCALE,
      useValue: 'en-GB',
    },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: MY_DATE_TIME_FORMATS,
    },
  ],
  templateUrl: './reopen-report.html',
  styleUrl: './reopen-report.scss',
})
export class ReopenReport implements OnInit {
  rows: ReOpenRecord[] = [];
  reopenHistory: any = {};

  searchQuery = '';
  search = '';

  selectedAssignedTo: number | null = 0;
  selectedReopenBy: number | null = 0;

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  totalItems = 0;
  // totalPages = 0;

  isLoading = false;
  isPanelVisible = true;
  isExporting = false;
  filterKey = SESSION_KEYS.REOPEN_REPORT_FILTER;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Permissions
  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  exportExcel = 'N';
  moduleName = '';

  assignedToUsers: ReopenUser[] = [];
  reopenByUsers: ReopenUser[] = [];

  showAssignedToDropdown = false;
  assignedToSearchText = '';

  showReopenByDropdown = false;
  reopenBySearchText = '';

  selectedAssignedToLabel = '--All Assigned To--';
  selectedReopenByLabel = '--All Re-Opened By--';

  constructor(
    private dataprovider: DataProviderService,
    private datePipe: DatePipe,
    private sessionService: SessionStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    const s = this.sessionService.getItem(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('selectedModuleDetail');
      if (storedModules) {
        try {
          const parsed = JSON.parse(storedModules);
          this.moduleName = parsed.name ?? '';
          this.addPer = parsed.addPer ?? 'N';
          this.editPer = parsed.editPer ?? 'N';
          this.deletePer = parsed.deletePer ?? 'N';
          this.viewPer = parsed.viewPer ?? 'N';
          this.exportExcel = parsed.exportExcel ?? 'N';
        } catch (error) {
          console.error('Invalid selectedModuleDetail:', error);
        }
      }
    }

    if (s) {
      this.currentPage = s.currentPage ?? 1;
      this.page = s.page ?? this.currentPage - 1;
      this.size = s.size ?? environment.size;
      this.recordsPerPage = this.size;
      this.search = s.searchText ?? '';
      this.searchQuery = this.search;
      this.selectedAssignedTo = s.assignedTo ?? 0;
      this.selectedReopenBy = s.reopenBy ?? 0;
      this.fromDate = s.fromDate ? new Date(s.fromDate) : null;
      this.toDate = s.toDate ? new Date(s.toDate) : null;
    }

    this.loadAssignedToUsers();
    this.loadReopenByUsers();
    this.getReOpenReport();
  }

  getReOpenReport(): void {
    this.isLoading = true;

    const formattedFromDate = this.fromDate ? this.formatDateForApi(this.fromDate, false) : undefined;

    const formattedToDate = this.toDate ? this.formatDateForApi(this.toDate, true) : undefined;

    this.dataprovider.getReopenReport(this.page, this.size, this.search?.trim() || '', formattedFromDate, formattedToDate, this.selectedAssignedTo, this.selectedReopenBy).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (response.success) {
          this.rows = response.data || [];

          this.totalItems = response.totalItems ?? 0;
          // this.totalPages = response.totalPages ?? 0;

          this.currentPage = this.page + 1;
          this.recordsPerPage = this.size;
        } else {
          this.rows = [];
          this.totalItems = 0;
          // this.totalPages = 0;
        }
      },

      error: (error) => {
        this.isLoading = false;

        console.error('Error fetching reopen report:', error);

        this.rows = [];
        this.totalItems = 0;
        // this.totalPages = 0;
      },
    });
  }

  loadAssignedToUsers(): void {
    this.dataprovider.getReopenReportAssignedUsers().subscribe({
      next: (response: any[]) => {
        this.assignedToUsers = response || [];

        // Restore selected user label
        if (this.selectedAssignedTo) {
          const selected = this.assignedToUsers.find((user) => user.userId === this.selectedAssignedTo);

          this.selectedAssignedToLabel = selected ? selected.userName : '--All Assigned To--';
        }
      },
      error: (error) => {
        console.error('Error loading assigned users:', error);
        this.assignedToUsers = [];
      },
    });
  }

  toggleAssignedToDropdown(): void {
    this.showAssignedToDropdown = !this.showAssignedToDropdown;

    if (!this.showAssignedToDropdown) {
      this.assignedToSearchText = '';
    }
  }

  get filteredAssignedToUsers(): ReopenUser[] {
    const search = this.assignedToSearchText.trim().toLowerCase();

    if (!search) {
      return this.assignedToUsers;
    }

    return this.assignedToUsers.filter((user) => user.userName?.toLowerCase().includes(search));
  }

  selectAssignedTo(item: ReopenUser): void {
    this.selectedAssignedTo = item.userId;
    this.selectedAssignedToLabel = item.userName;

    this.showAssignedToDropdown = false;
    this.assignedToSearchText = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReOpenReport();
  }

  clearAssignedTo(): void {
    this.selectedAssignedTo = 0;
    this.selectedAssignedToLabel = '--All Assigned To--';

    this.showAssignedToDropdown = false;
    this.assignedToSearchText = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReOpenReport();
  }

  loadReopenByUsers(): void {
    this.dataprovider.getReopenReportReopenedByUsers().subscribe({
      next: (response: any[]) => {
        this.reopenByUsers = response || [];

        if (this.selectedReopenBy) {
          const selected = this.reopenByUsers.find((user) => user.userId === this.selectedReopenBy);

          this.selectedReopenByLabel = selected ? selected.userName : '--All Re Opened By--';
        }
      },
      error: (error) => {
        console.error('Error loading reopened by users:', error);
        this.reopenByUsers = [];
      },
    });
  }

  toggleReopenByDropdown(): void {
    this.showReopenByDropdown = !this.showReopenByDropdown;

    if (!this.showReopenByDropdown) {
      this.reopenBySearchText = '';
    }
  }

  get filteredReopenByUsers(): ReopenUser[] {
    const search = this.reopenBySearchText.trim().toLowerCase();

    if (!search) {
      return this.reopenByUsers;
    }

    return this.reopenByUsers.filter((user) => user.userName?.toLowerCase().includes(search));
  }

  selectReopenBy(item: ReopenUser): void {
    this.selectedReopenBy = item.userId;
    this.selectedReopenByLabel = item.userName;

    this.showReopenByDropdown = false;
    this.reopenBySearchText = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReOpenReport();
  }

  clearReopenBy(): void {
    this.selectedReopenBy = 0;
    this.selectedReopenByLabel = '--All Re Opened By--';

    this.showReopenByDropdown = false;
    this.reopenBySearchText = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReOpenReport();
  }

  formatDateForApi(date: Date, isToDate: boolean): string {
    const formattedDate = new Date(date);

    if (isToDate) {
      formattedDate.setDate(formattedDate.getDate() + 1);
    }

    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return this.datePipe.transform(date, 'dd-MM-yyyy hh:mm a') ?? '-';
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();
    this.getReOpenReport();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.saveFilterState();
    this.getReOpenReport();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pages(): number[] {
    const delta = 5;
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  // get totalRecords(): number {
  //   return this.reopenHistory?.totalElements || 0;
  // }

  get totalRecords(): number {
    return this.totalItems;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.recordsPerPage));
  }

  get recordSummary(): string {
    const total = this.totalRecords;
    const start = total === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const end = Math.min(this.currentPage * this.recordsPerPage, total);
    return `Page ${this.currentPage} of ${this.totalPages}, (${start} - ${end} of ${total} record${total > 1 ? 's' : ''})`;
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  saveFilterState(): void {
    this.sessionService.setItem(this.filterKey, {
      currentPage: this.currentPage,
      page: this.page,
      size: this.size,
      searchText: this.search.trim(),
      fromDate: this.fromDate,
      toDate: this.toDate,
      assignedTo: this.selectedAssignedTo,
      reopenBy: this.selectedReopenBy,
    });
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'taskId',
      label: 'Task Id',
      sortable: true,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'taskStartDate',
      label: 'Task Start Date',
      sortable: true,
    },
    {
      key: 'taskEndDate',
      label: 'Task End Date',
      sortable: true,
    },
    {
      key: 'assignedToName',
      label: 'Assigned To',
      sortable: true,
    },
    {
      key: 'reopenByName',
      label: 'Re-open By',
      sortable: true,
    },
    {
      key: 'reopenDate',
      label: 'Re-open Date',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
    },
  ];

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

    this.rows.sort((a: any, b: any) => {
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
    this.search = '';

    this.fromDate = null;
    this.toDate = null;

    this.selectedAssignedTo = 0;
    this.selectedReopenBy = 0;

    this.currentPage = 1;
    this.page = 0;

    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.selectedAssignedToLabel = '--All Assigned To--';
    this.assignedToSearchText = '';
    this.showAssignedToDropdown = false;

    this.selectedReopenByLabel = '--All Re Opened By--';
    this.reopenBySearchText = '';
    this.showReopenByDropdown = false;

    this.sessionService.removeItem(this.filterKey);

    this.getReOpenReport();
  }

  exportToCSV(): void {
    if (this.totalRecords === 0) {
      Swal.fire('No Data', 'No records available for export.', 'info');
      return;
    }

    if (this.isExporting) return;

    this.isExporting = true;

    const formattedFromDate = this.fromDate ? this.formatDateForApi(this.fromDate, false) : undefined;

    const formattedToDate = this.toDate ? this.formatDateForApi(this.toDate, true) : undefined;

    this.dataprovider.getReopenReport(0, this.totalRecords, this.search?.trim() || '', formattedFromDate, formattedToDate, this.selectedAssignedTo, this.selectedReopenBy).subscribe({
      next: (response: any) => {
        this.isExporting = false;

        const result = response?.data ?? response;

        const allRows: ReOpenRecord[] = Array.isArray(result) ? result : (result?.content ?? []);

        if (!allRows.length) {
          Swal.fire('No Data', 'No records available for export.', 'info');
          return;
        }

        this.downloadReopenCSV(allRows);
      },
      error: (err) => {
        this.isExporting = false;

        console.error('Error exporting reopen report:', err);

        Swal.fire('Error', 'Unable to export reopen report.', 'error');
      },
    });
  }

  private downloadReopenCSV(rows: ReOpenRecord[]): void {
    const data = rows.map((r, index) => ({
      'Sr No': index + 1,
      'Task Id': r.taskId ?? '',
      Title: r.title || '',
      'Task Start Date': this.formatDateTime(r.taskStartDate),
      'Task End Date': this.formatDateTime(r.taskEndDate),
      'Assigned To': r.assignedToName?.trim() || 'System',
      'Re-opened By': r.reopenByName?.trim() || 'System',
      'Re-open Date': this.formatDateTime(r.reopenDate),
      Description: r.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const stamp = this.datePipe.transform(new Date(), 'dd-MM-yyyy_HHmm');

    link.href = url;
    // link.download = `Reopen_Report_${stamp}.csv`;
    link.download = `Reopen_Report.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close Assigned To dropdown
    if (!target.closest('.assigned-to-dropdown')) {
      this.showAssignedToDropdown = false;
      this.assignedToSearchText = '';
    }

    // Close Re-Opened By dropdown
    if (!target.closest('.reopen-by-dropdown')) {
      this.showReopenByDropdown = false;
      this.reopenBySearchText = '';
    }
  }
}
