import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

interface Task {
  task: string;
  owner: string;
  status: string;
  statusClass: string;
}

interface Approval {
  title: string;
  owner: string;
}
@Component({
  selector: 'app-employee-dashboard',
 standalone: true,
 imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.scss',
})
export class EmployeeDashboard {
  username: string = '';

   ngOnInit(): void {
    this.username =
      sessionStorage.getItem('username') || 'Society 123';
  }

    kpis = [
    {
      title: 'Team tasks',
      value: 86,
      icon: 'task_alt',
      className: 'blue',
      change: '+8 this week'
    },
    {
      title: 'Pending approval',
      value: 7,
      icon: 'pending_actions',
      className: 'orange',
      change: '3 due today'
    },
    {
      title: 'SLA at risk',
      value: 3,
      icon: 'warning',
      className: 'red',
      change: '1 escalated'
    },
    {
      title: 'On-time %',
      value: 92,
      icon: 'check_circle',
      className: 'green',
      change: '+4% this month'
    }
  ];

  tasks: Task[] = [
    {
      task: 'GST filing — ACME',
      owner: 'Anil',
      status: 'In progress',
      statusClass: 'progress'
    },
    {
      task: 'Audit report — Globex',
      owner: 'Priya',
      status: 'Submitted',
      statusClass: 'submitted'
    },
    {
      task: 'Reconcile A/C — ACME',
      owner: 'Anil',
      status: 'Overdue',
      statusClass: 'overdue'
    },
    {
      task: 'Renewal — Initech',
      owner: 'Karan',
      status: 'To do',
      statusClass: 'todo'
    },
    {
      task: 'Tax comp — Hooli',
      owner: 'Meera',
      status: 'In progress',
      statusClass: 'progress'
    },
    {
      task: 'Filing review — ACME',
      owner: 'Anil',
      status: 'Approved',
      statusClass: 'approved'
    }
  ];

  approvals: Approval[] = [
    {
      title: 'Q2 report',
      owner: 'Anil'
    },
    {
      title: 'Client audit',
      owner: 'Priya'
    }
  ];

  approve(item: Approval): void {
    console.log('Approved:', item);
  }

  goBack(): void {
    console.log('Back clicked');
  }

}