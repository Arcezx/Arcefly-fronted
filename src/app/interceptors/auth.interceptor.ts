import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (req.url.startsWith(environment.apiBaseUrl)) {
    const user = authService.currentUser;
    
    const authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(user ? { 'X-User-Email': user.email } : {})
      }
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
          toastr.error('Sesión expirada, por favor inicia sesión nuevamente', 'Error de autenticación');
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};