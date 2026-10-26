
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { DataProviderService } from '../../../service/data-provider.service';
import { SessionStorageService } from '../../../service/session-storage.service';

import Swal from 'sweetalert2';
import { Common } from '../../../classes/common';

interface Service {
  serviceId: number;
  name: string;
  status: number;
  registrationDate?: string;
  modificationDate?: string;
}

@Component({
  selector: 'app-service-index',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIcon,
    MatDivider
  ],
  templateUrl: './service-index.html',
  styleUrl: './service-index.scss'
})
export class ServiceIndex implements OnInit {

  services: Service[] = [];
  apiResponseService: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  recordsPerPage = environment.recordsPerPage;
  size = environment.size;

  selectedStatus = '';
  statusIndex = 0;

  common = new Common();

  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  approvePer = 'N';
  adminApprovePer = 'N';

  userId: any;
  moduleName = '';

  isPanelVisible = true;
  showHeaderBar = true;

  // Add SERVICE_FILTER to SESSION_KEYS if it does not exist yet.
  filterKey = SESSION_KEYS.SERVICE_FILTER;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns = [
    { key: 'name', label: 'Service Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private sessionService: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');

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
        } catch (error) {
          console.error('Error reading module permissions:', error);
        }
      }

      const filterState = this.sessionService.getItem(this.filterKey);

      if (filterState) {
        this.currentPage = filterState.currentPage ?? 1;
        this.page = filterState.page ?? this.currentPage - 1;
        this.size = filterState.size ?? environment.size;
        this.recordsPerPage = this.size;

        this.statusIndex = filterState.statusIndex ?? 0;
        this.selectedStatus =
          this.statusIndex > 0 ? String(this.statusIndex) : '';

        this.search = filterState.searchText ?? '';
        this.searchQuery = this.search;
      }
    }

    this.getServiceDetails();
  }

  saveFilterState(): void {
    this.sessionService.setItem(this.filterKey, {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search.trim(),
      page: this.page,
      size: this.size
    });
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getServiceDetails(): void {
    this.dataprovider
      .getServiceList(this.page, this.size, this.statusIndex, this.search)
      .subscribe({
        next: (response: any) => {
          const result = response?.data ?? {};

          this.apiResponseService = result;
          this.services = result?.data ?? [];

          // Support responses that return the list directly.
          if (Array.isArray(response?.data)) {
            this.services = response.data;
            this.apiResponseService = {
              totalElements: response.data.length
            };
          }

          // Keep the page number valid if records were removed.
          if (
            this.services.length === 0 &&
            this.currentPage > 1 &&
            this.page >= this.totalPages
          ) {
            this.currentPage = Math.max(1, this.totalPages);
            this.page = this.currentPage - 1;
            this.saveFilterState();
            this.getServiceDetails();
          }
        },
        error: (error: any) => {
          console.error('Error fetching service details:', error);
          this.services = [];
          this.apiResponseService = { totalElements: 0, data: [] };
        }
      });
  }

  get paginatedServices(): Service[] {
    return this.services;
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex =
      this.selectedStatus === '' ? 0 : Number(this.selectedStatus);

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getServiceDetails();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.search = '';
    this.selectedStatus = '';
    this.statusIndex = 0;
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getServiceDetails();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();
    this.getServiceDetails();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 5;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const result: number[] = [];

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  get totalPages(): number {
    const total = Number(this.apiResponseService?.totalElements ?? 0);

    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  get recordSummary(): string {
    const totalRecords = Number(
      this.apiResponseService?.totalElements ?? 0
    );

    const startRecord =
      totalRecords === 0
        ? 0
        : (this.currentPage - 1) * this.recordsPerPage + 1;

    const endRecord = Math.min(
      this.currentPage * this.recordsPerPage,
      totalRecords
    );

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} records)`;
  }

  getStatusName(status: number): string {
    switch (Number(status)) {
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

  sortData(column: string): void {
    if (!column) {
      return;
    }

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.services.sort((a: any, b: any) => {
      let valA = a[column] ?? '';
      let valB = b[column] ?? '';

      if (
        typeof valA === 'number' ||
        (valA !== '' && !isNaN(Number(valA)))
      ) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
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

  addService(): void {
    this.saveFilterState();
    this.router.navigate(['/add-service']);
  }

  viewService(serviceId: number): void {
    this.saveFilterState();
    this.router.navigate(['/view-service', serviceId]);
  }

  editService(serviceId: number): void {
    this.saveFilterState();
    this.router.navigate(['/edit-service', serviceId]);
  }

  onDeleteService(serviceId: number): void {
    const payload = {
      serviceId,
      userId: this.userId ? Number(this.userId) : null
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'small-confirm-popup'
      }
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.dataprovider.deleteService(payload).subscribe({
        next: (response: any) => {
          if (response?.success) {
            Swal.fire('Deleted!', response.message, 'success');
            this.getServiceDetails();
          } else {
            Swal.fire(
              'Error',
              response?.message || 'Unable to delete service.',
              'error'
            );
          }
        },
        error: (error: any) => {
          console.error('Error deleting service:', error);
          Swal.fire(
            'Error',
            'Something went wrong while deleting the service.',
            'error'
          );
        }
      });
    });
  }
}
