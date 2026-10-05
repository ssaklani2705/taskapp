import { Component, HostListener, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataProviderService } from '../../service/data-provider.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SESSION_KEYS } from '../../service/session-storage.keys';

export interface DashboardMetricDTO {
  count: number;
  taskStatusIds: number[];
}

interface ApiTask {
  taskId: number;

  clientId: number;

  title: string;

  date: string;

  priority: string;

  status: string;

  progress: number;

  description: string;

  assignedTo: number;

  addedBy: number;

  taskCategoryId: number;

  fileName1: string | null;

  fileName2: string | null;

  fileName3: string | null;

  fileName4: string | null;

  closeRemarks: string | null;

  clientName: string;
  assignedUser: string;

  dueDateTime: string;

  assignedByUser: string;

  taskStatus: any;
}

interface DashboardResponse {
  myTasksToday: DashboardMetricDTO;
  dueThisWeek: DashboardMetricDTO;
  overdue: DashboardMetricDTO;

  todo: {
    count: number;
    tasks: ApiTask[];
  };

  inProgress: {
    count: number;
    tasks: ApiTask[];
  };

  done: {
    count: number;
    tasks: ApiTask[];
  };
  overdueStatusIds: string;
  statusCounts?: StatusCounts;
}

interface Task {
  title: string;
  subtitle: string;
  clientName: string;
  assignedToName: string;
  startDay: string;
  dueDate: string;
  assignedByUser: string;
  type: 'high' | 'medium' | 'low' | 'progress' | 'done';
  progress?: number;
  taskStatusLabel: string;
  taskStatusClass: string;
}

interface TaskColumn {
  title: string;

  count: number;

  tasks: Task[];
}

interface StatusCounts {
  unassigned: number;
  assigned: number;
  assigneeClosure: number;
  reOpen: number;
  assigneeReClosure: number;
  assignorClosure: number;
}

export interface TaskFilterState {
  currentPage: number;
  page: number;
  size: number;

  statusIndex: number;
  searchText: string;

  clientId: number;
  taskCategoryId: number;
  assignedTo: number;
  priority: number;

  fromDate: string | null;
  toDate: string | null;

  taskStatusIds: string[];

  dashboardFilter: string;
}

@Component({
  selector: 'app-employee-dashboard',

  standalone: true,

  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule, MatFormFieldModule, MatSelectModule, FormsModule],

  templateUrl: './employee-dashboard.html',

  styleUrl: './employee-dashboard.scss',
})
export class EmployeeDashboard implements OnInit {
  readonly todayTasks = signal(0);

  readonly employeeName = signal('Anil Kumar');

  // readonly employeeRole =
  //   signal('Employee');

  readonly checkedInTime = signal('09:02');

  readonly stats = signal<any[]>([]);

  readonly columns = signal<TaskColumn[]>([]);

  constructor(
    private dataProviderService: DataProviderService,
    private router: Router,
  ) {}

  readonly statusStats = signal<any[]>([]);

  // key = field in statusCounts, statusName = value passed to Task list page
  private readonly statusConfig = [
    { key: 'assigned', label: 'Assigned', statusId: '1', icon: 'assignment_ind' },
    { key: 'assigneeClosure', label: 'Assignee Closure', statusId: '2', icon: 'task_alt' },
    { key: 'reOpen', label: 'Re-Open', statusId: '3', icon: 'replay' },
    { key: 'assigneeReClosure', label: 'Assignee Re-Closure', statusId: '4', icon: 'published_with_changes' },
    { key: 'assignorClosure', label: 'Assignor Closure', statusId: '5', icon: 'verified' },
  ];

  // ======================================================
  // INIT
  // ======================================================
  username: string = '';
  loginType: string = '';
  isAdmin: any;
  userId: any;
  designationName: any;
  isHod = '';
  ngOnInit(): void {
    this.username = sessionStorage.getItem('username') || 'Society 123';
    this.designationName = sessionStorage.getItem('designationName')?.trim() || '-';

    this.isAdmin = sessionStorage.getItem('isAdmin');

    this.userId = sessionStorage.getItem('userId');

    this.loginType = sessionStorage.getItem('loginType') || 'other';
    this.isHod = sessionStorage.getItem('isHod') || 'N';

    this.getDashboardClients();
    this.loadDashboard();
  }

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  loadDashboard(): void {
    const userId = Number(sessionStorage.getItem('userId')) || 1;

    this.dataProviderService.getDashboard(userId, this.isAdmin, this.selectedClientId, this.isHod).subscribe({
      next: (res: DashboardResponse) => {
        console.log('Dashboard response:', res);
        if (!res) {
          return;
        }
        // Today's task count
        this.todayTasks.set(res.myTasksToday.count || 0);
        // ----------------------------------------------
        // STATISTICS
        // ----------------------------------------------
        this.stats.set([
          {
            label: 'My tasks today',
            value: res.myTasksToday.count,
            color: 'normal',
            statusIds: (res.myTasksToday?.taskStatusIds || []).join(','),
          },

          {
            label: 'Due this week',
            value: res.dueThisWeek.count,
            color: 'normal',
            statusIds: (res.dueThisWeek?.taskStatusIds || []).join(','),
          },

          {
            label: 'Overdue',
            value: res.overdue.count,
            color: 'danger',
            statusIds: (res.overdue?.taskStatusIds || []).join(','),
          },
        ]);

        const sc: any = res.statusCounts || {};
        this.statusStats.set(
          this.statusConfig.map((s) => ({
            label: s.label,
            statusId: s.statusId,
            icon: s.icon,
            value: sc[s.key] || 0,
          })),
        );

        // ----------------------------------------------
        // TASK COLUMNS
        // ----------------------------------------------

        this.columns.set([
          {
            title: 'To do',

            count: res.todo?.count || 0,

            tasks: this.mapTasks(res.todo?.tasks || [], 'todo'),
          },

          {
            title: 'In progress',

            count: res.inProgress?.count || 0,

            tasks: this.mapTasks(res.inProgress?.tasks || [], 'progress'),
          },

          {
            title: 'Completed Tasks',

            count: res.done?.count || 0,

            tasks: this.mapTasks(res.done?.tasks || [], 'done'),
          },
        ]);
      },

      error: (error) => {
        console.error('Error loading dashboard:', error);
      },
    });
  }

