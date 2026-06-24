import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const SKIP_MEDIA_AUTH = new HttpContextToken<boolean>(() => false);

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class MediaAuthService {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(false);
  private authExpiry = 0;

  private isAuthenticating = false;
  private authSubject = new Subject<boolean>();

  authenticate(): Observable<boolean> {
    if (this.isAuthenticated() && Date.now() < this.authExpiry) {
      return of(true);
    }

    if (this.isAuthenticating) {
      return this.authSubject.pipe(take(1));
    }

    this.isAuthenticating = true;

    const headers = new HttpHeaders({ 'X-API-Key': environment.mediaApiKey });
    return this.http
      .post<{ ok: boolean }>(`${environment.mediaServerUrl}/auth`, {}, {
        headers,
        withCredentials: true,
        context: new HttpContext().set(SKIP_MEDIA_AUTH, true),
      })
      .pipe(
        tap(() => {
          this.isAuthenticated.set(true);
          this.authExpiry = Date.now() + EIGHT_HOURS_MS;
          this.isAuthenticating = false;
          this.authSubject.next(true);
        }),
        map(() => true),
        catchError(() => {
          this.isAuthenticated.set(false);
          this.isAuthenticating = false;
          this.authSubject.next(false);
          this.authSubject = new Subject<boolean>();
          return of(false);
        }),
      );
  }

  invalidate(): void {
    this.isAuthenticated.set(false);
    this.authExpiry = 0;
  }
}
