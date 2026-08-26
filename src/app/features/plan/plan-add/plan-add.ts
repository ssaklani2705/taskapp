import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';


export interface Plan {
  planId: any;
  name: string;
  rate: any;
  description: string;
  status: any;
  userId: any;
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
  };

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
  ) { }

  ngOnInit(): void {

    /* --------------------------------
       Get pagination/filter parameters
    --------------------------------- */

    const queryParams = this.route.snapshot.queryParamMap;

    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    /* --------------------------------
       User ID
    --------------------------------- */

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    /* --------------------------------
       Check Edit Mode
    --------------------------------- */

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
            };

            this.originalPlan = { ...this.plan };
          }
        },

        error: (err) => {
          console.error('Failed to fetch state', err);
          Swal.fire('Error', 'Unable to load state', 'error');
        },

      });
    }
  }

  /* =========================================
     CAPITALIZE FIRST CHARACTER
  ========================================= */



  /* =========================================
     SUBMIT
  ========================================= */

  onSubmit(form: NgForm): void {

    if (form.invalid || this.nameError) {
      form.control.markAllAsTouched();
      return;
    }

    /* User ID */
    this.plan.userId = this.userId ? Number(this.userId) : null;

    /* Save */
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

        const message =
          err?.error?.message ||
          'Something went wrong';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message
        });
      }

    });
  }

  /* =========================================
     RESET
  ========================================= */

  onReset(): void {

    if (this.isEditMode) {

      this.plan = { ...this.originalPlan };

    } else {

      this.plan = {
        planId: null,
        name: '',
        rate: null,
        description: '',
        status: null,
        userId: null,
      };
    }

    this.nameError = '';
  }

  /* =========================================
     BACK TO INDEX
  ========================================= */

  backToIndexPage(): void {

    this.router.navigate(['/plan-index'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        page: this.page,
        size: this.size || 5,
      },
    });
  }


  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;

    // Allow digits
    if (/^[0-9]$/.test(key)) {
      return;
    }

    // Allow only one decimal point
    if (key === '.' && !(event.target as HTMLInputElement).value.includes('.')) {
      return;
    }

    event.preventDefault();
  }
}
