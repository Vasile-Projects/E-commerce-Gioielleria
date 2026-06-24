import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpStatusCode } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SKIP_AUTH_REFRESH } from '../interceptors/auth-refresh.interceptor';

const SKIP_REFRESH_CTX = () => new HttpContext().set(SKIP_AUTH_REFRESH, true);
import { catchError, map, tap } from 'rxjs/operators';
import { UtenteApi } from '../models/api.models';
import { UserProfile } from '../models/ui.models';
import { mapToUserProfile } from '../models/mappers';
import { NavigationService } from './navigation.service';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly navigation = inject(NavigationService);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  login$(email: string, password: string): Observable<void> {
    return this.http.post<void>(`${API_BASE}/auth/login`, { email, password }, { context: SKIP_REFRESH_CTX() });
  }

  register$(nome: string, cognome: string, email: string, password: string): Observable<void> {
    return this.http.post<void>(`${API_BASE}/auth/registra`, { nome, cognome, email, password }, { context: SKIP_REFRESH_CTX() });
  }

  logout$(): Observable<void> {
    return this.http.post<void>(`${API_BASE}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      }),
    );
  }

  loadCurrentUser$(): Observable<UserProfile | null> {
    const ctx = new HttpContext().set(SKIP_AUTH_REFRESH, true);
    return this.http.get<UtenteApi>(`${API_BASE}/auth/me`, { context: ctx }).pipe(
      map(mapToUserProfile),
      tap(profile => this.currentUser.set(profile)),
      catchError(err => {
        if (err.status === HttpStatusCode.Unauthorized || err.status === 0) {
          return of(null);
        }
        return of(null);
      }),
    );
  }

  clearSession(): void {
    this.currentUser.set(null);
  }

  handleSessionExpired(): void {
    this.clearSession();
    this.navigation.goToOrder();
  }
}
