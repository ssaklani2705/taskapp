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

        
  // { path: 'designation-master', component: DesignationIndexComponent,canActivate: [ModulePermissionGuard],data: { moduleId: 3,permission: 'view' } },
  // { path: 'add-designation', component: AddDesignationComponent,canActivate: [ModulePermissionGuard],data: { moduleId: 3,permission: 'add' } },
  // { path: 'edit-designation/:designationId', component: AddDesignationComponent,canActivate: [ModulePermissionGuard], data: { renderMode: 'csr', moduleId: 3,permission: 'edit'  }},
  // { path: 'view-designation/:designationId', component: ViewDesignationComponent,canActivate: [ModulePermissionGuard], data: { renderMode: 'csr', moduleId: 3,permission: 'view' }  },


  // { path: 'department-master', component: DepartmentIndexComponent,canActivate: [ModulePermissionGuard],data: { moduleId: 2,permission: 'view' } },
  // { path: 'add-department', component: AddDepartmentComponent,canActivate: [ModulePermissionGuard],data: { moduleId: 2,permission: 'add' } },
  // { path: 'edit-department/:departmentId', component: AddDepartmentComponent,canActivate: [ModulePermissionGuard], data: { renderMode: 'csr', moduleId: 2,permission: 'edit'  }},
  // { path: 'view-department/:departmentId', component: ViewDepartmentComponent,canActivate: [ModulePermissionGuard], data: { renderMode: 'csr', moduleId: 2,permission: 'view' }  },



      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/clients')
            .then(m => m.Clients)
      },

      // {
      //   path: 'tasks',
      //   loadComponent: () =>
      //     import('./features/tasks/tasks')
      //       .then(m => m.Tasks)
      // },

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