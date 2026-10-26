import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataProviderService } from '../../../service/data-provider.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { environment } from '../../../../environments/environment';
interface Client {
  CompanyId: number;
  name: string;
  code: string;
  pan: string;
  status: number;
  gstFlag: number | string;
  gstNo: string;
  stateId: number;
  stateName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  contactName: string;
  contactEmail: string;
  emails: string;
  startDate: string;
  monthlyCharge: number;
  outstanding: number;
  name1: string;
  emailId1: string;
  name2: string;
  emailId2: string;
  name3: string;
  emailId3: string;
  managerId: number;
  managerName: string;
  planId: number;
  planName: string;
  userId: number;
  regdate: string;
  moddate: string;
  taxFlag: number | string;
  location: string;
}
@Component({
  selector: 'app-company-index',
  imports: [CommonModule, FormsModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIcon, MatDivider],
  templateUrl: './company-index.html',
  styleUrl: './company-index.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MyDateAdapter,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
  ],
})
export class CompanyIndex implements OnInit {
  companies: any[] = [];
  states: any[] = [];

  userId = 0;
  isLoading = false;

  // Pagination (backend page is 0-based, UI page is 1-based)
  page = 0;
  currentPage = 1;
  size: number = environment.size;
  totalRecords = 0;
  totalPages = 1;
  recordsPerPage: number = environment.recordsPerPage;

  // Filters
  searchQuery = '';
  search = '';
  selectedStatus = '';
  statusIndex = 1;
  stateId = 0;

  // Sorting (applies to the current page only)
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Permissions
  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  exportExcel = 'N';
  moduleName = '';
  isPanelVisible = true;

  filterKey = SESSION_KEYS.CLIENT_MASTER_FILTER;

  columns = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'stateName', label: 'State', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      this.userId = Number(sessionStorage.getItem('userId')) || 0;

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

    this.restoreFilterState();
    this.loadStates();
    this.getCompanyList();
  }

  // ===================== DATA =====================
  getCompanyList(): void {
    this.isLoading = true;

    this.dataprovider.getCompanyList(this.page, this.size, this.statusIndex, this.search, this.stateId).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Spring Page<CompanyDTO> response
        this.companies = response?.content || [];
        this.totalRecords = response?.totalElements || 0;
        this.totalPages = response?.totalPages || 1;
        this.page = response?.number ?? this.page;
        this.currentPage = this.page + 1;
        this.size = response?.size ?? this.size;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching company list:', error);
        this.companies = [];
        this.totalRecords = 0;
        this.totalPages = 1;
      },
    });
  }

  loadStates(): void {
    this.dataprovider.getStates().subscribe({
      next: (response: any) => {
        this.states = response?.data || response || [];
      },
      error: () => (this.states = []),
    });
  }

  // CompanyDTO has only stateId, so resolve the name from the states list
  getStateName(stateId: number | null): string {
    return this.states.find((s) => s.stateId === stateId)?.name ?? '';
  }

  // ===================== FILTERS =====================
  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.resetToFirstPage();
  }

  onStatusChange(): void {
    this.onSearch();
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.search = '';
    this.selectedStatus = '1';
    this.statusIndex = 1;
    // Reset state filter
    this.stateId = 0;
    this.stateSearch = '';
    this.stateOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.filterKey);
    }
    this.resetToFirstPage();
  }

  private resetToFirstPage(): void {
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();
    this.getCompanyList();
  }

  // ===================== NAVIGATION =====================
  addCompany(): void {
    this.saveFilterState();
    this.router.navigate(['/add-company']);
  }

  viewCompany(companyId: number): void {
    this.saveFilterState();
    this.router.navigate(['/view-company', companyId]);
  }

  editCompany(companyId: number): void {
    this.saveFilterState();
    this.router.navigate(['/edit-company', companyId]);
  }

  // ===================== DELETE =====================
  onDeleteCompany(companyId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this company?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: { popup: 'small-confirm-popup' },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.dataprovider.deleteCompany(companyId, this.userId).subscribe({
        next: (response: any) => {
          if (response?.success) {
            Swal.fire({
              title: 'Deleted!',
              text: response.message || 'Company deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => this.getCompanyList());
          } else {
            Swal.fire({
              title: 'Error',
              text: response?.message || 'Failed to delete company.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          Swal.fire({
            title: 'Error',
            text: error?.error?.message || 'Something went wrong while deleting the company.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        },
      });
    });
  }

  // ===================== PAGINATION =====================
  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
      return;
    }
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.saveFilterState();
    this.getCompanyList();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pages(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= 0) {
      return pages;
    }
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    let start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onChangeRecordsPerPage(): void {
    this.size = Number(this.size);
    if (!this.size || this.size < 1) {
      this.size = 5;
    }
    this.resetToFirstPage();
  }

  get recordSummary(): string {
    if (this.totalRecords === 0) {
      return 'Page 0 of 0, (0 - 0 of 0 records)';
    }
    const start = (this.currentPage - 1) * this.size + 1;
    const end = Math.min(this.currentPage * this.size, this.totalRecords);
    return `Page ${this.currentPage} of ${this.totalPages}, (${start} - ${end} of ${this.totalRecords} records)`;
  }

  // ===================== SORT (current page only) =====================
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    const getValue = (row: any): any => {
      if (column === 'stateName') {
        return this.getStateName(row.stateId).toLowerCase();
      }
      if (column === 'status') {
        return Number(row.status);
      }
      const v = row[column] ?? '';
      return typeof v === 'string' ? v.toLowerCase() : v;
    };

    this.companies = [...this.companies].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // ===================== EXPORT =====================

  // ===================== STATE & HELPERS =====================
  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  private saveFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    sessionStorage.setItem(
      this.filterKey,
      JSON.stringify({
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.search,
        size: this.size,
        stateId: this.stateId,
      }),
    );
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

  private restoreFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = sessionStorage.getItem(this.filterKey);

    if (!stored) {
      return;
    }

    try {
      const f = JSON.parse(stored);

      if (f.currentPage !== undefined) {
        this.currentPage = Number(f.currentPage) || 1;
        this.page = this.currentPage - 1;
      }

      if (f.statusIndex !== undefined) {
        this.statusIndex = Number(f.statusIndex);
        this.selectedStatus = f.selectedStatus !== undefined ? f.selectedStatus : this.statusIndex > 0 ? String(this.statusIndex) : '';
      }

      if (f.searchText !== undefined) {
        this.search = f.searchText;
        this.searchQuery = f.searchText;
      }

      if (f.size !== undefined) {
        this.size = Number(f.size) || environment.size;
      }

      if (f.stateId !== undefined) {
        this.stateId = Number(f.stateId) || 0;
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
  }

  planOpen = false;
  stateOpen = false;
  stateSearch = '';
  toggleStateDropdown(): void {
    this.stateOpen = !this.stateOpen;
    this.planOpen = false;
    this.stateSearch = '';
  }

  get selectedStateName(): string {
    return this.states.find((s) => s.stateId === this.stateId)?.name ?? '';
  }

  selectState(id: number): void {
    this.stateId = id;
    this.stateOpen = false;
    this.stateSearch = '';
    this.onStateChange();
  }

  onStateChange(): void {
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();
    this.getCompanyList();
  }
  get filteredStates(): any[] {
    return this.filterByName(this.states, this.stateSearch);
  }

  private filterByName(list: any[], text: string): any[] {
    const q = text.trim().toLowerCase();
    return q ? (list ?? []).filter((i) => (i.name ?? '').toLowerCase().includes(q)) : (list ?? []);
  }
}
