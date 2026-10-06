import { Component, signal } from '@angular/core';

import { SESSION_KEYS } from './service/session-storage.keys';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('taskapp');
  private readonly TASK_ROUTES = ['/task-index', '/view-task', '/edit-task', '/add-task'];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,) {
    if (isPlatformBrowser(this.platformId)) {
      this.clearTaskFilterWhenLeavingTaskModule();
    }
  }

  private clearTaskFilterWhenLeavingTaskModule(): void {
    this.router.events.pipe(filter((e): e is NavigationStart => e instanceof NavigationStart)).subscribe((e) => {
      const path = e.url.split('?')[0];
      const goingToTask = this.TASK_ROUTES.some((r) => path.startsWith(r));

      if (!goingToTask) {
        sessionStorage.removeItem(SESSION_KEYS.TASK_MASTER_FILTER);
      }
    });
  }
}
