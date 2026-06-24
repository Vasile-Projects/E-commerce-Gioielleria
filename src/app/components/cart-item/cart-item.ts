import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartItem as CartItemModel } from '../../models/ui.models';
import { onImageError } from '../../utilities/image-error';

const PLACEHOLDER = '/images/jewelry-placeholder.svg';

@Component({
  selector: 'app-cart-item',
  imports: [CurrencyPipe],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  item     = input.required<CartItemModel>();
  readonly = input<boolean>(false);

  quantityChanged = output<number>();
  removed         = output<void>();

  readonly imageSrc = computed(() => {
    const url = this.item().imageUrl;
    return url !== null ? url : PLACEHOLDER;
  });

  readonly decrementLabel = computed(() => `Diminuisci quantità ${this.item().productName}`);
  readonly incrementLabel = computed(() => `Aumenta quantità ${this.item().productName}`);
  readonly removeLabel    = computed(() => `Rimuovi ${this.item().productName}`);

  onIncrement(): void {
    this.quantityChanged.emit(this.item().quantity + 1);
  }

  onDecrement(): void {
    this.quantityChanged.emit(this.item().quantity - 1);
  }

  protected readonly onImageError = onImageError;
}
