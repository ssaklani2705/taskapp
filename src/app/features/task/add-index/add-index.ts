import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';

import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { MatSelectModule } from '@angular/material/select';

import { ActivatedRoute, Router } from '@angular/router';

import { DataProviderService } from '../../../service/data-provider.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatIconModule } from '@angular/material/icon';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';

import { OwlMomentDateTimeModule } from '@danielmoncada/angular-datetime-picker-moment-adapter';
import moment from 'moment';
import { SESSION_KEYS } from '../../../service/session-storage.keys';

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
    DatePipe,
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
export class AddIndexComponent implements OnInit {
  @ViewChild('pdfInput')
  pdfInput!: ElementRef<HTMLInputElement>;
  @ViewChild('zipInput')
  zipInput!: ElementRef<HTMLInputElement>;
  today: Date = new Date();
  task: any = {};
  originalTask: any = {};
  clients: any[] = [];
  taskCategories: any[] = [];
  users: any[] = [];
  pdfFile: File | null = null;
  zipFile: File | null = null;
  pdfFileName: string = '';
  zipFileName: string = '';
  pdfError: string = '';
  zipError: string = '';
  userId: any;
  isAdmin: any;
  loginType: any = '';
  isEditMode: boolean = false;
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
  isHod = '';
  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,

    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
  ) {}
  dashboardFilter: string = '';
  categoryIds: number[] = [];

  // Max characters allowed in Description (keep in sync with DB column / backend validation)
