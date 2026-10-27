import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

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

interface Service {
  serviceId: number;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-plan-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './plan-add.html',
  styleUrl: './plan-add.scss',
})
export class PlanAdd implements OnInit {
  plan: Plan = {
    planId: null,
    name: '',
    rate: null,
    description: '',
    status: null,
    userId: null,
    serviceIds: []
  };

  serviceIds?: number[];

  originalPlan: Plan = { ...this.plan };

  userId: string | null = null;

  isEditMode = false;

  nameError = '';

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 5;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.loadActiveServices();
    // const queryParams = this.route.snapshot.queryParamMap;

    // this.currentPage = Number(queryParams.get('currentPage')) || 1;
    // this.searchText = queryParams.get('searchText') || '';
    // this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    // this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    // this.size = Number(queryParams.get('size')) || 5;

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    const planId = this.route.snapshot.params['planId'];

    if (planId) {
      this.isEditMode = true;

      this.dataprovider.getPlanById(planId).subscribe({
        next: (res: ApiResponse<Plan>) => {
          if (res && res.data) {
            this.plan = {
              planId: res.data.planId,
              name: res.data.name,
              rate: res.data.rate,
              description: res.data.description,
              status: res.data.status,
              userId: res.data.userId,
              serviceIds: res.data.serviceIds || []
            };

            // Restore selected services from API response
    this.selectedServices = (res.data.serviceIds || []).map(Number);

    this.originalPlan = {
      ...this.plan,
      serviceIds: [...this.selectedServices]
    };
          }
        },
        error: (err) => {
          console.error('Failed to fetch state', err);
          Swal.fire('Error', 'Unable to load state', 'error');
        },
      });
    }
  }
servicesSubmitted = false;
  onSubmit(form: NgForm): void {

    this.servicesSubmitted = true;

  if (form.invalid || this.selectedServices.length === 0) {
    form.control.markAllAsTouched();
    return;
  }


    if (form.invalid || this.nameError) {
      form.control.markAllAsTouched();
      return;
    }

    this.plan.userId = this.userId ? Number(this.userId) : null;

    // Include selected service IDs in the request
  this.plan.serviceIds = [...this.selectedServices];

    this.dataprovider.savePlan(this.plan).subscribe({
      next: (response: ApiResponse<Plan>) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');
          this.backToIndexPage();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      },

      error: (err) => {
        console.error('Save state error:', err);

        const message = err?.error?.message || 'Something went wrong';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message,
        });
      },
    });
  }

  get allServicesSelected(): boolean {
  return this.services.length > 0 &&
    this.services.every((service: any) =>
      this.selectedServices.includes(service.serviceId)
    );
}

 onReset(): void {
  this.servicesSubmitted = false;
  if (this.isEditMode) {
    this.plan = {
      ...this.originalPlan,
      serviceIds: [...(this.originalPlan.serviceIds || [])]
    };

    // Restore originally selected services
    this.selectedServices = [...(this.originalPlan.serviceIds || [])];
  } else {
    this.plan = {
      planId: null,
      name: '',
      rate: null,
      description: '',
      status: null,
      userId: null,
      serviceIds: []
      
    };

    // Clear selected services
    this.selectedServices = [];
  }

  // Keep both values synchronized
  this.plan.serviceIds = [...this.selectedServices];

  this.showServiceDropdown = false;
  this.nameError = '';
}

  // backToIndexPage(): void {
  //   this.router.navigate(['/plan-index'], {
  //     queryParams: {
  //       currentPage: this.currentPage,
  //       statusIndex: this.statusIndex,
  //       searchText: this.searchText,
  //       page: this.page,
  //       size: this.size || 5,
  //     },
  //   });
  // }

  backToIndexPage(): void {
    this.router.navigate(['/plan-index']);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (/^[0-9]$/.test(key)) {
      return;
    }
    event.preventDefault();
  }

services: Service[] = [];
selectedServices: number[] = [];
showServiceDropdown = false;



loadActiveServices(): void {
  this.dataprovider.getActiveServices().subscribe({
    next: (response: any) => {
      this.services = response || [];
    },
    error: (error: any) => {
      console.error('Error loading active services:', error);
      this.services = [];
    }
  });
}

toggleService(serviceId: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  this.selectedServices = checked
    ? [...new Set([...this.selectedServices, serviceId])]
    : this.selectedServices.filter(id => id !== serviceId);
}

toggleAllServices(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  this.selectedServices = checked
    ? this.services.map(service => service.serviceId)
    : [];
}

@ViewChild('serviceDropdown')
serviceDropdown!: ElementRef;

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  if (
    this.showServiceDropdown &&
    this.serviceDropdown &&
    !this.serviceDropdown.nativeElement.contains(event.target)
  ) {
    this.showServiceDropdown = false;
  }
}
  
}