  // ======================================================
  // MAP API TASKS
  // ======================================================

  private mapTasks(tasks: ApiTask[], category: 'todo' | 'progress' | 'done'): Task[] {
    return tasks.map((task) => {
      // -----------------------------------------------
      // DONE
      // -----------------------------------------------

      if (category === 'done') {
        return {
          title: task.title,

          subtitle: 'Completed',

          clientName: task.clientName || '',

          assignedToName: task.assignedUser || '',
          assignedByUser: task.assignedByUser || '',

          startDay: this.formatDate(task.date),

          dueDate: this.formatDate(task.dueDateTime),
          // type: 'done',
          type: this.getPriorityType(task.priority),
          ...this.getStatusFields(task.taskStatus),
          taskStatus: task.taskStatus,
        };
      }

      // -----------------------------------------------
      // IN PROGRESS
      // -----------------------------------------------

      if (category === 'progress') {
        return {
          title: task.title,

          subtitle: `${task.progress || 0}% complete`,

          clientName: task.clientName || '',

          assignedToName: task.assignedUser || '',
          assignedByUser: task.assignedByUser || '',

          startDay: this.formatDate(task.date),

          dueDate: this.formatDate(task.dueDateTime),

          // type: 'progress',
          type: this.getPriorityType(task.priority),

          progress: task.progress || 0,
          ...this.getStatusFields(task.taskStatus),
          taskStatus: task.taskStatus,
        };
      }

      // -----------------------------------------------
      // TODO
      // -----------------------------------------------

      return {
        title: task.title,

        subtitle: `Due ${this.formatDate(task.date)} · ${this.formatPriority(task.priority)}`,

        clientName: task.clientName || '',

        assignedToName: task.assignedUser || '',
        assignedByUser: task.assignedByUser || '',

        startDay: this.formatDate(task.date),

        dueDate: this.formatDate(task.dueDateTime),

        type: this.getPriorityType(task.priority),

        ...this.getStatusFields(task.taskStatus),
        taskStatus: task.taskStatus,
      };
    });
  }

  // ======================================================
  // PRIORITY TYPE
  // ======================================================

  private getPriorityType(priority: string): 'high' | 'medium' | 'low' {
    const normalized = (priority || '').toString().trim().toUpperCase();

    switch (normalized) {
      case 'HIGH':
      case 'H':
      case '1':
        return 'high';

      case 'MEDIUM':
      case 'MED':
      case 'M':
      case '2':
        return 'medium';

      case 'LOW':
      case 'L':
      case '3':
        return 'low';

      default:
        console.warn('Unmapped task priority value, defaulting to low:', priority);
        return 'low';
    }
  }

  // ======================================================
  // PRIORITY LABEL
  // ======================================================

  private formatPriority(priority: string): string {
    if (!priority) {
      return '';
    }

    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }

  // ======================================================
  // DATE FORMAT
  // ======================================================

  private formatDate(date: string): string {
    if (!date) {
      return '';
    }

    const taskDate = new Date(date);

    if (isNaN(taskDate.getTime())) {
      return '';
    }

    return taskDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ======================================================
  // CHECK IN
  // ======================================================

  checkIn(): void {
    console.log(`Checked in at ${this.checkedInTime()}`);
  }

  // ======================================================
  // HELPDESK
  // ======================================================

  raiseHelpdeskTicket(): void {
    console.log('Helpdesk ticket requested');
  }

  // ======================================================
  // LEAVE
  // ======================================================

  applyLeave(): void {
    console.log('Leave application opened');
  }

  // =========================================================
  // GET INITIALS
  // =========================================================

  getInitials(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // =========================================================
  // GET SHORT NAME
  // =========================================================

  getShortName(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0];
    }

    const lastName = parts[parts.length - 1];

    // ---------------------------------------------
    // Two words
    // Example:
    // S. Saklani
    // ---------------------------------------------

    if (parts.length === 2) {
      return `${parts[0].charAt(0).toUpperCase()}. ${lastName}`;
    }

    // ---------------------------------------------
    // Three or more words
    // Example:
    // A.C. Thakur
    // ---------------------------------------------

    const initials = parts
      .slice(0, -1)
      .map((part) => part.charAt(0).toUpperCase())
      .join('.');

    return `${initials}. ${lastName}`;
  }

