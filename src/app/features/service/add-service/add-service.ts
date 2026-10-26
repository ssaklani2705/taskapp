
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';

interface Service {
  serviceId: number | null;
  name: string;
  status: number | null;
  userId: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './add-service.html',
  styleUrl: './add-service.scss'
})
export class AddServiceComponent implements OnInit {

  service: Service = this.getEmptyService();

  originalService: Service = this.getEmptyService();

  userId: string | null = null;

  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    const serviceId = this.route.snapshot.paramMap.get('serviceId');

    if (serviceId) {
      this.isEditMode = true;
      this.loadService(Number(serviceId));
    }
  }

  private getEmptyService(): Service {
    return {
      serviceId: null,
      name: '',
      status: null,
      userId: null
    };
  }

  private loadService(serviceId: number): void {
    this.dataprovider.getServiceById(serviceId).subscribe({
      next: (res: ApiResponse<Service>) => {
        if (res?.data) {
          this.service = {
            serviceId: res.data.serviceId,
            name: res.data.name ?? '',
            status: Number(res.data.status),
            userId: res.data.userId ?? null
          };

          this.originalService = { ...this.service };
        } else {
          Swal.fire('Error', 'Service details not found.', 'error');
        }
      },
      error: (err: any) => {
        console.error('Failed to load service:', err);
        Swal.fire('Error', 'Unable to load service details.', 'error');
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.service.name = this.service.name.trim();
    this.service.userId = this.userId ? Number(this.userId) : null;

    if (!this.service.name) {
      form.control.markAllAsTouched();
      return;
    }

    this.dataprovider.saveService(this.service).subscribe({
      next: (response: ApiResponse<Service>) => {
        if (response?.success) {
          Swal.fire(
            'Success',
            response.message || 'Service saved successfully.',
            'success'
          ).then(() => this.backToIndexPage());
        } else {
          Swal.fire(
            'Error',
            response?.message || 'Unable to save service.',
            'error'
          );
        }
      },
      error: (err: any) => {
        console.error('Save service error:', err);

        Swal.fire(
          'Error',
          err?.error?.message || 'Something went wrong while saving the service.',
          'error'
        );
      }
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      this.service = { ...this.originalService };
    } else {
      this.service = this.getEmptyService();
    }
  }

  backToIndexPage(): void {
    this.router.navigate(['/service-index']);
  }
}
