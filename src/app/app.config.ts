import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './interceptors/credential.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService } from 'primeng/api';

export const PRIMENG_PRESET = {
  ...Aura,
  semantic: {
    ...Aura.semantic,
    primary: {
      50: '{purple.50}',
      100: '{purple.100}',
      200: '{purple.200}',
      300: '{purple.300}',
      400: '{purple.400}',
      500: '{purple.500}',
      600: '{purple.600}',
      700: '{purple.700}',
      800: '{purple.800}',
      900: '{purple.900}',
      950: '{purple.950}'
    }
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    providePrimeNG({ theme: { preset: PRIMENG_PRESET, options: { darkModeSelector: false } } }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideHotToastConfig(),
    provideAnimationsAsync(),
    ConfirmationService
  ]
};
