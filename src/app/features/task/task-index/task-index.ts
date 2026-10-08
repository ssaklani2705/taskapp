import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { SessionStorageService } from '../../../service/session-storage.service';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, MatOption, MatOptionModule } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatDividerModule } from '@angular/material/divider';
import * as XLSX from 'xlsx';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OwlMomentDateTimeModule } from '@danielmoncada/angular-datetime-picker-moment-adapter';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@danielmoncada/angular-datetime-picker';
import { forkJoin } from 'rxjs';
export const MY_DATE_TIME_FORMATS = {
  parseInput: 'DD-MM-YYYY HH:mm',
  fullPickerInput: 'DD-MM-YYYY HH:mm',
  datePickerInput: 'DD-MM-YYYY',
  timePickerInput: 'HH:mm',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

interface Task {
  taskId: number;
  clientName: string;
  date: string;
  endDate: string;
  dueDateTime: string;
  taskCategoryName: string;
  assignedToName: string;
  priority: number;
  status: number;
  title: string;
  taskStatus: number;
  addedBy: String;
  assignedTo: string;
  assignedbyName: string;
  description: string;
  taskCategoryId: any;
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
    MatDividerModule,
    MatOptionModule,
    MatTooltipModule,
    OwlDateTimeModule,
    OwlMomentDateTimeModule,
  ],
  templateUrl: './task-index.html',
  styleUrl: './task-index.scss',
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MyDateAdapter,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
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
export class TaskIndex {
  dashboardFilter: string = '';
  tasks: Task[] = [];
  apiResponseTaskDetails: any = {};

  loginType = '';
  isHod = '';

  clients: Client[] = [];
  filteredClients: any[] = [];
  taskCategories: TaskCategory[] = [];
  assignedUsers: AssignedUser[] = [];

  searchQuery: string = '';
  search: string = '';
  selectedClient: string = '';
  selectedTaskStatuses: string[] = [];
  selectedTaskCategory: string = '';
  selectedAssignedTo: string = '';
  selectedPriority: string = '';
  selectedStatus: string = '';
  statusIndex: number = 0;

  currentPage: number = 1;
  selectedTaskStatus: any;
  page: number = 0;
  recordsPerPage: number = environment.recordsPerPage;
  size: number = environment.size;

  selectedmodules: any[] = [];
  createdBy: any;

  common = new Common();
  today: Date = new Date();
  task: any = {};

  userId: any;
  isAdmin: any;

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  exportExcelPer = 'Y';
  moduleName: string = '';
  showHeaderBar: boolean = true;

  filterKey = SESSION_KEYS.TASK_MASTER_FILTER;

  isPanelVisible = true;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Start Date',
      sortable: true,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      sortable: true,
    },
    {
      key: 'taskCategoryName',
      label: 'Task Category',
      sortable: true,
    },
    {
      key: 'assignedbyName',
      label: 'Assigned By',
      sortable: true,
    },
    {
      key: 'assignedToName',
      label: 'Assigned To',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
    },
    {
      key: 'taskStatus',
      label: 'Update Status',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      //  sessionStorage.removeItem(this.filterKey);
      this.userId = sessionStorage.getItem('userId');
      this.isAdmin = sessionStorage.getItem('isAdmin');
      this.loginType = sessionStorage.getItem('loginType') || 'other';
      this.isHod = sessionStorage.getItem('isHod') || 'N';

      const storedModuleDetail = sessionStorage.getItem('selectedModuleDetail');

      let moduleDetail: any = null;

      if (storedModuleDetail && storedModuleDetail !== 'null' && storedModuleDetail !== 'undefined') {
        try {
          moduleDetail = JSON.parse(storedModuleDetail);
        } catch (error) {
          console.error('Invalid selectedModuleDetail:', error);
        }
      }

      if (!moduleDetail) {
        const storedModules = sessionStorage.getItem('modules');

        if (storedModules) {
          try {
            const modules = JSON.parse(storedModules);
            moduleDetail = modules.find((module: any) => Number(module.moduleId) === 10 || module.name === 'Task');
          } catch (error) {
            console.error('Invalid modules session data:', error);
          }
        }
      }

      if (moduleDetail) {
        this.moduleName = moduleDetail.name ?? '';
        this.addPer = moduleDetail.addPer ?? 'N';
        this.editPer = moduleDetail.editPer ?? 'N';
        this.deletePer = moduleDetail.deletePer ?? 'N';
        this.viewPer = moduleDetail.viewPer ?? 'N';
        this.approvePer = moduleDetail.approvePer ?? 'N';
        this.adminApprovePer = moduleDetail.adminApprovePer ?? 'N';
        this.exportExcelPer = moduleDetail.exportExcel ?? 'N';
      }
    }

    this.sessionService.clearOtherSessions(this.filterKey);
    this.restoreFilterState();

    this.route.queryParams.subscribe((params) => {
      const saved = sessionStorage.getItem(this.filterKey);
      if (!saved) {
        if (params['statusIndex'] !== undefined) {
          this.statusIndex = Number(params['statusIndex']) || 0;
          this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';
        }

        if (params['taskStatusIds'] !== undefined) {
          this.selectedTaskStatuses = params['taskStatusIds']
            ? String(params['taskStatusIds'])
                .split(',')
                .map((x: string) => x.trim())
                .filter((x: string) => x)
            : [];
        }

        if (params['clientId'] !== undefined) {
          this.selectedClient = params['clientId'] ? String(params['clientId']) : '';
        }

        this.currentPage = 1;
        this.page = 0;
      }

      this.loadFilterData();
      this.getTaskDetails();
    });
  }

  private restoreFilterState(): void {
    let stateData: any = null;

    if (isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem(this.filterKey);
      const parsed = saved ? JSON.parse(saved) : null;
      console.log('dashboardFilter from session =>', parsed?.dashboardFilter);

      this.dashboardFilter = parsed?.dashboardFilter || '';
      if (saved) {
        try {
          stateData = JSON.parse(saved);
        } catch (error) {
          console.error('Invalid task filter session:', error);
        }
      }
    }

    if (!stateData) {
      this.currentPage = 1;
      this.page = 0;
      this.size = environment.size;
      this.recordsPerPage = this.size;

      this.search = '';
      this.searchQuery = '';

      this.statusIndex = 0;
      this.selectedStatus = '';

      this.selectedClient = '';
      this.selectedTaskCategory = '';
      this.selectedAssignedTo = '';
      this.selectedPriority = '';

      this.selectedTaskStatuses = [];

      this.fromDate = null;
      this.toDate = null;

      this.dashboardFilter = '';

      return;
    }

    this.currentPage = Number(stateData.currentPage) || 1;
    this.page = Number(stateData.page ?? this.currentPage - 1);

    this.size = Number(stateData.size) || environment.size;
    this.recordsPerPage = this.size;

    this.search = stateData.searchText || '';
    this.searchQuery = this.search;

    this.statusIndex = Number(stateData.statusIndex) || 0;
    this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';

    this.selectedClient = stateData.clientId != null ? String(stateData.clientId) : '';

    this.selectedTaskCategory = stateData.taskCategoryId != null ? String(stateData.taskCategoryId) : '';

    this.selectedAssignedTo = stateData.assignedTo != null ? String(stateData.assignedTo) : '';

    this.selectedPriority = stateData.priority != null ? String(stateData.priority) : '';

    if (Array.isArray(stateData.taskStatusIds)) {
      this.selectedTaskStatuses = stateData.taskStatusIds.map((x: any) => String(x));
    } else if (stateData.taskStatusIds != null && stateData.taskStatusIds !== '') {
      this.selectedTaskStatuses = String(stateData.taskStatusIds)
        .split(',')
        .filter((x: string) => x !== '');
    } else {
      this.selectedTaskStatuses = [];
    }

    this.fromDate = stateData.fromDate ? new Date(stateData.fromDate + 'T00:00:00') : null;

    this.toDate = stateData.toDate ? new Date(stateData.toDate + 'T00:00:00') : null;
  }

  private saveFilterState(): void {
    const filterState = {
      currentPage: this.currentPage,
      page: this.page,
      size: this.size,
      statusIndex: this.statusIndex,
      searchText: this.search,
      clientId: this.selectedClient ? Number(this.selectedClient) : null,
      taskCategoryId: this.selectedTaskCategory ? Number(this.selectedTaskCategory) : null,
      assignedTo: this.selectedAssignedTo ? Number(this.selectedAssignedTo) : null,
      priority: this.selectedPriority ? Number(this.selectedPriority) : null,
      fromDate: this.formatDateForApi(this.fromDate),
      toDate: this.formatDateForApi(this.toDate),

      taskStatusIds: this.selectedTaskStatuses,
      dashboardFilter: this.dashboardFilter,
    };

    sessionStorage.setItem(SESSION_KEYS.TASK_MASTER_FILTER, JSON.stringify(filterState));
  }

  private loadFilterData(): void {
    this.dataprovider.getTaskFilterDataForIndex(this.isAdmin, this.userId, this.loginType, this.isHod).subscribe({
      next: (response: any) => {
        this.clients = response.clients || [];
        this.filteredClients = [...this.clients];
        if (this.selectedClient) {
          const selectedClientObj = this.clients.find((c: any) => String(c.clientId) === String(this.selectedClient));

          if (selectedClientObj) {
            this.clientSearchText = selectedClientObj.name;
          } else {
            this.clientSearchText = '';
          }
        } else {
          this.clientSearchText = '';
        }
        this.filterAvailableClients();
        this.taskCategories = response.taskCategories || [];
        this.assignedUsers = response.assignedUsers || [];
      },
      error: (error) => {
        console.error('Error loading task filter data:', error);
        this.clients = [];
        this.filteredClients = [];
        this.taskCategories = [];
        this.assignedUsers = [];
      },
    });
  }

  private filterAvailableClients(): void {
    const availableClientNames = new Set(this.tasks.map((task: any) => task.clientName).filter((name: string) => name));
    this.filteredClients = this.clients.filter((client: any) => {
      if (this.selectedClient && String(client.clientId) === String(this.selectedClient)) {
        return true;
      }
      return availableClientNames.has(client.name);
    });
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getTaskDetails(): void {
    const clientId = this.selectedClient ? Number(this.selectedClient) : 0;
    const taskCategoryId = this.selectedTaskCategory ? Number(this.selectedTaskCategory) : 0;
    const assignedTo = this.selectedAssignedTo ? Number(this.selectedAssignedTo) : -1;
    const priority = this.selectedPriority ? Number(this.selectedPriority) : 0;
    const fromDate = this.formatDateForApi(this.fromDate);
    const toDate = this.formatDateForApi(this.toDate);
    const taskStatusId = this.selectedTaskStatuses;

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
        this.userId,
        taskStatusId,
        this.loginType,
        this.dashboardFilter,
        this.isHod,
      )
      .subscribe({
        next: (response: any) => {
          this.apiResponseTaskDetails = response;
          this.tasks = response.data || [];

          this.filterAvailableClients();

          if (this.selectedClient && this.clients.length > 0) {
            const selectedClientObj = this.clients.find((client: any) => String(client.clientId) === String(this.selectedClient));
            if (selectedClientObj) {
              this.clientSearchText = selectedClientObj.name;
            }
          }
        },
        error: (error) => {
          console.error('Error fetching task details:', error);
          this.apiResponseTaskDetails = {
            totalElements: 0,
          };
          this.tasks = [];
        },
      });
  }

  get paginatedTasks(): Task[] {
    return this.tasks;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();

    this.router
      .navigate(['/task-index'], {
        replaceUrl: true,
        state: {
          currentPage: this.currentPage,
          statusIndex: this.statusIndex,
          searchText: this.search,
          size: this.size,
          clientId: this.selectedClient || null,
          taskCategoryId: this.selectedTaskCategory || null,
          assignedTo: this.selectedAssignedTo || null,
          priority: this.selectedPriority || null,
          fromDate: this.formatDateForApi(this.fromDate) || null,
          toDate: this.formatDateForApi(this.toDate) || null,
          taskStatusIds: this.selectedTaskStatuses.length > 0 ? this.selectedTaskStatuses : [],
          taskType: this.dashboardFilter || '',
        },
      })
      .then(() => {
        this.getTaskDetails();
      });
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  onSearch(): void {
    this.search = this.searchQuery ? this.searchQuery.trim() : '';
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.currentPage = 1;
    this.page = 0;

    const fromDate = this.formatDateForApi(this.fromDate);
    const toDate = this.formatDateForApi(this.toDate);

    this.saveFilterState();

    this.router
      .navigate(['/task-index'], {
        state: {
          currentPage: 1,
          page: 0,
          size: this.size,
          statusIndex: this.statusIndex,
          searchText: this.search,
          clientId: this.selectedClient || null,
          taskCategoryId: this.selectedTaskCategory || null,
          assignedTo: this.selectedAssignedTo || null,
          priority: this.selectedPriority || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          taskStatusIds: this.selectedTaskStatuses.length ? this.selectedTaskStatuses.join(',') : null,
          taskType: this.dashboardFilter,
        },

        replaceUrl: true,
      })
      .then(() => {
        this.getTaskDetails();
      });
  }

  private formatDateForApi(date: Date | null): string {
    if (!date) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onChangeRecordsPerPage(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getTaskDetails();
  }

  viewTask(taskId: number): void {
    this.saveFilterState();

    this.router.navigate(['/view-task', taskId], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.search,
        size: this.size,
        clientId: this.selectedClient || null,
        taskCategoryId: this.selectedTaskCategory || null,
        assignedTo: this.selectedAssignedTo || null,
        priority: this.selectedPriority || null,
        fromDate: this.formatDateForApi(this.fromDate) || null,
        toDate: this.formatDateForApi(this.toDate) || null,
        taskStatusIds: this.selectedTaskStatuses.length > 0 ? this.selectedTaskStatuses : [],
        taskType: this.dashboardFilter || '',
      },
    });
  }

  editTask(taskId: number): void {
    this.saveFilterState();

    this.router.navigate(['/edit-task', taskId], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.search,
        size: this.size,
        clientId: this.selectedClient || null,
        taskCategoryId: this.selectedTaskCategory || null,
        assignedTo: this.selectedAssignedTo || null,
        priority: this.selectedPriority || null,
        fromDate: this.formatDateForApi(this.fromDate) || null,
        toDate: this.formatDateForApi(this.toDate) || null,
        taskStatusIds: this.selectedTaskStatuses.length ? this.selectedTaskStatuses.join(',') : null,
        taskType: this.dashboardFilter,
      },
    });
  }

  addTask(): void {
    this.saveFilterState();

    this.router.navigate(['/add-task'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.search,
        size: this.size,
        clientId: this.selectedClient || null,
        taskCategoryId: this.selectedTaskCategory || null,
        assignedTo: this.selectedAssignedTo || null,
        priority: this.selectedPriority || null,
        fromDate: this.formatDateForApi(this.fromDate) || null,
        toDate: this.formatDateForApi(this.toDate) || null,
        taskStatusIds: this.selectedTaskStatuses.length > 0 ? this.selectedTaskStatuses : [],
        taskType: this.dashboardFilter || '',
      },
    });
  }

  pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 5;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const arr: number[] = [];

    for (let i = start; i <= end; i++) {
      arr.push(i);
    }

    return arr;
  }

  get recordSummary(): string {
    const totalRecords = this.apiResponseTaskDetails?.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;

    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseTaskDetails?.totalElements || 0;

    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  sortData(column: string): void {
    if (!column) {
      return;
    }

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.tasks.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      valA = valA ?? '';
      valB = valB ?? '';

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  getPriorityLabel(priority: number): string {
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

  getPriorityClass(priority: number): string {
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

  clearFilters(): void {
    this.showStatusDropdown = false;
    this.searchQuery = '';
    this.search = '';
    this.selectedClient = '';
    this.clientSearchText = '';
    this.filteredClients = [...this.clients];
    this.selectedTaskCategory = '';
    this.selectedAssignedTo = '';
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.selectedTaskStatuses = [];
    this.fromDate = null;
    this.toDate = null;
    this.statusIndex = 0;
    this.currentPage = 1;
    this.page = 0;
    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.saveFilterState();

    this.router
      .navigate(['/task-index'], {
        state: {
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
          toDate: null,
          taskStatusId: null,
        },

        replaceUrl: true,
      })
      .then(() => {
        this.getTaskDetails();
      });
  }

  onDeleteTask(taskId: number): void {
    this.task = {
      taskId: Number(taskId),
      createdBy: this.userId ? Number(this.userId) : null,
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'small-confirm-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteTask(this.task).subscribe({
          next: (response: any) => {
            if (response.success) {
              Swal.fire('Deleted!', response.message, 'success');

              this.getTaskDetails();
            } else {
              Swal.fire('Error', response.message, 'error');
            }
          },

          error: (error) => {
            console.error('Error deleting task:', error);

            Swal.fire('Error', 'Something went wrong while deleting the task.', 'error');
          },
        });
      }
    });
  }

  fromDate: Date | null = null;
  toDate: Date | null = null;

  isTaskOwner(task: any): boolean {
    return Number(task.addedBy) === Number(this.userId);
  }

  // isTaskAssignedToUser(task: any): boolean {
  //   return Number(task.status) !== 3 && (Number(task.assignedTo) === Number(this.userId) || Number(task.addedBy) === Number(this.userId));
  // }

  isTaskAssignedToUser(task: any): boolean {
  if (Number(task.status) === 3) {
    return false;
  }

  const isAdmin = this.isAdmin === 'Y';
  const isAssignedOrOwner =
    Number(task.assignedTo) === Number(this.userId) ||
    Number(task.addedBy) === Number(this.userId);

  return isAdmin || isAssignedOrOwner;
}

  showTaskNotesModal = false;
  isAddingNote = false;
  selectedTask: any = null;
  taskNote = '';
  taskNotes: any[] = [];
  isSavingTaskNote = false;

  openTaskNotes(task: any): void {
    this.selectedTask = task;
    this.isAddingNote = false;
    this.taskNote = '';
    this.showTaskNotesModal = true;

    this.loadTaskNotes(task.taskId);
  }

  loadTaskNotes(taskId: number): void {
    this.dataprovider.getTaskNotes(taskId).subscribe({
      next: (response: any[]) => {
        this.taskNotes = response || [];
      },

      error: (error) => {
        console.error('Error loading task notes:', error);

        this.taskNotes = [];
      },
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
      userId: this.userId,
      sendMail: this.sendMail,
      isAdmin: this.isAdmin,
    };

    this.dataprovider.addTaskNote(request).subscribe({
      next: () => {
        this.taskNote = '';
        this.isAddingNote = false;
        this.sendMail = false;
        this.isSavingTaskNote = false;

        this.loadTaskNotes(this.selectedTask.taskId);
      },

      error: (error) => {
        console.error('Error saving task note', error);

        this.isSavingTaskNote = false;
      },
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
      '#0f766e', // Teal
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;

    return colors[index];
  }

  showChangeManagerModal = false;
  isChangingManager = false;
  taskDescription: string = '';
  descriptionValidationError = false;
  fileOne: File | null = null;
  fileOneName: string = '';
  fileTwo: File | null = null;
  fileTwoName: string = '';

  openChangeManagerModal(taskObject: any): void {
    this.descriptionValidationError = false;

    this.selectedTaskStatusIdForCondition = taskObject.taskStatus;

    this.task = {
      taskId: taskObject.taskId,
      managerId: taskObject.managerId,
      addedBy: taskObject.addedBy,
      assignedTo: taskObject.assignedTo,
      taskStatus: taskObject.taskStatus,
    };

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
    this.selectedTaskStatusId = 5;
    this.showChangeManagerModal = false;
    this.taskDescription = '';
    this.fileOne = null;
    this.fileOneName = '';
    this.fileTwo = null;
    this.fileTwoName = '';
    this.descriptionValidationError = false;
  }

  selectedTaskStatusId: number = 5;
  selectedTaskStatusIdForCondition: number = 0;

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  readonly ALLOWED_EXTENSIONS_FILE_ONE = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.zip'];
  readonly ALLOWED_EXTENSIONS_FILE_TWO = ['.pdf', '.xls', '.xlsx', '.doc', '.docx'];

  onFileOneSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const fileName = file.name.toLowerCase();

      const isAllowedType = this.ALLOWED_EXTENSIONS_FILE_ONE.some((ext) => fileName.endsWith(ext));

      if (!isAllowedType) {
        Swal.fire('Error', 'Only .pdf, .xls, .xlsx, .doc, .docx, .zip files are allowed.', 'error');

        input.value = '';
        this.fileOne = null;
        this.fileOneName = '';
        return;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        Swal.fire('Error', 'File size must not exceed 10 MB.', 'error');

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

      const fileName = file.name.toLowerCase();

      const isAllowedType = this.ALLOWED_EXTENSIONS_FILE_TWO.some((ext) => fileName.endsWith(ext));

      if (!isAllowedType) {
        Swal.fire('Error', 'Only .pdf, .xls, .xlsx, .doc, .docx files are allowed.', 'error');

        input.value = '';
        this.fileTwo = null;
        this.fileTwoName = '';
        return;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        Swal.fire('Error', 'File size must not exceed 10 MB.', 'error');

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

    formData.append('selectedTaskStatusId', String(this.selectedTaskStatusId));
    formData.append('taskId', String(this.task.taskId));
    formData.append('description', this.taskDescription.trim());
    formData.append('userId', this.userId);

    if (this.fileTwo) {
      formData.append('fileName3', this.fileTwo, this.fileTwo.name); // normal file → fileName1 (pdf)
    }

    if (this.fileOne) {
      formData.append('fileName4', this.fileOne, this.fileOne.name);
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
        console.error('Full error:', error);
        console.error('Backend message:', error?.error?.message);
        Swal.fire('Error', error?.error?.message || 'Something went wrong while updating the task.', 'error');
      },
    });
  }

  exportToExcel(): void {
    if (!this.tasks || this.tasks.length === 0) {
      alert('No tasks available for export.');
      return;
    }

    const exportData = this.tasks.map((task: any, index: number) => {
      return {
        'Sr. No.': index + 1,
        Title: task.title || '-',
        Client: task.clientName || '-',
        Date: task.date ? this.formatExcelDate(task.date) : '-',
        'Due Date': task.dueDateTime ? this.formatExcelDate(task.dueDateTime) : '-',
        'Task Category': task.taskCategoryName || '-',
        'Assigned By': task.assignedbyName || '-',
        'Assigned To': !task.assignedToName || task.assignedToName === '0' ? 'Unassigned User' : task.assignedToName,
        Priority: this.getPriorityLabel(task.priority),
        'Task Status': this.common.getTaskStatusLabel(task.taskStatus),
        Status: this.common.getStatusLabel(task.status),
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    worksheet['!cols'] = [
      { wch: 8 }, // Sr. No.
      { wch: 35 }, // Title
      { wch: 25 }, // Client
      { wch: 20 }, // Date
      { wch: 20 }, // Due Date
      { wch: 25 }, // Task Category
      { wch: 25 }, // Assigned By
      { wch: 25 }, // Assigned To
      { wch: 15 }, // Priority
      { wch: 20 }, // Task Status
      { wch: 15 }, // Status
    ];

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    const today = new Date();

    const dateString = `${today.getFullYear()}-` + `${String(today.getMonth() + 1).padStart(2, '0')}-` + `${String(today.getDate()).padStart(2, '0')}`;

    XLSX.writeFile(workbook, `Tasks_${dateString}.xlsx`);
  }

  private formatExcelDate(date: any): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  showStatusDropdown = false;

  onStatusChange(event: any): void {
    const value = event.target.value;

    if (event.target.checked) {
      this.selectedTaskStatuses.push(value);
    } else {
      this.selectedTaskStatuses = this.selectedTaskStatuses.filter((x) => x !== value);
    }

    this.onSearch();
  }

  taskStatusOptions: { id: string; label: string }[] = [
    { id: '1', label: 'Assigned' },
    { id: '2', label: 'Assignee Closure' },
    { id: '3', label: 'Re-Open' },
    { id: '4', label: 'Assignee Re-Closure' },
    { id: '5', label: 'Assignor Closure' },
  ];

  toggleTaskStatus(id: string): void {
    const index = this.selectedTaskStatuses.indexOf(id);

    if (index > -1) {
      this.selectedTaskStatuses = this.selectedTaskStatuses.filter((x) => x !== id);
    } else {
      this.selectedTaskStatuses = [...this.selectedTaskStatuses, id];
    }

    this.onSearch();
  }

  isTaskStatusChecked(id: string): boolean {
    return this.selectedTaskStatuses.includes(id);
  }

  showDescriptionModal = false;
  selectedDescriptionTask: any = null;

  openDescriptionModal(task: Task): void {
    this.selectedDescriptionTask = task;

    this.showDescriptionModal = true;
  }

  closeDescriptionModal(): void {
    this.showDescriptionModal = false;

    this.selectedDescriptionTask = null;
  }

  showAssignUserModal = false;
  selectedAssignTask: any = null;
  assignRemarks: string = '';
  users: any[] = [];

  openAssignUserModal(task: any): void {
    const currentAssignedUserId = Number(task.assignedTo || 0);

    this.selectedAssignTask = {
      ...task,
      assignedTo: 0,
      date: task.date ? new Date(task.date) : null,
      endDate: task.dueDateTime ? new Date(task.dueDateTime) : null,
    };

    // if (!this.selectedAssignTask.endDate) {
    //   this.setDefaultAssignEndDate();
    // }

    this.assignRemarks = '';
    this.showAssignUserModal = true;

    this.users = [];
    this.loadAssigneeWorkload(task.taskCategoryId, task.date, task.dueDateTime);
    const startDate = this.datePipe.transform(this.selectedAssignTask.date, 'yyyy-MM-dd');

    const endDate = this.datePipe.transform(this.selectedAssignTask.endDate, 'yyyy-MM-dd');

    this.loadAssignUsers(startDate, endDate, currentAssignedUserId);
    // this.dataprovider.changesCategoryIdgetUserFilterData(this.isAdmin, this.userId, this.loginType, task.clientId, task.taskCategoryId, Number(task.systemFlag ?? 0), startDate, endDate).subscribe({
    //   next: (res: any) => {
    //     const data = res?.data || res;

    //     const allUsers = data?.assignedUsers || [];

    //     this.users = allUsers.filter((user: any) => Number(user.userId) !== currentAssignedUserId);

    //     this.selectedAssignTask.maxHours = Number(data?.maxHours || 0);

    //     // Calculate default end date if there isn't already one
    //     // if (!this.selectedAssignTask.endDate) {
    //     //   this.setDefaultAssignEndDate();
    //     // }
    //   },

    //   error: (error: any) => {
    //     console.error('Error loading assigned users:', error);
    //     this.users = [];
    //   },
    // });
  }

  private isValidTaskDateRange(): boolean {
    if (!this.selectedAssignTask?.date) {
      Swal.fire('Error', 'Start Date & Time is required.', 'error');
      return false;
    }

    if (!this.selectedAssignTask?.endDate) {
      Swal.fire('Error', 'End Date & Time is required.', 'error');
      return false;
    }

    const startDate = new Date(this.selectedAssignTask.date);
    const endDate = new Date(this.selectedAssignTask.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Swal.fire('Error', 'Please select valid Start and End Date & Time.', 'error');
      return false;
    }

    if (endDate < startDate) {
      Swal.fire('Error', 'End Date & Time cannot be before Start Date & Time.', 'error');
      return false;
    }

    return true;
  }

  closeAssignUserModal(): void {
    this.showAssignUserModal = false;
    this.selectedAssignTask = null;
    this.assignRemarks = '';
    this.users = [];
  }

  assignUser(): void {
    if (!this.selectedAssignTask || !this.selectedAssignTask.assignedTo || this.selectedAssignTask.assignedTo == 0) {
      return;
    }

    if (this.selectedAssignTask.taskStatus === 1 && !this.assignRemarks?.trim()) {
      return;
    }

    if (!this.isValidTaskDateRange()) {
      return;
    }

    const taskId = this.selectedAssignTask.taskId;
    const assignedTo = this.selectedAssignTask.assignedTo;
    const remarks = this.assignRemarks?.trim() || '';
    const startDate = this.formatDateTimeForApi(this.selectedAssignTask.date);
    const endDate = this.formatDateTimeForApi(this.selectedAssignTask.endDate);

    this.dataprovider.updateTaskAssignedUser(taskId, assignedTo, this.userId, remarks, startDate, endDate).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const selectedUser = this.users.find((user: any) => user.userId == assignedTo);
          const taskIndex = this.paginatedTasks.findIndex((task: any) => task.taskId == taskId);

          if (taskIndex !== -1) {
            this.paginatedTasks[taskIndex].assignedTo = assignedTo;
            this.paginatedTasks[taskIndex].assignedToName = selectedUser?.firstName || 'Unassigned User';
            this.paginatedTasks[taskIndex].date = this.selectedAssignTask.date;
            this.paginatedTasks[taskIndex].endDate = this.selectedAssignTask.endDate;
          }

          this.closeAssignUserModal();
          this.onSearch();
        } else {
          console.error('Failed to assign user:', res?.message);
        }
      },

      error: (error: any) => {
        console.error('Error assigning user:', error);
      },
    });
  }

  // private setDefaultAssignEndDate(): void {
  //   if (!this.selectedAssignTask?.date) {
  //     return;
  //   }

  //   const maxHours = Number(this.selectedAssignTask?.maxHours);

  //   if (isNaN(maxHours) || maxHours <= 0) {
  //     return;
  //   }

  //   const startDate = new Date(this.selectedAssignTask.date);

  //   if (isNaN(startDate.getTime())) {
  //     return;
  //   }

  //   const endDate = new Date(startDate);
  //   endDate.setHours(endDate.getHours() + maxHours);

  //   this.selectedAssignTask.endDate = endDate;
  // }

  onAssignStartDateChange(startDate: any): void {
    if (!startDate) {
      return;
    }

    this.selectedAssignTask.date = new Date(startDate);

    // this.setDefaultAssignEndDate();
  }

  private formatDateTimeForApi(date: any): string | null {
    if (!date) {
      return null;
    }

    const dateObj = date instanceof Date ? date : new Date(date);

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

  onchangeloadUserDropdownData(task: any): void {
    const startDate = this.datePipe.transform(this.selectedAssignTask.date, 'yyyy-MM-dd');

    const endDate = this.datePipe.transform(this.selectedAssignTask.endDate, 'yyyy-MM-dd');

    const currentAssignedUserId = Number(this.selectedAssignTask.assignedTo || 0);
    // this.dataprovider.changesCategoryIdgetUserFilterData(this.isAdmin, this.userId, this.loginType, task.clientId, task.taskCategoryId, Number(task.systemFlag ?? 0), startDate, endDate).subscribe({
    //   next: (res: any) => {
    //     const data = res?.data || res;
    //     this.users = data?.assignedUsers || [];
    //   },
    //   error: (error: any) => {
    //     console.error('Error loading task dropdown data:', error);

    //     this.users = [];
    //   },
    // });

    this.loadAssignUsers(startDate, endDate, currentAssignedUserId);
  }

  isStatusRadioDisabled(task: any): boolean {
    const selfAssigned = task.addedBy == this.userId && task.assignedTo == this.userId;
    const isManager = task.managerId == this.userId;

    return isManager;
  }

  canShowAssignorClosure(): boolean {
    console.error('{this.managerId }' + this.task.addedBy, this.task.managerId, this.task.assignedTo);
    const isManager = this.task.managerId == this.userId;

    const isAssignor = this.task.addedBy == this.userId;
    const isSelfAssigned = this.task.addedBy == this.task.assignedTo;

    return isManager || (isAssignor && !isSelfAssigned);
  }

  getDueDateClass(dueDateTime: string): string {
    const due = new Date(dueDateTime);
    const now = new Date();

    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (due < now) {
      return 'due-overdue';
    } else if (dueDay.getTime() === today.getTime()) {
      return 'due-today';
    } else {
      return 'due-upcoming';
    }
  }

  removeZipFile(fileInput: HTMLInputElement): void {
    this.fileOne = null;
    this.fileOneName = '';
    fileInput.value = '';
  }

  removeNormalFile(fileInput: HTMLInputElement): void {
    this.fileTwo = null;
    this.fileTwoName = '';
    fileInput.value = '';
  }

  clientSearchText: string = '';
  showClientDropdown: boolean = false;
  selectedClientId: number = 0;

  filterClients(): void {
    const search = this.clientSearchText.toLowerCase().trim();

    if (search.length < 3) {
      this.showClientDropdown = false;
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.clients.filter((client: any) => client.name && client.name.toLowerCase().includes(search));

    this.showClientDropdown = true;

    if (!search) {
      this.selectedClient = '';
      this.filteredClients = [...this.clients];
    }
  }

  selectClient(client: any): void {
    this.clientSearchText = client.name;
    this.selectedClient = String(client.clientId);
    this.showClientDropdown = false;

    this.onSearch();
  }

  clearClientSearch(): void {
    this.clientSearchText = '';
    this.selectedClientId = 0;
    this.selectedClient = '';

    this.filteredClients = [];
    this.showClientDropdown = false;

    this.onSearch();
  }
  sendMail: boolean = false;
  showTaskCategoryDropdown = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.status-dropdown')) {
      this.showStatusDropdown = false;
    }

    if (!target.closest('.client-dropdown-container')) {
      this.showClientDropdown = false;
    }

    if (!target.closest('.task-category-dropdown')) {
      this.showTaskCategoryDropdown = false;
    }
  }

  canDisableChangeManager(task: any): boolean {
    if (Number(task.status) === 2 || Number(task.status) === 3) {
      return true;
    }

    if (Number(task.taskStatus) === 5) {
      return true;
    }

    if (this.isAdmin === 'Y') {
      return false;
    }

    const userId = Number(this.userId);
    const isAssignor = Number(task.addedBy) === userId;
    const isAssignee = Number(task.assignedTo) === userId;
    const isManager = Number(task.managerId) === userId;

    if (isAssignor && isAssignee) {
      return false;
    }

    const taskStatus = Number(task.taskStatus);
    let canAct = false;

    if (taskStatus === 1 || taskStatus === 3) {
      canAct = isAssignee;
    } else if (taskStatus === 2 || taskStatus === 4) {
      canAct = isAssignor || isManager;
    }

    return !canAct;
  }

  getSelectedTaskStatusLabel(): string {
    if (this.selectedTaskStatuses.length === 0) {
      return '--All Task Status--';
    }

    const labels = this.taskStatusOptions.filter((s) => this.selectedTaskStatuses.includes(s.id)).map((s) => s.label);

    if (labels.length > 2) {
      return `${labels.length} statuses selected`;
    }

    return labels.join(', ');
  }

  workloadList: { assignedTo: number; hours: number }[] = [];
  holidayError: string = '';
  public loadAssigneeWorkload(taskCategoryId: any, startDate: any, endDate: any): void {
    this.holidayError = '';
    console.log('{taskCategoryId : }' + taskCategoryId);

    const paramStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd HH:mm:ss');
    const paramEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd HH:mm:ss');

    if (!taskCategoryId || !startDate) {
      console.log('something went wrong    === ');
      return;
    }

    if (!paramStartDate && paramEndDate) {
      return;
    }

    this.dataprovider.getAssigneeWorkload(taskCategoryId, paramStartDate, paramEndDate).subscribe({
      next: (response) => {
        console.log('Assignee Workload:', response);

        if (!response.success) {
          this.holidayError = response.message || 'Unable to fetch workload';

          this.workloadList = [];
          return;
        }

        this.holidayError = '';
        this.workloadList = response.data || [];

        const assignedUserIds = new Set(this.workloadList.map((x: any) => Number(x.assignedTo)));
        this.users.forEach((user: any) => {
          user.hasWorkload = assignedUserIds.has(Number(user.userId));
        });
      },
      error: (error) => {
        console.error('Error fetching assignee workload', error);

        this.holidayError = error?.error?.message || 'Error fetching assignee workload';

        this.workloadList = [];
      },
    });
  }

  onAssignEndDateChange(value: any): void {
    this.selectedAssignTask.endDate = value;

    const startDate = this.datePipe.transform(this.selectedAssignTask.date, 'yyyy-MM-dd') || '';
    const endDate = this.datePipe.transform(this.selectedAssignTask.endDate, 'yyyy-MM-dd') || '';

    this.loadAssigneeWorkload(this.selectedAssignTask.taskCategoryId, this.selectedAssignTask.date, this.selectedAssignTask.endDate);

    const currentAssignedUserId = Number(this.selectedAssignTask.assignedTo || 0);
    this.loadAssignUsers(startDate, endDate, currentAssignedUserId);
  }

  // private loadAssignUsers(startDate: string | null, endDate: string | null, currentAssignedUserId: number): void {
  //   this.dataprovider
  //     .changesCategoryIdgetUserFilterData(
  //       this.isAdmin,
  //       this.userId,
  //       this.loginType,
  //       this.selectedAssignTask.clientId,
  //       this.selectedAssignTask.taskCategoryId,
  //       Number(this.selectedAssignTask.systemFlag ?? 0),
  //       startDate,
  //       endDate,
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         const data = res?.data || res;

  //         const allUsers = data?.assignedUsers || [];

  //         this.users = allUsers.filter((user: any) => Number(user.userId) !== currentAssignedUserId);

  //         this.selectedAssignTask.maxHours = Number(data?.maxHours || 0);
  //       },
  //       error: (error: any) => {
  //         console.error('Error loading assigned users:', error);
  //         this.users = [];
  //       },
  //     });
  // }

  private loadAssignUsers(startDate: string | null, endDate: string | null, currentAssignedUserId: number): void {
    const usersRequest = this.dataprovider.changesCategoryIdgetUserFilterData(
      this.isAdmin,
      this.userId,
      this.loginType,
      this.selectedAssignTask.clientId,
      this.selectedAssignTask.taskCategoryId,
      Number(this.selectedAssignTask.systemFlag ?? 0),
      startDate,
      endDate,
    );

    const workloadRequest = this.dataprovider.getAssigneeWorkload(this.selectedAssignTask.taskCategoryId, startDate, endDate);

    forkJoin({
      users: usersRequest,
      workload: workloadRequest,
    }).subscribe({
      next: ({ users, workload }: any) => {
        const userData = users?.data || users;
        const workloadData = workload?.data || workload;

        const allUsers = userData?.assignedUsers || [];
        const workloadUsers = workloadData || [];

        // Create a Set of users who have workload
        const workloadUserIds = new Set(workloadUsers.map((item: any) => Number(item.assignedTo)));

        this.users = allUsers
          .filter((user: any) => Number(user.userId) !== Number(currentAssignedUserId))
          .map((user: any) => ({
            ...user,
            hasWorkload: workloadUserIds.has(Number(user.userId)),
          }));

        this.selectedAssignTask.maxHours = Number(userData?.maxHours || 0);

        console.log('Users with workload:', this.users);
      },

      error: (error: any) => {
        console.error('Error loading assigned users:', error);
        this.users = [];
      },
    });
  }

  private normalizeClientId(value: any): string {
    if (value === null || value === undefined) return '';
    const v = String(value).trim();
    return v === '' || v === '0' || v === 'null' || v === 'undefined' ? '' : v;
  }
}
