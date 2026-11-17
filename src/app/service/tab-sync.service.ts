import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

const SESSION_KEYS = [
  'authToken', 'username', 'userId', 'sessionId', 'isAdmin', 'modules',
  'designationName', 'loginType', 'isHod', 'emailId', 'categoryIds',
];

type TabMessage =
  | { type: 'REQUEST_SESSION' }
  | { type: 'SESSION'; data: Record<string, string> }
  | { type: 'LOGIN'; userId: string }
  | { type: 'LOGOUT' };

@Injectable({ providedIn: 'root' })
export class TabSyncService {
  private channel: BroadcastChannel | null = null;
  private waiting: ((ok: boolean) => void) | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    private zone: NgZone,
  ) {
    if (!isPlatformBrowser(platformId) || typeof BroadcastChannel === 'undefined') {
      return; // unsupported browser: tabs simply stay independent, as today
    }
    this.channel = new BroadcastChannel('prospur-cms-auth');
    this.channel.onmessage = (e: MessageEvent<TabMessage>) =>
      this.zone.run(() => this.onMessage(e.data));
  }

  /** New tab: ask the other tabs for the session. Resolves true if one answered. */
  restoreSession(): Promise<boolean> {
    if (sessionStorage.getItem('authToken')) return Promise.resolve(true);
    if (!this.channel) return Promise.resolve(false);

    return new Promise((resolve) => {
      const timer = setTimeout(() => { this.waiting = null; resolve(false); }, 400);
      this.waiting = (ok) => { clearTimeout(timer); this.waiting = null; resolve(ok); };
      this.channel!.postMessage({ type: 'REQUEST_SESSION' } as TabMessage);
    });
  }

  /** Call right after a successful login. */
  announceLogin(userId: string | number): void {
    this.channel?.postMessage({ type: 'LOGIN', userId: String(userId) } as TabMessage);
  }

  /** Call right after logging out. */
  announceLogout(): void {
    this.channel?.postMessage({ type: 'LOGOUT' } as TabMessage);
  }

  private onMessage(msg: TabMessage): void {
    switch (msg.type) {
      case 'REQUEST_SESSION': {
        if (!sessionStorage.getItem('authToken')) return;
        const data: Record<string, string> = {};
        SESSION_KEYS.forEach((k) => {
          const v = sessionStorage.getItem(k);
          if (v !== null) data[k] = v;
        });
        this.channel?.postMessage({ type: 'SESSION', data } as TabMessage);
        break;
      }

      case 'SESSION': {
        if (!this.waiting || sessionStorage.getItem('authToken')) return;
        Object.entries(msg.data).forEach(([k, v]) => sessionStorage.setItem(k, v));
        this.waiting(true);
        break;
      }

      case 'LOGIN': {
        const mine = sessionStorage.getItem('userId');
        if (mine && mine !== msg.userId) this.endLocalSession();   // different user: log this tab out
        break;
      }

      case 'LOGOUT': {
        if (sessionStorage.getItem('authToken')) this.endLocalSession();
        break;
      }
    }
  }

  private endLocalSession(): void {
    const redirect = sessionStorage.getItem('loginType') === 'manager' ? '/manager-login' : '/login';
    SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
    sessionStorage.removeItem('selectedModuleDetail');
    this.router.navigate([redirect]);
  }
}