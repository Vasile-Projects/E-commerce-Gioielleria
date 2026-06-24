import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { MediaAuthService, SKIP_MEDIA_AUTH } from '../services/media-auth.service';

const MEDIA_HOST = 'media.ddzdev.com';

export const mediaAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes(MEDIA_HOST) || req.context.get(SKIP_MEDIA_AUTH)) {
    return next(req);
  }

  const mediaAuth = inject(MediaAuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status !== HttpStatusCode.Unauthorized) {
        return throwError(() => err);
      }

      mediaAuth.invalidate();
      return mediaAuth.authenticate().pipe(
        switchMap(ok => (ok ? next(req) : throwError(() => err))),
      );
    }),
  );
};
