import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DataProviderService } from '../../service/data-provider.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

interface Task {
  taskId: number;
  title: string;
  assignedTo: string;
  assignedUserName: string;
  taskStatus: number;
}

@Component({
  selector: 'app-manager-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.scss',
})
export class ManagerDashboard {
  username: string = '';
  today: Date = new Date();

  apiResponseTaskDetails: any = {};
  tasks: Task[] = [];
  task: any = {};

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  showChangeManagerModal = false;
  isChangingManager = false;

  taskDescription: string = '';
  descriptionValidationError = false;

  fileOne: File | null = null;
  fileOneName: string = '';

  fileTwo: File | null = null;
  fileTwoName: string = '';

  selectedClient: string = '';
  selectedTaskStatus: string = '';
  selectedTaskCategory: string = '';
  selectedAssignedTo: string = '';
  selectedPriority: string = '';
  statusIndex: number = 0;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  search: string = '';
  userId: any;
  isAdmin: any;

  page: number = 0;
  size: number = environment.size;

  kpis = [
    {
      title: 'Tasks',
      value: 0,
      icon: 'task_alt',
      className: 'blue',
      change: '+8 this week',
    },
    {
      title: 'Completed Tasks',
      value: 0,
      icon: 'check_circle',
      className: 'green',
      change: '1 escalated',
    },
    {
      title: 'Pending Tasks',
      value: 0,
      icon: 'pending_actions',
      className: 'orange',
      change: '3 due today',
    },
  ];

  constructor(private dataProvider: DataProviderService) {}

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username') || 'Society 123';

    this.getTasks();
    this.getTaskCounts();
  }

  getTasks(): void {
    this.dataProvider.getTasksByStatus().subscribe({
      next: (response: any) => {
        console.log('Task API Response:', response);

        const taskList = response?.taskList || [];

        this.tasks = taskList.map((task: any) => ({
          taskId: task.taskId,
          title: task.title || '',
          assignedTo: task.assignedTo || '',
          assignedUserName: task.assignedUserName || '',
          taskStatus: task.taskStatus,
        }));
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
        this.tasks = [];
      },
    });
  }

  getTaskCounts(): void {
    // Active Tasks
    this.dataProvider.countOfActiveTask().subscribe({
      next: (response: any) => {
        console.log('Active Task Count:', response);

        this.kpis[0].value = response?.count || 0;
      },

      error: (error) => {
        console.error('Error fetching active task count:', error);

        this.kpis[0].value = 0;
      },
    });

    // Completed Tasks
    this.dataProvider.countOfCompletedTask().subscribe({
      next: (response: any) => {
        console.log('Completed Task Count:', response);

        this.kpis[1].value = response?.count || 0;
      },

      error: (error) => {
        console.error('Error fetching completed task count:', error);

        this.kpis[1].value = 0;
      },
    });

    // Pending Tasks
    this.dataProvider.countOfPendingTask().subscribe({
      next: (response: any) => {
        console.log('Pending Task Count:', response);

        this.kpis[2].value = response?.count || 0;
      },

      error: (error) => {
        console.error('Error fetching pending task count:', error);

        this.kpis[2].value = 0;
      },
    });
  }

  openChangeManagerModal(taskId: any): void {
    console.log('sssssssss' + taskId);
    this.descriptionValidationError = false;

    this.task = {
      taskId: taskId,
    };

    console.log('{ == }' + JSON.stringify(this.task));

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

  onFileOneSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

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
      formData.append('fileName1', this.fileTwo, this.fileTwo.name); // normal file → fileName1 (pdf)
    }

    if (this.fileOne) {
      formData.append('fileName2', this.fileOne, this.fileOne.name); // zip file → fileName2
    }

    this.dataProvider.updateTaskDetails(formData).subscribe({
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
        Swal.fire(
          'Error',
          error?.error?.message || 'Something went wrong while updating the task.',
          'error',
        );
      },
    });
  }

  getTaskDetails(): void {
    const clientId = this.selectedClient ? Number(this.selectedClient) : 0;
    const taskCategoryId = this.selectedTaskCategory ? Number(this.selectedTaskCategory) : 0;
    const assignedTo = this.selectedAssignedTo ? Number(this.selectedAssignedTo) : 0;
    const priority = this.selectedPriority ? Number(this.selectedPriority) : 0;
    const fromDate = this.formatDateForApi(this.fromDate);
    const toDate = this.formatDateForApi(this.toDate);
    const taskStatusId = this.selectedTaskStatus ? Number(this.selectedTaskStatus) : 0;

    this.dataProvider
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
      )
      .subscribe({
        next: (response: any) => {
          console.log('TASK DETAILS RESPONSE:', response);

          this.apiResponseTaskDetails = response;

          this.tasks = response.data || [];
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

  private formatDateForApi(date: Date | null): string {
    if (!date) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getTaskStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return 'Assigned';

      case 2:
        return 'Assignee Closure';

      case 3:
        return 'Re-Open';

      case 4:
        return 'Assignee Re-Closure';

      case 5:
        return 'Assignor Closure';

      default:
        return 'Unknown';
    }
  }

  getTaskStatusClass(status: number): string {
    switch (status) {
      case 1:
        return 'status-assigned';

      case 2:
        return 'status-closure';

      case 3:
        return 'status-reopen';

      case 4:
        return 'status-reclosure';

      case 5:
        return 'status-completed';

      default:
        return 'status-default';
    }
  }
}
