import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { catchError, concatMap, map, of } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Toast } from 'bootstrap';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { NavigationService } from '../../services/navigation.service';
import { getProductImages } from '../../config/product-images';
import { CartDisplayInfo, ProductVariant, discountPercent } from '../../models/ui.models';
import { ImageGallery } from '../../components/image-gallery/image-gallery';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-product-details-page',
  imports: [ImageGallery, Button, CurrencyPipe, RouterLink],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsPage implements AfterViewInit {
  private readonly apiService = inject(ApiService);
  private readonly cartService = inject(CartService);
  private readonly navigation = inject(NavigationService);

  readonly id = input.required<string>();

  readonly productResource = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) return EMPTY;
      return this.apiService.getProdottoById(numericId);
    },
  });

  readonly categories = rxResource({
    stream: () => this.apiService.getCategorie(),
  });

  readonly materials = rxResource({
    stream: () => this.apiService.getMateriali(),
  });

  readonly categoryWithDescription = computed(() => {
    const p = this.productResource.value();
    const cats = this.categories.value();
    if (p === undefined || p === null || cats === undefined) return null;
    return cats.find(c => c.id === p.categoryId) ?? null;
  });

  readonly materialWithDescription = computed(() => {
    const p = this.productResource.value();
    const mats = this.materials.value();
    if (p === undefined || p === null || mats === undefined) return null;
    return mats.find(m => m.id === p.materialId) ?? null;
  });

  readonly productImages = computed(() => {
    const p = this.productResource.value();
    return p !== undefined && p !== null ? getProductImages(p.id, p.categoryName) : [];
  });

  readonly selectedVariant = signal<ProductVariant | null>(null);
  readonly selectedQuantity = signal(1);
  readonly isAdding = signal(false);
  readonly addError = signal<string | null>(null);

  readonly cartQuantity = computed(() => {
    const v = this.selectedVariant();
    if (v === null) return 0;
    const found = this.cartService.items().find(i => i.varianteId === v.id);
    return found !== undefined ? found.quantity : 0;
  });

  readonly availableStock = computed(() => {
    const v = this.selectedVariant();
    if (v === null) return 0;
    return v.stock - this.cartQuantity();
  });

  readonly displayedAvailableStock = computed(() =>
    Math.max(0, this.availableStock() - this.selectedQuantity()),
  );

  readonly stockMessage = computed<{ text: string; danger: boolean } | null>(() => {
    if (this.selectedVariant() === null && this.productResource.value()?.variants.length !== 1) return null;
    const avail = this.availableStock();
    if (avail <= 0) return { text: 'Non disponibile', danger: true };
    if (avail === 1) return { text: 'Ultimo pezzo disponibile', danger: false };
    const remaining = this.displayedAvailableStock();
    if (remaining === 0) return { text: 'Hai selezionato tutti i pezzi disponibili', danger: false };
    return { text: `${remaining} ${remaining === 1 ? 'pezzo disponibile' : 'pezzi disponibili'}`, danger: false };
  });

  readonly discountBadge = computed(() => {
    const p = this.productResource.value();
    if (p === undefined || p === null || !p.hasDiscount) return 0;
    return discountPercent(p.priceList, p.priceSale);
  });

  readonly canAddToCart = computed(
    () => this.selectedVariant() !== null && this.selectedQuantity() <= this.availableStock() && this.availableStock() > 0,
  );

  readonly canIncrement = computed(() => this.selectedQuantity() < this.availableStock());
  readonly canDecrement = computed(() => this.selectedQuantity() > 1);

  private readonly toastElRef = viewChild<ElementRef<HTMLElement>>('toastEl');
  private toast?: Toast;

  private readonly addTrigger$ = new Subject<void>();

  constructor() {
    effect(
      () => {
        const p = this.productResource.value();
        if (p === undefined || p === null) return;
        if (p.variants.length === 1) {
          this.selectedVariant.set(p.variants[0]);
        } else {
          this.selectedVariant.set(null);
        }
        this.selectedQuantity.set(1);
      },
      { allowSignalWrites: true },
    );

    this.addTrigger$
      .pipe(
        concatMap(() => {
          const p = this.productResource.value();
          const v = this.selectedVariant();
          if (p === undefined || p === null || v === null) return EMPTY;
          this.isAdding.set(true);
          const images = getProductImages(p.id, p.categoryName);
          const info: CartDisplayInfo = {
            productName: p.name,
            unitPrice: p.priceSale,
            imageUrl: images.length > 0 ? images[0] : null,
            stockAvailable: v.stock,
          };
          return this.cartService.add$(v.id, this.selectedQuantity(), info).pipe(
            map(() => true),
            catchError(() => of(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(ok => {
        this.isAdding.set(false);
        this.selectedQuantity.set(1);
        if (ok) {
          this.addError.set(null);
          this.toast?.show();
        } else {
          this.addError.set('Impossibile aggiungere al carrello. Riprova.');
        }
      });
  }

  ngAfterViewInit(): void {
    const el = this.toastElRef()?.nativeElement;
    if (el !== undefined) this.toast = new Toast(el, { delay: 2500 });
  }

  onVariantSelect(variant: ProductVariant): void {
    this.selectedVariant.set(variant);
    this.selectedQuantity.set(1);
  }

  onIncrement(): void {
    if (this.canIncrement()) this.selectedQuantity.update(q => q + 1);
  }

  onDecrement(): void {
    if (this.canDecrement()) this.selectedQuantity.update(q => q - 1);
  }

  onAddToCart(): void {
    this.addTrigger$.next();
  }

  onNavigateBack(): void {
    this.navigation.goToProducts();
  }
}
