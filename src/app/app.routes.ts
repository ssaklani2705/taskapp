import { Routes } from '@angular/router';
import { DepartmentIndexComponent } from './features/department/department-index/department-index';
import { ViewTaskCategoryComponent } from './features/taskcategory/view-task-category/view-task-category';

export const routes: Routes = [

  // ================================
  // AUTH
  // ================================

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  {
    path: 'manager-login',
    loadComponent: () =>
      import('./features/auth/login/manager-login/manager-login')
        .then(m => m.ManagerLogin)
  },


  // ================================
  // MAIN APPLICATION
  // ================================

  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      {
        path: 'employee-dashboard',
        loadComponent: () =>
          import('./features/employee-dashboard/employee-dashboard')
            .then(m => m.EmployeeDashboard)
      },

       {path: 'my-team',loadComponent: () =>import('./features/myteam/my-team/my-team').then(m => m.MyTeam)},
       {path: 'view-team/:userId',loadComponent: () =>import('./features/myteam/view-team/view-team').then(m => m.ViewTeam)},
       {path: 'add-team',loadComponent: () =>import('./features/myteam/add-team/add-team').then(m => m.AddTeam)},
       {path: 'edit-team/:userId',loadComponent: () =>import('./features/myteam/add-team/add-team').then(m => m.AddTeam)},

        //Department Master
       {path: 'department-master',loadComponent: () =>import('./features/department/department-index/department-index').then(m => m.DepartmentIndexComponent)},
       {path: 'view-department/:departmentId',loadComponent: () =>import('./features/department/view-department/view-department').then(m => m.ViewDepartmentComponent)},
       {path: 'add-department',loadComponent: () =>import('./features/department/add-department/add-department').then(m => m.AddDepartmentComponent)},
       {path: 'edit-department/:departmentId',loadComponent: () =>import('./features/department/add-department/add-department').then(m => m.AddDepartmentComponent)},

       //Designation Master
       {path: 'designation-master',loadComponent: () =>import('./features/designation/designation-index/designation-index').then(m => m.DesignationIndexComponent)},
       {path: 'view-designation/:designationId',loadComponent: () =>import('./features/designation/view-designation/view-designation').then(m => m.ViewDesignation)},
       {path: 'add-designation',loadComponent: () =>import('./features/designation/add-designation/add-designation').then(m => m.AddDesignation)},
       {path: 'edit-designation/:designationId',loadComponent: () =>import('./features/designation/add-designation/add-designation').then(m => m.AddDesignation)},
       
        {path: 'task-index',loadComponent: () =>import('./features/task/task-index/task-index').then(m => m.TaskIndex)},

        {path: 'task-category-index',loadComponent: () =>import('./features/taskcategory/task-category-index/task-category-index').then(m => m.IndexTaskCategory)},
        {path: 'add-task-category',loadComponent: () =>import('./features/taskcategory/add-task-category/add-task-category').then(m => m.AddTaskCategoryComponent)},
        {path: 'edit-task-category/:taskCategoryId',loadComponent: () =>import('./features/taskcategory/add-task-category/add-task-category').then(m => m.AddTaskCategoryComponent)},
        {path: 'view-task-category/:taskCategoryId',loadComponent: () =>import('./features/taskcategory/view-task-category/view-task-category').then(m => m.ViewTaskCategoryComponent)},

           { path: 'state-index', loadComponent: () => import('./features/states/state-index/state-index').then(m => m.StateIndex) },
      { path: 'add-state', loadComponent: () => import('./features/states/state-add/state-add').then(m => m.StateAdd) },
      { path: 'edit-state/:stateId', loadComponent: () => import('./features/states/state-add/state-add').then(m => m.StateAdd) },
      { path: 'view-state/:stateId', loadComponent: () => import('./features/states/state-view/state-view').then(m => m.StateView) },


 {
        path: 'client-index',
        loadComponent: () =>
          import('./features/Client/client-index/client-index').then((m) => m.ClientIndex),
      },
      {
        path: 'add-client',
        loadComponent: () =>
          import('./features/Client/add-client/add-client').then((m) => m.AddClient),
      },
      {
        path: 'edit-client/:clientId',
        loadComponent: () =>
          import('./features/Client/add-client/add-client').then((m) => m.AddClient),
      },
      {
        path: 'view-client/:clientId',
        loadComponent: () =>
          import('./features/Client/view-client/view-client').then((m) => m.ViewClient),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
     
    
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },


  // ================================
  // FALLBACK
  // ================================

  {
    path: '**',
    redirectTo: 'login'
  }

];