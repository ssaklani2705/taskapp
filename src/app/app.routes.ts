import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { moduleGuard } from './core/guards/module-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'manager-login',
    loadComponent: () => import('./features/auth/login/manager-login/manager-login').then(m => m.ManagerLogin)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      // Dashboards (one per login type)
      {
        path: 'dashboard',
        canActivate: [moduleGuard], data: { loginTypes: ['manager'] },
        loadComponent: () => import('./features/manager-dashboard/manager-dashboard').then(m => m.ManagerDashboard)
      },
      {
        path: 'employee-dashboard',
        canActivate: [moduleGuard], data: { loginTypes: ['other'] },
        loadComponent: () => import('./features/employee-dashboard/employee-dashboard').then(m => m.EmployeeDashboard)
      },

      // 1 - User Management (employee login only)
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 1, loginTypes: ['other'] },
        children: [
          { path: 'user-management-index', loadComponent: () => import('./features/myteam/my-team/my-team').then(m => m.MyTeam) },
          { path: 'view-user-management/:userId', loadComponent: () => import('./features/myteam/view-team/view-team').then(m => m.ViewTeam) },
          { path: 'add-user-management', loadComponent: () => import('./features/myteam/add-team/add-team').then(m => m.AddTeam) },
          { path: 'edit-user-management/:userId', loadComponent: () => import('./features/myteam/add-team/add-team').then(m => m.AddTeam) },
        ]
      },

      // 2 - Department Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 2, loginTypes: ['other'] },
        children: [
          { path: 'department-master', loadComponent: () => import('./features/department/department-index/department-index').then(m => m.DepartmentIndexComponent) },
          { path: 'view-department/:departmentId', loadComponent: () => import('./features/department/view-department/view-department').then(m => m.ViewDepartmentComponent) },
          { path: 'add-department', loadComponent: () => import('./features/department/add-department/add-department').then(m => m.AddDepartmentComponent) },
          { path: 'edit-department/:departmentId', loadComponent: () => import('./features/department/add-department/add-department').then(m => m.AddDepartmentComponent) },
        ]
      },

      // 3 - Designation Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 3, loginTypes: ['other'] },
        children: [
          { path: 'designation-master', loadComponent: () => import('./features/designation/designation-index/designation-index').then(m => m.DesignationIndexComponent) },
          { path: 'view-designation/:designationId', loadComponent: () => import('./features/designation/view-designation/view-designation').then(m => m.ViewDesignation) },
          { path: 'add-designation', loadComponent: () => import('./features/designation/add-designation/add-designation').then(m => m.AddDesignation) },
          { path: 'edit-designation/:designationId', loadComponent: () => import('./features/designation/add-designation/add-designation').then(m => m.AddDesignation) },
        ]
      },

      // 10 - Tasks (both login types)
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 10 },
        children: [
          { path: 'task-index', loadComponent: () => import('./features/task/task-index/task-index').then(m => m.TaskIndex) },
          { path: 'add-task', loadComponent: () => import('./features/task/add-index/add-index').then(m => m.AddIndexComponent) },
          { path: 'edit-task/:taskId', loadComponent: () => import('./features/task/add-index/add-index').then(m => m.AddIndexComponent) },
          { path: 'view-task/:taskId', loadComponent: () => import('./features/task/view-index/view-index').then(m => m.ViewIndex) },
        ]
      },

      // 5 - Task Category Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 5, loginTypes: ['other'] },
        children: [
          { path: 'task-category-index', loadComponent: () => import('./features/taskcategory/task-category-index/task-category-index').then(m => m.IndexTaskCategory) },
          { path: 'add-task-category', loadComponent: () => import('./features/taskcategory/add-task-category/add-task-category').then(m => m.AddTaskCategoryComponent) },
          { path: 'edit-task-category/:taskCategoryId', loadComponent: () => import('./features/taskcategory/add-task-category/add-task-category').then(m => m.AddTaskCategoryComponent) },
          { path: 'view-task-category/:taskCategoryId', loadComponent: () => import('./features/taskcategory/view-task-category/view-task-category').then(m => m.ViewTaskCategoryComponent) },
        ]
      },

      // 4 - State Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 4, loginTypes: ['other'] },
        children: [
          { path: 'state-index', loadComponent: () => import('./features/states/state-index/state-index').then(m => m.StateIndex) },
          { path: 'add-state', loadComponent: () => import('./features/states/state-add/state-add').then(m => m.StateAdd) },
          { path: 'edit-state/:stateId', loadComponent: () => import('./features/states/state-add/state-add').then(m => m.StateAdd) },
          { path: 'view-state/:stateId', loadComponent: () => import('./features/states/state-view/state-view').then(m => m.StateView) },
        ]
      },

      // 8 - Client Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 8, loginTypes: ['other'] },
        children: [
          { path: 'client-index', loadComponent: () => import('./features/Client/client-index/client-index').then(m => m.ClientIndex) },
          { path: 'add-client', loadComponent: () => import('./features/Client/add-client/add-client').then(m => m.AddClient) },
          { path: 'edit-client/:clientId', loadComponent: () => import('./features/Client/add-client/add-client').then(m => m.AddClient) },
          { path: 'view-client/:clientId', loadComponent: () => import('./features/Client/view-client/view-client').then(m => m.ViewClient) },
        ]
      },

      // 11 - Recurring Master (both login types)
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 11 },
        children: [
          { path: 'recurring-index', loadComponent: () => import('./features/Recurring/recurring-index/recurring-index').then(m => m.RecurringIndex) },
          { path: 'add-recurring', loadComponent: () => import('./features/Recurring/add-recurring/add-recurring').then(m => m.AddRecurring) },
          { path: 'edit-recurring/:recurringId', loadComponent: () => import('./features/Recurring/add-recurring/add-recurring').then(m => m.AddRecurring) },
          { path: 'view-recurring/:recurringId', loadComponent: () => import('./features/Recurring/view-recurring/view-recurring').then(m => m.ViewRecurring) },
        ]
      },

      // 6 - Access Report
      {
        path: 'access-report', canActivate: [moduleGuard], data: { moduleId: 6, loginTypes: ['other'] },
        loadComponent: () => import('./reports/access/access-report/access-report').then(m => m.AccessReportComponent)
      },
      // 7 - Mail Log Report
      {
        path: 'mail-log-report', canActivate: [moduleGuard], data: { moduleId: 7, loginTypes: ['other'] },
        loadComponent: () => import('./reports/maillog/mail-log-report/mail-log-report').then(m => m.MailLogReportComponent)
      },

      {
        path: 'workload-report', canActivate: [moduleGuard], data: { moduleId: 10 },
        loadComponent: () => import('./reports/workload-report/workload-report').then(m => m.WorkloadReport)
      },

      // 9 - Plan Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 9, loginTypes: ['other'] },
        children: [
          { path: 'plan-index', loadComponent: () => import('./features/plan/plan-index/plan-index').then(m => m.PlanIndex) },
          { path: 'add-plan', loadComponent: () => import('./features/plan/plan-add/plan-add').then(m => m.PlanAdd) },
          { path: 'edit-plan/:planId', loadComponent: () => import('./features/plan/plan-add/plan-add').then(m => m.PlanAdd) },
          { path: 'view-plan/:planId', loadComponent: () => import('./features/plan/plan-view/plan-view').then(m => m.PlanView) },
        ]
      },

      // 12 - Holiday Master
      {
        path: '', canActivate: [moduleGuard], data: { moduleId: 12, loginTypes: ['other'] },
        children: [
          { path: 'hodiday-index', loadComponent: () => import('./features/holiday/holiday-index/holiday-index').then(m => m.HolidayIndexComponent) },
          { path: 'add-holiday', loadComponent: () => import('./features/holiday/add-holiday/add-holiday').then(m => m.AddHolidayComponent) },
          { path: 'edit-holiday/:holidayId', loadComponent: () => import('./features/holiday/add-holiday/add-holiday').then(m => m.AddHolidayComponent) },
          { path: 'view-holiday/:holidayId', loadComponent: () => import('./features/holiday/view-holiday/view-holiday').then(m => m.ViewHolidayComponent) },
        ]
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];