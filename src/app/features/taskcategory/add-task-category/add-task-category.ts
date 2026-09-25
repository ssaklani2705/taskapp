import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
} from '@danielmoncada/angular-datetime-picker';
import Swal from 'sweetalert2';
import { DataProviderService } from '../../../service/data-provider.service';
import moment from 'moment';

export const MY_DATE_TIME_FORMATS = {
  parseInput: 'hh:mm A',
  fullPickerInput: 'hh:mm A',
  datePickerInput: 'hh:mm A',
  timePickerInput: 'hh:mm A',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'app-add-task-category',
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
  templateUrl: './add-task-category.html',
  styleUrl: './add-task-category.scss',
  providers: [
    {
      provide: OWL_DATE_TIME_LOCALE,
      useValue: 'en-GB',
    },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: MY_DATE_TIME_FORMATS,
    },
  ],
})
export class AddTaskCategoryComponent implements OnInit {
  taskCategory: any = {
    taskcategoryId: null,
    departmentId: null,
    name: '',
    status: null,
    dueDateTime: null,
  };

  originalTaskCategory: any = {};

  departmentId = 0;

  departments: any[] = [];

  userId: any;

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
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   this.currentPage = +(params['currentPage'] || 1);
    //   this.searchText = params['searchText'] || '';
    //   this.statusIndex = +(params['statusIndex'] || 0);
    //   this.departmentId = +(params['departmentId'] || 0);
    //   this.page = +(params['page'] || 0);
    //   this.size = +(params['size'] || 5);
    // });

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    this.getDepartments();

    const taskcategoryId = this.route.snapshot.params['taskCategoryId'];

    if (taskcategoryId) {
      this.isEditMode = true;

      this.dataprovider.getTaskCategoryById(taskcategoryId).subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.taskCategory = {
              taskcategoryId: res.data.taskcategoryId,
              departmentId: res.data.departmentId,
              name: res.data.name,
              status: res.data.status,
              userId: res.data.userId,
              dueDateTime: res.data.dueDateTime,
            };

            this.originalTaskCategory = {
              ...this.taskCategory,

              dueDateTime: this.taskCategory.dueDateTime
                ? String(this.taskCategory.dueDateTime)
                : null,
            };
          }
        },
        error: (err) => {
          console.error('Failed to fetch task category', err);
          Swal.fire('Error', 'Unable to load task category', 'error');
        },
      });
    }
  }

  getDepartments(): void {
    this.dataprovider.getActiveDepartments().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.departments = response;
        } else if (response && Array.isArray(response.data)) {
          this.departments = response.data;
        } else {
          this.departments = [];
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.departments = [];
      },
    });
  }

  capitalizeFirstCharOnly(value: string): string {
    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private formatTimeString(value: any): string | null {
    if (!value) {
      return null;
    }

    if (
      typeof value === 'string' &&
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value.trim())
    ) {
      return value.trim().toUpperCase();
    }

    if (typeof value === 'string') {
      const timeOnly = value.trim().substring(0, 8);
      const match = timeOnly.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

      if (match) {
        let hours = Number(match[1]);

        const minutes = match[2];
        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return String(hours).padStart(2, '0') + ':' + minutes + ' ' + period;
      }
    }

    if (moment.isMoment(value)) {
      return value.format('hh:mm A');
    }

    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null;
      }

      return moment(value).format('hh:mm A');
    }

    console.error(
      'Unsupported dueDateTime value:',

      value,
    );

    return null;
  }

  private formatTimeForApi(value: any): string | null {
    if (!value) {
      return null;
    }

    if (moment.isMoment(value)) {
      return value.format('hh:mm A');
    }

    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null;
      }

      return moment(value).format('hh:mm A');
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(trimmedValue)) {
        return trimmedValue.toUpperCase();
      }

      const match = trimmedValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

      if (match) {
        let hours = Number(match[1]);

        const minutes = match[2];
        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return String(hours).padStart(2, '0') + ':' + minutes + ' ' + period;
      }

      return trimmedValue;
    }

    return null;
  }

  onSubmit(form: any): void {
    if (form.invalid || this.nameError) {
      form.control.markAllAsTouched();

      return;
    }

    if (!this.taskCategory.dueDateTime) {
      Swal.fire('Error', 'Please select Due Time', 'error');

      return;
    }

    const payload = {
      ...this.taskCategory,

      userId: this.userId ? Number(this.userId) : null,
      departmentId: Number(this.taskCategory.departmentId),
      dueDateTime: this.taskCategory.dueDateTime,
    };

    console.log('TASK CATEGORY PAYLOAD:', payload);

    this.dataprovider.saveTaskCategory(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');

          this.backToIndexPage();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      },
      error: (err) => {
        console.error('Save task category error:', err);
        Swal.fire('Error', 'Something went wrong', 'error');
      },
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      this.taskCategory = {
        ...this.originalTaskCategory,

        dueDateTime: this.originalTaskCategory.dueDateTime
          ? String(this.originalTaskCategory.dueDateTime)
          : null,
      };
    } else {
      this.taskCategory = {
        taskcategoryId: null,
        departmentId: null,
        name: '',
        status: null,
        dueDateTime: null,
      };
    }

    this.nameError = '';
  }

  // backToIndexPage(): void {
  //   this.router.navigate(['/task-category-index'], {
  //     queryParams: {
  //       currentPage: this.currentPage,
  //       statusIndex: this.statusIndex,
  //       searchText: this.searchText,
  //       departmentId: this.departmentId || '',
  //       page: this.page,
  //       size: this.size || 5,
  //     },
  //   });
  // }

  backToIndexPage(): void {
    this.router.navigate(['/task-category-index']);
  }

  private timeStringToDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date();

    let hours = 0;
    let minutes = 0;

    const time = value.trim().toUpperCase();

    const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

    if (amPmMatch) {
      hours = Number(amPmMatch[1]);
      minutes = Number(amPmMatch[2]);

      const period = amPmMatch[3];

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }

      if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      const twentyFourHourMatch = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

      if (!twentyFourHourMatch) {
        return null;
      }

      hours = Number(twentyFourHourMatch[1]);
      minutes = Number(twentyFourHourMatch[2]);
    }

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  preventDecimal(event: KeyboardEvent): void {
    if (event.key === '.' || event.key === ',' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }
}
