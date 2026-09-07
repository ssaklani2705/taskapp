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
  OwlDateTimeModule
} from '@danielmoncada/angular-datetime-picker';

import Swal from 'sweetalert2';

import {
  DataProviderService
} from '../../../service/data-provider.service';

import {
  OwlMomentDateTimeModule
} from '@danielmoncada/angular-datetime-picker-moment-adapter';

import moment from 'moment';


/* ============================================
   DATE / TIME FORMAT
============================================ */

export const MY_DATE_TIME_FORMATS = {

  parseInput: 'hh:mm A',

  fullPickerInput: 'hh:mm A',

  datePickerInput: 'hh:mm A',

  timePickerInput: 'hh:mm A',

  monthYearLabel: 'MMM YYYY',

  dateA11yLabel: 'LL',

  monthYearA11yLabel: 'MMMM YYYY'

};


/* ============================================
   COMPONENT
============================================ */

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


  /* ============================================
     TASK CATEGORY
  ============================================ */

  taskCategory: any = {

    taskcategoryId: null,

    departmentId: null,

    name: '',

    status: null,

    dueDateTime: null

  };


  /* ============================================
     ORIGINAL DATA
  ============================================ */

  originalTaskCategory: any = {};


  /* ============================================
     OTHER VARIABLES
  ============================================ */

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


  /* ============================================
     CONSTRUCTOR
  ============================================ */

  constructor(

    private route: ActivatedRoute,

    private dataprovider: DataProviderService,

    @Inject(PLATFORM_ID)

    private platformId: Object,

    private router: Router

  ) {}


  /* ============================================
     ON INIT
  ============================================ */

  ngOnInit(): void {


    /* ==========================================
       QUERY PARAMETERS
    ========================================== */

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


    /* ==========================================
       USER ID
    ========================================== */

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


    /* ==========================================
       LOAD DEPARTMENTS
    ========================================== */

    this.getDepartments();


    /* ==========================================
       EDIT MODE
    ========================================== */

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


              /*
               * API already returns
               * time as STRING
               */

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


                dueDateTime:
                res.data.dueDateTime
              };


              /*
               * Store original values
               * for RESET
               */

              this.originalTaskCategory = {

                ...this.taskCategory,

                dueDateTime:

                  this.taskCategory.dueDateTime

                    ? String(

                        this.taskCategory.dueDateTime

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


  /* ============================================
     GET DEPARTMENTS
  ============================================ */

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


  /* ============================================
     CAPITALIZE FIRST CHARACTER ONLY
  ============================================ */

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


  /* ============================================
     FORMAT TIME STRING
     
     Converts possible backend values into:

     HH:mm AM/PM

     Example:
     10:30:00 -> 10:30 AM
     14:30:00 -> 02:30 PM
     10:30 AM -> 10:30 AM
  ============================================ */

  private formatTimeString(

    value: any

  ): string | null {


    if (!value) {

      return null;

    }


    /*
     * Already in HH:mm AM/PM format
     */

    if (

      typeof value === 'string' &&

      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(

        value.trim()

      )

    ) {

      return value

        .trim()

        .toUpperCase();

    }


    /*
     * Backend may return:
     *
     * 10:30
     * 10:30:00
     * 14:30
     * 14:30:00
     */

    if (

      typeof value === 'string'

    ) {


      const timeOnly =

        value

          .trim()

          .substring(

            0,

            8

          );


      const match =

        timeOnly.match(

          /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/

        );


      if (match) {


        let hours =

          Number(match[1]);


        const minutes =

          match[2];


        const period =

          hours >= 12

            ? 'PM'

            : 'AM';


        hours =

          hours % 12 || 12;


        return (

          String(hours).padStart(2, '0') +

          ':' +

          minutes +

          ' ' +

          period

        );

      }

    }


    /*
     * Moment object
     */

    if (

      moment.isMoment(value)

    ) {


      return value.format(

        'hh:mm A'

      );

    }


    /*
     * JavaScript Date
     */

    if (

      value instanceof Date

    ) {


      if (

        isNaN(value.getTime())

      ) {

        return null;

      }


      return moment(value).format(

        'hh:mm A'

      );

    }


    console.error(

      'Unsupported dueDateTime value:',

      value

    );


    return null;

  }


  /* ============================================
     FORMAT TIME FOR API
     
     IMPORTANT:
     dueDateTime is now STRING.

     Example:
     "10:30 AM"

     API receives:
     "10:30 AM"
  ============================================ */

  private formatTimeForApi(

    value: any

  ): string | null {


    if (!value) {

      return null;

    }


    /*
     * If picker returns Moment
     */

    if (

      moment.isMoment(value)

    ) {

      return value.format(

        'hh:mm A'

      );

    }


    /*
     * If picker returns Date
     */

    if (

      value instanceof Date

    ) {


      if (

        isNaN(value.getTime())

      ) {

        return null;

      }


      return moment(value).format(

        'hh:mm A'

      );

    }


    /*
     * String value
     */

    if (

      typeof value === 'string'

    ) {


      const trimmedValue =

        value.trim();


      /*
       * Already formatted:
       * 10:30 AM
       */

      if (

        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(

          trimmedValue

        )

      ) {

        return trimmedValue.toUpperCase();

      }


      /*
       * 24-hour string:
       * 14:30
       * 14:30:00
       */

      const match =

        trimmedValue.match(

          /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/

        );


      if (match) {


        let hours =

          Number(match[1]);


        const minutes =

          match[2];


        const period =

          hours >= 12

            ? 'PM'

            : 'AM';


        hours =

          hours % 12 || 12;


        return (

          String(hours).padStart(2, '0') +

          ':' +

          minutes +

          ' ' +

          period

        );

      }


      return trimmedValue;

    }


    return null;

  }


  /* ============================================
     SUBMIT
  ============================================ */

  onSubmit(form: any): void {


    /* ==========================================
       FORM VALIDATION
    ========================================== */

    if (

      form.invalid ||

      this.nameError

    ) {


      form.control

        .markAllAsTouched();


      return;

    }


    /* ==========================================
       VALIDATE DUE TIME
    ========================================== */

    if (

      !this.taskCategory.dueDateTime

    ) {


      Swal.fire(

        'Error',

        'Please select Due Time',

        'error'

      );


      return;

    }


    /* ==========================================
       CREATE API PAYLOAD
    ========================================== */

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


      /*
       * STRING ONLY
       *
       * Example:
       * "10:30 AM"
       */

       dueDateTime:
this.taskCategory.dueDateTime

        

      // dueDateTime:

      //   this.formatTimeForApi(

      //     this.taskCategory.dueDateTime

      //   )

    };


    console.log(

      'TASK CATEGORY PAYLOAD:',

      payload

    );


    /* ==========================================
       SAVE API
    ========================================== */

    this.dataprovider

      .saveTaskCategory(payload)

      .subscribe({

        next: (response: any) => {


          if (

            response.success

          ) {


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


  /* ============================================
     RESET
  ============================================ */

  onReset(): void {


    if (

      this.isEditMode

    ) {


      this.taskCategory = {


        ...this.originalTaskCategory,


        /*
         * STRING COPY
         */

        dueDateTime:

          this.originalTaskCategory

            .dueDateTime

            ? String(

                this.originalTaskCategory

                  .dueDateTime

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


  /* ============================================
     BACK TO INDEX PAGE
  ============================================ */

  backToIndexPage(): void {


    this.router.navigate(

      [

        '/task-category-index'

      ],

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

  private timeStringToDate(value: string): Date | null {

  if (!value) {
    return null;
  }

  const date = new Date();

  let hours = 0;
  let minutes = 0;

  const time = value.trim().toUpperCase();

  // 10:30 AM
  const amPmMatch = time.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
  );

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

  }

  // 10:30 or 10:30:00
  else {

    const twentyFourHourMatch = time.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?$/
    );

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

}