import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-holiday',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './add-holiday.html',
  styleUrl: './add-holiday.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MyDateAdapter,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
  ],
})
export class AddHolidayComponent implements OnInit {
  holidayForm!: FormGroup;
  originalHoliday: any = {};

  userId: any;

  isEditMode: boolean = false;
  holidayId: number = 0;

  minDate: Date = new Date();

  currentPage: number = 1;
  searchText: string = '';
  statusIndex: number = 0;
  page: number = 0;
  size: number = 5;

  disabledStartDates: Date[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today;
    this.createForm();
  }

  private createForm(): void {
    this.holidayForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9\s.,;:=$\-_+'"/\\!@`#%&*()?]+$/)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      status: [1, Validators.required],
    });
  }

  ngOnInit(): void {
    const savedFilter = sessionStorage.getItem('holidayMasterFilter');

    if (savedFilter) {
      const filter = JSON.parse(savedFilter);

      this.currentPage = filter.currentPage || 1;
      this.searchText = filter.searchText || '';
      this.statusIndex = filter.statusIndex || 0;
      this.page = filter.page || this.currentPage - 1;
      this.size = filter.size || 5;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    const holidayId = this.route.snapshot.params['holidayId'];

    if (holidayId) {
      this.isEditMode = true;
      this.holidayId = Number(holidayId);

      this.dataprovider.getHolidayById(this.holidayId).subscribe({
        next: (res) => {
          if (res && res.data) {
            const data = res.data;

            this.holidayForm.patchValue({
              name: data.name || '',
              startDate: this.parseDate(data.startDate),
              endDate: this.parseDate(data.endDate),
              status: Number(data.status) || 1,
            });

            this.originalHoliday = {
              ...this.holidayForm.value,
            };

            this.loadExistingHolidayDates();
          }
        },
        error: (error) => {
          console.error('Error fetching holiday:', error);

          Swal.fire('Error', 'Unable to load holiday details.', 'error');
        },
      });
    } else {
      this.isEditMode = false;

      this.holidayForm.patchValue({
        name: '',
        startDate: null,
        endDate: null,
        status: 1,
      });

      this.originalHoliday = {
        ...this.holidayForm.value,
      };
    }

    this.loadExistingHolidayDates();
  }

  startDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }

    const dateTime = new Date(date);
    dateTime.setHours(0, 0, 0, 0);

    return !this.disabledStartDates.some((disabledDate) => {
      const d = new Date(disabledDate);
      d.setHours(0, 0, 0, 0);

      return d.getTime() === dateTime.getTime();
    });
  };

  private loadExistingHolidayDates(): void {
    this.dataprovider.getHolidayDetails(0, 1000, 0, '').subscribe({
      next: (response) => {
        if (!response?.success || !response?.data) {
          return;
        }

        this.disabledStartDates = response.data
          .filter((holiday: any) => {
            // During edit, don't disable this holiday's own start date
            return Number(holiday.holidayId) !== this.holidayId;
          })
          .filter((holiday: any) => holiday.startDate)
          .map((holiday: any) => this.parseDate(holiday.startDate))
          .filter((date: Date | null): date is Date => date !== null);
      },
      error: (error) => {
        console.error('Error loading holiday dates:', error);
      },
    });
  }

  capitalizeFirstCharOnly(value: string): string {
    if (!value) {
      return '';
    }

    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    this.holidayForm.get('name')?.setValue(capitalized, { emitEvent: false });

    return capitalized;
  }

  onSubmit(): void {
    this.holidayForm.markAllAsTouched();

    if (this.holidayForm.invalid) {
      return;
    }

    const startDate: Date = this.holidayForm.get('startDate')?.value;
    const endDate: Date = this.holidayForm.get('endDate')?.value;

    if (startDate && this.isDuplicateStartDate(startDate)) {
      Swal.fire('Error', 'A holiday already exists on the selected start date', 'error');

      return;
    }

    if (startDate && endDate && endDate < startDate) {
      Swal.fire('Error', 'End Date cannot be before Start Date', 'error');

      return;
    }

    const formValues = this.holidayForm.value;

    const payload: any = {
      holidayId: this.isEditMode ? this.holidayId : 0,
      name: formValues.name ? formValues.name.trim() : '',
      startDate: this.formatDateForApi(formValues.startDate),
      endDate: this.formatDateForApi(formValues.endDate),
      status: Number(formValues.status),
      userId: this.userId ? Number(this.userId) : null,
    };

    this.dataprovider.saveHoliday(payload).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');

          this.backToIndexPage();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error saving holiday:', err);

        Swal.fire('Error', 'Something went wrong', 'error');
      },
    });
  }

  private isDuplicateStartDate(date: Date): boolean {
    const selectedTime = new Date(date);
    selectedTime.setHours(0, 0, 0, 0);

    return this.disabledStartDates.some((disabledDate) => {
      const existingTime = new Date(disabledDate);
      existingTime.setHours(0, 0, 0, 0);

      return existingTime.getTime() === selectedTime.getTime();
    });
  }

  onReset(): void {
    this.holidayForm.patchValue({
      ...this.originalHoliday,
    });
  }

  backToIndexPage(): void {
    this.router.navigate(['/hodiday-index']);
  }

  private parseDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    date.setHours(0, 0, 0, 0);

    return date;
  }

  private formatDateForApi(date: Date | null): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
