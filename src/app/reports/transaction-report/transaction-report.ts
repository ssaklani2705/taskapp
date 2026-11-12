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

export interface ActionBy {
  userId: number;
  firstname: string;
}

export interface Module {
  moduleId: number;
  name: string;
}

export interface TransactionRecord {
  transactionId: number;
  moduleName: string;
  actionBy: string | null;
  userId?: number | null;
  updatedOn: string;
  action: string;
}

@Component({
  selector: 'app-transaction-report',
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
  templateUrl: './transaction-report.html',
  styleUrl: './transaction-report.scss',
})
export class TransactionReport {
  rows: TransactionRecord[] = [];
  transactionHistory: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  isLoading = false;
  isPanelVisible = true;
  isExporting = false;
  filterKey = SESSION_KEYS.TRANSACTION_REPORT_FILTER;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  selectedModuleId = 0;
  selectedUserId = 0;

  // Permissions
  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  exportExcel = 'N';
  moduleName = '';

  // Action By filter
  actionBySearchText = '';
  showActionByDropdown = false;
  actionBy: ActionBy[] = [];
  filteredActionBy: ActionBy[] = [];

  // Module Name filter
  module: Module[] = [];
  showModuleDropdown = false;
  moduleSearchText = '';

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
      this.selectedModuleId = s.moduleId ?? 0;
      this.selectedUserId = s.userId ?? 0;
      this.fromDate = s.fromDate ? new Date(s.fromDate) : null;
      this.toDate = s.toDate ? new Date(s.toDate) : null;
    }

    this.loadActiveUsers();
    this.loadActiveModules();
    this.getTransactionReport();
  }

  loadActiveUsers(): void {
    this.dataprovider.getTransactionActionUsers().subscribe({
      next: (response: any) => {
        const users = response?.data ?? response ?? [];

        this.actionBy = users.map((user: any) => ({
          userId: Number(user.userId),
          firstname: user.firstname ?? user.firstName ?? '',
        }));

        this.filteredActionBy = [];

        if (this.selectedUserId) {
          const selectedUser = this.actionBy.find((user) => user.userId === this.selectedUserId);

          if (selectedUser) {
            this.actionBySearchText = selectedUser.firstname;
          }
        }
      },
      error: (error) => {
        console.error('Error loading Action By users:', error);
        this.actionBy = [];
      },
    });
  }

  loadActiveModules(): void {
    this.dataprovider.getActiveModules().subscribe({
      next: (response: any) => {
        this.module = response?.data ?? response ?? [];
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.module = [];
      },
    });
  }

  getTransactionReport(): void {
    this.isLoading = true;

    const formattedFromDate = this.fromDate ? this.formatDateForApi(this.fromDate, false) : undefined;

    const formattedToDate = this.toDate ? this.formatDateForApi(this.toDate, true) : undefined;

    this.dataprovider.getTransactionHistory(this.page, this.size, this.search, this.selectedModuleId, this.selectedUserId, formattedFromDate, formattedToDate).subscribe({
      next: (response: any) => {
        this.transactionHistory = response?.data ?? response;

        this.rows = this.transactionHistory?.content ?? [];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching transaction history:', error);

        this.transactionHistory = {
          content: [],
          totalElements: 0,
        };

        this.rows = [];
        this.isLoading = false;
      },
    });
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return this.datePipe.transform(date, 'dd-MM-yyyy hh:mm a') ?? '-';
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

  selectedActionBy: string = '';

  // filterActionBy(): void {
  //   const search = this.actionBySearchText.toLowerCase().trim();

  //   this.selectedUserId = 0;

  //   if (search.length < 3) {
  //     this.showActionByDropdown = false;
  //     this.filteredActionBy = [];
  //     return;
  //   }

  //   this.filteredActionBy = this.actionBy.filter((user) => user.firstname?.toLowerCase().includes(search));

  //   this.showActionByDropdown = true;
  // }

  filterActionBy(): void {
    const search = this.actionBySearchText.toLowerCase().trim();

    this.selectedUserId = 0;

    if (!search) {
      this.showActionByDropdown = false;
      this.filteredActionBy = [];
      return;
    }

    if (search.length < 3) {
      this.filteredActionBy = this.actionBy.filter((user) => user.userId === -1 && user.firstname.toLowerCase().includes(search));
    } else {
      this.filteredActionBy = this.actionBy.filter((user) => user.firstname.toLowerCase().includes(search));
    }

    this.showActionByDropdown = true;
  }

  selectActionBy(user: ActionBy): void {
    this.actionBySearchText = user.firstname;
    this.selectedUserId = user.userId;
    this.showActionByDropdown = false;

    this.onSearch();
  }

  clearActionBySearch(): void {
    this.actionBySearchText = '';
    this.selectedUserId = 0;
    this.filteredActionBy = [];
    this.showActionByDropdown = false;

    this.onSearch();
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();
    this.getTransactionReport();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.saveFilterState();
    this.getTransactionReport();
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

  get totalRecords(): number {
    return this.transactionHistory?.totalElements || 0;
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
      moduleId: this.selectedModuleId,
      userId: this.selectedUserId,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
  }

  get selectedModuleLabel(): string {
    if (!this.selectedModuleId) {
      return '--All Modules--';
    }

    const selected = this.module.find((item) => item.moduleId === this.selectedModuleId);

    return selected?.name ?? '--All Modules--';
  }

  get filteredModules(): Module[] {
    const search = this.moduleSearchText.toLowerCase().trim();

    if (!search) {
      return this.module;
    }

    return this.module.filter((item) => item.name?.toLowerCase().includes(search));
  }

  toggleModuleDropdown(): void {
    this.showModuleDropdown = !this.showModuleDropdown;
    this.moduleSearchText = '';
  }

  selectModule(module: Module): void {
    this.selectedModuleId = module.moduleId;
    this.showModuleDropdown = false;
    this.moduleSearchText = '';

    this.onSearch();
  }

  clearModule(): void {
    this.selectedModuleId = 0;
    this.showModuleDropdown = false;
    this.moduleSearchText = '';

    this.onSearch();
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'moduleName',
      label: 'Module Name',
      sortable: true,
    },
    {
      key: 'actionBy',
      label: 'Action By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      sortable: true,
    },
    {
      key: 'action',
      label: 'Action / Description',
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

  // exportToExcel(): void {
  //   if (this.totalRecords === 0) {
  //     Swal.fire('No Data', 'No records available for export.', 'info');
  //     return;
  //   }

  //   if (this.isExporting) return;

  //   this.isExporting = true;

  //   const formattedFromDate = this.fromDate ? this.formatDateForApi(this.fromDate, false) : undefined;

  //   const formattedToDate = this.toDate ? this.formatDateForApi(this.toDate, true) : undefined;

  //   this.dataprovider.getTransactionHistory(0, this.totalRecords, this.search, this.selectedModuleId, this.selectedUserId, formattedFromDate, formattedToDate).subscribe({
  //     next: (response: any) => {
  //       this.isExporting = false;

  //       const result = response?.data ?? response;
  //       const allRows: TransactionRecord[] = result?.content ?? [];

  //       if (allRows.length === 0) {
  //         Swal.fire('No Data', 'No records available for export.', 'info');
  //         return;
  //       }

  //       this.downloadTransactionExcel(allRows);
  //     },
  //     error: (err) => {
  //       this.isExporting = false;
  //       console.error('Error exporting transaction report:', err);

  //       Swal.fire('Error', 'Unable to export transaction report.', 'error');
  //     },
  //   });
  // }

  // private downloadTransactionExcel(rows: TransactionRecord[]): void {
  //   const data = rows.map((r, index) => ({
  //     'Sr No': index + 1,
  //     'Module Name': r.moduleName || '',
  //     // 'Action By': r.actionBy || '',
  //     'Action By': r.userId == null || r.userId === 0 || r.userId === -1 || !r.actionBy?.trim() ? 'System' : r.actionBy,
  //     'Updated On': this.formatDateTime(r.updatedOn),
  //     'Action / Description': r.action || '',
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(data);

  //   worksheet['!cols'] = [
  //     { wch: 8 }, // Sr No
  //     { wch: 25 }, // Module Name
  //     { wch: 25 }, // Action By
  //     { wch: 22 }, // Updated On
  //     { wch: 60 }, // Action / Description
  //   ];

  //   const workbook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Report');

  //   const stamp = this.datePipe.transform(new Date(), 'dd-MM-yyyy_HHmm');

  //   XLSX.writeFile(workbook, `Transaction_Report_${stamp}.xlsx`);
  // }

  exportToCSV(): void {
    if (this.totalRecords === 0) {
      Swal.fire('No Data', 'No records available for export.', 'info');
      return;
    }

    if (this.isExporting) return;

    this.isExporting = true;

    const formattedFromDate = this.fromDate ? this.formatDateForApi(this.fromDate, false) : undefined;

    const formattedToDate = this.toDate ? this.formatDateForApi(this.toDate, true) : undefined;

    this.dataprovider.getTransactionHistory(0, this.totalRecords, this.search, this.selectedModuleId, this.selectedUserId, formattedFromDate, formattedToDate).subscribe({
      next: (response: any) => {
        this.isExporting = false;

        const result = response?.data ?? response;
        const allRows: TransactionRecord[] = result?.content ?? [];

        if (allRows.length === 0) {
          Swal.fire('No Data', 'No records available for export.', 'info');
          return;
        }

        this.downloadTransactionCSV(allRows);
      },
      error: (err) => {
        this.isExporting = false;
        console.error('Error exporting transaction report:', err);

        Swal.fire('Error', 'Unable to export transaction report.', 'error');
      },
    });
  }

  private downloadTransactionCSV(rows: TransactionRecord[]): void {
    const data = rows.map((r, index) => ({
      'Sr No': index + 1,
      'Module Name': r.moduleName || '',
      'Action By': r.userId == null || r.userId === 0 || r.userId === -1 || !r.actionBy?.trim() ? 'System' : r.actionBy,
      'Updated On': this.formatDateTime(r.updatedOn),
      'Action / Description': r.action || '',
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
    link.download = `Transaction_Report.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.search = '';

    this.fromDate = null;
    this.toDate = null;

    this.selectedModuleId = 0;
    this.moduleSearchText = '';
    this.showModuleDropdown = false;

    this.selectedUserId = 0;
    this.actionBySearchText = '';
    this.filteredActionBy = [];
    this.showActionByDropdown = false;

    this.currentPage = 1;
    this.page = 0;

    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.saveFilterState();
    this.getTransactionReport();
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close Module Name dropdown
    if (!target.closest('.task-category-dropdown')) {
      this.showModuleDropdown = false;
      this.moduleSearchText = '';
    }

    // Close Action By dropdown
    if (!target.closest('.client-dropdown-container')) {
      this.showActionByDropdown = false;
    }
  }
}
