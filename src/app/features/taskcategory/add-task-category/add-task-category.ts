import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-add-task-category',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon,
    MatDivider
],
  templateUrl: './add-task-category.html',
  styleUrl: './add-task-category.scss',
})
export class AddTaskCategoryComponent implements OnInit {

  taskCategory: any = {
    taskcategoryId: null,
    departmentId: null,
    name: '',
    status: null,
  };

  originalTaskCategory: any = {};

  departments: any[] = [];

  userId: any;

  isEditMode: boolean = false;

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

    /* --------------------------------
       Get pagination/filter parameters
    --------------------------------- */

    const queryParams =
      this.route.snapshot.queryParamMap;

    this.currentPage =
      Number(queryParams.get('currentPage')) || 1;

    this.searchText =
      queryParams.get('searchText') || '';

    this.statusIndex =
      Number(queryParams.get('statusIndex')) || 0;

    this.page =
      Number(queryParams.get('page')) ||
      this.currentPage - 1;

    this.size =
      Number(queryParams.get('size')) || 5;


    /* --------------------------------
       User ID
    --------------------------------- */

    if (isPlatformBrowser(this.platformId)) {
      this.userId =
        sessionStorage.getItem('userId');
    }


    /* --------------------------------
       Load departments
    --------------------------------- */

    this.getDepartments();


    /* --------------------------------
       Check Edit Mode
    --------------------------------- */

    const taskcategoryId =
      this.route.snapshot.params['taskCategoryId'];

    if (taskcategoryId) {

      this.isEditMode = true;

      this.dataprovider
        .getTaskCategoryById(taskcategoryId)
        .subscribe({

          next: (res) => {

            if (res && res.data) {

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
              };

              this.originalTaskCategory =
                { ...this.taskCategory };
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
          },

        });
    }
  }


  /* =========================================
     GET DEPARTMENTS
  ========================================= */

  getDepartments(): void {

    this.dataprovider
      .getActiveDepartments()
      .subscribe({

        next: (response: any) => {

          /*
           * Handle both:
           *
           * response.data
           * OR
           * direct array
           */

          if (Array.isArray(response)) {

            this.departments = response;

          } else if (
            response &&
            Array.isArray(response.data)
          ) {

            this.departments =
              response.data;

          } else {

            this.departments = [];
          }

          console.log(
            'Departments:',
            this.departments
          );
        },

        error: (error) => {

          console.error(
            'Error loading departments:',
            error
          );

          this.departments = [];

          Swal.fire(
            'Error',
            'Unable to load departments',
            'error'
          );
        },

      });
  }


  /* =========================================
     CAPITALIZE FIRST CHARACTER
  ========================================= */

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


  /* =========================================
     SUBMIT
  ========================================= */

  onSubmit(form: any): void {

    if (
      form.invalid ||
      this.nameError
    ) {

      form.control.markAllAsTouched();

      return;
    }


    /* User ID */

    this.taskCategory.userId =
      this.userId
        ? Number(this.userId)
        : null;


    /* Make sure department is number */

    if (
      this.taskCategory.departmentId !== null &&
      this.taskCategory.departmentId !== undefined &&
      this.taskCategory.departmentId !== ''
    ) {

      this.taskCategory.departmentId =
        Number(
          this.taskCategory.departmentId
        );

    } else {

      Swal.fire(
        'Error',
        'Please select a department',
        'error'
      );

      return;
    }


    /* Save */

    this.dataprovider
      .saveTaskCategory(this.taskCategory)
      .subscribe({

        next: (response: any) => {

          if (response.success) {

            Swal.fire(
              'Success',
              response.message,
              'success'
            );

            this.backToIndexPage();

          } else {

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
        },

      });
  }


  /* =========================================
     RESET
  ========================================= */

  onReset(): void {

    if (this.isEditMode) {

      this.taskCategory =
        { ...this.originalTaskCategory };

    } else {

      /*
       * IMPORTANT:
       * departmentId must be null.
       *
       * This makes:
       * -- Select Department --
       * appear instead of blank.
       */

      this.taskCategory = {

        taskcategoryId: null,

        departmentId: null,

        name: '',

        status: null,
      };
    }

    this.nameError = '';
  }


  /* =========================================
     BACK TO INDEX
  ========================================= */

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

          page:
            this.page,

          size:
            this.size || 5,
        },
      }
    );
  }
}
