import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OrdineDettaglioApi } from '../models/api.models';
import { Order, PaymentMethod } from '../models/ui.models';
import { mapToOrder } from '../models/mappers';
import { ApiService } from './api.service';

import { API_BASE } from '../config/api.config';

export interface CheckoutPayload {
  indirizzoId: number;
  paymentMethod: PaymentMethod;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  placeOrder$(payload: CheckoutPayload): Observable<Order> {
    return this.http
      .post<OrdineDettaglioApi>(`${API_BASE}/ordini`, {
        indirizzo_id: payload.indirizzoId,
        metodo_pagamento: payload.paymentMethod,
      })
      .pipe(
        map(mapToOrder),
        tap(() => this.apiService.invalidateProductCache()),
      );
  }
}
