import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IndirizzoApi } from '../models/api.models';
import { Address, AddressData } from '../models/ui.models';
import { mapToAddress } from '../models/mappers';

import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);

  getAddresses$(): Observable<Address[]> {
    return this.http
      .get<IndirizzoApi[]>(`${API_BASE}/indirizzi`)
      .pipe(map(items => items.map(mapToAddress)));
  }

  addAddress$(data: AddressData): Observable<Address> {
    return this.http
      .post<IndirizzoApi>(`${API_BASE}/indirizzi`, {
        via:       data.street,
        citta:     data.city,
        cap:       data.postalCode,
        provincia: data.province,
      })
      .pipe(map(mapToAddress));
  }

  updateAddress$(id: number, data: Partial<AddressData>): Observable<Address> {
    const body: Record<string, string> = {};
    if (data.street !== undefined)     body['via']       = data.street;
    if (data.city !== undefined)       body['citta']     = data.city;
    if (data.postalCode !== undefined) body['cap']       = data.postalCode;
    if (data.province !== undefined)   body['provincia'] = data.province;

    return this.http
      .patch<IndirizzoApi>(`${API_BASE}/indirizzi/${id}`, body)
      .pipe(map(mapToAddress));
  }

  setPrimary$(id: number): Observable<void> {
    return this.http.patch<void>(`${API_BASE}/indirizzi/${id}/predefinito`, {});
  }

  deleteAddress$(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/indirizzi/${id}`);
  }
}
