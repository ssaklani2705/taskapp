import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Task {
  title: string;
  subtitle: string;
  type: 'high' | 'medium' | 'low' | 'progress' | 'done';
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
  styleUrl: './employee-dashboard.scss',
})
export class EmployeeDashboard {
  
  readonly employeeName = signal('Anil Kumar');
  readonly employeeRole = signal('Employee');
  readonly checkedInTime = signal('09:02');

  readonly stats = signal([
    {
      label: 'My tasks today',
      value: 6,
      color: 'normal'
    },
    {
      label: 'Due this week',
      value: 14,
      color: 'normal'
    },
    {
      label: 'Overdue',
      value: 1,
      color: 'danger'
    }
  ]);

  readonly columns = signal<TaskColumn[]>([
    {
      title: 'To do',
      count: 3,
      tasks: [
        {
          title: 'Client A — GST filing',
          subtitle: 'Due today · High',
          type: 'high'
        },
        {
          title: 'Renewal document',
          subtitle: 'Due Fri · Medium',
          type: 'medium'
        },
        {
          title: 'Call back — XYZ Ltd',
          subtitle: 'Due Mon · Low',
          type: 'low'
        }
      ]
    },
    {
      title: 'In progress',
      count: 2,
      tasks: [
        {
          title: 'Audit report — Globex',
          subtitle: '60% complete',
          type: 'progress',
          progress: 60
        },
        {
          title: 'Reconcile accounts',
          subtitle: '30% complete',
          type: 'progress',
          progress: 30
        }
      ]
    },
    {
      title: 'Done',
      count: 2,
      tasks: [
        {
          title: 'Email setup',
          subtitle: 'Approved',
          type: 'done'
        },
        {
          title: 'Filing — Feb',
          subtitle: 'Approved',
          type: 'done'
        }
      ]
    }
  ]);

  checkIn(): void {
    console.log(`Checked in at ${this.checkedInTime()}`);
  }

  raiseHelpdeskTicket(): void {
    console.log('Helpdesk ticket requested');
  }

  applyLeave(): void {
    console.log('Leave application opened');
  }
}