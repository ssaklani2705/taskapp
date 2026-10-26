import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { DataProviderService } from '../../../service/data-provider.service';
import { SessionStorageService } from '../../../service/session-storage.service';
import Swal from 'sweetalert2';
import { Common } from '../../../classes/common';

interface Service {
  serviceId: number;
  name: string;
}

export interface Plan {
  planId: any;
  name: string;
  rate: any;
  description: string;
  status: any;
  userId: any;
  serviceIds: number[];
  serviceNames?: string[];
}

@Component({
  selector: 'app-plan-index',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIcon,
    MatDivider
  ],
  templateUrl: './plan-index.html',
  styleUrl: './plan-index.scss',
})
export class PlanIndex {
  plans: Plan[] = [];
  apiResponsePlan: any = {};

  searchQuery: string = '';
  search: string = '';

  currentPage: number = 1;
  page: number = 0;
  recordsPerPage: number = environment.recordsPerPage;
  size: number = environment.size;

  selectedStatus: string = '';
  statusIndex: number = 0;

  // Service filter
  services: Service[] = [];
  selectedServiceId: number | '' = '';

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';

  selectedmodules: any[] = [];

  createdBy: any;
  userId: any;

  moduleName: string = '';

  common = new Common();
  taskCategory: any = {};

  isPanelVisible: boolean = true;
  showHeaderBar: boolean = true;

  filterKey = SESSION_KEYS.PLAN_FILTER;

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');

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

        this.selectedServiceId =
          filterState.selectedServiceId !== undefined &&
          filterState.selectedServiceId !== null &&
          filterState.selectedServiceId !== ''
            ? Number(filterState.selectedServiceId)
            : '';
      }
    }

    this.loadActiveServices();
    this.getPlanDetails();
  }

  // Load active services for the filter dropdown
  // loadActiveServices(): void {
  //   this.dataprovider.getActiveServices().subscribe({
  //     next: (response: Service[]) => {
  //       this.services = response || [];
  //       this.mapPlanServices();
  //     },
  //     error: (error) => {
  //       console.error('Error loading active services:', error);
  //       this.services = [];
  //       this.mapPlanServices();
  //     }
  //   });
  // }
//   loadActiveServices(): void {
//   this.dataprovider.getActiveServices().subscribe({
//     next: (response: any) => {
//       this.services = response?.data || [];
//       this.mapPlanServices();
//     },
//     error: (error: any) => {
//       console.error('Error loading active services:', error);
//       this.services = [];
//       this.mapPlanServices();
//     }
//   });
// }

loadActiveServices(): void {
  this.dataprovider.getActiveServices().subscribe({
    next: (response: any) => {
      console.log('Active Services API Response:', response);

      this.services = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response)
            ? response
            : [];

      console.log('Loaded Services:', this.services);

      this.mapPlanServices();
    },
    error: (error: any) => {
      console.error('Error loading active services:', error);
      this.services = [];
      this.mapPlanServices();
    }
  });
}

  // Map service IDs to service names for display
  // mapPlanServices(): void {
  //   this.plans = this.plans.map((plan: Plan) => {
  //     const selectedIds = this.getServiceIds(plan);

  //     return {
  //       ...plan,
  //       serviceNames: this.services
  //         .filter(service =>
  //           selectedIds.includes(Number(service.serviceId))
  //         )
  //         .map(service => service.name)
  //     };
  //   });
  // }

  mapPlanServices(): void {
  this.plans = this.plans.map((plan: Plan) => {
    const selectedIds = this.getServiceIds(plan);

    return {
      ...plan,
      serviceNames: this.services
        .filter((service: Service) =>
          selectedIds.includes(Number(service.serviceId))
        )
        .map((service: Service) => service.name)
    };
  });
}

  // Safely handle service IDs returned as numbers or strings
  private getServiceIds(plan: Plan): number[] {
    const ids: any = (plan as any).serviceIds;

    if (Array.isArray(ids)) {
      return ids
        .filter((id: any) => id !== null && id !== undefined && id !== '')
        .map((id: any) => Number(id))
        .filter((id: number) => Number.isFinite(id));
    }

    // Fallback if the API returns comma-separated IDs
    if (typeof ids === 'string' && ids.trim()) {
      return ids
        .split(',')
        .map((id: string) => Number(id.trim()))
        .filter((id: number) => Number.isFinite(id));
    }

    return [];
  }

  // Plans displayed in the table, filtered by selected service
  get paginatedPlans(): Plan[] {
    if (this.selectedServiceId === '') {
      return this.plans;
    }

    const selectedId = Number(this.selectedServiceId);

    return this.plans.filter((plan: Plan) =>
      this.getServiceIds(plan).includes(selectedId)
    );
  }

  saveFilterState(): void {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search.trim(),
      page: this.page,
      size: this.size,
      selectedServiceId: this.selectedServiceId
    };

    this.sessionService.setItem(this.filterKey, filterState);
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getPlanDetails(): void {
    this.dataprovider
      .getPlanList(this.page, this.size, this.statusIndex, this.search)
      .subscribe({
        next: (response: any) => {
          this.apiResponsePlan = response?.data || {};
          this.plans = response?.data?.data || [];
          this.mapPlanServices();
        },
        error: (error) => {
          console.error('Error fetching plan details:', error);

          this.plans = [];

          this.apiResponsePlan = {
            totalElements: 0,
            data: [],
          };
        },
      });
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex =
      this.selectedStatus === '' ? 0 : Number(this.selectedStatus);

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getPlanDetails();
  }

  // Called when the service dropdown changes
  onServiceChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    // The current API returns a server-paginated list.
    // This applies the selected service to the plans currently loaded.
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();
    this.getPlanDetails();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  onDeletePlan(planId: number): void {
    const payload = {
      planId: planId,
      userId: this.userId ? Number(this.userId) : null,
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this plan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'small-confirm-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deletePlan(payload).subscribe({
          next: (response: any) => {
            if (response.success) {
              Swal.fire('Deleted!', response.message, 'success');
              this.getPlanDetails();
            } else {
              Swal.fire('Error', response.message, 'error');
            }
          },
          error: (error) => {
            console.error('Error deleting plan:', error);
            Swal.fire(
              'Error',
              'Something went wrong while deleting the plan.',
              'error'
            );
          },
        });
      }
    });
  }

  viewPlan(planId: number): void {
    this.saveFilterState();
    this.router.navigate(['/view-plan', planId]);
  }

  editPlan(planId: number): void {
    this.saveFilterState();
    this.router.navigate(['/edit-plan', planId]);
  }

  addPlan(): void {
    this.saveFilterState();
    this.router.navigate(['/add-plan']);
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
    const totalRecords = this.apiResponsePlan?.totalElements || 0;
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

  get totalPages(): number {
    const total = this.apiResponsePlan?.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'name',
      label: 'Plan Name',
      sortable: true,
    },
    {
      key: 'serviceNames',
      label: 'Services',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
    },
    {
      key: 'rate',
      label: 'Rate',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

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

    this.plans.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      valA = valA ?? '';
      valB = valB ?? '';

      if (column === 'serviceNames') {
        valA = (valA || []).join(', ').toLowerCase();
        valB = (valB || []).join(', ').toLowerCase();
      } else if (!isNaN(valA) && !isNaN(valB)) {
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

    this.selectedStatus = '';
    this.statusIndex = 0;

    this.selectedServiceId = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getPlanDetails();
  }
}
