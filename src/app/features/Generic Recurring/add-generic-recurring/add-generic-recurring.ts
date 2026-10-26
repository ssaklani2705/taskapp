import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { MatIconModule } from '@angular/material/icon';

interface TaskCategory {
  taskcategoryId: number;
  name: string;
  departmentName?: string;
}

@Component({
  selector: 'app-add-generic-recurring',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './add-generic-recurring.html',
  styleUrl: './add-generic-recurring.scss',
})
export class AddGenericRecurring implements OnInit {
  recurringForm!: FormGroup;

  taskCategories: TaskCategory[] = [];

  dates: number[] = Array.from({ length: 28 }, (_, i) => i + 1);
  monthlyDates: number[] = Array.from({ length: 28 }, (_, i) => i + 1);

  isEditMode = false;
  genericRecurringId: number | null = null;

  userId!: number;

  isSubmitting = false;
  isLoading = false;

  filterKey = SESSION_KEYS.GENERIC_RECURRING_FILTER;

  constructor(
    private fb: FormBuilder,
    private dataprovider: DataProviderService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {}

  loginType = '';
  isAdmin: any;
  isHod = '';

  categoryIds: number[] = [];
  groupedCategories: { department: string; items: TaskCategory[] }[] = [];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isAdmin = sessionStorage.getItem('isAdmin');
      this.loginType = sessionStorage.getItem('loginType') || 'other';
      this.isHod = sessionStorage.getItem('isHod') || 'N';

      try {
        const saved = sessionStorage.getItem('categoryIds');
        this.categoryIds = saved ? JSON.parse(saved).map((id: any) => Number(id)) : [];
      } catch {
        this.categoryIds = [];
      }
    }
    this.initializeForm();
    this.getUserId();
    this.checkEditMode();
    this.loadTaskCategories();
  }

  private initializeForm(): void {
    this.recurringForm = this.fb.group({
      genericRecurringId: [null],
      forValue: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: ['', Validators.maxLength(5000)],
      type: [1, Validators.required],
      day: [null],
      date: [null],
      month: [null],
      time: [null, Validators.required], // <-- new
      taskCatId: [null, Validators.required],
      priority: [null, Validators.required],
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
    const id = this.route.snapshot.paramMap.get('genericRecurringId');

    if (id) {
      this.genericRecurringId = Number(id);

      if (this.genericRecurringId > 0) {
        this.isEditMode = true;

        this.getGenericRecurringById(this.genericRecurringId);
      }
    }
  }

  private loadTaskCategories(): void {
    this.dataprovider.getActiveTaskCategoriesForRecurring(this.userId, this.isAdmin, this.loginType, this.isHod).subscribe({
      next: (response: any) => {
        this.taskCategories = response || [];
        this.buildGroupedCategories();
        this.autoSelectSingleCategory();
      },
      error: (error) => {
        console.error('Error fetching task categories:', error);
        this.taskCategories = [];
        this.groupedCategories = [];
      },
    });
  }

  private buildGroupedCategories(): void {
    const map = new Map<string, TaskCategory[]>();

    for (const c of this.taskCategories) {
      const key = c.departmentName || 'Other';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(c);
    }

    const asc = (x: string, y: string) => x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' });

    this.groupedCategories = Array.from(map, ([department, items]) => ({
      department,
      items: [...items].sort((a, b) => asc(a.name || '', b.name || '')),
    })).sort((a, b) => asc(a.department, b.department));
  }

  private autoSelectSingleCategory(): void {
    const isAdminOrManager = String(this.isAdmin).toUpperCase() === 'Y' || String(this.loginType).toLowerCase() === 'manager';

    if (isAdminOrManager || this.isEditMode || this.recurringForm.get('taskCatId')?.value) {
      return;
    }

    const matched = this.categoryIds.length ? this.taskCategories.filter((c) => this.categoryIds.includes(Number(c.taskcategoryId))) : this.taskCategories;

    if (matched.length === 1) {
      this.recurringForm.patchValue({ taskCatId: matched[0].taskcategoryId });
      this.onTaskCategoryChange();
    }
  }

  private getGenericRecurringById(genericRecurringId: number): void {
    this.isLoading = true;

    this.dataprovider.getGenericRecurringById(genericRecurringId, this.userId).subscribe({
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
          genericRecurringId: recurring.genericRecurringId,
          forValue: recurring.forValue,
          title: recurring.title || '',
          description: recurring.description || '',
          type: Number(recurring.type),
          day: recurring.day !== null && recurring.day !== undefined ? Number(recurring.day) : null,
          date: recurring.date !== null && recurring.date !== undefined ? Number(recurring.date) : null,
          month: recurring.month !== null && recurring.month !== undefined ? Number(recurring.month) : null,
          taskCatId: recurring.taskCatId,
          priority: recurring.priority !== null && recurring.priority !== undefined ? Number(recurring.priority) : null,
          status: recurring.status !== null && recurring.status !== undefined ? Number(recurring.status) : 1,
          time: this.toTimeInput(recurring.time),
        });

        this.updateTypeValidators(Number(recurring.type));

        if (Number(recurring.type) === 4) {
          this.onYearlyMonthChange();
        }

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error fetching generic recurring:', error);

        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error || 'Unable to load generic recurring details.',
        });

        this.backToIndexPage();
      },
    });
  }

  private toTimeInput(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const parts = value.split(':');
    const hh = (parts[0] || '00').padStart(2, '0');
    const mm = (parts[1] || '00').substring(0, 2).padStart(2, '0');

    return `${hh}:${mm}`;
  }

  private toApiTime(value: string | null | undefined): string | null {
    const t = this.toTimeInput(value);
    return t ? `${t}:00` : null;
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

    dateControl?.enable({ emitEvent: false });

    if (type === 1) {
      dayControl?.setValue(null);
      dateControl?.setValue(null);
      monthControl?.setValue(null);
      this.dates = [];
    } else if (type === 2) {
      dayControl?.setValidators(Validators.required);
      dateControl?.setValue(null);
      monthControl?.setValue(null);
      this.dates = [];
    } else if (type === 3) {
      dateControl?.setValidators(Validators.required);
      dayControl?.setValue(null);
      monthControl?.setValue(null);
      this.dates = Array.from({ length: 28 }, (_, i) => i + 1);
    } else if (type === 4) {
      dateControl?.setValidators(Validators.required);
      monthControl?.setValidators(Validators.required);
      dayControl?.setValue(null);
      const monthValue = monthControl?.value;

      if (monthValue === null || monthValue === undefined || monthValue === '') {
        dateControl?.setValue(null);
        dateControl?.disable({ emitEvent: false });
        this.dates = [];
      } else {
        dateControl?.enable({ emitEvent: false });
      }
    }

    dayControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();
    monthControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.checkingTaskCategoryEmployee) {
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
      genericRecurringId: this.isEditMode ? this.genericRecurringId : null,
      forValue: Number(formValue.forValue),
      title: formValue.title?.trim(),
      description: formValue.description?.trim() || null,
      type: Number(formValue.type),
      day: formValue.day !== null && formValue.day !== '' ? Number(formValue.day) : null,
      date: formValue.date !== null && formValue.date !== '' ? Number(formValue.date) : null,
      month: formValue.month !== null && formValue.month !== '' ? Number(formValue.month) : null,
      taskCatId: Number(formValue.taskCatId),
      priority: Number(formValue.priority),
      status: this.isEditMode ? Number(formValue.status) : 1,
      time: this.toApiTime(formValue.time),
    };

    console.log('Generic Recurring Request:', requestData);

    this.isSubmitting = true;

    this.dataprovider.addOrUpdateGenericRecurring(requestData, this.userId).subscribe({
      next: (response: any) => {
        console.log('Add/Update Generic Recurring Response:', response);

        this.isSubmitting = false;

        if (response?.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || (this.isEditMode ? 'Generic recurring updated successfully.' : 'Generic recurring added successfully.'),
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            this.backToIndexPage();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response?.message || 'Unable to save generic recurring.',
          });
        }
      },
