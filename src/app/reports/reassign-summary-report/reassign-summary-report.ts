import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { forkJoin, Observable } from 'rxjs';
import { MyDateAdapter } from '../../classes/my-date-adapter';
import { MY_DATE_TIME_FORMATS } from '../../features/task/task-index/task-index';
import { DataProviderService } from '../../service/data-provider.service';
import { SessionStorageService } from '../../service/session-storage.service';
import { environment } from '../../../environments/environment';
import { SESSION_KEYS } from '../../service/session-storage.keys';

interface ReassignRow {
  userName: string;
  taskCount: number;
}

interface AssignedUser {
  userId: number;
  firstName: string;
}

interface Department {
  departmentId: number;
  name: string;
}

@Component({
  selector: 'app-reassign-summary-report',
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
  templateUrl: './reassign-summary-report.html',
  styleUrl: './reassign-summary-report.scss',
})
export class ReassignSummaryReport implements OnInit {
  rows: ReassignRow[] = [];
  apiResponse: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  isPanelVisible = true;
  filterKey = SESSION_KEYS.REASSIGN_SUMMARY_REPORT;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  selectedTaskCategory = '';
  selectedClientId = 0;
  selectedUserId = 0;

  assignedUsers: AssignedUser[] = [];
  userSearchText = '';
  showUserDropdown = false;
  exportingExcel = false;
  filteredUsers: AssignedUser[] = [];

  constructor(
    private dataprovider: DataProviderService,
    private datePipe: DatePipe,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);
    const s = this.sessionService.getItem(this.filterKey);

    if (s) {
      this.currentPage = s.currentPage ?? 1;
      this.page = s.page ?? this.currentPage - 1;
      this.size = s.size ?? environment.size;
      this.recordsPerPage = this.size;
      this.search = s.searchText ?? '';
      this.searchQuery = this.search;
      this.userSearchText = this.search;
      this.selectedUserId = s.userId ?? 0;
      this.selectedDepartmentIds = s.departmentIds ?? [];
      this.fromDate = s.fromDate ? new Date(s.fromDate) : null;
      this.toDate = s.toDate ? new Date(s.toDate) : null;
    }

