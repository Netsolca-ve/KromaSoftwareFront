import { Injectable, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly loading = signal(false);
  private activeRequests = 0;
  private hideTimer?: number;

  show(): void {
    this.activeRequests++;
    this.loading.set(true);
    if (this.hideTimer) window.clearTimeout(this.hideTimer);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.hideTimer = window.setTimeout(() => this.loading.set(false), 150);
    }
  }

  track<T>(request$: Observable<T>): Observable<T> {
    this.show();
    return request$.pipe(finalize(() => this.hide()));
  }
}