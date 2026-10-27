import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DataProviderService } from '../../../service/data-provider.service';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';
import { AssignedUser, Client, MY_DATE_TIME_FORMATS, TaskCategory } from '../../../features/task/task-index/task-index';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
interface ReassignRow {
  taskDate: any;
  taskName: string;
  taskCategory: string;
  clientName: string;
  oldUser: string;
  newUser: string;
}
@Component({
  selector: 'app-reassign-report',
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
  templateUrl: './reassign-report.html',
  styleUrl: './reassign-report.scss',
})
export class ReassignReport implements OnInit {
  rows: ReassignRow[] = [];
  apiResponse: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  isPanelVisible = true;
  filterKey = SESSION_KEYS.ACCESS_REPORT_FILTER;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  selectedTaskCategory = '';
  selectedClientId = 0;
  selectedUserId = 0;

  taskCategories: TaskCategory[] = [];
  groupedCategories: { department: string; items: TaskCategory[] }[] = [];
  showTaskCategoryDropdown = false;
  categorySearchText = '';

  constructor(
    private dataprovider: DataProviderService,
    private datePipe: DatePipe,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);
    this.loadDepartments();
    this.selectedTaskCatId = Number(this.selectedTaskCategory) || 0;
    const s = this.sessionService.getItem(this.filterKey);

