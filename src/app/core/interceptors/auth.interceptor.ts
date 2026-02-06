import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from '../services/keycloak.service';

/**
 * Interceptor para añadir token de autenticación a las peticiones
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        if (token && !this.isAssetRequest(request.url)) {
          const authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authRequest);
        }
        return next.handle(request);
      })
    );
  }

  /**
   * Verifica si la petición es para un asset estático
   */
  private isAssetRequest(url: string): boolean {
    return url.includes('/assets/') || 
           url.includes('.json') || 
           url.includes('.css') || 
           url.includes('.js') ||
           url.includes('.ico') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.svg');
  }
}
