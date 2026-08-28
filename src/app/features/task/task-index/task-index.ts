import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
  Component,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { environment } from '../../../../environments/environment';

import { Common } from '../../../classes/common';

import {
  DataProviderService
} from '../../../service/data-provider.service';

import Swal from 'sweetalert2';

import {
  SessionStorageService
} from '../../../service/session-storage.service';

import {
  SESSION_KEYS
} from '../../../service/session-storage.keys';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


interface Task {

  taskId: number;

  clientName: string;

  date: string;

  taskCategoryName: string;

  assignedToName: string;

  priority: number;

  status: number;

  title: string;

  taskStatus: number;

  addedBy: String;
}


interface Client {

  clientId: number;

  name: string;
}


interface TaskCategory {

  taskcategoryId: number;

  name: string;
}


interface AssignedUser {

  userId: number;

  firstName: string;
}


@Component({

  selector: 'app-task-index',

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDividerModule
  ],

  templateUrl: './task-index.html',

  styleUrl: './task-index.scss',
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
export class TaskIndex {


  // =========================================================
  // DATA
  // =========================================================

  tasks: Task[] = [];

  apiResponseTaskDetails: any = {};


  // =========================================================
  // FILTER MASTER DATA
  // =========================================================

  clients: Client[] = [];

  taskCategories: TaskCategory[] = [];

  assignedUsers: AssignedUser[] = [];


  // =========================================================
  // SEARCH
  // =========================================================

  searchQuery: string = '';

  search: string = '';


  // =========================================================
  // FILTERS
  // =========================================================

  selectedClient: string = '';

  selectedTaskCategory: string = '';

  selectedAssignedTo: string = '';

  selectedPriority: string = '';

  selectedStatus: string = '';

  statusIndex: number = 0;


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage: number = 1;

  page: number = 0;

  recordsPerPage: number =
    environment.recordsPerPage;

  size: number =
    environment.size;


  // =========================================================
  // OTHER
  // =========================================================

  selectedmodules: any[] = [];

  createdBy: any;

  common = new Common();

  task: any = {};

  userId: any;

  isAdmin: any;


  // =========================================================
  // PERMISSIONS
  // =========================================================

  addPer: string = 'N';

  editPer: string = 'N';

  deletePer: string = 'N';

  viewPer: string = 'N';

  approvePer: string = 'N';

  adminApprovePer: string = 'N';

  moduleName: string = '';

  showHeaderBar: boolean = true;


  // =========================================================
  // SESSION FILTER
  // =========================================================

  filterKey =
    SESSION_KEYS.TASK_MASTER_FILTER;


  // =========================================================
  // PANEL
  // =========================================================

  isPanelVisible = true;


  // =========================================================
  // SORT
  // =========================================================

  sortColumn: string = '';

  sortDirection: 'asc' | 'desc' = 'asc';


  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [

      {
        key: 'title',
        label: 'Title',
        sortable: true
      },

      {
        key: 'clientName',
        label: 'Client',
        sortable: true
      },

      {
        key: 'date',
        label: 'Date',
        sortable: true
      },

      {
        key: 'taskCategoryName',
        label: 'Task Category',
        sortable: true
      },

      {
        key: 'assignedToName',
        label: 'Assigned To',
        sortable: true
      },

      {
        key: 'priority',
        label: 'Priority',
        sortable: true
      },
      {
        key: 'taskStatus',
        label: 'Task Status',
        sortable: true
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true
      }

    ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private dataprovider: DataProviderService,

    @Inject(PLATFORM_ID)
    private platformId: Object,

    private router: Router,

    private route: ActivatedRoute,

    private sessionService: SessionStorageService,

  ) { }


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * Clear only unrelated filter sessions.
     *
     * Do NOT clear TASK_MASTER_FILTER here,
     * otherwise your pagination/filter state is lost.
     */
    this.sessionService.clearOtherSessions(
      this.filterKey
    );


    // -------------------------------------------------------
    // USER ID
    // -------------------------------------------------------

    if (
      isPlatformBrowser(this.platformId)
    ) {

      this.userId =
        sessionStorage.getItem(
          'userId'
        );

         this.isAdmin =
        sessionStorage.getItem(
          'isAdmin'
        );

    }


    // -------------------------------------------------------
    // PERMISSIONS
    // -------------------------------------------------------

    if (
      isPlatformBrowser(this.platformId)
    ) {

      const storedModules =
        sessionStorage.getItem(
          'selectedModuleDetail'
        );


      if (storedModules) {

        try {

          const parsed =
            JSON.parse(storedModules);

          this.moduleName =
            parsed.name ?? '';

          this.addPer =
            parsed.addPer ?? 'N';

          this.editPer =
            parsed.editPer ?? 'N';

          this.deletePer =
            parsed.deletePer ?? 'N';

          this.viewPer =
            parsed.viewPer ?? 'N';

          this.approvePer =
            parsed.approvePer ?? 'N';

          this.adminApprovePer =
            parsed.adminApprovePer ?? 'N';

        } catch (error) {

          console.error(
            'Invalid selectedModuleDetail:',
            error
          );

        }

      }

    }


    // -------------------------------------------------------
    // RESTORE FILTER STATE
    // -------------------------------------------------------

    this.restoreFilterState();


    // -------------------------------------------------------
    // LOAD FILTER MASTER DATA
    // -------------------------------------------------------

    this.loadFilterData();


    // -------------------------------------------------------
    // LOAD TASKS
    // -------------------------------------------------------

    this.getTaskDetails();

  }


  // =========================================================
  // RESTORE FILTER STATE
  // =========================================================

  private restoreFilterState(): void {

    let stateData: any = null;


    // -------------------------------------------------------
    // FIRST: ROUTER NAVIGATION STATE
    // -------------------------------------------------------

    const nav =
      this.router.getCurrentNavigation();

    stateData =
      nav?.extras?.state;


    // -------------------------------------------------------
    // SECOND: SESSION STORAGE
    // -------------------------------------------------------

    if (!stateData) {

      const saved =
        sessionStorage.getItem(
          this.filterKey
        );

      if (saved) {

        try {

          stateData =
            JSON.parse(saved);

        } catch (error) {

          console.error(
            'Invalid task filter session:',
            error
          );

        }

      }

    }


    // -------------------------------------------------------
    // NOTHING SAVED
    // -------------------------------------------------------

    if (!stateData) {

      this.currentPage = 1;

      this.page = 0;

      this.size =
        environment.size;

      this.recordsPerPage =
        this.size;

      this.search = '';

      this.searchQuery = '';

      this.statusIndex = 0;

      this.selectedStatus = '';

      this.selectedClient = '';

      this.selectedTaskCategory = '';

      this.selectedAssignedTo = '';

      this.selectedPriority = '';

      this.fromDate = null;

      this.toDate = null;

      return;
    }


    // -------------------------------------------------------
    // PAGE
    // -------------------------------------------------------

    this.currentPage =
      Number(stateData.currentPage) || 1;

    this.page =
      this.currentPage - 1;


    // -------------------------------------------------------
    // SIZE
    // -------------------------------------------------------

    this.size =
      Number(stateData.size) ||
      environment.size;

    this.recordsPerPage =
      this.size;


    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    this.search =
      stateData.searchText || '';

    this.searchQuery =
      this.search;


    // -------------------------------------------------------
    // STATUS
    // -------------------------------------------------------

    this.statusIndex =
      Number(stateData.statusIndex) || 0;

    this.selectedStatus =
      this.statusIndex
        ? String(this.statusIndex)
        : '';


    // -------------------------------------------------------
    // CLIENT
    // -------------------------------------------------------

    this.selectedClient =
      stateData.clientId != null
        ? String(stateData.clientId)
        : '';


    // -------------------------------------------------------
    // TASK CATEGORY
    // -------------------------------------------------------

    this.selectedTaskCategory =
      stateData.taskCategoryId != null
        ? String(stateData.taskCategoryId)
        : '';


    // -------------------------------------------------------
    // ASSIGNED TO
    // -------------------------------------------------------

    this.selectedAssignedTo =
      stateData.assignedTo != null
        ? String(stateData.assignedTo)
        : '';


    // -------------------------------------------------------
    // PRIORITY
    // -------------------------------------------------------

    this.selectedPriority =
      stateData.priority != null
        ? String(stateData.priority)
        : '';


    // -------------------------------------------------------
    // FROM DATE
    // -------------------------------------------------------

    this.fromDate =
      stateData.fromDate
        ? new Date(
          stateData.fromDate + 'T00:00:00'
        )
        : null;


    // -------------------------------------------------------
    // TO DATE
    // -------------------------------------------------------

    this.toDate =
      stateData.toDate
        ? new Date(
          stateData.toDate + 'T00:00:00'
        )
        : null;


    console.log(
      'Restored From Date:',
      this.fromDate
    );

    console.log(
      'Restored To Date:',
      this.toDate
    );

  }


  // =========================================================
  // SAVE FILTER STATE
  // =========================================================

  private saveFilterState(): void {

    const filterState = {

      currentPage:
        this.currentPage,

      page:
        this.page,

      size:
        this.size,

      statusIndex:
        this.statusIndex,

      searchText:
        this.search,

      clientId:
        this.selectedClient
          ? Number(this.selectedClient)
          : null,

      taskCategoryId:
        this.selectedTaskCategory
          ? Number(this.selectedTaskCategory)
          : null,

      assignedTo:
        this.selectedAssignedTo
          ? Number(this.selectedAssignedTo)
          : null,

      priority:
        this.selectedPriority
          ? Number(this.selectedPriority)
          : null,

      fromDate:
        this.formatDateForApi(this.fromDate),

      toDate:
        this.formatDateForApi(this.toDate)

    };


    if (
      isPlatformBrowser(this.platformId)
    ) {

      sessionStorage.setItem(
        this.filterKey,
        JSON.stringify(filterState)
      );

    }

  }

  // =========================================================
  // LOAD FILTER DATA
  // =========================================================

  private loadFilterData(): void {

    this.dataprovider
      .getTaskFilterData()
      .subscribe({

        next: (response: any) => {

          console.log(
            'TASK FILTER DATA:',
            response
          );


          this.clients =
            response.clients || [];


          this.taskCategories =
            response.taskCategories || [];


          this.assignedUsers =
            response.assignedUsers || [];

        },


        error: (error) => {

          console.error(
            'Error loading task filter data:',
            error
          );

          this.clients = [];

          this.taskCategories = [];

          this.assignedUsers = [];

        }

      });

  }


  // =========================================================
  // TOGGLE PANEL
  // =========================================================

  togglePanel(): void {

    this.isPanelVisible =
      !this.isPanelVisible;

  }


  // =========================================================
  // GET TASK DETAILS
  // =========================================================

  getTaskDetails(): void {

    const clientId =
      this.selectedClient
        ? Number(this.selectedClient)
        : 0;

    const taskCategoryId =
      this.selectedTaskCategory
        ? Number(this.selectedTaskCategory)
        : 0;

    const assignedTo =
      this.selectedAssignedTo
        ? Number(this.selectedAssignedTo)
        : 0;

    const priority =
      this.selectedPriority
        ? Number(this.selectedPriority)
        : 0;

    const fromDate =
      this.formatDateForApi(this.fromDate);

    const toDate =
      this.formatDateForApi(this.toDate);


    this.dataprovider
      .getTaskDetails(

        this.page,

        this.size,

        this.statusIndex,

        this.search,

        clientId,

        taskCategoryId,

        assignedTo,

        priority,

        fromDate,

      toDate,
      this.isAdmin,
      this.userId

      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'TASK DETAILS RESPONSE:',
            response
          );

          this.apiResponseTaskDetails =
            response;

          this.tasks =
            response.data || [];

        },

        error: (error) => {

          console.error(
            'Error fetching task details:',
            error
          );

          this.apiResponseTaskDetails = {
            totalElements: 0
          };

          this.tasks = [];

        }

      });

  }


  // =========================================================
  // PAGINATED TASKS
  // =========================================================

  get paginatedTasks(): Task[] {

    return this.tasks;

  }


  // =========================================================
  // GO TO PAGE
  // =========================================================

  goToPage(
    pageNumber: number
  ): void {

    if (
      pageNumber < 1 ||
      pageNumber > this.totalPages
    ) {

      return;

    }


    this.currentPage =
      pageNumber;


    this.page =
      pageNumber - 1;


    this.saveFilterState();


    this.router
      .navigate(

        ['/task-index'],

        {

          queryParams: {

            currentPage:
              this.currentPage,

            page:
              this.page,

            size:
              this.size,

            statusIndex:
              this.statusIndex,

            searchText:
              this.search,

            clientId:
              this.selectedClient || null,

            taskCategoryId:
              this.selectedTaskCategory || null,

            assignedTo:
              this.selectedAssignedTo || null,

            priority:
              this.selectedPriority || null,

            fromDate:
              this.formatDateForApi(this.fromDate) || null,

            toDate:
              this.formatDateForApi(this.toDate) || null

          },

          replaceUrl: true

        }

      )
      .then(() => {

        this.getTaskDetails();

      });

  }


  // =========================================================
  // FIRST PAGE
  // =========================================================

  goToFirstPage(): void {

    this.goToPage(1);

  }


  // =========================================================
  // LAST PAGE
  // =========================================================

  goToLastPage(): void {

    this.goToPage(
      this.totalPages
    );

  }


  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  // onSearch(): void {

  //   this.search =
  //     this.searchQuery
  //       ? this.searchQuery.trim()
  //       : '';


  //   this.statusIndex =
  //     this.selectedStatus === ''
  //       ? 0
  //       : Number(this.selectedStatus);


  //   this.currentPage = 1;

  //   this.page = 0;


  //   this.saveFilterState();


  //   this.router
  //     .navigate(

  //       ['/task-index'],

  //       {

  //         queryParams: {

  //           currentPage: 1,

  //           page: 0,

  //           size: this.size,

  //           statusIndex:
  //             this.statusIndex,

  //           searchText:
  //             this.search,

  //           clientId:
  //             this.selectedClient || null,

  //           taskCategoryId:
  //             this.selectedTaskCategory || null,

  //           assignedTo:
  //             this.selectedAssignedTo || null,

  //           priority:
  //             this.selectedPriority || null

  //         },

  //         replaceUrl: true

  //       }

  //     )
  //     .then(() => {

  //       this.getTaskDetails();

  //     });

  // }

  onSearch(): void {

    this.search =
      this.searchQuery
        ? this.searchQuery.trim()
        : '';

    this.statusIndex =
      this.selectedStatus === ''
        ? 0
        : Number(this.selectedStatus);


    this.currentPage = 1;
    this.page = 0;


    const fromDate =
      this.formatDateForApi(this.fromDate);

    const toDate =
      this.formatDateForApi(this.toDate);


    this.saveFilterState();


    this.router
      .navigate(
        ['/task-index'],
        {
          queryParams: {

            currentPage: 1,

            page: 0,

            size: this.size,

            statusIndex:
              this.statusIndex,

            searchText:
              this.search,

            clientId:
              this.selectedClient || null,

            taskCategoryId:
              this.selectedTaskCategory || null,

            assignedTo:
              this.selectedAssignedTo || null,

            priority:
              this.selectedPriority || null,

            fromDate:
              fromDate || null,

            toDate:
              toDate || null

          },

          replaceUrl: true

        }
      )
      .then(() => {

        this.getTaskDetails();

      });

  }

  private formatDateForApi(
    date: Date | null
  ): string {

    if (!date) {
      return '';
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  // =========================================================
  // CHANGE RECORDS PER PAGE
  // =========================================================

  onChangeRecordsPerPage(): void {

    this.currentPage = 1;

    this.page = 0;


    this.saveFilterState();


    this.getTaskDetails();

  }


  // =========================================================
  // DELETE TASK
  // =========================================================

  // onDeleteTask(
  //   taskId: number
  // ): void {

  //   // this.task = {

  //   //   taskId:

  //   //     Number(taskId),

  //   //   userId:

  //   //     this.userId
  //   //       ? Number(this.userId)
  //   //       : null

  //   // };


  //   // Swal.fire({

  //   //   title:
  //   //     'Are you sure?',

  //   //   text:
  //   //     'Do you really want to delete this task?',

  //   //   icon:
  //   //     'warning',

  //   //   showCancelButton:
  //   //     true,

  //   //   confirmButtonText:
  //   //     'Yes, delete it!',

  //   //   cancelButtonText:
  //   //     'No, keep it',

  //   // }).then(
  //   //   (result) => {

  //   //     if (
  //   //       result.isConfirmed
  //   //     ) {

  //   //       this.dataprovider
  //   //         .deleteTask(this.task)
  //   //         .subscribe({

  //   //           next:
  //   //             (response: any) => {

  //   //               if (
  //   //                 response.success
  //   //               ) {

  //   //                 Swal.fire(

  //   //                   'Deleted!',

  //   //                   response.message,

  //   //                   'success'

  //   //                 );


  //   //                 this.getTaskDetails();

  //   //               } else {

  //   //                 Swal.fire(

  //   //                   'Error',

  //   //                   response.message,

  //   //                   'error'

  //   //                 );

  //   //               }

  //   //             },


  //   //           error:
  //   //             (error) => {

  //   //               console.error(
  //   //                 'Error deleting task:',
  //   //                 error
  //   //               );


  //   //               Swal.fire(

  //   //                 'Error',

  //   //                 'Something went wrong while deleting the task.',

  //   //                 'error'

  //   //               );

  //   //             }

  //   //         });

  //   //     }

  //   //   }

  //   // );

  // }


  // =========================================================
  // VIEW TASK
  // =========================================================

  viewTask(taskId: number): void {

    this.saveFilterState();

    this.router.navigate(
      [
        '/view-task',
        taskId
      ],
      {
        state: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.search,

          size:
            this.size,

          clientId:
            this.selectedClient,

          taskCategoryId:
            this.selectedTaskCategory,

          assignedTo:
            this.selectedAssignedTo,

          priority:
            this.selectedPriority,

          fromDate:
            this.formatDateForApi(this.fromDate),

          toDate:
            this.formatDateForApi(this.toDate)

        }
      }
    );

  }


  // =========================================================
  // EDIT TASK
  // =========================================================

  editTask(
    taskId: number
  ): void {

    this.saveFilterState();


    this.router.navigate(

      [
        '/edit-task',
        taskId
      ],

      {

        state: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.search,

          size:
            this.size,

          clientId:
            this.selectedClient,

          taskCategoryId:
            this.selectedTaskCategory,

          assignedTo:
            this.selectedAssignedTo,

          priority:
            this.selectedPriority,
          fromDate:
            this.formatDateForApi(this.fromDate),

          toDate:
            this.formatDateForApi(this.toDate)

        }

      }

    );

  }


  // =========================================================
  // ADD TASK
  // =========================================================

  addTask(): void {

    this.saveFilterState();


    this.router.navigate(

      ['/add-task'],

      {

        state: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.search,

          size:
            this.size,

          clientId:
            this.selectedClient,

          taskCategoryId:
            this.selectedTaskCategory,

          assignedTo:
            this.selectedAssignedTo,

          priority:
            this.selectedPriority,
          fromDate:
            this.formatDateForApi(this.fromDate),

          toDate:
            this.formatDateForApi(this.toDate)

        }

      }

    );

  }


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  pages(): number[] {

    const total =
      this.totalPages;


    const current =
      this.currentPage;


    const delta = 5;


    const start =
      Math.max(
        1,
        current - delta
      );


    const end =
      Math.min(
        total,
        current + delta
      );


    const arr: number[] = [];


    for (
      let i = start;
      i <= end;
      i++
    ) {

      arr.push(i);

    }


    return arr;

  }


  // =========================================================
  // RECORD SUMMARY
  // =========================================================

  get recordSummary(): string {

    const totalRecords =
      this.apiResponseTaskDetails
        ?.totalElements || 0;


    const startRecord =
      totalRecords === 0

        ? 0

        : (

          (this.currentPage - 1) *
          this.recordsPerPage

        ) + 1;


    const endRecord =
      Math.min(

        this.currentPage *
        this.recordsPerPage,

        totalRecords

      );


    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;

  }


  // =========================================================
  // TOTAL PAGES
  // =========================================================

  get totalPages(): number {

    const total =
      this.apiResponseTaskDetails
        ?.totalElements || 0;


    return Math.max(

      1,

      Math.ceil(

        total /
        this.recordsPerPage

      )

    );

  }


  // =========================================================
  // SORT
  // =========================================================

  sortData(
    column: string
  ): void {

    if (!column) {

      return;

    }


    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';

    }


    this.tasks.sort(
      (a: any, b: any) => {

        let valA =
          a[column];

        let valB =
          b[column];


        valA =
          valA ?? '';

        valB =
          valB ?? '';


        if (
          !isNaN(valA) &&
          !isNaN(valB)
        ) {

          valA =
            Number(valA);

          valB =
            Number(valB);

        } else {

          valA =
            valA
              .toString()
              .toLowerCase();

          valB =
            valB
              .toString()
              .toLowerCase();

        }


        if (
          valA < valB
        ) {

          return this.sortDirection ===
            'asc'
            ? -1
            : 1;

        }


        if (
          valA > valB
        ) {

          return this.sortDirection ===
            'asc'
            ? 1
            : -1;

        }


        return 0;

      }

    );

  }


  // =========================================================
  // PRIORITY LABEL
  // =========================================================

  getPriorityLabel(
    priority: number
  ): string {

    switch (priority) {

      case 1:
        return 'High';

      case 2:
        return 'Medium';

      case 3:
        return 'Low';

      default:
        return '-';

    }

  }


  // =========================================================
  // PRIORITY CSS
  // =========================================================

  getPriorityClass(
    priority: number
  ): string {

    switch (priority) {

      case 1:
        return 'priority-high';

      case 2:
        return 'priority-medium';

      case 3:
        return 'priority-low';

      default:
        return '';

    }

  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    // Clear search
    this.searchQuery = '';
    this.search = '';

    // Clear dropdown filters
    this.selectedClient = '';
    this.selectedTaskCategory = '';
    this.selectedAssignedTo = '';
    this.selectedPriority = '';
    this.selectedStatus = '';

    // Clear dates
    this.fromDate = null;
    this.toDate = null;

    // Reset status
    this.statusIndex = 0;

    // Reset pagination
    this.currentPage = 1;
    this.page = 0;

    // Reset sorting
    this.sortColumn = '';
    this.sortDirection = 'asc';

    // Save cleared filter state
    this.saveFilterState();


    this.router.navigate(
      ['/task-index'],
      {
        queryParams: {

          currentPage: 1,

          page: 0,

          size: this.size,

          statusIndex: 0,

          searchText: '',

          clientId: null,

          taskCategoryId: null,

          assignedTo: null,

          priority: null,

          fromDate: null,

          toDate: null

        },

        replaceUrl: true

      }
    ).then(() => {

      this.getTaskDetails();

    });

  }

  onDeleteTask(taskId: number): void {

    this.task = {
      taskId: Number(taskId),
      createdBy: this.userId
        ? Number(this.userId)
        : null
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {

      if (result.isConfirmed) {

        this.dataprovider
          .deleteTask(this.task)
          .subscribe({

            next: (response: any) => {

              if (response.success) {

                Swal.fire(
                  'Deleted!',
                  response.message,
                  'success'
                );

                this.getTaskDetails();

              } else {

                Swal.fire(
                  'Error',
                  response.message,
                  'error'
                );

              }

            },

            error: (error) => {

              console.error(
                'Error deleting task:',
                error
              );

              Swal.fire(
                'Error',
                'Something went wrong while deleting the task.',
                'error'
              );

            }

          });

      }

    });
  }


  fromDate: Date | null = null;