    if (s) {
      this.currentPage = s.currentPage ?? 1;
      this.page = s.page ?? this.currentPage - 1;
      this.size = s.size ?? environment.size;
      this.recordsPerPage = this.size;
      this.search = s.searchText ?? '';
      this.searchQuery = this.search;
      this.selectedTaskCategory = s.taskCategory ?? '';
      this.selectedClientId = s.clientId ?? 0;
      this.selectedUserId = s.userId ?? 0;
      this.fromDate = s.fromDate ? new Date(s.fromDate) : null;
      this.toDate = s.toDate ? new Date(s.toDate) : null;
    }
    this.loadTaskCategories();
    this.getReassignReport();
    this.loadActiveUsers();
    this.loadActiveClients();
  }

  saveFilterState(): void {
    this.sessionService.setItem(this.filterKey, {
      currentPage: this.currentPage,
      page: this.page,
      size: this.size,
      searchText: this.search.trim(),
      taskCategory: this.selectedTaskCategory,
      clientId: this.selectedClientId,
      userId: this.selectedUserId,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
  }

  getReassignReport(): void {
    const from = this.fromDate ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? '') : '';
    const to = this.toDate ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? '') : '';

    this.dataprovider
      .getTaskReassignReport(
        this.page,
        this.size,
        this.search,
        from,
        to,
        Number(this.selectedTaskCategory) || 0,
        this.selectedClientId || 0,
        this.selectedUserId || 0,
        this.selectedDepartmentIds.join(','),
      )
      .subscribe({
        next: (response) => {
          this.apiResponse = response;
          this.rows = response.content || []; // Spring Page uses "content"
        },
        error: (err) => console.error('Error fetching reassign report:', err),
      });
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();
    this.getReassignReport();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.saveFilterState();
    this.getReassignReport();
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

  formatDateTime(value: any): string {
    if (!value) return '';
    return this.datePipe.transform(value, 'dd-MM-yyyy hh:mm a') || '';
  }

  toggleTaskCategoryDropdown(): void {
    this.showTaskCategoryDropdown = !this.showTaskCategoryDropdown;
    this.categorySearchText = '';

    if (this.showTaskCategoryDropdown) {
      setTimeout(() => document.getElementById('taskCategorySearchInput')?.focus(), 0);
    }
  }

  selectTaskCategory(category: TaskCategory): void {
    this.selectedTaskCatId = Number(category.taskcategoryId); // drives the label and highlight
    this.selectedTaskCategory = String(category.taskcategoryId); // used by the API call
    this.showTaskCategoryDropdown = false;
    this.categorySearchText = '';
    this.onSearch();
  }
  clearTaskCategory(): void {
    this.selectedTaskCatId = 0;
    this.selectedTaskCategory = '';
    this.showTaskCategoryDropdown = false;
    this.categorySearchText = '';
    this.onSearch();
  }
  get filteredCategories(): TaskCategory[] {
    const q = this.categorySearchText.trim().toLowerCase();
    if (!q) return this.taskCategories;
    return this.taskCategories.filter((c) => (c.name || '').toLowerCase().includes(q));
  }

  loadTaskCategories(): void {
    this.dataprovider.getTaskCategories().subscribe({
      next: (res: any) => {
        this.taskCategories = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
        this.buildGroupedCategories();
      },
      error: (err) => console.error('Error loading task categories:', err),
    });
  }
  private buildGroupedCategories(): void {
    const map = new Map<string, TaskCategory[]>();

    this.taskCategories.forEach((c: any) => {
      const dept: string = c.departmentName || 'Other';
      map.set(dept, [...(map.get(dept) ?? []), c]);
    });

    this.groupedCategories = [...map]
      .map(([department, items]) => ({
        department,
        items: items.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      }))
      .sort((a, b) => a.department.localeCompare(b.department));
  }
  clientSearchText: string = '';
  showClientDropdown: boolean = false;
  clients: Client[] = [];
  filteredClients: any[] = [];
  selectedClient: string = '';
  assignedUsers: AssignedUser[] = [];
  selectedAssignedTo: string = '';
  filterClients(): void {
    const search = this.clientSearchText.toLowerCase().trim();

    if (search.length < 3) {
      this.showClientDropdown = false;
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.clients.filter((client: any) => client.name && client.name.toLowerCase().includes(search));

    this.showClientDropdown = true;

    if (!search) {
      this.selectedClient = '';
      this.filteredClients = [...this.clients];
    }
  }

  selectClient(client: any): void {
    this.clientSearchText = client.name;
    this.selectedClientId = Number(client.clientId); // this is what the API call uses
    this.selectedClient = String(client.clientId);
    this.showClientDropdown = false;

    this.onSearch();
  }

  clearClientSearch(): void {
    this.clientSearchText = '';
    this.selectedClientId = 0;
    this.selectedClient = '';

    this.filteredClients = [];
    this.showClientDropdown = false;

    this.onSearch();
  }
  exportExcelPer = 'Y';
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

  clearFilters(): void {
    this.selectedDepartmentIds = [];
    this.selectedTaskCatId = 0;
    // search
    this.searchQuery = '';
    this.search = '';

    // dates
    this.fromDate = null;
    this.toDate = null;

    // dropdowns
    this.selectedTaskCategory = '';
    this.selectedUserId = 0;
    this.selectedAssignedTo = '';

    // client
    this.selectedClientId = 0;
    this.selectedClient = '';
    this.clientSearchText = '';
    this.filteredClients = [];
    this.showClientDropdown = false;

    // category dropdown state
    this.categorySearchText = '';
    this.showTaskCategoryDropdown = false;

    // paging
    this.currentPage = 1;
    this.page = 0;

    // clear saved filter, then reload
    this.saveFilterState();
    this.getReassignReport();
  }

  loadActiveClients(): void {
    this.dataprovider.findByActiveClient().subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);

        // restore the client name if a client filter was saved in session
        if (this.selectedClientId && !this.clientSearchText) {
          const found = this.clients.find((c: any) => c.clientId === this.selectedClientId);
          if (found) this.clientSearchText = found.name;
        }
      },
      error: (err) => console.error('Error loading active clients:', err),
    });
  }

  isExporting = false;

  exportToExcel(): void {
    const totalRecords = this.totalRecords;

    if (totalRecords === 0) {
      Swal.fire('No Data', 'No records available for export.', 'info');
      return;
    }

    if (this.isExporting) return;
    this.isExporting = true;

    // same filters as getReassignReport(), but page 0 and size = total filtered records
    const from = this.fromDate ? (this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') ?? '') : '';
    const to = this.toDate ? (this.datePipe.transform(this.toDate, 'yyyy-MM-dd') ?? '') : '';

    this.dataprovider.getTaskReassignReport(0, totalRecords, this.search, from, to, Number(this.selectedTaskCategory) || 0, this.selectedClientId || 0, this.selectedUserId || 0,this.selectedDepartmentIds.join(',')).subscribe({
      next: (response: any) => {
        this.isExporting = false;
        const allRows: ReassignRow[] = response?.content || [];

        if (allRows.length === 0) {
          Swal.fire('No Data', 'No records available for export.', 'info');
          return;
        }

        this.downloadReassignExcel(allRows);
      },
      error: (err) => {
        this.isExporting = false;
        console.error('Error exporting reassign report:', err);
        Swal.fire('Error', 'Unable to export reassign report.', 'error');
      },
    });
  }

  private downloadReassignExcel(rows: ReassignRow[]): void {
    const data = rows.map((r, index) => ({
      'Sr No': index + 1,
      'Task Date': this.formatDateTime(r.taskDate),
      'Task Name': r.taskName || '',
      'Task Category': r.taskCategory || '',
      Client: r.clientName || '',
      'Previous User': r.oldUser || '',
      'New User': r.newUser || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet['!cols'] = [
      { wch: 8 }, // Sr No
      { wch: 20 }, // Task Date
      { wch: 40 }, // Task Name
      { wch: 25 }, // Task Category
      { wch: 30 }, // Client
      { wch: 22 }, // Old User
      { wch: 22 }, // New User
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reassign Report');

    const stamp = this.datePipe.transform(new Date(), 'dd-MM-yyyy_HHmm');
    XLSX.writeFile(workbook, `Reassign_Report_${stamp}.xlsx`);
  }

  userSearchText = '';
  showUserDropdown = false;
  filteredUsers: AssignedUser[] = [];

  filterUsers(): void {
    const search = this.userSearchText.toLowerCase().trim();

    // emptied the box: remove the user filter
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

  selectUser(user: any): void {
    this.userSearchText = user.firstName;
    this.selectedUserId = Number(user.userId);
    this.showUserDropdown = false;
    this.onSearch();
  }

  clearUserSearch(): void {
    this.userSearchText = '';
    this.selectedUserId = 0;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.onSearch();
  }
  selectedTaskCatId = 0;

  get filteredGroupedCategories(): { department: string; items: TaskCategory[] }[] {
    const q = this.categorySearchText.trim().toLowerCase();
    if (!q) return this.groupedCategories;

    return this.groupedCategories
      .map((g) => {
        // department name matches: keep all its categories
        if (g.department.toLowerCase().includes(q)) return g;
        return {
          department: g.department,
          items: g.items.filter((c) => (c.name || '').toLowerCase().includes(q)),
        };
      })
      .filter((g) => g.items.length > 0);
  }
  get selectedTaskCategoryLabel(): string {
    if (!this.selectedTaskCatId) return '--All Task Categories--';
    const c = this.taskCategories.find((x: any) => Number(x.taskcategoryId) === Number(this.selectedTaskCatId));
    return c ? c.name : '--All Task Categories--';
  }

@HostListener('document:click', ['$event'])
closeDropdowns(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  if (!target.closest('.task-category-dropdown')) {
    this.showTaskCategoryDropdown = false;
    this.categorySearchText = '';
  }
  if (!target.closest('.status-dropdown')) {
    this.showDepartmentDropdown = false;
  }
}
  departments: { departmentId: number; name: string }[] = [];
  selectedDepartmentIds: number[] = [];
  showDepartmentDropdown = false;

  loadDepartments(): void {
    this.dataprovider.getActiveDepartments().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
        this.departments = [...list].sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }));
      },
      error: (err) => console.error('Error loading departments:', err),
    });
  }

  isDepartmentChecked(id: number): boolean {
    return this.selectedDepartmentIds.includes(id);
  }

  toggleDepartment(id: number): void {
    this.selectedDepartmentIds = this.isDepartmentChecked(id) ? this.selectedDepartmentIds.filter((x) => x !== id) : [...this.selectedDepartmentIds, id];
    this.onSearch();
  }

  getSelectedDepartmentLabel(): string {
    if (this.selectedDepartmentIds.length === 0) return '--All Departments--';
    const names = this.departments.filter((d) => this.selectedDepartmentIds.includes(d.departmentId)).map((d) => d.name);
    return names.length > 2 ? `${names.length} Departments Selected` : names.join(', ');
  }
}
