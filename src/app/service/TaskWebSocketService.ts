import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TaskWebSocketService {
  private stompClient!: Client;
  private connected$ = new BehaviorSubject<boolean>(false);

  connect(): void {
    if (this.stompClient?.active) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:9091/taskapp/ws'),
      reconnectDelay: 5000,
      debug: (message: string) => console.log(message),
    });

    this.stompClient.onConnect = () => this.connected$.next(true);
    this.stompClient.onWebSocketClose = () => this.connected$.next(false);
    this.stompClient.onStompError = (frame) => console.error('STOMP error', frame);

    this.stompClient.activate();
  }

  /** Returns an Observable of notes. Unsubscribing from it cleans up the STOMP subscription. */
  watchTaskNotes(taskId: number): Observable<any> {
    return new Observable((observer) => {
      let stompSub: StompSubscription | null = null;

      // wait until connected (works for reconnects too)
      const connSub = this.connected$.pipe(filter((c) => c)).subscribe(() => {
        stompSub?.unsubscribe();
        stompSub = this.stompClient.subscribe(`/topic/task-notes/${taskId}`, (message: IMessage) => {
          if (message.body) {
            observer.next(JSON.parse(message.body));
          }
        });
      });

      // teardown
      return () => {
        connSub.unsubscribe();
        stompSub?.unsubscribe();
      };
    });
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connected$.next(false);
    }
  }
}