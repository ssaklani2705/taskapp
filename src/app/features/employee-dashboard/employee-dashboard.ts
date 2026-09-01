import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataProviderService } from '../../service/data-provider.service';


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

}


interface DashboardResponse {

  myTasksToday: number;

  dueThisWeek: number;

  overdue: number;

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

}


interface Task {

  title: string;

  subtitle: string;

  type:
    | 'high'
    | 'medium'
    | 'low'
    | 'progress'
    | 'done';

  progress?: number;

}


interface TaskColumn {

  title: string;

  count: number;

  tasks: Task[];

}



@Component({

  selector: 'app-employee-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ],

  templateUrl: './employee-dashboard.html',

  styleUrl: './employee-dashboard.scss'

})
export class EmployeeDashboard implements OnInit {

  readonly todayTasks = signal(0);


  readonly employeeName =
    signal('Anil Kumar');


  readonly employeeRole =
    signal('Employee');


  readonly checkedInTime =
    signal('09:02');


  readonly stats =
    signal<any[]>([]);


  readonly columns =
    signal<TaskColumn[]>([]);


  constructor(
    private dataProviderService: DataProviderService
  ) {}


  // ======================================================
  // INIT
  // ======================================================
username: string = '';
  ngOnInit(): void {
     this.username = sessionStorage.getItem('username') || 'Society 123';

    this.loadDashboard();

  }


  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  loadDashboard(): void {

    const userId =
      Number(sessionStorage.getItem('userId')) || 1;

    this.dataProviderService
      .getDashboard(userId)
      .subscribe({

        next: (res: DashboardResponse) => {

          console.log(
            'Dashboard response:',
            res
          );


          if (!res) {
            return;
          }

          
          // Today's task count
          this.todayTasks.set(res.myTasksToday);

          // ----------------------------------------------
          // STATISTICS
          // ----------------------------------------------

          this.stats.set([

            {
              label: 'My tasks today',
              value: res.myTasksToday,
              color: 'normal'
            },

            {
              label: 'Due this week',
              value: res.dueThisWeek,
              color: 'normal'
            },

            {
              label: 'Overdue',
              value: res.overdue,
              color: 'danger'
            }

          ]);


          // ----------------------------------------------
          // TASK COLUMNS
          // ----------------------------------------------

          this.columns.set([

            {
              title: 'To do',

              count: res.todo?.count || 0,

              tasks:
                this.mapTasks(
                  res.todo?.tasks || [],
                  'todo'
                )

            },

            {
              title: 'In progress',

              count:
                res.inProgress?.count || 0,

              tasks:
                this.mapTasks(
                  res.inProgress?.tasks || [],
                  'progress'
                )

            },

            {
              title: 'Done',

              count:
                res.done?.count || 0,

              tasks:
                this.mapTasks(
                  res.done?.tasks || [],
                  'done'
                )

            }

          ]);

        },


        error: (error) => {

          console.error(
            'Error loading dashboard:',
            error
          );

        }

      });

  }


  // ======================================================
  // MAP API TASKS
  // ======================================================

  private mapTasks(
    tasks: ApiTask[],
    category: 'todo' | 'progress' | 'done'
  ): Task[] {

    return tasks.map(task => {

      // -----------------------------------------------
      // DONE
      // -----------------------------------------------

      if (category === 'done') {

        return {

          title: task.title,

          subtitle: 'Completed',

          type: 'done'

        };

      }


      // -----------------------------------------------
      // IN PROGRESS
      // -----------------------------------------------

      if (category === 'progress') {

        return {

          title: task.title,

          subtitle:
            `${task.progress || 0}% complete`,

          type: 'progress',

          progress:
            task.progress || 0

        };

      }


      // -----------------------------------------------
      // TODO
      // -----------------------------------------------

      return {

        title: task.title,

        subtitle:
          `Due ${this.formatDate(task.date)} · ${this.formatPriority(task.priority)}`,

        type:
          this.getPriorityType(task.priority)

      };

    });

  }


  // ======================================================
  // PRIORITY TYPE
  // ======================================================

  private getPriorityType(
    priority: string
  ): 'high' | 'medium' | 'low' {

    switch (
      priority?.toUpperCase()
    ) {

      case 'HIGH':
        return 'high';

      case 'MEDIUM':
        return 'medium';

      default:
        return 'low';

    }

  }


  // ======================================================
  // PRIORITY LABEL
  // ======================================================

  private formatPriority(
    priority: string
  ): string {

    if (!priority) {
      return '';
    }

    return priority
      .charAt(0)
      .toUpperCase()
      +
      priority
        .slice(1)
        .toLowerCase();

  }


  // ======================================================
  // DATE FORMAT
  // ======================================================

  private formatDate(
    date: string
  ): string {

    if (!date) {
      return '';
    }

    const taskDate =
      new Date(date);


    return taskDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric'
      }
    );

  }


  // ======================================================
  // CHECK IN
  // ======================================================

  checkIn(): void {

    console.log(
      `Checked in at ${this.checkedInTime()}`
    );

  }


  // ======================================================
  // HELPDESK
  // ======================================================

  raiseHelpdeskTicket(): void {

    console.log(
      'Helpdesk ticket requested'
    );

  }


  // ======================================================
  // LEAVE
  // ======================================================

  applyLeave(): void {

    console.log(
      'Leave application opened'
    );

  }


    // =========================================================
  // GET INITIALS
  // =========================================================

  getInitials(
    name: string
  ): string {

    if (!name) {
      return '';
    }


    const parts =
      name
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }


  // =========================================================
  // GET SHORT NAME
  // =========================================================

  getShortName(
    name: string
  ): string {

    if (!name) {
      return '';
    }


    const parts =
      name
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0];
    }


    const lastName =
      parts[parts.length - 1];


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

    const initials =
      parts
        .slice(0, -1)
        .map(
          part =>
            part
              .charAt(0)
              .toUpperCase()
        )
        .join('.');


    return `${initials}. ${lastName}`;
  }

}
