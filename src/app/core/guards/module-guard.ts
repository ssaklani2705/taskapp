import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const moduleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const moduleId = route.data['moduleId'] as number | undefined;
  const loginTypes = route.data['loginTypes'] as string[] | undefined;

  const loginType = sessionStorage.getItem('loginType') || 'other';
  let modules: any[] = [];
  try { modules = JSON.parse(sessionStorage.getItem('modules') || '[]'); } catch { modules = []; }

  const typeOk = !loginTypes || loginTypes.includes(loginType);
  const moduleOk = moduleId === undefined ||
    modules.some(m => Number(m.moduleId) === moduleId);

  if (typeOk && moduleOk) return true;

  return router.createUrlTree([loginType === 'manager' ? '/dashboard' : '/employee-dashboard']);
};