readonly descriptionMaxLength = 2000;

  ngOnInit(): void {
    const savedFilter = sessionStorage.getItem(SESSION_KEYS.TASK_MASTER_FILTER);

    if (savedFilter) {
      const state = JSON.parse(savedFilter);
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

      this.isHod = sessionStorage.getItem('isHod') || 'N';

      const savedCategoryIds = sessionStorage.getItem('categoryIds');

      try {
        this.categoryIds = savedCategoryIds ? JSON.parse(savedCategoryIds).map((id: any) => Number(id)) : [];
      } catch {
        this.categoryIds = [];
      }
    }

    this.loadDropdownData();

    const taskId = this.route.snapshot.params['taskId'];

    if (taskId) {
      this.isEditMode = true;

      this.loadTask(taskId);
    } else {
      this.isEditMode = false;

      this.task = {
        taskId: null,

        userType: 1, // 1 = Employee, 2 = Manager

        title: '',

        clientId: null,

        date: null,

        taskCategoryId: null,

        description: '',

        assignedTo: null,

        buddyId: null,          // ADD THIS LINE

        priority: null,

        status: 1,

        addedBy: null,

        fileName1: null,

        fileName2: null,
        taskStatusId: null,
        startDate: null,
        endDate: null,
      };

      // Task Category no longer depends on Client: load the list on page load
      this.onchangeloadDropdownData();
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

          // API may return userType as a string
          this.task.userType = this.task.userType != null ? Number(this.task.userType) : null;

          this.originalTask = { ...this.task };

          if (this.task.startDate) {
            this.task.startDate = new Date(this.task.startDate);
          }
          if (this.task.endDate) {
            this.task.endDate = new Date(this.task.endDate);
          }
          // Load categories even if the task has no client (client is optional for some categories)
          this.onchangeloadDropdownData();

          if (this.task.taskCategoryId) {
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
  // FILES
  // ============================================================

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  readonly ALLOWED_EXTENSIONS_FILE_ONE = ['.pdf', '.xls', '.xlsx', '.doc', '.docx'];
  readonly ALLOWED_EXTENSIONS_FILE_TWO = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.zip'];

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

  // ============================================================
  // SUBMIT
  // ============================================================

  onSubmit(form: any): void {
    if (form.invalid || this.pdfError || this.zipError) {
      form.control.markAllAsTouched();
      return;
    }

    
    if (this.checkingTaskCategoryEmployee) {
      Swal.fire('Please wait', 'Checking employee availability for the selected category...', 'info');
      return;
    }

    // Do not submit if selected task category has no employee
    // if (this.taskCategoryEmployeeError) {
    //   Swal.fire('Error', 'No employee available for the selected task category.', 'error');
    //   return;
    // }

    this.task.addedBy = this.userId ? Number(this.userId) : null;

    // Buddy must not be the same person as Assigned To
    if (this.task.buddyId && Number(this.task.buddyId) === Number(this.task.assignedTo)) {
      this.task.buddyId = null;
    }

    // Non-manager login: client search box is empty, so no client may be sent
if (this.loginType !== 'manager' && !(this.clientSearchText || '').trim()) {
  this.task.clientId = null;
}

    const formData = new FormData();

    // Client is optional for some categories: send it only when selected
    if (this.task.clientId) {
      formData.append('clientId', String(Number(this.task.clientId)));
    }

    formData.append('startDate', this.formatDateTimeForApi(this.task.startDate) ?? '');

    formData.append('endDate', this.formatDateTimeForApi(this.task.endDate) ?? '');

    formData.append('taskCategoryId', String(Number(this.task.taskCategoryId)));

    formData.append('description', this.task.description || '');

    formData.append('assignedTo', String(Number(this.task.assignedTo)));

    if (this.task.buddyId) {
      formData.append('buddyId', String(Number(this.task.buddyId)));
    }

    formData.append('priority', String(Number(this.task.priority)));

    formData.append('title', this.task.title || '');

    formData.append('addedBy', String(Number(this.task.addedBy)));

    formData.append('userType', String(Number(this.task.userType)));

    if (this.isEditMode) {
      formData.append('taskId', String(Number(this.task.taskId)));

      if (this.task.status !== null && this.task.status !== undefined) {
        formData.append('status', String(Number(this.task.status)));
      }
    }

    if (this.pdfFile) {
      formData.append('fileName1', this.pdfFile);
    }

    if (this.zipFile) {
      formData.append('fileName2', this.zipFile);
    }

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

  // onReset(): void {
  //   if (this.isEditMode) {
  //     this.task = {
  //       ...this.originalTask,
  //     };

  //     if (this.task.startDate) {
  //       this.task.startDate = new Date(this.task.startDate);
  //     }
  //     if (this.task.endDate) {
  //       this.task.endDate = new Date(this.task.endDate);
  //     }
  //   } else {
  //     this.task = {
  //       taskId: null,

  //       userType: 1,

  //       title: '',

  //       clientId: null,

  //       startDate: null,
  //       endDate: null,
  //       taskCategoryId: null,

  //       description: '',

  //       assignedTo: null,

  //       buddyId: null,          // ADD THIS LINE

  //       priority: null,

  //       status: 1,

  //       addedBy: null,

  //       fileName1: null,

  //       fileName2: null,
  //     };

  //     this.selectedTaskCategoryName = '';
  //     this.showCategoryDropdown = false;
  //     this.categorySearchText = '';           // ADD THIS LINE
  //     this.clientSearchText = '';
  //     this.filteredClients = [];
  //     this.showClientDropdown = false;
  //     this.users = [];
  //     this.noEmployeeError = '';
  //     this.holidayError = '';
  //     this.endDateError = '';
  //   }

  //   // Clear Angular variables
  //   this.pdfFile = null;

  //   this.zipFile = null;

  //   this.pdfFileName = '';

  //   this.zipFileName = '';

  //   this.pdfError = '';

  //   this.zipError = '';

  //   // Clear actual file input
  //   if (this.pdfInput) {
  //     this.pdfInput.nativeElement.value = '';
  //   }

  //   if (this.zipInput) {
  //     this.zipInput.nativeElement.value = '';
  //   }
  // }

  onReset(): void {
  if (this.isEditMode) {
    this.task = {
      ...this.originalTask,
    };

    if (this.task.startDate) {
      this.task.startDate = new Date(this.task.startDate);
    }
    if (this.task.endDate) {
      this.task.endDate = new Date(this.task.endDate);
    }

    // Restore the client name in the search box, otherwise it would be
    // empty while clientId is restored
    const originalClient = this.clients.find((c: any) => Number(c.clientId) === Number(this.task.clientId));
    this.clientSearchText = originalClient ? originalClient.name : '';
    this.filteredClients = [];
    this.showClientDropdown = false;
    this.clientTouched = false;                 // ADD
  } else {
    this.task = {
      taskId: null,
      userType: 1,
      title: '',
      clientId: null,
      startDate: null,
      endDate: null,
      taskCategoryId: null,
      description: '',
      assignedTo: null,
      buddyId: null,
      priority: null,
      status: 1,
      addedBy: null,
      fileName1: null,
      fileName2: null,
    };

    this.selectedTaskCategoryName = '';
    this.showCategoryDropdown = false;
    this.categorySearchText = '';
    this.clientSearchText = '';
    this.clientTouched = false;                 // ADD
    this.filteredClients = [];
    this.showClientDropdown = false;
    this.users = [];
    this.workloadList = [];                     // ADD
    this.noEmployeeError = '';
    this.holidayError = '';
    this.endDateError = '';
    this.taskCategoryEmployeeError = false;     // ADD

    // The category list was loaded for the previous type / client
    this.onchangeloadDropdownData();            // ADD
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

  backToIndexPage(): void {
    this.router.navigate(['/task-index']);
  }

  // ============================================================
  // DROPDOWN DATA
  // ============================================================

  onchangeloadDropdownData(): void {
    const typeAtRequest = Number(this.task.userType);
      const clientAtRequest = this.task.clientId;

    this.dataprovider.changesClientIdgetTaskFilterData(this.isAdmin, this.userId, this.loginType, this.task.clientId, this.isHod, this.task.userType).subscribe({
      next: (res: any) => {

        // Ignore responses for an outdated client or task type
      if (
        typeAtRequest !== Number(this.task.userType) ||
        Number(clientAtRequest || 0) !== Number(this.task.clientId || 0)
      ) {
        return;
      }
        if (typeAtRequest !== Number(this.task.userType)) {
          return; // user already switched type; ignore this stale response
        }
        const data = res?.data || res;
        this.taskCategories = (data?.taskCategories || []).sort((a: any, b: any) => {
          const aName = String(a.name || a.categoryName || a).trim();
          const bName = String(b.name || b.categoryName || b).trim();

          if (aName.toLowerCase() === 'admin task') return -1;
          if (bName.toLowerCase() === 'admin task') return 1;
          if (aName.toLowerCase() === 'general task') return 1;
          if (bName.toLowerCase() === 'general task') return -1;

          return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
        });

        this.buildGroupedCategories();

        // Show the already-selected category name, or clear it if it is
        // not available for the chosen client
        // const selected = this.taskCategories.find((x: any) => Number(x.taskcategoryId) === Number(this.task.taskCategoryId));

        // const clientChanged = this.isEditMode && Number(this.task.clientId) !== Number(this.originalTask?.clientId);

        // if (selected) {
        //   this.selectedTaskCategoryName = selected.name;
        // } else if (this.task.taskCategoryId && (!this.isEditMode || clientChanged)) {
        //   this.task.taskCategoryId = null;
        //   this.selectedTaskCategoryName = '';
        // }

        const selected = this.taskCategories.find(
  (x: any) =>
    Number(x.taskcategoryId ?? x.taskCategoryId) ===
    Number(this.task.taskCategoryId)
);

if (selected) {
  this.task.taskCategoryId =
    selected.taskcategoryId ?? selected.taskCategoryId;

  this.selectedTaskCategoryName = selected.name;

  // Refresh the employee dropdown after the category data is loaded.
  if (this.task.taskCategoryId) {
    this.onchangeloadUserDropdownData();
  }
} else {
  this.task.taskCategoryId = null;
  this.selectedTaskCategoryName = '';
  this.task.assignedTo = null;
  this.task.buddyId = null;         // ADD
  this.users = [];
}
        // Categories that belong to the logged-in user's session (categoryIds from login)
        const sessionCategories = this.categoryIds.length ? this.taskCategories.filter((c: any) => this.categoryIds.includes(Number(c.taskcategoryId ?? c.taskCategoryId))) : this.taskCategories;

        console.log('categoryIds:', this.categoryIds, 'matched:', sessionCategories);

        // No auto-select for admin or manager
        const isAdminOrManager = String(this.isAdmin).toUpperCase() === 'Y' || String(this.loginType).toLowerCase() === 'manager';

        // Auto-select when exactly one category matches and none is chosen yet
        if (!isAdminOrManager && sessionCategories.length === 1 && !this.task.taskCategoryId) {
          this.selectTaskCategory(sessionCategories[0]);
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error loading task dropdown data:', error);
        this.taskCategories = [];
        this.groupedCategories = [];
        this.selectedTaskCategoryName = '';
      },
    });
  }

 


onchangeloadUserDropdownData(onLoaded?: () => void): void {
  if (!this.task.taskCategoryId) {
    this.users = [];
    this.task.assignedTo = null;
    return;
  }

  const userType = Number(this.task.userType);

  // Type 2: do not require dates to load the employee list.
  const startDate =
    userType === 2 && !this.task.startDate
      ? null
      : this.task.startDate
        ? this.datePipe.transform(this.task.startDate, 'yyyy-MM-dd')
        : null;

  const endDate =
    userType === 2 && !this.task.endDate
      ? null
      : this.task.endDate
        ? this.datePipe.transform(this.task.endDate, 'yyyy-MM-dd')
        : null;

  const clientId =
    userType === 1 ? 0 : Number(this.task.clientId || 0);

  this.dataprovider.changesCategoryIdgetUserFilterData(
    this.isAdmin,
    this.userId,
    this.loginType,
    clientId,
    this.task.taskCategoryId,
    0,
    startDate,
    endDate,
    userType
  ).subscribe({
    // next: (res: any) => {
    //   // Ignore stale responses if the category/type changed during the request.
    //   if (
    //     Number(this.task.taskCategoryId) !==
    //       Number(res?.requestedTaskCategoryId ?? this.task.taskCategoryId)
    //   ) {
    //     return;
    //   }

    //   const data = res?.data || res;
    //   this.users = this.markWorkload(data?.assignedUsers || []);

    //   // Auto-select only for new tasks.
    //   if (!this.isEditMode && !this.task.assignedTo && this.users.length) {
    //     const recommendedUser = this.users.find(
    //       (user: any) => user.hasWorkload
    //     );

    //     this.task.assignedTo =
    //       recommendedUser?.userId ?? this.users[0].userId;
    //       this.clearBuddyIfSameAsAssignee();      // ADD
    //   }

    //   onLoaded?.();
    // },
   next: (res: any) => {
        const data = res?.data || res;


        this.users = this.markWorkload(data?.assignedUsers || []);


        if (!this.isEditMode && this.users.length > 0) {
          if (Number(this.task.userType) === 2) {
            this.task.assignedTo = this.users[0].userId;
          } else if (!this.task.assignedTo) {
            const recommendedUser = this.users.find((user: any) => user.hasWorkload);


            this.task.assignedTo = recommendedUser?.userId ?? this.users[0].userId;
          }


          this.clearBuddyIfSameAsAssignee();
        }


        onLoaded?.();
      },
    error: (error: any) => {
      console.error('Error loading assigned users:', error);
      this.users = [];
    }
  });
}



  loadDropdownData(): void {
    this.dataprovider.getTaskFilterData(this.isAdmin, this.userId, this.loginType, this.isHod).subscribe({
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

        Swal.fire('Error', 'Unable to load task dropdown data.', 'error');
      },
    });
  }

  // ============================================================
  // CLIENT
  // ============================================================

  noEmployeeError = '';

  // Task Category is independent of Client, so it is NOT cleared here.
  // Only the assignee list depends on the client.
  // onClientChange(clientId: number | null): void {
  //   // this.task.assignedTo = null;
  //   // this.noEmployeeError = '';
  //   // this.users = [];
  // }

onClientChange(clientId: number | null): void {
  this.task.clientId = clientId;

  // Clear category selected for the previous client
  this.task.taskCategoryId = null;
  this.selectedTaskCategoryName = '';
  this.taskCategories = [];
  this.groupedCategories = [];
  this.categorySearchText = '';
  this.showCategoryDropdown = false;

  // Clear dependent employee selections
  this.task.assignedTo = null;
  this.task.buddyId = null;
  this.users = [];
  this.workloadList = [];
  this.noEmployeeError = '';
  this.holidayError = '';
  this.taskCategoryEmployeeError = false;

  // Reset dates belonging to the previous category
  this.task.startDate = null;
  this.task.endDate = null;

  // Reload categories for the current client selection
  this.onchangeloadDropdownData();
}

  clientSearchText = '';
  filteredClients: any[] = [];
  showClientDropdown = false;

  // filterClients(): void {
  //   const search = this.clientSearchText.trim().toLowerCase();

  //   if (search.length < 3) {
  //     this.showClientDropdown = false;
  //     this.filteredClients = [];
  //     return;
  //   }

  //   this.filteredClients = this.clients.filter((client) => client.name.toLowerCase().includes(search));

  //   this.showClientDropdown = true;
  // }

  clientTouched = false;

filterClients(): void {
  this.clientTouched = true;

  // The text was edited by keyboard: if it no longer matches the selected
  // client, treat it as deselected (same as clicking the red cross)
  if (this.task.clientId) {
    const selected = this.clients.find((c: any) => Number(c.clientId) === Number(this.task.clientId));

    if (!selected || selected.name !== this.clientSearchText) {
      this.onClientChange(null); // clears clientId, category, assignee, buddy, dates
    }
  }

  const search = (this.clientSearchText || '').trim().toLowerCase();

  if (search.length < 3) {
    this.showClientDropdown = false;
    this.filteredClients = [];
    return;
  }

  this.filteredClients = this.clients.filter((client) => client.name.toLowerCase().includes(search));
  this.showClientDropdown = true;
}

 
  selectClient(client: any): void {
  if (Number(this.task.clientId) !== Number(client.clientId)) {
    this.onClientChange(client.clientId);
  }

  this.clientSearchText = client.name;
  this.showClientDropdown = false;
}

  // clearClientSelection(): void {
  //   this.task.clientId = null;

  //   this.clientSearchText = '';

  //   this.filteredClients = [];

  //   this.showClientDropdown = false;

  //   this.onClientChange(null);
  // }

//   clearClientSelection(): void {
//   this.clientSearchText = '';
//   this.filteredClients = [];
//   this.showClientDropdown = false;

//   this.onClientChange(null);
// }

clearClientSelection(): void {
  this.clientTouched = true;
  this.clientSearchText = '';
  this.filteredClients = [];
  this.showClientDropdown = false;
  this.onClientChange(null);
}

  onManagerClientChange(clientId: number | null): void {
  this.task.clientId = clientId;

  // Everything below belonged to the previous client
  this.task.assignedTo = null;
  this.task.buddyId = null;
  this.users = [];
  this.workloadList = [];
  this.noEmployeeError = '';
  this.holidayError = '';
  this.taskCategoryEmployeeError = false;

  // Category
  this.task.taskCategoryId = null;
  this.selectedTaskCategoryName = '';
  this.showCategoryDropdown = false;
  this.categorySearchText = '';

  // Start and End Date & Time
  this.task.startDate = null;
  this.task.endDate = null;
  // this.durationMessage = '';

  if (!clientId) {
    return;
  }

  // Reload the category list for the new client
  this.onchangeloadDropdownData();
}


// onManagerClientChange(clientId: number | null): void {
//   this.task.clientId = clientId;

//   this.task.assignedTo = null;
//   this.task.buddyId = null;         // ADD
//   this.users = [];
//   this.workloadList = [];
//   this.noEmployeeError = '';
//   this.holidayError = '';

//   if (!clientId) {
//     return;
//   }

//   this.onchangeloadDropdownData();

//   // Load employees immediately if a category is already selected.
//   if (this.task.taskCategoryId) {
//     this.onchangeloadUserDropdownData();
//   }
// }


  // ============================================================
  // DATES
  // ============================================================

  onEndDateChange(value: any): void {
    this.task.endDate = value;
    this.loadAssigneeWorkload();
    this.validateDates();
    this.onchangeloadUserDropdownData();
  }

  onStartDateChange(value: any): void {
    this.task.startDate = value;
    this.calculateEndDate();
    this.validateDates();
    this.loadAssigneeWorkload();
    this.onchangeloadUserDropdownData();
  }

  private calculateEndDate(): void {
    if (!this.task.taskCategoryId) {
      return;
    }

    const selectedCategory = this.taskCategories.find((x: any) => Number(x.taskcategoryId) === Number(this.task.taskCategoryId));

    if (!selectedCategory) {
      return;
    }

    const dueHours = Number(selectedCategory.dueDateTime || selectedCategory.dueTime || selectedCategory.ts_duetime || selectedCategory.duedatetime || 0);

    // Use the start date picked by the user; default to now only if empty
    let startDate: Date;
    const picked = this.task.startDate;

    if (picked) {
      startDate = moment.isMoment(picked) ? picked.toDate() : new Date(picked);
    } else {
      startDate = new Date();
    }

    if (isNaN(startDate.getTime())) {
      startDate = new Date();
    }
    const endDate = new Date(startDate.getTime());
    endDate.setHours(endDate.getHours() + dueHours);
    this.task.startDate = startDate;
    this.task.endDate = endDate;

    console.log('Selected Category:', selectedCategory);
    console.log('Due Hours:', dueHours);
    console.log('Calculated Start:', this.task.startDate);
    console.log('Calculated End:', this.task.endDate);
  }

  endDateError = '';

  // Earliest date the end picker allows
  get endMinDate(): Date {
    return this.toDate_(this.task.startDate) || this.today;
  }

  private toDate_(value: any): Date | null {
    if (!value) return null;
    const d = moment.isMoment(value) ? value.toDate() : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private validateDates(): void {
    this.endDateError = '';

    const start = this.toDate_(this.task.startDate);
    const end = this.toDate_(this.task.endDate);

    if (start && end && end.getTime() <= start.getTime()) {
      this.endDateError = 'End date & time cannot be earlier than start date & time.';
      this.task.endDate = null; // clear the invalid value
    }
  }

  // ============================================================
  // ASSIGNEE WORKLOAD
  // ============================================================

  private loadAssigneeWorkload(): void {
    this.holidayError = '';
    this.noEmployeeError = '';

    if (!this.task.taskCategoryId || !this.task.startDate || !this.task.endDate) {
      this.workloadList = [];

      this.users = this.users.map((user: any) => ({
        ...user,
        hasWorkload: false,
      }));

      //     alert('FIRST CASE 1 ' + JSON.stringify(this.users));

      // Clear selection for a new task when required fields are missing.
      if (!this.isEditMode) {
        this.task.assignedTo = null;
      }

      return;
    }

    const startDateParam = this.datePipe.transform(this.task.startDate, 'yyyy-MM-dd HH:mm:ss');

    const endDateParam = this.datePipe.transform(this.task.endDate, 'yyyy-MM-dd HH:mm:ss');

    if (!startDateParam || !endDateParam) {
      return;
    }

    this.dataprovider.getAssigneeWorkload(this.task.taskCategoryId, startDateParam, endDateParam).subscribe({
      next: (response) => {
   //     alert("REEEEEEE 0" + JSON.stringify(response))
        console.log('Assignee Workload:', response);

        if (!response.success) {
          this.holidayError = response.message || 'Unable to fetch workload';

          this.workloadList = [];

          this.users = this.users.map((user: any) => ({
            ...user,
            hasWorkload: false,
          }));

          //    alert('FIRST CASE 2 ' + JSON.stringify(this.users));

          if (!this.isEditMode) {
            this.task.assignedTo = null;
          }

          return;
        }

        this.holidayError = '';
        this.workloadList = response.data || [];

        if (this.workloadList.length === 0) {
          this.noEmployeeError = 'No employee available for the selected category.';
        }

        // // Get the recommended employee IDs from the API response.
        // const assignedUserIds = new Set(this.workloadList.map((item: any) => Number(item.assignedTo)));

        // // Update the employee recommendation indicators.
        // this.users = this.users.map((user: any) => ({
        //   ...user,
        //   hasWorkload: assignedUserIds.has(Number(user.userId)),
        // }));

        this.users = this.markWorkload(this.users);

        //     alert(JSON.stringify(this.users));
        // Automatically select the recommended employee for a new task.
        // if (!this.isEditMode) {
        //   const recommendedUser = this.users.find((user: any) => user.hasWorkload);

        //   this.task.assignedTo = recommendedUser ? recommendedUser.userId : null;
        //   this.clearBuddyIfSameAsAssignee();    // ADD
        // }

        if (!this.isEditMode && Number(this.task.userType) === 1) {
          const recommendedUser = this.users.find((user: any) => user.hasWorkload);


          this.task.assignedTo = recommendedUser ? recommendedUser.userId : null;


          this.clearBuddyIfSameAsAssignee();
        }

        console.log('Updated users:', this.users);
        console.log('Selected employee:', this.task.assignedTo);
      },

      error: (error) => {
        console.error('Error fetching assignee workload', error);

        this.holidayError = error?.error?.message || 'Error fetching assignee workload';

        this.workloadList = [];

        this.users = this.users.map((user: any) => ({
          ...user,
          hasWorkload: false,
        }));

        if (!this.isEditMode) {
          this.task.assignedTo = null;
        }
      },
    });
  }

  readonly MAX_TASK_HOURS = 8;
  get durationExceedsLimit(): boolean {
    const start = this.toDate_(this.task.startDate);
    const end = this.toDate_(this.task.endDate);

    if (!start || !end) {
      return false;
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours > this.MAX_TASK_HOURS;
  }

  taskCategoryEmployeeError = false;
  checkingTaskCategoryEmployee = false;

  

onTaskCategoryChange(): void {
  this.calculateEndDate();
  this.loadAssigneeWorkload();

  // Load employees immediately, even when dates are empty.
  this.onchangeloadUserDropdownData();

  const taskCategoryId = this.task.taskCategoryId;
  this.taskCategoryEmployeeError = false;

  if (!taskCategoryId) {
    this.checkingTaskCategoryEmployee = false;
    return;
  }

  this.checkingTaskCategoryEmployee = true;

  this.dataprovider
    .isEmployeeAvailableForTaskCategoryForTask(
      Number(taskCategoryId)
    )
    .subscribe({
      next: (available: boolean) => {
        this.checkingTaskCategoryEmployee = false;
        this.taskCategoryEmployeeError = !available;
      },
      error: (error: any) => {
        console.error(
          'Error checking employee availability:',
          error
        );
        this.checkingTaskCategoryEmployee = false;
        this.taskCategoryEmployeeError = false;
      },
    });
}



  workloadList: { assignedTo: number; hours: number }[] = [];
  holidayError: string = '';

  // ============================================================
  // TASK CATEGORY DROPDOWN
  // ============================================================

  showCategoryDropdown = false;
  selectedTaskCategoryName = '';

  // Departments for which Client is not mandatory (non-manager logins only)
  readonly CLIENT_OPTIONAL_DEPARTMENTS = [2, 3, 4, 5];

  private getSelectedCategory(): any {
    return this.taskCategories.find((x: any) => Number(x.taskcategoryId ?? x.taskCategoryId) === Number(this.task.taskCategoryId));
  }

  
  get isClientOptional(): boolean {
    const category = this.getSelectedCategory();
    if (!category) return false; // no category selected yet: Client stays mandatory
    return this.CLIENT_OPTIONAL_DEPARTMENTS.includes(Number(category.departmentId));
  }

  selectTaskCategory(category: any): void {
    this.task.taskCategoryId = category.taskcategoryId ?? category.taskCategoryId;
    this.selectedTaskCategoryName = category.name;
    this.showCategoryDropdown = false;
    this.categorySearchText = '';          // ADD THIS LINE

    this.onTaskCategoryChange();

    // Assignees normally depend on the client; load them when a client is
    // chosen or when the client is optional for this category
    // if (this.task.clientId || this.isClientOptional) {
    //   this.onchangeloadUserDropdownData();
    // }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // if (!target.closest('.category-dropdown-container')) {
    //   this.showCategoryDropdown = false;
    // }
    if (!target.closest('.category-dropdown-container')) {
    this.showCategoryDropdown = false;
    this.categorySearchText = '';        // ADD THIS LINE
  }
  }

  groupedCategories: { department: string; items: any[] }[] = [];

  // private buildGroupedCategories(): void {
  //   const map = new Map<string, any[]>();

  //   for (const c of this.taskCategories || []) {
  //     const key = c.departmentName || 'Other';
  //     if (!map.has(key)) {
  //       map.set(key, []);
  //     }
  //     map.get(key)!.push(c);
  //   }

  //   this.groupedCategories = Array.from(map, ([department, items]) => ({ department, items }));
  // }
  private buildGroupedCategories(): void {
    const map = new Map<string, any[]>();

    for (const c of this.taskCategories || []) {
      const key = c.departmentName || 'Other';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(c);
    }

    const asc = (x: string, y: string) => x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' });

    this.groupedCategories = Array.from(map, ([department, items]) => ({
      department,
      items: [...items].sort((a, b) => asc(String(a.name || ''), String(b.name || ''))), // category A-Z
    })).sort((a, b) => asc(a.department, b.department)); // department A-Z
  }

  onUserTypeChange(type: number): void {
    this.task.userType = type;

    // Client, assignee and category belonged to the previous type
    this.resetClient();

    // Everything below belonged to the previous type
    this.task.assignedTo = null;
    this.task.buddyId = null;       // ADD
    this.users = [];
    this.workloadList = [];
    this.noEmployeeError = '';
    this.holidayError = '';
    this.taskCategoryEmployeeError = false;

    // Clear Start and End Date & Time
  this.task.startDate = null;
  this.task.endDate = null;
  // this.durationMessage = '';   // if you have one (the "exceeds 8 hours" message)

    this.task.taskCategoryId = null;
    this.selectedTaskCategoryName = '';
    this.showCategoryDropdown = false;
    this.categorySearchText = '';           // ADD THIS LINE

    // Reload categories for the new type
    this.onchangeloadDropdownData();
  }

  // Clears Client (works for both the manager dropdown and the search input)
  // and the assignee list, which depends on it
  private resetClient(): void {
    this.task.clientId = null;
    this.clientSearchText = '';
    this.filteredClients = [];
    this.showClientDropdown = false;

    this.task.assignedTo = null;
    this.task.buddyId = null;       // ADD
    this.users = [];
    this.workloadList = [];
    this.noEmployeeError = '';
  }

  // Called only when the user clicks a category in the dropdown
  // onCategoryPicked(category: any): void {
  //   const newId = Number(category.taskcategoryId ?? category.taskCategoryId);

  //   // Clear Client only if the category actually changed
  //   if (Number(this.task.taskCategoryId) !== newId) {
  //     this.resetClient();
  //   }

  //   this.selectTaskCategory(category);
  // }
  // Called only when the user clicks a category in the dropdown
onCategoryPicked(category: any): void {
  const newId = Number(category.taskcategoryId ?? category.taskCategoryId);

  // Client stays as selected. Only the assignee belonged to the previous category.
  if (Number(this.task.taskCategoryId) !== newId) {
    this.task.assignedTo = null;
    this.task.buddyId = null;       // ADD
    this.users = [];
    this.workloadList = [];
    this.noEmployeeError = '';
    this.holidayError = '';
  }

  this.selectTaskCategory(category);
}

  // private markWorkload(users: any[]): any[] {
  //   const assignedUserIds = new Set((this.workloadList || []).map((x: any) => Number(x.assignedTo)));
  //   const isManager = Number(this.task.userType) === 2;

  //   return users
  //     .filter((user: any) => !isManager || !assignedUserIds.has(Number(user.userId)))
  //     .map((user: any) => ({
  //       ...user,
  //       hasWorkload: isManager ? this.workloadList.length > 0 && !assignedUserIds.has(Number(user.userId)) : assignedUserIds.has(Number(user.userId)),
  //     }));
  // }

  private markWorkload(users: any[]): any[] {
    const assignedUserIds = new Set((this.workloadList || []).map((x: any) => Number(x.assignedTo)));


    const isManager = Number(this.task.userType) === 2;


    return (users || []).map((user: any) => ({
      ...user,
      hasWorkload: isManager ? !assignedUserIds.has(Number(user.userId)) : assignedUserIds.has(Number(user.userId)),
    }));
  }

  categorySearchText = '';

get filteredGroupedCategories(): { department: string; items: any[] }[] {
  const q = this.categorySearchText.trim().toLowerCase();
  if (!q) return this.groupedCategories;

  return this.groupedCategories
    .map((g) => {
      // department name matches: keep all its categories
      if (g.department.toLowerCase().includes(q)) return g;
      return {
        department: g.department,
        items: g.items.filter((c: any) => String(c.name || '').toLowerCase().includes(q)),
      };
    })
    .filter((g) => g.items.length > 0);
}


toggleCategoryDropdown(): void {
  if (
    (this.loginType === 'manager' && !this.task.clientId) ||
    (Number(this.task.userType) === 2 && !this.task.clientId)
  ) {
    this.showCategoryDropdown = false;
    return;
  }

  this.showCategoryDropdown = !this.showCategoryDropdown;
  this.categorySearchText = '';

  if (this.showCategoryDropdown) {
    setTimeout(() => {
      document.getElementById('addTaskCategorySearchInput')?.focus();
    }, 0);
  }
}

get isEmployeeType(): boolean {
  return Number(this.task.userType) === 1;
}


// Same list as Assigned To, minus the selected assignee, and without the recommended marker
get buddyUsers(): any[] {
  return (this.users || []).filter(
    (u: any) =>
      Number(u.userId) !== Number(this.task.assignedTo) &&
      String(u.isHod ?? 'N').toUpperCase() !== 'Y'
  );
}

onAssignedToChange(userId: any): void {
  this.task.assignedTo = userId;
  this.clearBuddyIfSameAsAssignee();
}

private clearBuddyIfSameAsAssignee(): void {
  if (this.task.buddyId && Number(this.task.buddyId) === Number(this.task.assignedTo)) {
    this.task.buddyId = null;
  }
}


}
