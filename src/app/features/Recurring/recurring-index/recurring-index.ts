import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataProviderService } from '../../../service/data-provider.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

interface Recurring {
  recurringId: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  type: number;
  date: number | null;
  day: number | null;
  month: number | null;
  taskCatId: number;
  taskCatName: string;
  status: number;
}

interface TaskCategory {
  taskcategoryId: number;
  name: string;
}

@Component({
  selector: 'app-recurring-index',
  imports: [CommonModule, FormsModule, MatInputModule, MatCardModule, MatIcon, MatDivider],
  templateUrl: './recurring-index.html',
  styleUrl: './recurring-index.scss',
})
export class RecurringIndex {
  recurring: Recurring[] = [];
  userId!: number;
  isLoading = false;

  currentPage = 1;
  page = 0;
  size = 5;
  totalRecords = 0;
  totalPages = 1;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isPanelVisible = true;
  filterKey = SESSION_KEYS.RECURRING_FILTER;

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  moduleName: string = '';
  showHeaderBar: boolean = true;
  exportExcel: string = 'N';

  searchQuery = '';
  search = '';
  selectedStatus = '';
  statusIndex = 0;

  selectedClientId = 0;
  selectedType = 0;
  selectedTaskCatId = 0;

  clients: any[] = [];
  taskCategories: TaskCategory[] = [];

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      const storedUserId = sessionStorage.getItem('userId');

