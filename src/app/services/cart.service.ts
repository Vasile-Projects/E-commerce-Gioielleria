import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CarrelloApi } from '../models/api.models';
import { CartDisplayInfo, CartItem, cartTotal } from '../models/ui.models';
import { mapToCartItem } from '../models/mappers';
import { STORAGE_KEYS } from '../constants/storage-keys';

import { API_BASE } from '../config/api.config';

type CartMode = 'guest' | 'merging' | 'server';

interface GuestCartItem {
  varianteId: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  imageUrl: string | null;
  stockAvailable: number;
}


@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  readonly mode = signal<CartMode>('guest');
  readonly items = signal<CartItem[]>(this.loadGuestItems());
  readonly total = computed(() => cartTotal(this.items()));
  readonly count = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));

  constructor() {
    effect(() => {
      if (this.mode() === 'guest') {
        const guestItems: GuestCartItem[] = this.items().map(i => ({
          varianteId: i.varianteId,
          quantity: i.quantity,
          productName: i.productName,
          unitPrice: i.unitPrice,
          imageUrl: i.imageUrl,
          stockAvailable: i.stockAvailable,
        }));
        localStorage.setItem(STORAGE_KEYS.guestCart, JSON.stringify(guestItems));
      }
    });
  }

  add$(varianteId: number, qty: number, info: CartDisplayInfo): Observable<void> {
    if (this.mode() === 'server') {
      const existing = this.items().find(i => i.varianteId === varianteId);
      const totalQty = existing !== undefined ? existing.quantity + qty : qty;
      return this.http
        .post<void>(`${API_BASE}/carrello/items`, {
          prodotto_variante_id: varianteId,
          quantita: totalQty,
        })
        .pipe(switchMap(() => this.loadCart$()));
    }

    this.items.update(items => {
      const existing = items.find(i => i.varianteId === varianteId);
      if (existing !== undefined) {
        return items.map(i =>
          i.varianteId === varianteId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [
        ...items,
        {
          varianteId,
          quantity: qty,
          productName: info.productName,
          unitPrice: info.unitPrice,
          imageUrl: info.imageUrl,
          stockAvailable: info.stockAvailable,
        },
      ];
    });
    return of(void 0);
  }

  remove$(varianteId: number): Observable<void> {
    if (this.mode() === 'server') {
      return this.http
        .delete<void>(`${API_BASE}/carrello/items/${varianteId}`)
        .pipe(switchMap(() => this.loadCart$()));
    }

    this.items.update(items => items.filter(i => i.varianteId !== varianteId));
    return of(void 0);
  }

  updateQuantity$(varianteId: number, qty: number): Observable<void> {
    if (qty <= 0) {
      return this.remove$(varianteId);
    }

    if (this.mode() === 'server') {
      return this.http
        .post<void>(`${API_BASE}/carrello/items`, {
          prodotto_variante_id: varianteId,
          quantita: qty,
        })
        .pipe(switchMap(() => this.loadCart$()));
    }

    this.items.update(items =>
      items.map(i => i.varianteId === varianteId ? { ...i, quantity: qty } : i),
    );
    return of(void 0);
  }

  clear$(): Observable<void> {
    if (this.mode() === 'server') {
      return this.http.delete<void>(`${API_BASE}/carrello`).pipe(
        map(() => { this.items.set([]); }),
      );
    }

    this.items.set([]);
    return of(void 0);
  }

  loadCart$(): Observable<void> {
    return this.http.get<CarrelloApi>(`${API_BASE}/carrello`).pipe(
      map(res => { this.items.set(res.items.map(mapToCartItem)); }),
    );
  }

  mergeGuestCart$(): Observable<string[]> {
    const guestItems = this.readGuestStorage();

    if (guestItems.length === 0) {
      return of([]);
    }

    return this.http
      .post<CarrelloApi>(`${API_BASE}/carrello/merge`, {
        items: guestItems.map(i => ({ prodotto_variante_id: i.varianteId, quantita: i.quantity })),
      })
      .pipe(
        switchMap(() =>
          this.loadCart$().pipe(
            map(() => {
              localStorage.removeItem(STORAGE_KEYS.guestCart);
              return [] as string[];
            }),
          ),
        ),
      );
  }

  switchToServer(): void {
    this.mode.set('server');
  }

  clearLocal(): void {
    this.items.set([]);
  }

  switchToGuest(): void {
    this.mode.set('guest');
    this.items.set([]);
  }

  private loadGuestItems(): CartItem[] {
    return this.readGuestStorage().map(g => ({
      varianteId: g.varianteId,
      quantity: g.quantity,
      productName: g.productName,
      unitPrice: g.unitPrice,
      imageUrl: g.imageUrl,
      stockAvailable: g.stockAvailable,
    }));
  }

  private readGuestStorage(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.guestCart);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as GuestCartItem[]) : [];
    } catch {
      return [];
    }
  }
}
