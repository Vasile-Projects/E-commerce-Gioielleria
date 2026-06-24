import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  goToCart(): void {
    this.router.navigate(['/carrello']);
  }

  goToHome(): void {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  goToOrder(): void {
    this.router.navigate(['/ordine']);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout'], { replaceUrl: true });
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToProductDetail(id: number): void {
    this.router.navigate(['/products', id]);
  }

  goToOrders(): void {
    this.router.navigate(['/ordini'], { replaceUrl: true });
  }

  setProductFilters(categoriaId: number | null, materialeId?: number | null): void {
    const queryParams: Record<string, number> = {};
    if (categoriaId) queryParams['categoria'] = categoriaId;
    if (materialeId) queryParams['materiale'] = materialeId;
    this.router.navigate(['/products'], { queryParams });
  }
}