      if (storedUserId) {
        this.userId = Number(storedUserId);
      }
    }

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
          this.approvePer = parsed.approvePer ?? 'N';
          this.adminApprovePer = parsed.adminApprovePer ?? 'N';
          this.exportExcel = parsed.exportExcel ?? 'N';
        } catch (error) {
          console.error('Invalid selectedModuleDetail:', error);
        }
      }
    }

    this.loadRecurringClients();
    this.loadTaskCategories();
    this.restoreFilterState();
    this.getRecurringDetails();
  }

  private loadRecurringClients(): void {
    if (!this.userId) {
      console.error('User ID not found.');
      return;
    }

    this.dataprovider.getRecurringClients(this.userId).subscribe({
      next: (response: any) => {
        console.log('Recurring Clients:', response);

        this.clients = response || [];
      },

      error: (error) => {
        console.error('Error fetching recurring clients:', error);

        this.clients = [];
      },
    });
  }

  private loadTaskCategories(): void {
    this.dataprovider.getTaskCategories().subscribe({
      next: (response: any) => {
        console.log('Task Categories:', response);

        this.taskCategories = response || [];
      },

      error: (error) => {
        console.error('Error fetching task categories:', error);

        this.taskCategories = [];
      },
    });
  }

  getRecurringDetails(): void {
    this.isLoading = true;

    this.dataprovider
      .getRecurringDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search,
        this.selectedClientId,
        this.selectedType,
        this.selectedTaskCatId,
        this.sortColumn || 'title',
        this.sortDirection,
        this.userId,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Recurring Details Response:', response);

          this.recurring = response?.data || [];

          this.totalRecords = Number(response?.totalElements || 0);
          this.totalPages = Number(response?.totalPages || 1);

          this.currentPage = Number(response?.currentPage ?? this.page) + 1;

          this.page = Number(response?.currentPage ?? this.page);

          this.size = Number(response?.pageSize ?? this.size);

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Error fetching recurring details:', error);

          this.recurring = [];
          this.totalRecords = 0;
          this.totalPages = 1;
          this.currentPage = 1;

          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.selectedClientId = Number(this.selectedClientId || 0);
    this.selectedType = Number(this.selectedType || 0);
    this.selectedTaskCatId = Number(this.selectedTaskCatId || 0);

    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();

    this.getRecurringDetails();
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.search = '';

    this.selectedStatus = '';
    this.statusIndex = 0;

    this.selectedClientId = 0;
    this.selectedType = 0;
    this.selectedTaskCatId = 0;

    this.currentPage = 1;
    this.page = 0;

    this.sortColumn = 'title';
    this.sortDirection = 'asc';

    this.saveFilterState();

    this.getRecurringDetails();
  }

  onChangeRecordsPerPage(): void {
    this.size = Number(this.size);

    if (!this.size || this.size < 1) {
      this.size = 5;
    }

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getRecurringDetails();
  }

  onFilterChange(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.selectedClientId = Number(this.selectedClientId || 0);
    this.selectedType = Number(this.selectedType || 0);
    this.selectedTaskCatId = Number(this.selectedTaskCatId || 0);
    this.search = this.searchQuery.trim();

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getRecurringDetails();
  }

  addRecurring() {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      clientId: this.selectedClientId,
      type: this.selectedType,
      taskCatId: this.selectedTaskCatId,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-recurring'], {
      state: filterState,
    });
  }

  viewRecurring(recurringId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      clientId: this.selectedClientId,
      type: this.selectedType,
      taskCatId: this.selectedTaskCatId,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-recurring', recurringId], {
      state: filterState,
    });
  }

  editRecurring(recurringId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      clientId: this.selectedClientId,
      type: this.selectedType,
      taskCatId: this.selectedTaskCatId,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-recurring', recurringId], {
      state: filterState,
    });
  }

  onDeleteUser(recurringId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this recurring?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
    popup: 'small-confirm-popup'
  }
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteRecurring(recurringId, this.userId).subscribe({
          next: (response: any) => {
            if (response?.success) {
              Swal.fire({
                title: 'Deleted!',
                text: response.message || 'Recurring deleted successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
              }).then(() => {
                this.getRecurringDetails();
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: response?.message || 'Failed to delete recurring.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },

          error: (error) => {
            console.error('Error deleting recurring:', error);

            Swal.fire({
              title: 'Error',
              text: error?.error?.message || 'Something went wrong while deleting the recurring.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  private saveFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,

      clientId: this.selectedClientId,
      type: this.selectedType,
      taskCatId: this.selectedTaskCatId,

      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
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
      const filterState = JSON.parse(stored);

      if (filterState.currentPage) {
        this.currentPage = Number(filterState.currentPage);
      }

      this.page = this.currentPage - 1;

      if (filterState.statusIndex !== undefined) {
        this.statusIndex = Number(filterState.statusIndex);
      }

      if (filterState.searchText !== undefined) {
        this.search = filterState.searchText;

        this.searchQuery = filterState.searchText;
      }

      if (filterState.size) {
        this.size = Number(filterState.size);
      }

      if (this.statusIndex > 0) {
        this.selectedStatus = String(this.statusIndex);
      }

      if (filterState.clientId !== undefined) {
        this.selectedClientId = Number(filterState.clientId);
      }

      if (filterState.type !== undefined) {
        this.selectedType = Number(filterState.type);
      }

      if (filterState.taskCatId !== undefined) {
        this.selectedTaskCatId = Number(filterState.taskCatId);
      }

      if (filterState.sortColumn) {
        this.sortColumn = filterState.sortColumn;
      }

      if (filterState.sortDirection) {
        this.sortDirection = filterState.sortDirection;
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
  }

  get recordSummary(): string {
    if (this.totalRecords === 0) {
      return 'Page 0 of 0, (0 - 0 of 0 records)';
    }

    const start = (this.currentPage - 1) * this.size + 1;

    const end = Math.min(this.currentPage * this.size, this.totalRecords);

    return (
      `Page ${this.currentPage} of ${this.totalPages}, ` +
      `(${start} - ${end} of ${this.totalRecords} records)`
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

  getTypeLabel(type: number | string): string {
    switch (+type) {
      case 1:
        return 'Daily';

      case 2:
        return 'Weekly';

      case 3:
        return 'Monthly';

      case 4:
        return 'Yearly';

      default:
        return 'Unknown';
    }
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.goToPage(1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.goToPage(this.totalPages);
    }
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

    let end = Math.min(this.totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    if (pageNumber === this.currentPage) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();

    this.getRecurringDetails();
  }

  columns = [
    {
      key: 'name',
      label: 'Client Name',
      sortable: true,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'taskCatName',
      label: 'Task Category',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;

      this.sortDirection = 'asc';
    }

    this.recurring = [...this.recurring].sort((a: any, b: any) => {
      let valueA = a[column];

      let valueB = b[column];

      if (column === 'status') {
        valueA = Number(valueA);

        valueB = Number(valueB);
      }

      if (valueA === null || valueA === undefined) {
        valueA = '';
      }

      if (valueB === null || valueB === undefined) {
        valueB = '';
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();

        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }
}
