import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // Ahora usa la función interceptor
    ),
    provideAnimations(),
    provideLottieOptions({ 
      player: () => player 
    }),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      toastClass: 'custom-toast',
      iconClasses: {
        success: 'toast-success-icon',
        error: 'toast-error-icon',
        info: 'toast-info-icon',
        warning: 'toast-warning-icon'
      },
    }),
  ],
};