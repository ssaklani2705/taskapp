import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { MatIconModule } from '@angular/material/icon';

interface Client {
  clientId: number;
  name: string;
}

interface TaskCategory {
  taskcategoryId: number;
  name: string;
}

@Component({
  selector: 'app-add-recurring',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,MatIconModule],
  templateUrl: './add-recurring.html',
  styleUrl: './add-recurring.scss',
})
export class AddRecurring implements OnInit {
  recurringForm!: FormGroup;

  clients: Client[] = [];
  taskCategories: TaskCategory[] = [];

  dates: number[] = Array.from({ length: 28 }, (_, i) => i + 1);

  isEditMode = false;
  recurringId: number | null = null;

  userId!: number;

  isSubmitting = false;
  isLoading = false;

  filterKey = SESSION_KEYS.RECURRING_FILTER;

  constructor(
    private fb: FormBuilder,
    private dataprovider: DataProviderService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getUserId();
    this.checkEditMode();
    this.loadClients();
    this.loadTaskCategories();
  }

  private initializeForm(): void {
    this.recurringForm = this.fb.group({
      recurringId: [null],
      clientId: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: ['', Validators.maxLength(5000)],
      type: [1, Validators.required],
      day: [null],
      date: [null],
      month: [null],
      taskCatId: [null, Validators.required],
      status: [1],
    });

    this.updateTypeValidators(1);
  }

  private getUserId(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedUserId = sessionStorage.getItem('userId');

    if (storedUserId) {
      this.userId = Number(storedUserId);
    }
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('recurringId');

    if (id) {
      this.recurringId = Number(id);

      if (this.recurringId > 0) {
        this.isEditMode = true;

        this.getRecurringById(this.recurringId);
      }
    }
  }

  private loadClients(): void {
    this.dataprovider.getRecurringClients(this.userId).subscribe({
      next: (response: any) => {
        this.clients = response || [];

        console.log(response);
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
        this.taskCategories = response || [];
      },

      error: (error) => {
        console.error('Error fetching task categories:', error);
        this.taskCategories = [];
      },
    });
  }

  private getRecurringById(recurringId: number): void {
    this.isLoading = true;

    this.dataprovider.getRecurringById(recurringId, this.userId).subscribe({
      next: (response: any) => {
        console.log('Recurring Details:', response);

        const recurring = response?.data;

        if (!recurring) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Recurring record not found.',
          });

          this.backToIndexPage();

          return;
        }

        this.recurringForm.patchValue({
          recurringId: recurring.recurringId,
          clientId: recurring.clientId,
          title: recurring.title || '',
          description: recurring.description || '',
          type: Number(recurring.type),
          day: recurring.day !== null && recurring.day !== undefined ? Number(recurring.day) : null,
          date:
            recurring.date !== null && recurring.date !== undefined ? Number(recurring.date) : null,
          month:
            recurring.month !== null && recurring.month !== undefined
              ? Number(recurring.month)
              : null,
          taskCatId: recurring.taskCatId,
          status:
            recurring.status !== null && recurring.status !== undefined
              ? Number(recurring.status)
              : 1,
        });

        this.updateTypeValidators(Number(recurring.type));

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error fetching recurring:', error);

        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error || 'Unable to load recurring details.',
        });

        this.backToIndexPage();
      },
    });
  }

  onTypeChange(): void {
    const type = Number(this.recurringForm.get('type')?.value);

    this.updateTypeValidators(type);
  }

  private updateTypeValidators(type: number): void {
    const dayControl = this.recurringForm.get('day');
    const dateControl = this.recurringForm.get('date');
    const monthControl = this.recurringForm.get('month');

    dayControl?.clearValidators();
    dateControl?.clearValidators();
    monthControl?.clearValidators();

    if (type === 1) {
      dayControl?.setValue(null);
      dateControl?.setValue(null);
      monthControl?.setValue(null);
    } else if (type === 2) {
      dayControl?.setValidators(Validators.required);
      dateControl?.setValue(null);
      monthControl?.setValue(null);
    } else if (type === 3) {
      dateControl?.setValidators(Validators.required);
      dayControl?.setValue(null);
      monthControl?.setValue(null);
    } else if (type === 4) {
      dateControl?.setValidators(Validators.required);
      monthControl?.setValidators(Validators.required);
      dayControl?.setValue(null);
    }

    dayControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();
    monthControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    const type = Number(this.recurringForm.get('type')?.value);

    this.updateTypeValidators(type);

    this.recurringForm.markAllAsTouched();

    if (this.recurringForm.invalid) {
      return;
    }

    const formValue = this.recurringForm.getRawValue();

    const requestData: any = {
      recurringId: this.isEditMode ? this.recurringId : null,
      clientId: Number(formValue.clientId),
      title: formValue.title?.trim(),
      description: formValue.description?.trim() || null,
      type: Number(formValue.type),
      day: formValue.day !== null && formValue.day !== '' ? Number(formValue.day) : null,
      date: formValue.date !== null && formValue.date !== '' ? Number(formValue.date) : null,
      month: formValue.month !== null && formValue.month !== '' ? Number(formValue.month) : null,
      taskCatId: Number(formValue.taskCatId),
      status: this.isEditMode ? Number(formValue.status) : 1,
    };

    console.log('Recurring Request:', requestData);

    this.isSubmitting = true;

    this.dataprovider.addOrUpdateRecurring(requestData, this.userId).subscribe({
      next: (response: any) => {
        console.log('Add/Update Recurring Response:', response);

        this.isSubmitting = false;

        if (response?.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text:
              response.message ||
              (this.isEditMode
                ? 'Recurring updated successfully.'
                : 'Recurring added successfully.'),
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            this.backToIndexPage();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response?.message || 'Unable to save recurring.',
          });
        }
      },

      error: (error) => {
        console.error('Error saving recurring:', error);

        this.isSubmitting = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || error?.error || 'Unable to save recurring.',
        });
      },
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      if (this.recurringId) {
        this.getRecurringById(this.recurringId);
      }

      return;
    }

    this.recurringForm.reset({
      recurringId: null,
      clientId: null,
      title: '',
      description: '',
      type: 1,
      day: null,
      date: null,
      month: null,
      taskCatId: null,
      status: 1,
    });

    this.updateTypeValidators(1);

    this.recurringForm.markAsPristine();
    this.recurringForm.markAsUntouched();
  }

  backToIndexPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem(this.filterKey);

      if (stored) {
        const filterState = JSON.parse(stored);

        this.router.navigate(['/recurring-index'], {
          state: filterState,
        });

        return;
      }
    }

    this.router.navigate(['/recurring-index']);
  }
}
