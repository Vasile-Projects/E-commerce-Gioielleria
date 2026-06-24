import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { EMPTY, Subject } from 'rxjs';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { CheckoutService } from '../../services/checkout.service';
import { NavigationService } from '../../services/navigation.service';
import { Button } from '../../components/button/button';
import { CartItemComponent } from '../../components/cart-item/cart-item';
import { AddressFormComponent } from '../../components/address-form/address-form';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { AddressData, Order, PaymentMethod, addressLabel, formatOrderNumber } from '../../models/ui.models';
import { PAYMENT_OPTIONS } from '../../constants/payment-options';

@Component({
  selector: 'app-checkout-page',
  imports: [Button, CartItemComponent, CurrencyPipe, AddressFormComponent, ConfirmModal],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly cartService     = inject(CartService);
  private readonly addressService  = inject(AddressService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly navigation      = inject(NavigationService);

  readonly items = this.cartService.items;
  readonly count = this.cartService.count;
  readonly total = this.cartService.total;

  readonly addressResource = rxResource({
    stream: () => this.addressService.getAddresses$(),
  });

  readonly addresses = computed(() => {
    const v = this.addressResource.value();
    return v !== undefined ? v : [];
  });

  readonly selectedAddressId = signal<number | null>(null);
  readonly paymentMethod     = signal<PaymentMethod>('carta');
  readonly showAddressForm   = signal(false);
  readonly showConfirmModal  = signal(false);
  readonly isAddingAddress   = signal(false);
  readonly isPlacingOrder    = signal(false);
  readonly checkoutError     = signal<string | null>(null);
  readonly addressError      = signal<string | null>(null);
  readonly placedOrder       = signal<Order | null>(null);

  readonly paymentOptions = PAYMENT_OPTIONS;
  readonly paymentIcons: Record<PaymentMethod, string> = {
    carta:        'bi-credit-card',
    paypal:        'bi-paypal',
    contrassegno: 'bi-cash-coin',
    bonifico:     'bi-bank',
  };

  readonly addressLabel     = addressLabel;
  readonly formatOrderNumber = formatOrderNumber;

  private readonly addAddressTrigger$ = new Subject<AddressData>();
  private readonly checkoutTrigger$   = new Subject<void>();

  constructor() {
    effect(
      () => {
        const list = this.addressResource.value();
        if (list === undefined) return;

        if (list.length === 0) {
          this.showAddressForm.set(true);
          return;
        }

        if (this.selectedAddressId() !== null) return;

        const primary = list.find(a => a.isPrimary);
        if (primary !== undefined) {
          this.selectedAddressId.set(primary.id);
        } else {
          this.selectedAddressId.set(list[0].id);
        }
      },
      { allowSignalWrites: true },
    );

    this.addAddressTrigger$
      .pipe(
        exhaustMap(data => {
          this.isAddingAddress.set(true);
          return this.addressService.addAddress$(data).pipe(
            catchError(() => of(null)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(address => {
        this.isAddingAddress.set(false);
        if (address !== null) {
          this.addressError.set(null);
          this.addressResource.reload();
          this.selectedAddressId.set(address.id);
          this.showAddressForm.set(false);
        } else {
          this.addressError.set('Salvataggio indirizzo fallito. Riprova.');
        }
      });

    this.checkoutTrigger$
      .pipe(
        exhaustMap(() => {
          const id     = this.selectedAddressId();
          const method = this.paymentMethod();
          if (id === null) return EMPTY;
          this.isPlacingOrder.set(true);
          this.checkoutError.set(null);
          return this.checkoutService.placeOrder$({ indirizzoId: id, paymentMethod: method }).pipe(
            switchMap(order => this.cartService.clear$().pipe(
              map(() => order),
              catchError(() => {
                this.cartService.clearLocal();
                return of(order);
              }),
            )),
            catchError(err => {
              const detail: string | null = err.error?.detail ?? err.error?.message ?? null;
              if (err.status === 409) {
                this.checkoutError.set(
                  detail ?? 'Uno o più articoli non sono disponibili nelle quantità richieste.',
                );
              } else {
                this.checkoutError.set(
                  detail ?? 'Errore durante il pagamento. Riprova più tardi.',
                );
              }
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(order => {
        this.isPlacingOrder.set(false);
        this.showConfirmModal.set(false);
        if (order !== null) {
          this.placedOrder.set(order);
        }
      });
  }

  onAddressSelect(id: number): void {
    this.selectedAddressId.set(id);
  }

  onNewAddressSubmitted(data: AddressData): void {
    this.addAddressTrigger$.next(data);
  }

  onShowAddressForm(): void {
    this.showAddressForm.set(true);
  }

  onCancelAddressForm(): void {
    this.showAddressForm.set(false);
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  onConfirm(): void {
    this.showConfirmModal.set(true);
  }

  onConfirmOrder(): void {
    this.checkoutTrigger$.next();
  }

  onCancelOrder(): void {
    this.showConfirmModal.set(false);
  }

  onBackToHome(): void {
    this.navigation.goToHome();
  }

  onBackToOrders(): void {
    this.navigation.goToOrders();
  }
}
