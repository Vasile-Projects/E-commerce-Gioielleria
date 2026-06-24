import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, exhaustMap, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { AuthFlowService } from '../../services/auth-flow.service';
import { NavigationService } from '../../services/navigation.service';
import { LoginFormComponent, LoginData } from '../../components/login-form/login-form';
import { RegisterFormComponent } from '../../components/register-form/register-form';
import { RegisterData } from '../../models/ui.models';

type OrderStep =
  | { kind: 'login' }
  | { kind: 'register'; pendingEmail: string };

@Component({
  selector: 'app-order-page',
  imports: [LoginFormComponent, RegisterFormComponent],
  templateUrl: './order-page.html',
  styleUrl: './order-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPage {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private authFlow    = inject(AuthFlowService);
  private navigation  = inject(NavigationService);

  readonly pageTitle = computed(() =>
    this.cartService.count() > 0 ? 'Completa il tuo ordine' : 'Accedi al tuo account'
  );

  readonly step                 = signal<OrderStep>({ kind: 'login' });
  readonly loginError           = signal<string | null>(null);
  readonly registerEmailError   = signal<string | null>(null);
  readonly registerGeneralError = signal<string | null>(null);
  readonly isLoading            = signal(false);

  readonly pendingEmail = computed(() => {
    const s = this.step();
    return s.kind === 'register' ? s.pendingEmail : '';
  });

  private readonly loginSubmit$    = new Subject<LoginData>();
  private readonly registerSubmit$ = new Subject<RegisterData>();

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.goAfterAuth();
      return;
    }

    this.loginSubmit$.pipe(
      exhaustMap(data => this.authFlow.login$(data).pipe(
        switchMap(result => {
          if (result.kind !== 'navigate') return of(result);
          this.cartService.switchToServer();
          return this.cartService.mergeGuestCart$().pipe(
            catchError(() => of([])),
            switchMap(() => of(result)),
          );
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(result => {
      this.isLoading.set(false);
      if (result.kind === 'navigate') {
        this.goAfterAuth();
      } else if (result.kind === 'register') {
        this.step.set({ kind: 'register', pendingEmail: result.pendingEmail });
      } else {
        this.loginError.set(result.message);
      }
    });

    this.registerSubmit$.pipe(
      exhaustMap(data => this.authFlow.register$(data).pipe(
        switchMap(result => {
          if (result.kind !== 'navigate') return of(result);
          this.cartService.switchToServer();
          return this.cartService.mergeGuestCart$().pipe(
            catchError(() => of([])),
            switchMap(() => of(result)),
          );
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(result => {
      this.isLoading.set(false);
      if (result.kind === 'navigate') {
        this.goAfterAuth();
      } else if (result.kind === 'error') {
        if (result.field === 'email') {
          this.registerEmailError.set(result.message);
        } else {
          this.registerGeneralError.set(result.message);
        }
      }
    });
  }

  onLoginSubmitted(data: LoginData): void {
    this.loginError.set(null);
    this.isLoading.set(true);
    this.loginSubmit$.next(data);
  }

  onRegisterSubmitted(data: RegisterData): void {
    this.registerEmailError.set(null);
    this.registerGeneralError.set(null);
    this.isLoading.set(true);
    this.registerSubmit$.next(data);
  }

  onBackToCart(): void {
    this.navigation.goToCart();
  }

  onRegisterDirect(): void {
    this.step.set({ kind: 'register', pendingEmail: '' });
    this.loginError.set(null);
    this.registerEmailError.set(null);
    this.registerGeneralError.set(null);
  }

  onBackToLogin(): void {
    this.step.set({ kind: 'login' });
    this.loginError.set(null);
    this.registerEmailError.set(null);
    this.registerGeneralError.set(null);
  }

  private goAfterAuth(): void {
    if (this.cartService.count() > 0) {
      this.navigation.goToCheckout();
    } else {
      this.navigation.goToOrders();
    }
  }
}
