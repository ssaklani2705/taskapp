import { CommonModule, isPlatformBrowser } from '@angular/common';

import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { MatSelectModule } from '@angular/material/select';

import { ActivatedRoute, Router } from '@angular/router';

import { DataProviderService } from '../../../service/data-provider.service';

import Swal from 'sweetalert2';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatIconModule } from '@angular/material/icon';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';

import { OwlMomentDateTimeModule } from '@danielmoncada/angular-datetime-picker-moment-adapter';
import moment from 'moment';

export const MY_DATE_TIME_FORMATS = {
  parseInput: 'DD-MM-YYYY HH:mm',

  fullPickerInput: 'DD-MM-YYYY HH:mm',

  datePickerInput: 'DD-MM-YYYY',

  timePickerInput: 'HH:mm',

  monthYearLabel: 'MMM YYYY',

  dateA11yLabel: 'LL',

  monthYearA11yLabel: 'MMMM YYYY',
};

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
    MatSelectModule,
    MatIconModule,
    OwlDateTimeModule,
    OwlMomentDateTimeModule,
  ],

  templateUrl: './add-index.html',

  styleUrl: './add-index.scss',
  encapsulation: ViewEncapsulation.Emulated,
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
  // providers: [
  //   {
  //     provide: DateAdapter,
  //     useClass: MyDateAdapter,
  //   },
  //   {
  //     provide: MAT_DATE_LOCALE,
  //     useValue: 'en-GB',
  //   },
  // ],
})
export class AddIndexComponent implements OnInit {
  @ViewChild('pdfInput')
  pdfInput!: ElementRef<HTMLInputElement>;

  @ViewChild('zipInput')
  zipInput!: ElementRef<HTMLInputElement>;

  today: Date = new Date();

  // readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

  isAdmin: any;

