import { ApplicationConfig, LOCALE_ID, inject, provideBrowserGlobalErrorListeners, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { lastValueFrom, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { authRefreshInterceptor } from './interceptors/auth-refresh.interceptor';
import { mediaAuthInterceptor } from './interceptors/media-auth.interceptor';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { MediaAuthService } from './services/media-auth.service';

registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([credentialsInterceptor, authRefreshInterceptor, mediaAuthInterceptor])),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules), withViewTransitions()),
    { provide: LOCALE_ID, useValue: 'it' },
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      const cart = inject(CartService);
      const mediaAuth = inject(MediaAuthService);
      return lastValueFrom(
        forkJoin([
          auth.loadCurrentUser$().pipe(
            switchMap(user => {
              if (user !== null) {
                cart.switchToServer();
                return cart.loadCart$().pipe(map(() => void 0));
              }
              return of(null);
            }),
          ),
          mediaAuth.authenticate(),
        ]).pipe(
          timeout(5000),
          catchError(() => of(null)),
        ),
      );
    }),
  ],
};
