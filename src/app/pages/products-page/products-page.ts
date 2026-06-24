import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ProductFilters } from '../../services/api.service';
import { NavigationService } from '../../services/navigation.service';
import { Category, Material, Product } from '../../models/ui.models';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { FilterSelect } from '../../components/filter-select/filter-select';
import { ProductCard } from '../../components/product-card/product-card';
import { SectionHeader } from '../../components/section-header/section-header';
import { Button } from '../../components/button/button';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products-page',
  imports: [FilterBar, FilterSelect, ProductCard, SectionHeader, Button],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private apiService = inject(ApiService);
  private navigation = inject(NavigationService);

  readonly categoria = input<string>();
  readonly materiale = input<string>();

  readonly activeFilters = computed<ProductFilters>(() => {
    const catId = Number(this.categoria());
    const matId = Number(this.materiale());
    return {
      ...(Number.isFinite(catId) && catId > 0 ? { categoriaId: catId } : {}),
      ...(Number.isFinite(matId) && matId > 0 ? { materialeId: matId } : {}),
    };
  });

  // Paginated product state
  readonly allProducts = signal<Product[]>([]);
  readonly total = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingMore = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);

  readonly hasMore = computed(() => this.allProducts().length < this.total());

  private readonly loadTrigger = new Subject<{ filters: ProductFilters; skip: number }>();

  // Categories and materials — no pagination needed
  readonly categories = rxResource({
    stream: () => this.apiService.getCategorie(),
  });
  readonly materials = rxResource({
    stream: () => this.apiService.getMateriali(),
  });

  readonly displayedCategories = computed<Category[]>(() => this.categories.value() ?? []);
  readonly displayedMaterials = computed<Material[]>(() => this.materials.value() ?? []);
  readonly activeCategoryId = computed<number | null>(() => this.activeFilters().categoriaId ?? null);
  readonly activeMaterialId = computed<number | null>(() => this.activeFilters().materialeId ?? null);

  readonly skeletonItems = [0, 1, 2, 3, 4, 5];

  constructor() {
    // Reset and reload whenever filters change
    effect(() => {
      const filters = this.activeFilters();
      this.allProducts.set([]);
      this.total.set(0);
      this.isLoading.set(true);
      this.isLoadingMore.set(false);
      this.hasError.set(false);
      this.loadTrigger.next({ filters, skip: 0 });
    });

    this.loadTrigger
      .pipe(
        switchMap(({ filters, skip }) =>
          this.apiService.getProdotti(filters, skip, PAGE_SIZE).pipe(
            map(res => ({ items: res.items, total: res.total, skip, error: false })),
            catchError(() => of({ items: [] as Product[], total: 0, skip, error: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ items, total, skip, error }) => {
        if (error) {
          this.hasError.set(true);
        } else if (skip === 0) {
          this.allProducts.set(items);
          this.total.set(total);
        } else {
          this.allProducts.update(prev => [...prev, ...items]);
          this.total.set(total);
        }
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      });
  }

  loadMore(): void {
    if (this.isLoadingMore() || this.isLoading() || !this.hasMore()) return;
    const nextSkip = this.allProducts().length;
    this.isLoadingMore.set(true);
    this.loadTrigger.next({ filters: this.activeFilters(), skip: nextSkip });
  }

  onCategoryChange(category: Category | null): void {
    this.navigation.setProductFilters(category?.id ?? null, null);
  }

  onMaterialChange(material: Material | null): void {
    this.navigation.setProductFilters(this.activeCategoryId(), material?.id ?? null);
  }

  onProductCategoryClick(categoryId: number): void {
    this.navigation.setProductFilters(categoryId, null);
  }

  goToHome(): void {
    this.navigation.goToHome();
  }
}
