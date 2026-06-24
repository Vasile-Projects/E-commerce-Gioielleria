import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, retry, shareReplay, tap } from 'rxjs/operators';
import {
  PaginatedResponse,
  ProdottoListItemApi,
  ProdottoDettaglioApi,
  CategoriaApi,
  MaterialeApi,
} from '../models/api.models';
import { mapToProduct, mapToProductDetail, mapToCategory, mapToMaterial } from '../models/mappers';
import { Product, Category, Material } from '../models/ui.models';

import { API_BASE } from '../config/api.config';

export interface ProductFilters {
  categoriaId?: number;
  materialeId?: number;
  inEvidenza?: boolean;
  haSconto?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private categorie$: Observable<Category[]> | null = null;
  private materiali$: Observable<Material[]> | null = null;
  private prodottoCache = new Map<number, Product>();

  getProdotti(
    filters: ProductFilters = {},
    skip = 0,
    limit = 12,
  ): Observable<{ items: Product[]; total: number }> {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (filters.categoriaId !== undefined) {
      params = params.set('categoria_id', filters.categoriaId);
    }
    if (filters.materialeId !== undefined) {
      params = params.set('materiale_id', filters.materialeId);
    }
    if (filters.inEvidenza !== undefined) {
      params = params.set('in_evidenza', filters.inEvidenza);
    }
    if (filters.haSconto !== undefined) {
      params = params.set('ha_sconto', filters.haSconto);
    }

    return this.http
      .get<PaginatedResponse<ProdottoListItemApi>>(`${API_BASE}/prodotti`, { params })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map(res => ({ items: res.items.map(mapToProduct), total: res.total })),
      );
  }

  getProdottoById(id: number): Observable<Product> {
    const cached = this.prodottoCache.get(id);
    if (cached !== undefined) return of(cached);

    return this.http
      .get<ProdottoDettaglioApi>(`${API_BASE}/prodotti/${id}`)
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map(mapToProductDetail),
        tap(product => this.prodottoCache.set(id, product)),
      );
  }

  invalidateProductCache(): void {
    this.prodottoCache.clear();
  }

  getCategorie(): Observable<Category[]> {
    this.categorie$ ??= this.http
      .get<CategoriaApi[]>(`${API_BASE}/categorie`)
      .pipe(retry({ count: 2, delay: 1000 }), map(items => items.map(mapToCategory)), shareReplay(1));
    return this.categorie$;
  }

  getMateriali(): Observable<Material[]> {
    this.materiali$ ??= this.http
      .get<MaterialeApi[]>(`${API_BASE}/materiali`)
      .pipe(retry({ count: 2, delay: 1000 }), map(items => items.map(mapToMaterial)), shareReplay(1));
    return this.materiali$;
  }
}
