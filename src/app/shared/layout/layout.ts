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
import { Auth } from '../../@core/services/auth';
import { Userlayout } from './components/userlayout/userlayout';


@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatProgressSpinnerModule,
    Userlayout,
  ],
  selector: 'app-layout',
  styleUrl: './layout.scss',
  templateUrl: './layout.html',
})
export class Layout {
  showProfile = false;
  isDarkMode = localStorage.getItem('theme') === 'dark';
  Auth = inject(Auth);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    readonly loadingService: LoadingService,
    private readonly uiModalService: UiModalService,
  ) {
    this.applyTheme();
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

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  setTheme(isDarkMode: boolean): void {
    this.isDarkMode = isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}