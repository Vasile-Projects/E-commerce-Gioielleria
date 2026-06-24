import { Injectable, inject } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AddressService } from './address.service';
import { LoginData } from '../components/login-form/login-form';
import { RegisterData } from '../models/ui.models';

export type AuthFlowResult =
  | { kind: 'navigate' }
  | { kind: 'register'; pendingEmail: string }
  | { kind: 'error'; field: 'email' | 'password' | 'general'; message: string };

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private readonly authService    = inject(AuthService);
  private readonly addressService = inject(AddressService);

  login$(data: LoginData): Observable<AuthFlowResult> {
    return this.authService.login$(data.email, data.password).pipe(
      switchMap(() => this.postAuthFlow$()),
      catchError(err => {
        if (err.status === HttpStatusCode.NotFound) {
          return of({ kind: 'register', pendingEmail: data.email } as const);
        }
        if (err.status === HttpStatusCode.Unauthorized) {
          return of({ kind: 'error', field: 'password', message: 'Password non corretta.' } as const);
        }
        return this.networkError(err);
      }),
    );
  }

  register$(data: RegisterData): Observable<AuthFlowResult> {
    return this.authService.register$(data.firstName, data.lastName, data.email, data.password).pipe(
      switchMap(() => this.postAuthFlow$()),
      switchMap(result => {
        if (result.kind !== 'navigate') return of(result);
        return this.addressService.addAddress$(data.address).pipe(
          map(() => ({ kind: 'navigate' } as const)),
          catchError(() => of({ kind: 'navigate' } as const)),
        );
      }),
      catchError(err => {
        if (err.status === HttpStatusCode.Conflict) {
          return of({ kind: 'error', field: 'email', message: 'Email già registrata.' } as const);
        }
        return this.networkError(err);
      }),
    );
  }

  private postAuthFlow$(): Observable<AuthFlowResult> {
    return this.authService.loadCurrentUser$().pipe(
      map(() => ({ kind: 'navigate' } as const)),
    );
  }

  private networkError(err: { status: number }): Observable<AuthFlowResult> {
    if (err.status === 0) {
      return of({ kind: 'error', field: 'general', message: 'Connessione non disponibile.' } as const);
    }
    return of({ kind: 'error', field: 'general', message: 'Errore imprevisto. Riprova.' } as const);
  }
}
