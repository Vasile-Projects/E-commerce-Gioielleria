import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { catchError, debounceTime, exhaustMap, groupBy, mergeMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Toast } from 'bootstrap';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { CartItemComponent } from '../../components/cart-item/cart-item';
import { Button } from '../../components/button/button';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-cart-page',
  imports: [CartItemComponent, Button, CurrencyPipe, ConfirmModal],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage implements AfterViewInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly navigation = inject(NavigationService);

  readonly items    = this.cartService.items;
  readonly count    = this.cartService.count;
  readonly total    = this.cartService.total;
  readonly loggedIn = this.authService.isLoggedIn;

  readonly showClearModal = signal(false);
  readonly isClearingCart = signal(false);
  readonly updatingId     = signal<number | null>(null);
  readonly removingId     = signal<number | null>(null);
  readonly cartError      = signal<string | null>(null);

  private readonly qtyTrigger$    = new Subject<{ varianteId: number; qty: number }>();
  private readonly removeTrigger$ = new Subject<number>();
  private readonly clearTrigger$  = new Subject<void>();

  private readonly errorToastRef = viewChild<ElementRef<HTMLElement>>('errorToastEl');
  private errorToast?: Toast;

  constructor() {
    this.qtyTrigger$
      .pipe(
        groupBy(e => e.varianteId),
        mergeMap(group$ => group$.pipe(
          debounceTime(400),
          exhaustMap(({ varianteId, qty }) => {
            this.updatingId.set(varianteId);
            return this.cartService.updateQuantity$(varianteId, qty).pipe(
              catchError(() => {
                this.cartError.set('Errore nell\'aggiornamento della quantità.');
                this.errorToast?.show();
                return of(void 0);
              }),
            );
          }),
        )),
        takeUntilDestroyed(),
      )
      .subscribe(() => { this.updatingId.set(null); });

    this.removeTrigger$
      .pipe(
        exhaustMap(varianteId => {
          this.removingId.set(varianteId);
          return this.cartService.remove$(varianteId).pipe(
            catchError(() => {
              this.cartError.set('Errore nella rimozione dell\'articolo.');
              this.errorToast?.show();
              return of(void 0);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => { this.removingId.set(null); });

    this.clearTrigger$
      .pipe(
        exhaustMap(() => {
          this.isClearingCart.set(true);
          return this.cartService.clear$().pipe(
            catchError(() => {
              this.cartError.set('Errore durante lo svuotamento del carrello.');
              this.errorToast?.show();
              return of(void 0);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.isClearingCart.set(false);
        this.showClearModal.set(false);
      });
  }

  ngAfterViewInit(): void {
    const el = this.errorToastRef()?.nativeElement;
    if (el !== undefined) this.errorToast = new Toast(el, { delay: 3000 });
  }

  onQuantityChanged(varianteId: number, quantity: number): void {
    this.qtyTrigger$.next({ varianteId, qty: quantity });
  }

  onRemove(varianteId: number): void {
    this.removeTrigger$.next(varianteId);
  }

  onRequestClear(): void {
    this.showClearModal.set(true);
  }

  onConfirmClear(): void {
    this.clearTrigger$.next();
  }

  onCancelClear(): void {
    this.showClearModal.set(false);
  }

  onCheckout(): void {
    this.navigation.goToOrder();
  }

  onContinueShopping(): void {
    this.navigation.goToProducts();
  }
}