toDate: Date | null = null;

isTaskOwner(task: any): boolean {
  return Number(task.addedBy) === Number(this.userId);
}

//for model note
showTaskNotesModal = false;

isAddingNote = false;

selectedTask: any = null;

taskNote = '';

taskNotes: any[] = [];

isSavingTaskNote = false;


openTaskNotes(task: any): void {

  this.selectedTask = task;

  // Initially DON'T show add form
  this.isAddingNote = false;

  this.taskNote = '';

  this.showTaskNotesModal = true;

  // Load previous notes
  this.loadTaskNotes(task.taskId);
}

loadTaskNotes(taskId: number): void {

  this.dataprovider.getTaskNotes(taskId).subscribe({
    next: (response: any[]) => {

      console.log('Task notes:', response);

      this.taskNotes = response || [];
    },

    error: (error) => {

      console.error('Error loading task notes:', error);

      this.taskNotes = [];
    }
  });

}


startAddingNote(): void {

  this.isAddingNote = true;

  this.taskNote = '';
}

cancelAddingNote(): void {

  this.isAddingNote = false;

  this.taskNote = '';
}

closeTaskNotesModal(): void {

  if (this.isSavingTaskNote) {
    return;
  }

  this.showTaskNotesModal = false;

  this.selectedTask = null;

  this.taskNote = '';
}


