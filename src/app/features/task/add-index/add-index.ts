import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule
} from '@angular/material/core';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  DataProviderService
} from '../../../service/data-provider.service';

import Swal from 'sweetalert2';
import { MyDateAdapter } from '../../../classes/my-date-adapter';


@Component({
  selector: 'app-add-task',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],

  templateUrl: './add-index.html',

  styleUrl: './add-index.scss',
  encapsulation: ViewEncapsulation.Emulated,
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


export class AddIndexComponent implements OnInit {


  // ============================================================
  // TASK
  // ============================================================

  task: any = {};

  originalTask: any = {};


  // ============================================================
  // DROPDOWN DATA
  // ============================================================

  clients: any[] = [];

  taskCategories: any[] = [];

  users: any[] = [];


  // ============================================================
  // FILES
  // ============================================================

  pdfFile: File | null = null;

  zipFile: File | null = null;

  pdfFileName: string = '';

  zipFileName: string = '';

  pdfError: string = '';

  zipError: string = '';


  // ============================================================
  // USER
  // ============================================================

  userId: any;


  // ============================================================
  // MODE
  // ============================================================

  isEditMode: boolean = false;


  // ============================================================
  // INDEX PARAMETERS
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

    private router: Router
  ) { }


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    // ----------------------------------------------------------
    // QUERY PARAMETERS
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
    // USER ID
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
    // LOAD DROPDOWNS
    // ----------------------------------------------------------
    this.loadDropdownData()

    // ----------------------------------------------------------
    // GET TASK ID
    // ----------------------------------------------------------

    const taskId =
      this.route.snapshot.params['taskId'];


    // ----------------------------------------------------------
    // EDIT
    // ----------------------------------------------------------

    if (taskId) {

      this.isEditMode = true;

      this.loadTask(
        taskId
      );

    }


    // ----------------------------------------------------------
    // ADD
    // ----------------------------------------------------------

    else {

      this.isEditMode = false;

      this.task = {

        taskId: null,

        title: '',

        clientId: null,

        date: null,

        taskCategoryId: null,

        description: '',

        assignedTo: null,

        priority: null,

        status: 1,

        addedBy: null,

        fileName1: null,

        fileName2: null

      };

    }

  }


  // ============================================================
  // LOAD TASK
  // ============================================================

  loadTask(taskId: any): void {

    this.dataprovider
      .getTaskById(taskId)
      .subscribe({

        next: (res: any) => {

          if (res && res.data) {

            this.task = {
              ...res.data
            };


            this.originalTask = {
              ...res.data
            };


            // Convert API date to Date
            if (this.task.date) {

              this.task.date =
                new Date(
                  this.task.date
                );

            }

          }

        },

        error: (error: any) => {

          console.error(
            'Error fetching task:',
            error
          );

          Swal.fire(
            'Error',
            'Unable to load task details.',
            'error'
          );

        }

      });

  }


  // ============================================================
  // CLIENT LIST
  // ============================================================

  loadClients(): void {

    // this.dataprovider
    //   .getClientList()
    //   .subscribe({

    //     next: (res: any) => {

    //       this.clients =
    //         res?.data || [];

    //     },

    //     error: (error: any) => {

    //       console.error(
    //         'Error loading clients:',
    //         error
    //       );

    //     }

    //   });

  }


  // ============================================================
  // TASK CATEGORY LIST
  // ============================================================

  loadTaskCategories(): void {

    // this.dataprovider
    //   .getTaskCategoryList()
    //   .subscribe({

    //     next: (res: any) => {

    //       this.taskCategories =
    //         res?.data || [];

    //     },

    //     error: (error: any) => {

    //       console.error(
    //         'Error loading task categories:',
    //         error
    //       );

    //     }

    //   });

  }


  // ============================================================
  // USER LIST
  // ============================================================

  loadUsers(): void {

    // this.dataprovider
    //   .getUserList()
    //   .subscribe({

    //     next: (res: any) => {

    //       this.users =
    //         res?.data || [];

    //     },

    //     error: (error: any) => {

    //       console.error(
    //         'Error loading users:',
    //         error
    //       );

    //     }

    //   });

  }


  // ============================================================
  // PDF
  // ============================================================

  onPdfSelected(
    event: Event
  ): void {

    this.pdfError = '';

    this.pdfFile = null;

    this.pdfFileName = '';


    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();


    if (
      extension !== 'pdf'
    ) {

      this.pdfError =
        'Only PDF files are allowed.';

      input.value = '';

      return;

    }


    this.pdfFile = file;

    this.pdfFileName =
      file.name;

  }


  // ============================================================
  // ZIP
  // ============================================================

  onZipSelected(
    event: Event
  ): void {

    this.zipError = '';

    this.zipFile = null;

    this.zipFileName = '';


    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();


    if (
      extension !== 'zip'
    ) {

      this.zipError =
        'Only ZIP files are allowed.';

      input.value = '';

      return;

    }


    this.zipFile = file;

    this.zipFileName =
      file.name;

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
      this.pdfError ||
      this.zipError
    ) {
      form.control.markAllAsTouched();
      return;
    }


    // ----------------------------------------------------------
    // ADDED BY
    // ----------------------------------------------------------

    this.task.addedBy = this.userId
      ? Number(this.userId)
      : null;


    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    let dateValue = '';

    if (this.task.date) {

      const date = new Date(this.task.date);

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        date.getDate()
      ).padStart(2, '0');

      dateValue = `${year}-${month}-${day}`;
    }


    // ----------------------------------------------------------
    // FORM DATA
    // ----------------------------------------------------------

    const formData = new FormData();


    // ----------------------------------------------------------
    // TASK PARAMETERS
    // IMPORTANT:
    // These names MUST match @RequestParam names in backend
    // ----------------------------------------------------------

    formData.append(
      'clientId',
      String(Number(this.task.clientId))
    );

    formData.append(
      'date',
      dateValue
    );

    formData.append(
      'taskCategoryId',
      String(Number(this.task.taskCategoryId))
    );

    formData.append(
      'description',
      this.task.description || ''
    );

    formData.append(
      'assignedTo',
      String(Number(this.task.assignedTo))
    );

    formData.append(
      'priority',
      String(Number(this.task.priority))
    );

    formData.append(
      'title',
      this.task.title || ''
    );

    formData.append(
      'addedBy',
      String(Number(this.task.addedBy))
    );


    // ----------------------------------------------------------
    // UPDATE ONLY
    // ----------------------------------------------------------

    if (this.isEditMode) {

      formData.append(
        'taskId',
        String(Number(this.task.taskId))
      );

      if (
        this.task.status !== null &&
        this.task.status !== undefined
      ) {

        formData.append(
          'status',
          String(Number(this.task.status))
        );
      }
    }


    // ----------------------------------------------------------
    // PDF
    // Backend expects: fileName1
    // ----------------------------------------------------------

    if (this.pdfFile) {

      formData.append(
        'fileName1',
        this.pdfFile
      );
    }


    // ----------------------------------------------------------
    // ZIP
    // Backend expects: fileName2
    // ----------------------------------------------------------

    if (this.zipFile) {

      formData.append(
        'fileName2',
        this.zipFile
      );
    }


    // ----------------------------------------------------------
    // DEBUG - OPTIONAL
    // ----------------------------------------------------------

    formData.forEach((value, key) => {

      console.log(
        key,
        value
      );

    });


    // ----------------------------------------------------------
    // API
    // ----------------------------------------------------------

    this.dataprovider
      .saveTask(formData)
      .subscribe({

        next: (response: any) => {

          if (
            response &&
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
              response?.message ||
              'Unable to save task.',
              'error'
            );
          }
        },


        error: (error: any) => {

          console.error(
            'Error saving task:',
            error
          );

          Swal.fire(
            'Error',
            error?.error?.message ||
            'Something went wrong.',
            'error'
          );
        }

      });
  }


  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {

    if (this.isEditMode) {

      this.task = {
        ...this.originalTask
      };


      if (this.task.date) {

        this.task.date =
          new Date(
            this.task.date
          );

      }

    }

    else {

      this.task = {

        taskId: null,

        title: '',

        clientId: null,

        date: null,

        taskCategoryId: null,

        description: '',

        assignedTo: null,

        priority: null,

        status: 1,

        addedBy: null,

        fileName1: null,

        fileName2: null

      };

    }


    this.pdfFile = null;

    this.zipFile = null;

    this.pdfFileName = '';

    this.zipFileName = '';

    this.pdfError = '';

    this.zipError = '';

  }


  // ============================================================
  // BACK
  // ============================================================

  backToIndexPage(): void {

    this.router.navigate(
      ['/task-index'],
      {
        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          size:
            this.size || 5

        }

      }
    );

  }
  loadDropdownData(): void {

    this.dataprovider.getTaskFilterData().subscribe({

      next: (res: any) => {

        console.log('TASK DROPDOWN RESPONSE:', res);

        const data = res?.data || res;

        this.clients = data?.clients || [];

        this.taskCategories = data?.taskCategories || [];

        this.users = data?.assignedUsers || [];

        console.log('CLIENTS:', this.clients);
        console.log('TASK CATEGORIES:', this.taskCategories);
        console.log('ASSIGNED USERS:', this.users);
      },

      error: (error: any) => {

        console.error(
          'Error loading task dropdown data:',
          error
        );

        this.clients = [];
        this.taskCategories = [];
        this.users = [];

        Swal.fire(
          'Error',
          'Unable to load task dropdown data.',
          'error'
        );
      }





    });
  }
}