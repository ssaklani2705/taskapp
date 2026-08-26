import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataProviderService } from '../../../service/data-provider.service';
import { Router } from '@angular/router';

interface Client {
  clientId: number;
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
  userId: number;
  regdate: string;
  moddate: string;
  taxFlag: number | string;
  location: string;
}

@Component({
  selector: 'app-client-index',
  imports: [CommonModule, FormsModule],
  templateUrl: './client-index.html',
  styleUrl: './client-index.scss',
})
export class ClientIndex {
  clients: Client[] = [];

  isLoading = false;

  currentPage = 1;
  page = 0;
  size = 5;
  totalRecords = 0;
  totalPages = 1;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isPanelVisible = true;

  addPer = 'Y';
  editPer = 'Y';
  deletePer = 'Y';

  searchQuery = '';
  search = '';
  selectedStatus = '';
  statusIndex = 0;

  stateId = 0;
  managerId = 0;

  states: any[] = [];
  managers: any[] = [];

  filterKey = 'clientFilter';

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.restoreFilterState();
    this.loadStates();
    this.loadManagers();
    this.getClientDetails();
  }

  getClientDetails(): void {
    const clientName = '';
    const clientCode = '';
    const contactName = '';
    const contactEmail = '';

    this.dataprovider
      .getClientDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.managerId,
        this.stateId,
        clientName,
        clientCode,
        contactName,
        contactEmail,
        this.search,
        this.sortColumn || 'name',
        this.sortDirection,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Client Details Response:', response);

          this.clients = response.data || [];

          this.totalRecords = response.totalElements || 0;
          this.totalPages = response.totalPages || 1;
          this.currentPage = (response.currentPage ?? this.page) + 1;
          this.page = response.currentPage ?? this.page;
          this.size = response.pageSize ?? this.size;
        },

        error: (error) => {
          console.error('Error fetching client details:', error);

          this.clients = [];
          this.totalRecords = 0;
          this.totalPages = 1;
        },
      });
  }

  loadStates(): void {
    this.dataprovider.getStates().subscribe({
      next: (response: any) => {
        console.log('States:', response);

        this.states = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.states = [];
      },
    });
  }

  loadManagers(): void {
    this.dataprovider.getManagers().subscribe({
      next: (response: any) => {
        console.log('Active Managers:', response);

        this.managers = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.managers = [];
      },
    });
  }

  onStateChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
  }

  onManagerChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
  }

  addClient() {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-client'], {
      state: filterState,
    });
  }

  viewClient(ClientId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-client', ClientId], {
      state: filterState,
    });
  }

  editClient(ClientId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-client', ClientId], {
      state: filterState,
    });
  }

  onDeleteUser(ClientId: number): void {}

  onStatusChange(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();

    this.getClientDetails();
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();

    this.getClientDetails();
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
      stateId: this.stateId,
      managerId: this.managerId,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
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

    this.getClientDetails();
  }

  onChangeRecordsPerPage(): void {
    this.size = Number(this.size);

    if (!this.size || this.size < 1) {
      this.size = 5;
    }

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
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

      if (filterState.stateId !== undefined) {
        this.stateId = Number(filterState.stateId);
      }

      if (filterState.managerId !== undefined) {
        this.managerId = Number(filterState.managerId);
      }

      if (this.statusIndex > 0) {
        this.selectedStatus = String(this.statusIndex);
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
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

  columns = [
    {
      key: 'name',
      label: 'Client Name',
      sortable: true,
    },
    {
      key: 'code',
      label: 'Client Code',
      sortable: true,
    },
    {
      key: 'managerName',
      label: 'Manager',
      sortable: true,
    },
    {
      key: 'stateName',
      label: 'State',
      sortable: true,
    },
    {
      key: 'contactName',
      label: 'Contact Name',
      sortable: true,
    },
    {
      key: 'contactEmail',
      label: 'Contact Email',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
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

    this.clients = [...this.clients].sort((a: any, b: any) => {
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
