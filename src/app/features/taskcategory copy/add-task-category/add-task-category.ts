import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
  OwlDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';

import Swal from 'sweetalert2';

import {
  DataProviderService
} from '../../../service/data-provider.service';
import {
  OwlMomentDateTimeModule
} from '@danielmoncada/angular-datetime-picker-moment-adapter';

import * as moment from 'moment';


export const MY_DATE_TIME_FORMATS = {

  parseInput: 'DD-MM-YYYY hh:mm A',

  fullPickerInput: 'DD-MM-YYYY hh:mm A',

  datePickerInput: 'DD-MM-YYYY',

  timePickerInput: 'hh:mm A',

  monthYearLabel: 'MMM YYYY',

  dateA11yLabel: 'LL',

  monthYearA11yLabel: 'MMMM YYYY'

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

    OwlDateTimeModule,
   OwlMomentDateTimeModule
  ],

  templateUrl: './add-task-category.html',

  styleUrl: './add-task-category.scss',

 providers: [
  {
    provide: OWL_DATE_TIME_LOCALE,
    useValue: 'en-GB'
  },
  {
    provide: OWL_DATE_TIME_FORMATS,
    useValue: MY_DATE_TIME_FORMATS
  }
]
})
export class AddTaskCategoryComponent
  implements OnInit {

  taskCategory: any = {

    taskcategoryId: null,

    departmentId: null,

    name: '',

    status: null,

    dueDateTime: null

  };


  /* Current Date & Time */
  today: Date = new Date();


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

    private router: Router

  ) {}


  ngOnInit(): void {

    /* ===============================
       QUERY PARAMETERS
    =============================== */

    this.route.queryParams
      .subscribe(params => {

        this.currentPage =
          +(params['currentPage'] || 1);

        this.searchText =
          params['searchText'] || '';

        this.statusIndex =
          +(params['statusIndex'] || 0);

        this.departmentId =
          +(params['departmentId'] || 0);

        this.page =
          +(params['page'] || 0);

        this.size =
          +(params['size'] || 5);

      });


    /* ===============================
       USER ID
    =============================== */

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      this.userId =
        sessionStorage.getItem(
          'userId'
        );

    }


    /* ===============================
       LOAD DEPARTMENTS
    =============================== */

    this.getDepartments();


    /* ===============================
       EDIT MODE
    =============================== */

    const taskcategoryId =
      this.route.snapshot
        .params['taskCategoryId'];


    if (taskcategoryId) {

      this.isEditMode = true;


      this.dataprovider
        .getTaskCategoryById(
          taskcategoryId
        )
        .subscribe({

          next: (res: any) => {

            if (
              res &&
              res.data
            ) {

              this.taskCategory = {

                taskcategoryId:
                  res.data.taskcategoryId,

                departmentId:
                  res.data.departmentId,

                name:
                  res.data.name,

                status:
                  res.data.status,

                userId:
                  res.data.userId,

                /*
                 * Convert API date
                 * to JavaScript Date
                 */
                dueDateTime:
                  res.data.dueDateTime
                    ? new Date(
                        res.data.dueDateTime
                      )
                    : null

              };


              this.originalTaskCategory =
                {

                  ...this.taskCategory,

                  dueDateTime:
                    this.taskCategory.dueDateTime
                      ? new Date(
                          this.taskCategory
                            .dueDateTime
                            .getTime()
                        )
                      : null

                };

            }

          },


          error: (err) => {

            console.error(
              'Failed to fetch task category',
              err
            );

            Swal.fire(
              'Error',
              'Unable to load task category',
              'error'
            );

          }

        });

    }

  }


  /* =================================
     GET DEPARTMENTS
  ================================= */

  getDepartments(): void {

    this.dataprovider
      .getActiveDepartments()
      .subscribe({

        next: (response: any) => {

          if (
            Array.isArray(response)
          ) {

            this.departments =
              response;

          }

          else if (
            response &&
            Array.isArray(
              response.data
            )
          ) {

            this.departments =
              response.data;

          }

          else {

            this.departments = [];

          }

        },


        error: (error) => {

          console.error(
            'Error loading departments:',
            error
          );

          this.departments = [];

        }

      });

  }


  /* =================================
     CAPITALIZE FIRST CHARACTER
  ================================= */

  capitalizeFirstCharOnly(
    value: string
  ): string {

    if (!value) {

      return '';

    }


    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );

  }


  /* =================================
     FORMAT DATE FOR API
  ================================= */

  // private formatDateTimeForApi(
  //   date: Date | null
  // ): string | null {

  //   if (!date) {

  //     return null;

  //   }


  //   if (
  //     !(date instanceof Date) ||
  //     isNaN(date.getTime())
  //   ) {

  //     return null;

  //   }


  //   const year =
  //     date.getFullYear();

  //   const month =
  //     String(
  //       date.getMonth() + 1
  //     ).padStart(2, '0');

  //   const day =
  //     String(
  //       date.getDate()
  //     ).padStart(2, '0');

  //   const hours =
  //     String(
  //       date.getHours()
  //     ).padStart(2, '0');

  //   const minutes =
  //     String(
  //       date.getMinutes()
  //     ).padStart(2, '0');


  //   return (
  //     `${year}-${month}-${day}` +
  //     ` ${hours}:${minutes}:00`
  //   );

  // }

  private formatDateTimeForApi(date: any): string | null {

  if (!date) {
    return null;
  }

  let dateObj: Date;

  // Moment object
  if (moment.isMoment(date)) {
    dateObj = date.toDate();
  }

  // JavaScript Date
  else if (date instanceof Date) {
    dateObj = date;
  }

  else {
    console.error('Unsupported dueDateTime value:', date);
    return null;
  }

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  const year = dateObj.getFullYear();

  const month = String(
    dateObj.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    dateObj.getDate()
  ).padStart(2, '0');

  const hours = String(
    dateObj.getHours()
  ).padStart(2, '0');

  const minutes = String(
    dateObj.getMinutes()
  ).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}



  /* =================================
     SUBMIT
  ================================= */

  onSubmit(form: any): void {

    if (
      form.invalid ||
      this.nameError
    ) {

      form.control
        .markAllAsTouched();

      return;

    }


    /* ===============================
       VALIDATE DATE
    =============================== */

    if (
      !this.taskCategory.dueDateTime
    ) {

      Swal.fire(
        'Error',
        'Please select Due Date & Time',
        'error'
      );

      return;

    }


    /* ===============================
       CREATE API PAYLOAD
    =============================== */

    const payload = {

      ...this.taskCategory,

      userId:
        this.userId
          ? Number(this.userId)
          : null,

      departmentId:
        Number(
          this.taskCategory.departmentId
        ),

      dueDateTime:
        this.formatDateTimeForApi(
          this.taskCategory.dueDateTime
        )

    };


    this.dataprovider
      .saveTaskCategory(payload)
      .subscribe({

        next: (response: any) => {

          if (response.success) {

            Swal.fire(
              'Success',
              response.message,
              'success'
            );

            this.backToIndexPage();

          }

          else {

            Swal.fire(
              'Error',
              response.message,
              'error'
            );

          }

        },


        error: (err) => {

          console.error(
            'Save task category error:',
            err
          );

          Swal.fire(
            'Error',
            'Something went wrong',
            'error'
          );

        }

      });

  }


  /* =================================
     RESET
  ================================= */

  onReset(): void {

    if (this.isEditMode) {

      this.taskCategory = {

        ...this.originalTaskCategory,

        dueDateTime:
          this.originalTaskCategory
            .dueDateTime
            ? new Date(
                this.originalTaskCategory
                  .dueDateTime
                  .getTime()
              )
            : null

      };

    }

    else {

      this.taskCategory = {

        taskcategoryId: null,

        departmentId: null,

        name: '',

        status: null,

        dueDateTime: null

      };

    }


    this.nameError = '';

  }


  /* =================================
     BACK TO INDEX
  ================================= */

  backToIndexPage(): void {

    this.router.navigate(
      ['/task-category-index'],
      {

        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          departmentId:
            this.departmentId || '',

          page:
            this.page,

          size:
            this.size || 5

        }

      }
    );

  }

}