import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatFormFieldModule,
} from '@angular/material/form-field';

import {
  MatInputModule,
} from '@angular/material/input';

import {
  MatSelectModule,
} from '@angular/material/select';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  DataProviderService,
} from '../../../service/data-provider.service';

import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-add-department',

  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],

  templateUrl: './add-department.html',

  styleUrl: './add-department.scss',
})


export class AddDepartmentComponent implements OnInit {

  // ============================================================
  // DEPARTMENT OBJECT
  // ============================================================

  department: any = {};

  originalDepartment: any = {};


  // ============================================================
  // USER
  // ============================================================

  userId: any;


  // ============================================================
  // MODE
  // ============================================================

  isEditMode: boolean = false;


  // ============================================================
  // VALIDATION
  // ============================================================

  nameError: string = '';


  // ============================================================
  // PAGINATION / FILTER STATE
  // ============================================================

  currentPage: number = 1;

  searchText: string = '';

  statusIndex: number = 0;

  page: number = 0;

  size: number = 5;


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private route: ActivatedRoute,

    private dataprovider: DataProviderService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private router: Router,
  ) {}


  // ============================================================
  // ON INIT
  // ============================================================

  ngOnInit(): void {

    // ----------------------------------------------------------
    // GET QUERY PARAMETERS
    // ----------------------------------------------------------

    const queryParams =
      this.route.snapshot.queryParamMap;


    this.currentPage =
      Number(
        queryParams.get('currentPage')
      ) || 1;


    this.searchText =
      queryParams.get('searchText') || '';


    this.statusIndex =
      Number(
        queryParams.get('statusIndex')
      ) || 0;


    this.page =
      Number(
        queryParams.get('page')
      ) || this.currentPage - 1;


    this.size =
      Number(
        queryParams.get('size')
      ) || 5;


    // ----------------------------------------------------------
    // GET USER ID
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // GET DEPARTMENT ID FROM ROUTE
    // ----------------------------------------------------------

    const departmentId =
      this.route.snapshot.params[
        'departmentId'
      ];


    // ----------------------------------------------------------
    // EDIT MODE
    // ----------------------------------------------------------

    if (departmentId) {

      this.isEditMode = true;


      this.dataprovider
        .getDepartmentById(
          departmentId
        )
        .subscribe({

          next: (res) => {

            if (res && res.data) {

              this.department =
                res.data;

              // ----------------------------------------------
              // KEEP ORIGINAL VALUES FOR RESET
              // ----------------------------------------------

              this.originalDepartment = {
                ...res.data,
              };

            }

          },

          error: (error) => {

            console.error(
              'Error fetching department:',
              error
            );

            Swal.fire(
              'Error',
              'Unable to load department details.',
              'error'
            );

          },

        });

    }

    // ----------------------------------------------------------
    // ADD MODE
    // ----------------------------------------------------------

    else {

      this.isEditMode = false;

      this.department = {

        name: '',

        sequence: null,

        status: 1,

      };

    }

  }


  // ============================================================
  // CAPITALIZE FIRST CHARACTER
  // ============================================================

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


  // ============================================================
  // SUBMIT
  // ============================================================

  onSubmit(form: any): void {

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      form.invalid ||
      this.nameError
    ) {

      form.control.markAllAsTouched();

      return;

    }


    // ----------------------------------------------------------
    // USER ID
    // ----------------------------------------------------------

    this.department.userId =
      this.userId
        ? Number(this.userId)
        : null;


    // ----------------------------------------------------------
    // SEQUENCE CONVERSION
    // ----------------------------------------------------------

    if (
      this.department.sequence !== null &&
      this.department.sequence !== undefined &&
      this.department.sequence !== ''
    ) {

      this.department.sequence =
        Number(
          this.department.sequence
        );

    }


    // ----------------------------------------------------------
    // ADD / UPDATE API
    // ----------------------------------------------------------

    this.dataprovider
      .saveDepartment(
        this.department
      )
      .subscribe({

        next: (response) => {

          // -----------------------------------------------
          // SUCCESS
          // -----------------------------------------------

          if (response.success) {

            Swal.fire(
              'Success',
              response.message,
              'success'
            );

            this.onReset();

            this.backToIndexPage();

          }

          // -----------------------------------------------
          // BUSINESS ERROR
          // -----------------------------------------------

          else {

            Swal.fire(
              'Error',
              response.message,
              'error'
            );

          }

        },


        // -----------------------------------------------
        // HTTP ERROR
        // -----------------------------------------------

        error: (err) => {

          console.error(
            'Error saving department:',
            err
          );

          Swal.fire(
            'Error',
            'Something went wrong',
            'error'
          );

        },

      });

  }


  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {

    // ----------------------------------------------------------
    // EDIT MODE
    // ----------------------------------------------------------

    if (this.isEditMode) {

      this.department = {
        ...this.originalDepartment,
      };

    }

    // ----------------------------------------------------------
    // ADD MODE
    // ----------------------------------------------------------

    else {

      this.department = {

        name: '',

        sequence: null,

        status: 1,

      };

    }


    this.nameError = '';

  }


  // ============================================================
  // BACK TO INDEX
  // ============================================================

  backToIndexPage(): void {

    this.router.navigate(
      ['/department-master'],
      {
        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          size:
            this.size || 5,

        },
      }
    );

  }

}
