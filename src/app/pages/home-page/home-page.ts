import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { NavigationService } from '../../services/navigation.service';
import { Category, Product, discountPercent } from '../../models/ui.models';
import { HeroSection } from '../../components/hero-section/hero-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { ProductCard } from '../../components/product-card/product-card';
import { CategoryTile } from '../../components/category-tile/category-tile';
import { Button } from '../../components/button/button';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-home-page',
  imports: [HeroSection, SectionHeader, ProductCard, CategoryTile, Button],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private apiService = inject(ApiService);
  private navigation = inject(NavigationService);

  // Featured section
  readonly featuredItems = signal<Product[]>([]);
  readonly featuredTotal = signal<number>(0);
  readonly featuredLoading = signal<boolean>(true);
  readonly featuredLoadingMore = signal<boolean>(false);
  readonly featuredError = signal<boolean>(false);
  readonly featuredHasMore = computed(() => this.featuredItems().length < this.featuredTotal());

  private readonly featuredTrigger = new Subject<number>();

  // Discounted section (sorted by discount % ascending on each page merge)
  readonly discountedItems = signal<Product[]>([]);
  readonly discountedTotal = signal<number>(0);
  readonly discountedLoading = signal<boolean>(true);
  readonly discountedLoadingMore = signal<boolean>(false);
  readonly discountedError = signal<boolean>(false);
  readonly discountedHasMore = computed(() => this.discountedItems().length < this.discountedTotal());

  private readonly discountedTrigger = new Subject<number>();

  readonly categories = rxResource({
    stream: () => this.apiService.getCategorie(),
  });

  readonly displayedCategories = computed<Category[]>(() => this.categories.value() ?? []);

  readonly heroImage = `${environment.mediaServerUrl}/media/vz/gioielleria/images/immagini_gioielli/collane/collana1.avif`;
  readonly skeletonItems = [0, 1, 2];

  constructor() {
    this.featuredTrigger
      .pipe(
        switchMap(skip =>
          this.apiService.getProdotti({ inEvidenza: true }, skip, PAGE_SIZE).pipe(
            map(res => ({ items: res.items, total: res.total, skip, error: false })),
            catchError(() => of({ items: [] as Product[], total: 0, skip, error: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ items, total, skip, error }) => {
        if (error) {
          this.featuredError.set(true);
        } else if (skip === 0) {
          this.featuredItems.set(items);
          this.featuredTotal.set(total);
        } else {
          this.featuredItems.update(prev => [...prev, ...items]);
          this.featuredTotal.set(total);
        }
        this.featuredLoading.set(false);
        this.featuredLoadingMore.set(false);
      });

    this.discountedTrigger
      .pipe(
        switchMap(skip =>
          this.apiService.getProdotti({ haSconto: true }, skip, PAGE_SIZE).pipe(
            map(res => ({ items: res.items, total: res.total, skip, error: false })),
            catchError(() => of({ items: [] as Product[], total: 0, skip, error: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ items, total, skip, error }) => {
        if (error) {
          this.discountedError.set(true);
        } else if (skip === 0) {
          this.discountedItems.set(
            [...items].sort(
              (a, b) => discountPercent(a.priceList, a.priceSale) - discountPercent(b.priceList, b.priceSale),
            ),
          );
          this.discountedTotal.set(total);
        } else {
          this.discountedItems.update(prev =>
            [...prev, ...items].sort(
              (a, b) => discountPercent(a.priceList, a.priceSale) - discountPercent(b.priceList, b.priceSale),
            ),
          );
          this.discountedTotal.set(total);
        }
        this.discountedLoading.set(false);
        this.discountedLoadingMore.set(false);
      });
  }

  ngOnInit(): void {
    this.featuredTrigger.next(0);
    this.discountedTrigger.next(0);
  }

  loadMoreFeatured(): void {
    if (this.featuredLoadingMore() || this.featuredLoading() || !this.featuredHasMore()) return;
    this.featuredLoadingMore.set(true);
    this.featuredTrigger.next(this.featuredItems().length);
  }

  loadMoreDiscounted(): void {
    if (this.discountedLoadingMore() || this.discountedLoading() || !this.discountedHasMore()) return;
    this.discountedLoadingMore.set(true);
    this.discountedTrigger.next(this.discountedItems().length);
  }

  onCtaClick(): void {
    this.navigation.goToProducts();
  }

  onCategorySelect(category: Category): void {
    this.navigation.setProductFilters(category.id);
  }

  onProductCategoryClick(categoryId: number): void {
    this.navigation.setProductFilters(categoryId);
  }
}
