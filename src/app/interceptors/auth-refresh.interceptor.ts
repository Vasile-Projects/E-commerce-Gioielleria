import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpInterceptorFn,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { API_BASE } from '../config/api.config';

export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
class AuthRefreshState {
  isRefreshing = false;
  subject = new Subject<boolean>();
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH_REFRESH)) {
    return next(req);
  }

  const state = inject(AuthRefreshState);
  const http = inject(HttpClient);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status !== HttpStatusCode.Unauthorized) {
        return throwError(() => err);
      }

      if (state.isRefreshing) {
        return state.subject.pipe(
          take(1),
          switchMap(() => next(req)),
        );
      }

      state.isRefreshing = true;
      state.subject.next(false);

      return http
        .post<void>(`${API_BASE}/auth/refresh`, {}, {
          context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
        })
        .pipe(
          switchMap(() => {
            state.isRefreshing = false;
            state.subject.next(true);
            return next(req);
          }),
          catchError(refreshErr => {
            state.isRefreshing = false;
            state.subject.error(refreshErr);
            state.subject = new Subject<boolean>();
            auth.handleSessionExpired();
            return throwError(() => refreshErr);
          }),
        );
    }),
  );
};