    this.getReassignSummaryReport();
    this.loadActiveUsers();
    this.loadDepartments();
  }

  // getReassignSummaryReport(): void {
  //   const formattedFromDate = this.fromDate ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? undefined) : undefined;

  //   const formattedToDate = this.toDate ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? undefined) : undefined;

  //   this.dataprovider.getOldUserTaskCount(this.page, this.size, formattedFromDate, formattedToDate, this.searchQuery.trim()).subscribe({
  //     next: (response) => {
  //       this.apiResponse = response;
  //       this.rows = response?.content ?? [];
  //     },
  //     error: (error) => {
  //       console.error('Error fetching old user task count:', error);
  //       this.rows = [];
  //     },
  //   });
  // }

  getReassignSummaryReport(): void {
    const formattedFromDate = this.fromDate ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? undefined) : undefined;

    const formattedToDate = this.toDate ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? undefined) : undefined;

    this.dataprovider.getOldUserTaskCount(this.page, this.size, formattedFromDate, formattedToDate, this.searchQuery.trim(), this.selectedDepartmentIds).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.rows = response?.content ?? [];
      },
      error: (error) => {
        console.error('Error fetching old user task count:', error);
        this.rows = [];
        this.apiResponse = {};
      },
    });
  }

  // loadDepartments(): void {
  //   const userId = this.selectedUserId || undefined;
  //   const username = this.searchQuery.trim();

  //   this.dataprovider.getReassignSummaryReportDepartments(userId, username).subscribe({
  //     next: (response: any[]) => {
  //       this.departments = (response ?? [])
  //         .map((item: any) => ({
  //           departmentId: Number(item.departmentId),
  //           name: item.name,
  //         }))
  //         .filter((department: Department) => Number.isInteger(department.departmentId) && department.departmentId > 0)
  //         .sort((a, b) => a.name.localeCompare(b.name));

  //       const availableIds = new Set(this.departments.map((department) => department.departmentId));

  //       const oldSelection = [...this.selectedDepartmentIds];

  //       this.selectedDepartmentIds = oldSelection.filter((id) => availableIds.has(id));

  //       this.saveFilterState();

  //       if (oldSelection.length !== this.selectedDepartmentIds.length) {
  //         this.currentPage = 1;
  //         this.page = 0;
  //         this.getReassignSummaryReport();
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error loading departments:', error);
  //       this.departments = [];
  //       this.selectedDepartmentIds = [];
  //     },
  //   });
  // }

  loadDepartments(): void {
    this.dataprovider.getReassignSummaryReportDepartments().subscribe({
      next: (response: any[]) => {
        this.departments = (response ?? [])
          .map((item: any) => ({
            departmentId: Number(item.departmentId),
            name: item.name,
          }))
          .filter((department: Department) => Number.isInteger(department.departmentId) && department.departmentId > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        const availableIds = new Set(this.departments.map((department) => department.departmentId));

        const oldSelection = [...this.selectedDepartmentIds];

        this.selectedDepartmentIds = oldSelection.filter((id) => availableIds.has(id));

        this.saveFilterState();

        if (oldSelection.length !== this.selectedDepartmentIds.length) {
          this.currentPage = 1;
          this.page = 0;
          this.getReassignSummaryReport();
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.departments = [];
        this.selectedDepartmentIds = [];
      },
    });
  }

  loadActiveUsers(): void {
    this.dataprovider.getallUsers().subscribe({
      next: (users) => {
        this.assignedUsers = users || [];

        if (this.selectedUserId && !this.userSearchText) {
          const found: any = this.assignedUsers.find((u: any) => u.userId === this.selectedUserId);
          if (found) this.userSearchText = found.firstName;
        }
      },
      error: (err) => console.error('Error loading users:', err),
    });
  }

  onSearch(): void {
    this.searchQuery = this.userSearchText.trim();
    this.search = this.searchQuery;

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReassignSummaryReport();
    this.loadDepartments();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.saveFilterState();
    this.getReassignSummaryReport();
  }

  saveFilterState(): void {
    this.sessionService.setItem(this.filterKey, {
      currentPage: this.currentPage,
      page: this.page,
      size: this.size,
      searchText: this.userSearchText.trim(),
      userId: this.selectedUserId,
      departmentIds: this.selectedDepartmentIds,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
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
    return this.apiResponse?.totalElements || 0;
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

  filterUsers(): void {
    const search = this.userSearchText.toLowerCase().trim();

    if (!search) {
      this.selectedUserId = 0;
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    if (search.length < 3) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.filteredUsers = this.assignedUsers.filter((u: any) => (u.firstName || '').toLowerCase().includes(search));
    this.showUserDropdown = true;
  }

  selectUser(user: AssignedUser): void {
    this.userSearchText = user.firstName;
    this.selectedUserId = Number(user.userId);
    this.showUserDropdown = false;
    this.onSearch();
  }

  clearUserSearch(): void {
    this.userSearchText = '';
    this.searchQuery = '';
    this.search = '';
    this.selectedUserId = 0;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.onSearch();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.search = '';
    this.userSearchText = '';
    this.selectedUserId = 0;

    this.fromDate = null;
    this.toDate = null;

    this.selectedDepartmentIds = [];
    this.showDepartmentDropdown = false;

    this.currentPage = 1;
    this.page = 0;

    this.filteredUsers = [];
    this.userSearchText =""
    this.showUserDropdown = false;



    this.saveFilterState();
    this.getReassignSummaryReport();
  }

  departments: Department[] = [];
  selectedDepartmentIds: number[] = [];
  showDepartmentDropdown = false;

  onDepartmentChange(departmentId: number, checked: boolean): void {
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return;
    }

    if (checked) {
      if (!this.selectedDepartmentIds.includes(departmentId)) {
        this.selectedDepartmentIds = [...this.selectedDepartmentIds, departmentId];
      }
    } else {
      this.selectedDepartmentIds = this.selectedDepartmentIds.filter((id) => id !== departmentId);
    }

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReassignSummaryReport();
  }

  clearDepartments(): void {
    this.selectedDepartmentIds = [];
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getReassignSummaryReport();
  }

  exportToExcel(): void {
    if (this.exportingExcel) {
      return;
    }

    this.exportingExcel = true;

    const fromDate = this.fromDate ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? undefined) : undefined;

    const toDate = this.toDate ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? undefined) : undefined;

    const username = this.searchQuery.trim();
    const departmentIds = [...this.selectedDepartmentIds];

    this.dataprovider.getOldUserTaskCount(0, this.size, fromDate, toDate, username, departmentIds).subscribe({
      next: (response: any) => {
        const firstPageData: ReassignRow[] = response?.content ?? [];
        const totalPages = response?.totalPages ?? 1;

        if (totalPages <= 1) {
          this.downloadExcel(firstPageData);
          return;
        }

        const requests: Observable<any>[] = [];

        for (let pageIndex = 1; pageIndex < totalPages; pageIndex++) {
          requests.push(this.dataprovider.getOldUserTaskCount(pageIndex, this.size, fromDate, toDate, username, departmentIds));
        }

        forkJoin(requests).subscribe({
          next: (responses: any[]) => {
            const allRows: ReassignRow[] = [...firstPageData, ...responses.flatMap((pageResponse: any) => pageResponse?.content ?? [])];

            this.downloadExcel(allRows);
          },
          error: (error) => {
            console.error('Error fetching reassign summary pages for export:', error);

            this.exportingExcel = false;

            Swal.fire({
              icon: 'error',
              title: 'Export Failed',
              text: 'Unable to export the reassign summary report. Please try again.',
            });
          },
        });
      },
      error: (error) => {
        console.error('Error fetching reassign summary report for export:', error);

        this.exportingExcel = false;

        Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'Unable to fetch the report for Excel export. Please try again.',
        });
      },
    });
  }

  private downloadExcel(data: ReassignRow[]): void {
    try {
      const rows = data.map((row, index) => ({
        'Sr. No.': index + 1,
        User: row.userName ?? '',
        Count: row.taskCount ?? 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      worksheet['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 15 }];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reassign Summary');

      const now = new Date();
      const pad = (value: number) => String(value).padStart(2, '0');

      const timestamp = `${now.getFullYear()}` + `${pad(now.getMonth() + 1)}` + `${pad(now.getDate())}_` + `${pad(now.getHours())}` + `${pad(now.getMinutes())}` + `${pad(now.getSeconds())}`;

      const filename = `Reassign_Summary_Report_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error creating Excel file:', error);

      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Unable to create the Excel file. Please try again.',
      });
    } finally {
      this.exportingExcel = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.department-dropdown')) {
      this.showDepartmentDropdown = false;
    }
  }
}
