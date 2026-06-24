import { Routes } from '@angular/router';
import { cartNotEmptyGuard } from './guards/cart-not-empty.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home-page/home-page').then(m => m.HomePage),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products-page/products-page').then(m => m.ProductsPage),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-details-page/product-details-page').then(m => m.ProductDetailsPage),
  },
  {
    path: 'carrello',
    loadComponent: () =>
      import('./pages/cart-page/cart-page').then(m => m.CartPage),
  },
  {
    path: 'ordine',
    loadComponent: () =>
      import('./pages/order-page/order-page').then(m => m.OrderPage),
  },
  {
    path: 'checkout',
    canActivate: [cartNotEmptyGuard, authGuard],
    loadComponent: () =>
      import('./pages/checkout-page/checkout-page').then(m => m.CheckoutPage),
  },
  {
    path: 'ordini',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders-page/orders-page').then(m => m.OrdersPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
