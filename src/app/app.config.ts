import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http'; // Agregar withInterceptorsFromDi
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { KeycloakService } from 'keycloak-angular';
import { keycloakInitOptions } from './core/config/keycloak.config';
import { provideNativeDateAdapter } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';

import { routes } from './app.routes';

registerLocaleData(localeEs);

function initializeKeycloak(keycloak: KeycloakService) {
  return () => {
    console.log('Inicializando Keycloak...');
    return keycloak.init(keycloakInitOptions).catch((error) => {
      console.error('Error en Keycloak:', error);
      console.warn('Continuando sin Keycloak por problemas de configuración');
      return Promise.resolve();
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi() // ← ESTO ES LO QUE FALTABA
    ),
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
};
