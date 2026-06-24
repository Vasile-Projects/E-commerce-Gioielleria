import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OrdineListItemApi, OrdineDettaglioApi, PaginatedResponse } from '../models/api.models';
import { Order } from '../models/ui.models';
import { mapToOrder } from '../models/mappers';

import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders$(): Observable<Order[]> {
    const params = new HttpParams().set('limit', 50);
    return this.http
      .get<PaginatedResponse<OrdineListItemApi>>(`${API_BASE}/ordini`, { params })
      .pipe(
        switchMap(res =>
          res.items.length === 0
            ? of([])
            : forkJoin(res.items.map(item => this.getOrderById$(item.id)))
        ),
      );
  }

  getOrderById$(id: number): Observable<Order> {
    return this.http
      .get<OrdineDettaglioApi>(`${API_BASE}/ordini/${id}`)
      .pipe(map(mapToOrder));
  }
}
