import { HttpInterceptorFn } from '@angular/common/http';

const API_HOST = 'gioielleria-api.ddzdev.com';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(API_HOST)) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
