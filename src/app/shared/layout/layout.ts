import { Component, DestroyRef, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from '../../@core/services/loading.service';
import { UiModalService } from '../../@core/services/ui-modal.service';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-layout',
  styleUrl: './layout.scss',
  templateUrl: './layout.html',
})
export class Layout {
  showProfile = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    readonly loadingService: LoadingService,
    private readonly uiModalService: UiModalService,
  ) {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loadingService.show();
        } else {
          this.loadingService.hide();
        }
      });
  }

  openNewAppointment(): void {
    this.uiModalService.requestNewAppointment();
    if (!this.router.url.startsWith('/home')) this.router.navigate(['/home']);
  }
}