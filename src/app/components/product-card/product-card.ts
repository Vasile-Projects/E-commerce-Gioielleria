import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, discountPercent } from '../../models/ui.models';
import { onImageError } from '../../utilities/image-error';
import { getProductImages } from '../../config/product-images';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();

  categoryClick = output<number>();

  readonly thumbnail = computed(() => {
    const p = this.product();
    return getProductImages(p.id, p.categoryName)[0];
  });

  readonly discountBadge = computed(() => {
    const p = this.product();
    return p.hasDiscount ? discountPercent(p.priceList, p.priceSale) : 0;
  });

  protected readonly onImageError = onImageError;

  onCategoryClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoryClick.emit(this.product().categoryId);
  }
}