error: (error: any) => {
        console.error('Error saving generic recurring:', error);
        this.isSubmitting = false;
        const actualMessage = error?.error?.data || error?.error?.message || (typeof error?.error === 'string' ? error.error : '');
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Title',
          text: actualMessage || 'Unable to save generic recurring.',
          confirmButtonText: 'OK',
        });
      },
      // error: (error) => {
      //   console.error('Error saving generic recurring:', error);

      //   this.isSubmitting = false;

      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Error',
      //     text: error?.error?.message || error?.error || 'Unable to save generic recurring.',
      //   });
      // },
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      if (this.genericRecurringId) {
        this.getGenericRecurringById(this.genericRecurringId);
      }

      return;
    }

    this.recurringForm.reset({
      genericRecurringId: null,
      forValue: null,
      title: '',
      description: '',
      type: 1,
      day: null,
      date: null,
      month: null,
      taskCatId: null,
      priority: null,
      status: 1,
      time: null,
    });

    this.showTaskCategoryDropdown = false;
    this.categorySearchText = '';

    this.updateTypeValidators(1);

    this.recurringForm.markAsPristine();
    this.recurringForm.markAsUntouched();
  }

  onYearlyMonthChange(): void {
    const monthValue = this.recurringForm.get('month')?.value;
    const dateControl = this.recurringForm.get('date');

    if (monthValue === null || monthValue === undefined || monthValue === '') {
      dateControl?.setValue(null);
      dateControl?.disable({ emitEvent: false });
      this.dates = [];

      return;
    }

    dateControl?.enable({ emitEvent: false });
    const month = Number(monthValue);
    let maxDays = 28;

    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
      maxDays = 31;
    } else if ([4, 6, 9, 11].includes(month)) {
      maxDays = 30;
    }

    this.dates = Array.from({ length: maxDays }, (_, i) => i + 1);
    const selectedDate = dateControl?.value;

    if (selectedDate !== null && selectedDate !== undefined && Number(selectedDate) > maxDays) {
      dateControl?.setValue(null);
    }

    dateControl?.updateValueAndValidity();
  }

  backToIndexPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem(this.filterKey);

      if (stored) {
        const filterState = JSON.parse(stored);

        this.router.navigate(['/generic-recurring-index'], {
          state: filterState,
        });

        return;
      }
    }

    this.router.navigate(['/generic-recurring-index']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (this.showTaskCategoryDropdown && !target.closest('.task-category-dropdown')) {
      this.showTaskCategoryDropdown = false;
      this.categorySearchText = '';
      this.recurringForm.get('taskCatId')?.markAsTouched();
    }
  }

  taskCategoryEmployeeError = false;
  checkingTaskCategoryEmployee = false;

  onTaskCategoryChange(): void {
    const taskCategoryId = this.recurringForm.get('taskCatId')?.value;
    this.taskCategoryEmployeeError = false;
    if (!taskCategoryId) {
      this.checkingTaskCategoryEmployee = false;
      return;
    }
    this.checkingTaskCategoryEmployee = true;
    this.dataprovider.isEmployeeAvailableForTaskCategory(Number(taskCategoryId)).subscribe({
      next: (available: boolean) => {
        console.log('Task Category:', taskCategoryId);
        console.log('Usable employee available:', available);
        this.checkingTaskCategoryEmployee = false;
        this.taskCategoryEmployeeError = !available;
      },
      error: (error) => {
        console.error('Error checking employee availability:', error);
        this.checkingTaskCategoryEmployee = false;
        this.taskCategoryEmployeeError = false;
      },
    });
  }

  showTaskCategoryDropdown = false;
  categorySearchText = '';

  get selectedTaskCategoryName(): string {
    const id = this.recurringForm?.get('taskCatId')?.value;

    if (id === null || id === undefined || id === '') return '';
    const c = this.taskCategories.find((x) => Number(x.taskcategoryId) === Number(id));

    return c ? c.name : '';
  }

  get filteredGroupedCategories(): { department: string; items: TaskCategory[] }[] {
    const q = this.categorySearchText.trim().toLowerCase();

    if (!q) return this.groupedCategories;

    return this.groupedCategories
      .map((g) => {
        if (g.department.toLowerCase().includes(q)) return g;
        return {
          department: g.department,
          items: g.items.filter((c) => (c.name || '').toLowerCase().includes(q)),
        };
      })
      .filter((g) => g.items.length > 0);
  }

  toggleTaskCategoryDropdown(): void {
    this.showTaskCategoryDropdown = !this.showTaskCategoryDropdown;
    this.categorySearchText = '';

    if (this.showTaskCategoryDropdown) {
      setTimeout(() => document.getElementById('addRecurringCategorySearchInput')?.focus(), 0);
    } else {
      this.recurringForm.get('taskCatId')?.markAsTouched();
    }
  }

  selectTaskCategory(category: TaskCategory): void {
    const control = this.recurringForm.get('taskCatId');
    control?.setValue(category.taskcategoryId);
    control?.markAsDirty();
    control?.markAsTouched();

    this.showTaskCategoryDropdown = false;
    this.categorySearchText = '';

    this.onTaskCategoryChange();
  }
}
