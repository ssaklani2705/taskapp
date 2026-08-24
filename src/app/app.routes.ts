import { Routes } from '@angular/router';

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
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/clients')
            .then(m => m.Clients)
      },

      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/tasks')
            .then(m => m.Tasks)
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