  loginType: any = '';

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
  taskStatusIds: string = '';
  clientId: string = '';
  taskCategoryId: string = '';
  assignedTo: string = '';
  priority: string = '';
  fromDate: string = '';
  toDate: string = '';
  // ----------------------------

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
  // INIT
  // ============================================================
  dashboardFilter: string = '';
  ngOnInit(): void {
  
    // ----------------------------------------------------------
    // NAVIGATION STATE
    // ----------------------------------------------------------

    const navigation = this.router.getCurrentNavigation();

    const state = navigation?.extras?.state || (history.state && Object.keys(history.state).length ? history.state : null);

    if (state) {
      this.currentPage = state.currentPage || 1;

      this.searchText = state.searchText || '';

      this.statusIndex = state.statusIndex || 0;

      this.size = state.size || 5;

      this.clientId = state.clientId || '';

      this.taskCategoryId = state.taskCategoryId || '';

      this.assignedTo = state.assignedTo || '';

      this.priority = state.priority || '';

      this.fromDate = state.fromDate || '';

      this.toDate = state.toDate || '';

      this.taskStatusIds = Array.isArray(state.taskStatusIds) ? state.taskStatusIds.join(',') : state.taskStatusIds || '';

      this.dashboardFilter = state.taskType || '';

      this.page = this.currentPage - 1;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');

      this.isAdmin = sessionStorage.getItem('isAdmin');

      this.loginType = sessionStorage.getItem('loginType') || 'other';
    }

    this.loadDropdownData();

    const taskId = this.route.snapshot.params['taskId'];

    if (taskId) {
      this.isEditMode = true;

      this.loadTask(taskId);
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

        fileName2: null,
        taskStatusId: null,
      };
    }
    
  }

  // ============================================================
  // LOAD TASK
  // ============================================================

  loadTask(taskId: any): void {
    this.dataprovider.getTaskById(taskId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.task = { ...res.data };
          this.originalTask = { ...res.data };
          // Convert API date to Date
          if (this.task.date) {
            this.task.date = new Date(this.task.date);
          }
          if (this.task.clientId) {
            this.onchangeloadDropdownData();
          }
          if (this.task.clientId && this.task.taskCategoryId) {
            this.onchangeloadUserDropdownData();
          }

          if (this.clients?.length) {
            const selectedClient = this.clients.find((x: any) => Number(x.clientId) === Number(this.task.clientId));

            if (selectedClient) {
              this.clientSearchText = selectedClient.name;
            }
          }
        }
      },
      error: (error: any) => {
        console.error('Error fetching task:', error);
        Swal.fire('Error', 'Unable to load task details.', 'error');
      },
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

  // onPdfSelected(
  //   event: Event
  // ): void {

  //   this.pdfError = '';

  //   this.pdfFile = null;

  //   this.pdfFileName = '';

  //   const input =
  //     event.target as HTMLInputElement;

  //   if (
  //     !input.files ||
  //     input.files.length === 0
  //   ) {

  //     return;

  //   }

  //   const file =
  //     input.files[0];

  //   const extension =
  //     file.name
  //       .split('.')
  //       .pop()
  //       ?.toLowerCase();

  //   if (
  //     extension !== 'pdf'
  //   ) {

  //     this.pdfError =
  //       'Only PDF files are allowed.';

  //     input.value = '';

  //     return;

  //   }

  //   this.pdfFile = file;

  //   this.pdfFileName =
  //     file.name;

  // }

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  readonly ALLOWED_EXTENSIONS_FILE_ONE = ['.pdf', '.xls', '.xlsx', '.doc', '.docx'];
  readonly ALLOWED_EXTENSIONS_FILE_TWO = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.zip'];

  // ============================================================
  // FILE - 1
  // ============================================================

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    // Reset previous values
    this.pdfError = '';
    this.pdfFile = null;
    this.pdfFileName = '';

    if (!file) {
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();

    const isAllowedType = this.ALLOWED_EXTENSIONS_FILE_ONE.some((ext) => fileName.endsWith(ext));

    if (!isAllowedType) {
      this.pdfError = 'Only .pdf, .xls, .xlsx, .doc, .docx files are allowed.';

      input.value = '';

      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.pdfError = 'File size must not exceed 10 MB.';

      input.value = '';

      return;
    }

    // Valid file
    this.pdfFile = file;

    this.pdfFileName = file.name;

    this.pdfError = '';
  }

  // ============================================================
  // FILE - 2
  // ============================================================

  onZipSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    // Reset previous values
    this.zipError = '';
    this.zipFile = null;
    this.zipFileName = '';

    if (!file) {
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();

    const isAllowedType = this.ALLOWED_EXTENSIONS_FILE_TWO.some((ext) => fileName.endsWith(ext));

    if (!isAllowedType) {
      this.zipError = 'Only .pdf, .xls, .xlsx, .doc, .docx, .zip files are allowed.';

      input.value = '';

      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.zipError = 'File size must not exceed 10 MB.';

      input.value = '';

      return;
    }

    // Valid file
    this.zipFile = file;

    this.zipFileName = file.name;

    this.zipError = '';
  }
  // onPdfSelected(event: Event): void {

  //   const input =
  //     event.target as HTMLInputElement;

  //   const file =
  //     input.files?.[0];

  //   // Reset previous values
  //   this.pdfError = '';
  //   this.pdfFile = null;
  //   this.pdfFileName = '';

  //   if (!file) {
  //     return;
  //   }

  //   // Validate file type
  //   const isPdf =
  //     file.type === 'application/pdf' ||
  //     file.name.toLowerCase().endsWith('.pdf');

  //   if (!isPdf) {

  //     this.pdfError =
  //       'Please select a valid PDF file.';

  //     input.value = '';

  //     return;
  //   }

  //   // Validate file size
  //   if (
  //     file.size >
  //     this.MAX_FILE_SIZE
  //   ) {

  //     this.pdfError =
  //       'PDF file size must not exceed 5 MB.';

  //     input.value = '';

  //     return;
  //   }

  //   // Valid file
  //   this.pdfFile =
  //     file;

  //   this.pdfFileName =
  //     file.name;

  //   this.pdfError = '';

  // }

  // // ============================================================
  // // ZIP
  // // ============================================================

  // onZipSelected(event: Event): void {

  //   const input =
  //     event.target as HTMLInputElement;

  //   const file =
  //     input.files?.[0];

  //   // Reset previous values
  //   this.zipError = '';
  //   this.zipFile = null;
  //   this.zipFileName = '';

  //   if (!file) {
  //     return;
  //   }

  //   // Validate file type
  //   const isZip =
  //     file.type === 'application/zip' ||
  //     file.type === 'application/x-zip-compressed' ||
  //     file.name.toLowerCase().endsWith('.zip');

  //   if (!isZip) {

  //     this.zipError =
  //       'Please select a valid ZIP file.';

  //     input.value = '';

  //     return;
  //   }

  //   // Validate file size
  //   if (
  //     file.size >
  //     this.MAX_FILE_SIZE
  //   ) {

  //     this.zipError =
  //       'ZIP file size must not exceed 5 MB.';

  //     input.value = '';

  //     return;
  //   }

  //   // Valid file
  //   this.zipFile =
  //     file;

  //   this.zipFileName =
  //     file.name;

  //   this.zipError = '';

  // }

  // ============================================================
  // SUBMIT
  // ============================================================
  onSubmit(form: any): void {
    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (form.invalid || this.pdfError || this.zipError) {
      form.control.markAllAsTouched();
      return;
    }

    // ----------------------------------------------------------
    // ADDED BY
    // ----------------------------------------------------------

    this.task.addedBy = this.userId ? Number(this.userId) : null;

    const formData = new FormData();

    // ----------------------------------------------------------
    // TASK PARAMETERS
    // IMPORTANT:
    // These names MUST match @RequestParam names in backend
    // ----------------------------------------------------------

    formData.append('clientId', String(Number(this.task.clientId)));

    formData.append(
      'date',
      // dateValue

      this.formatDateTimeForApi(this.task.date) ?? '',
    );

    formData.append('taskCategoryId', String(Number(this.task.taskCategoryId)));

    formData.append('description', this.task.description || '');

    formData.append('assignedTo', String(Number(this.task.assignedTo)));

    formData.append('priority', String(Number(this.task.priority)));

    formData.append('title', this.task.title || '');

    formData.append('addedBy', String(Number(this.task.addedBy)));

    // ----------------------------------------------------------
    // UPDATE ONLY
    // ----------------------------------------------------------

    if (this.isEditMode) {
      formData.append('taskId', String(Number(this.task.taskId)));

      if (this.task.status !== null && this.task.status !== undefined) {
        formData.append('status', String(Number(this.task.status)));
      }
    }

    // ----------------------------------------------------------
    // PDF
    // Backend expects: fileName1
    // ----------------------------------------------------------

    if (this.pdfFile) {
      formData.append('fileName1', this.pdfFile);
    }

    // ----------------------------------------------------------
    // ZIP
    // Backend expects: fileName2
    // ----------------------------------------------------------

    if (this.zipFile) {
      formData.append('fileName2', this.zipFile);
    }

    // ----------------------------------------------------------
    // DEBUG - OPTIONAL
    // ----------------------------------------------------------

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    // ----------------------------------------------------------
    // API
    // ----------------------------------------------------------

    this.dataprovider.saveTask(formData).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          Swal.fire('Success', response.message, 'success');
          this.backToIndexPage();
        } else {
          Swal.fire('Error', response?.message || 'Unable to save task.', 'error');
        }
      },
      error: (error: any) => {
        console.error('Error saving task:', error);
        Swal.fire('Error', error?.error?.message || 'Something went wrong.', 'error');
      },
    });
  }

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
    } else {
      console.error('Unsupported dueDateTime value:', date);
      return null;
    }

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    const year = dateObj.getFullYear();

    const month = String(dateObj.getMonth() + 1).padStart(2, '0');

    const day = String(dateObj.getDate()).padStart(2, '0');

    const hours = String(dateObj.getHours()).padStart(2, '0');

    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  }

  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {
    if (this.isEditMode) {
      this.task = {
        ...this.originalTask,
      };

      if (this.task.date) {
        this.task.date = new Date(this.task.date);
      }
    } else {
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

        fileName2: null,
      };
    }

    // Clear Angular variables
    this.pdfFile = null;

    this.zipFile = null;

    this.pdfFileName = '';

    this.zipFileName = '';

    this.pdfError = '';

    this.zipError = '';

    // Clear actual file input
    if (this.pdfInput) {
      this.pdfInput.nativeElement.value = '';
    }

    if (this.zipInput) {
      this.zipInput.nativeElement.value = '';
    }
  }

  // ============================================================
  // BACK
  // ============================================================

  backToIndexPage(): void {
    this.router.navigate(['/task-index'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5,

        clientId: this.clientId || null,
        taskCategoryId: this.taskCategoryId || null,
        assignedTo: this.assignedTo || null,
        priority: this.priority || null,

        fromDate: this.fromDate || null,
        toDate: this.toDate || null,

        taskStatusIds: this.taskStatusIds ? this.taskStatusIds.split(',') : [],

        taskType: this.dashboardFilter,
      },
    });
  }

  onchangeloadDropdownData(): void {
    // alert(this.task.clientId);
    this.dataprovider.changesClientIdgetTaskFilterData(this.isAdmin, this.userId, this.loginType, this.task.clientId).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        // this.clients = data?.clients || [];
        this.taskCategories = data?.taskCategories || [];
        // this.users = data?.assignedUsers || [];
      },

      error: (error: any) => {
        console.error('Error loading task dropdown data:', error);

        // this.clients = [];
        this.taskCategories = [];
        // this.users = [];

        // Swal.fire(
        //   'Error',
        //   'Unable to load task dropdown data.',
        //   'error'
        // );
      },
    });
  }

  onchangeloadUserDropdownData(): void {
    this.dataprovider.changesCategoryIdgetUserFilterData(this.isAdmin, this.userId, this.loginType, this.task.clientId, this.task.taskCategoryId).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.users = data?.assignedUsers || [];
      },
      error: (error: any) => {
        console.error('Error loading task dropdown data:', error);
        this.users = [];
      },
    });
  }

  loadDropdownData(): void {
    // alert(this.task.clientId);
    this.dataprovider.getTaskFilterData(this.isAdmin, this.userId, this.loginType).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.clients = data?.clients || [];
        this.filteredClients = [...this.clients];
        if (this.task.clientId) {
          const selectedClient = this.clients.find((x: any) => Number(x.clientId) === Number(this.task.clientId));

          if (selectedClient) {
            this.clientSearchText = selectedClient.name;
          }
        }
      },

      error: (error: any) => {
        console.error('Error loading task dropdown data:', error);

        this.clients = [];
        // this.taskCategories = [];
        // this.users = [];

        Swal.fire('Error', 'Unable to load task dropdown data.', 'error');
      },
    });
  }

  onClientChange(clientId: number | null): void {
    this.task.taskCategoryId = null;
    this.task.assignedTo = null;

    this.taskCategories = [];
    this.users = [];

    if (!clientId) {
      this.task.assignedTo = null;
    }
  }
  removePdfFile(): void {
    this.pdfFile = null;
    this.pdfFileName = '';
    this.pdfError = '';

    if (this.pdfInput) {
      this.pdfInput.nativeElement.value = '';
    }
  }

  removeZipFile(): void {
    this.zipFile = null;
    this.zipFileName = '';
    this.zipError = '';

    if (this.zipInput) {
      this.zipInput.nativeElement.value = '';
    }
  }

  clientSearchText = '';
  filteredClients: any[] = [];
  showClientDropdown = false;

  filterClients(): void {
    const search = this.clientSearchText.trim().toLowerCase();

    if (search.length < 3) {
      this.showClientDropdown = false;
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.clients.filter((client) => client.name.toLowerCase().includes(search));

    this.showClientDropdown = true;
  }

  selectClient(client: any): void {
    this.task.clientId = client.clientId; // value used in save API

    this.clientSearchText = client.name;

    this.showClientDropdown = false;

    this.onClientChange(client.clientId);
    this.onchangeloadDropdownData();
  }

  clearClientSelection(): void {
    this.task.clientId = null;

    this.clientSearchText = '';

    this.filteredClients = [];

    this.showClientDropdown = false;
  }
}
