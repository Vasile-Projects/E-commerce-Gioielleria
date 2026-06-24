import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, exhaustMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ConfirmModal],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly navigation = inject(NavigationService);

  readonly cartCount = this.cartService.count;
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly userDisplayName = computed(() => {
    const user = this.authService.currentUser();
    return user !== null ? `${user.firstName} ${user.lastName}` : '';
  });

  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly showLogoutModal = signal(false);
  readonly userDropdownOpen = signal(false);
  readonly isLoggingOut = signal(false);

  private readonly isHeroPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects === '/'),
    ),
    { initialValue: this.router.url === '/' },
  );

  readonly isTransparent = computed(() => this.isHeroPage() && !this.scrolled());

  private readonly logoutTrigger$ = new Subject<void>();

  constructor() {
    this.logoutTrigger$
      .pipe(
        exhaustMap(() => {
          this.isLoggingOut.set(true);
          return this.authService.logout$().pipe(
            catchError(() => of(void 0)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.isLoggingOut.set(false);
        this.showLogoutModal.set(false);
        this.cartService.switchToGuest();
        this.navigation.goToHome();
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-wrapper')) {
      this.userDropdownOpen.set(false);
    }
  }

  toggleUserDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.userDropdownOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  requestLogout(): void {
    this.userDropdownOpen.set(false);
    this.showLogoutModal.set(true);
    this.closeMobileMenu();
  }

  logout(): void {
    this.logoutTrigger$.next();
  }
}