saveTaskNote(): void {

  if (!this.taskNote?.trim()) {
    return;
  }

  if (!this.selectedTask?.taskId) {
    return;
  }

  this.isSavingTaskNote = true;

  const request = {
    taskId: this.selectedTask.taskId,
    note: this.taskNote.trim(),
    userId: this.userId
  };

  this.dataprovider.addTaskNote(request).subscribe({

    next: () => {

      this.taskNote = '';

      // Hide Add Note form after successful submit
      this.isAddingNote = false;

      this.isSavingTaskNote = false;

      // Reload previous notes
      this.loadTaskNotes(this.selectedTask.taskId);
    },

    error: (error) => {

      console.error('Error saving task note', error);

      this.isSavingTaskNote = false;
    }

  });
}

getCreatorInitial(name: string): string {
  if (!name || !name.trim()) {
    return '?';
  }

  return name.trim().charAt(0).toUpperCase();
}

getCreatorColor(name: string): string {

  if (!name || !name.trim()) {
    return '#64748b';
  }

  const colors = [
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#dc2626', // Red
    '#ea580c', // Orange
    '#16a34a', // Green
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#ca8a04', // Yellow
    '#0f766e'  // Teal
  ];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;

  return colors[index];
}




  // =========================================================
  // CHANGE MANAGER / TASK FILES MODAL
  // =========================================================

  showChangeManagerModal = false;
  isChangingManager = false;

  taskDescription: string = '';
  descriptionValidationError = false;

  fileOne: File | null = null;
  fileOneName: string = '';

  fileTwo: File | null = null;
  fileTwoName: string = '';


  openChangeManagerModal(taskId: any): void {
    console.log("sssssssss" + taskId);
    this.descriptionValidationError = false;


    this.task = {
      taskId: taskId
    };


    console.log("{ == }" + JSON.stringify(this.task));

    this.taskDescription = '';

    this.fileOne = null;
    this.fileOneName = '';

    this.fileTwo = null;
    this.fileTwoName = '';

    this.showChangeManagerModal = true;

  }


  closeChangeManagerModal(): void {

    if (this.isChangingManager) {
      return;
    }

    this.showChangeManagerModal = false;

    this.taskDescription = '';

    this.fileOne = null;
    this.fileOneName = '';

    this.fileTwo = null;
    this.fileTwoName = '';

    this.descriptionValidationError = false;

  }

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  onFileOneSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const file = input.files[0];

      // ZIP validation
      if (!file.name.toLowerCase().endsWith('.zip')) {
        Swal.fire('Error', 'Only ZIP files are allowed.', 'error');

        input.value = '';
        this.fileOne = null;
        this.fileOneName = '';
        return;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        Swal.fire('Error', 'ZIP file size must not exceed 5 MB.', 'error');

        input.value = '';
        this.fileOne = null;
        this.fileOneName = '';
        return;
      }

      this.fileOne = file;
      this.fileOneName = file.name;

    } else {
      this.fileOne = null;
      this.fileOneName = '';
    }
  }

  onFileTwoSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const file = input.files[0];

      // PDF validation
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        Swal.fire('Error', 'Only PDF files are allowed.', 'error');

        input.value = '';
        this.fileTwo = null;
        this.fileTwoName = '';
        return;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        Swal.fire('Error', 'PDF file size must not exceed 5 MB.', 'error');

        input.value = '';
        this.fileTwo = null;
        this.fileTwoName = '';
        return;
      }

      this.fileTwo = file;
      this.fileTwoName = file.name;

    } else {
      this.fileTwo = null;
      this.fileTwoName = '';
    }
  }

  changeManager(): void {

    if (!this.taskDescription || !this.taskDescription.trim()) {
      this.descriptionValidationError = true;
      return;
    }

    this.descriptionValidationError = false;
    this.isChangingManager = true;

    const formData = new FormData();
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }


    formData.append('taskId', String(this.task.taskId));
    formData.append('description', this.taskDescription.trim());

    if (this.fileTwo) {
      formData.append('fileName1', this.fileTwo, this.fileTwo.name);   // normal file → fileName1 (pdf)
    }

    if (this.fileOne) {
      formData.append('fileName2', this.fileOne, this.fileOne.name);   // zip file → fileName2
    }

    this.dataprovider.updateTaskDetails(formData).subscribe({

      next: (response: any) => {

        this.isChangingManager = false;

        if (response.success) {
          Swal.fire('Updated!', response.message, 'success');
          this.showChangeManagerModal = false;
          this.getTaskDetails();
        } else {
          Swal.fire('Error', response.message, 'error');
        }

      },

      error: (error) => {
        this.isChangingManager = false;
        console.error('Full error:', error);          // add this
        console.error('Backend message:', error?.error?.message);  // and this
        Swal.fire('Error', error?.error?.message || 'Something went wrong while updating the task.', 'error');
      }

    });

  }

}