  //Dropdown
  clients: any[] = [];
  selectedClientId: any = 0;
  getDashboardClients(): void {
    this.dataProviderService.getDashboardClients(this.userId, this.isAdmin, this.loginType, this.selectedClientId).subscribe({
      next: (res: any[]) => {
        this.clients = res;
        if (this.selectedClientId > 0) {
          const client = this.clients.find((x) => x.clientId == this.selectedClientId);

          if (client) {
            this.clientSearchText = client.clientName;
          }
        }
      },
      error: (error) => {
        console.error('Error loading dashboard clients:', error);
        this.clients = [];
      },
    });
  }

  onClientChange(clientId: number | null): void {
    this.selectedClientId = clientId;

    console.log('Selected Client ID:', clientId);

    // Reload dashboard with selected client
    this.loadDashboard();
  }

  openTaskIndex(stat: any): void {
    // if (!stat || stat.value === 0) {
    //   return;
    // }
    let taskType = '';

    console.log(JSON.stringify(stat) + ' checking now ');

    if (stat.label === 'My tasks today') {
      taskType = 'today';
    } else if (stat.label === 'Due this week') {
      taskType = 'week';
    } else if (stat.label === 'Overdue') {
      taskType = 'overdue';
    }

    const taskStatusIds = stat.statusIds ? stat.statusIds.split(',').map((x: string) => x.trim()) : [];

    this.saveTaskFilterAndNavigate(taskStatusIds, taskType);
  }

  clientSearchText = '';
  showClientDropdown = false;
  filteredClients: any[] = [];

  filterClients(): void {
    const search = this.clientSearchText?.trim().toLowerCase();

    if (!search || search.length < 3) {
      this.filteredClients = [];
      this.showClientDropdown = false;

      return;
    }

    this.filteredClients = this.clients.filter((client: any) => client.clientName && client.clientName.toLowerCase().includes(search));

    this.showClientDropdown = true;
  }

  selectClient(client: any): void {
    if (!client) {
      this.selectedClientId = 0;
      this.clientSearchText = '';
    } else {
      this.selectedClientId = client.clientId;
      this.clientSearchText = client.clientName;
    }

    this.showClientDropdown = false;

    this.loadDashboard();
  }

  clearClientFilter(): void {
    this.clientSearchText = '';
    this.selectedClientId = 0;
    this.filteredClients = [];
    this.showClientDropdown = false;

    this.loadDashboard();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.dashboard-client-container')) {
      this.showClientDropdown = false;
    }
  }

  openTaskIndexByStatus(stat: any): void {
    if (!stat || stat.value === 0) {
      return;
    }

    // this.router.navigate(['/task-index'], {
    //   queryParams: {
    //     taskStatusIds: stat.statusId,
    //     clientId: this.selectedClientId || 0,
    //     statusIndex: 1,
    //   },
    // });

    this.saveTaskFilterAndNavigate([String(stat.statusId)]);
  }

  private getStatusFields(status: number | null | undefined): { taskStatusLabel: string; taskStatusClass: string } {
    switch (Number(status ?? 0)) {
      case 1:
        return { taskStatusLabel: 'Assigned', taskStatusClass: 'ts-assigned' };
      case 2:
        return { taskStatusLabel: 'Assignee Closure', taskStatusClass: 'ts-assignee-closure' };
      case 3:
        return { taskStatusLabel: 'Re-Open', taskStatusClass: 'ts-reopen' };
      case 4:
        return { taskStatusLabel: 'Assignee Re-Closure', taskStatusClass: 'ts-reclosure' };
      case 5:
        return { taskStatusLabel: 'Assignor Closure', taskStatusClass: 'ts-assignor-closure' };
      default:
        return { taskStatusLabel: 'Unassigned', taskStatusClass: 'ts-unassigned' };
    }
  }

  private saveTaskFilterAndNavigate(taskStatusIds: string[], dashboardFilter: string = ''): void {
    const filterState: TaskFilterState = {
      currentPage: 1,
      page: 0,
      size: 10,

      statusIndex: 1,
      searchText: '',

      clientId: this.selectedClientId || 0,
      taskCategoryId: 0,
      assignedTo: 0,
      priority: 0,

      fromDate: null,
      toDate: null,

      taskStatusIds,
      dashboardFilter,
    };

    sessionStorage.setItem(SESSION_KEYS.TASK_MASTER_FILTER, JSON.stringify(filterState));

    this.router.navigate(['/task-index']);
  }
}
