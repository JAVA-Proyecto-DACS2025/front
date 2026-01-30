import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from '../services/keycloak.service';

/**
 * Guard para verificar roles específicos
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return new Observable(observer => {
      if (!this.keycloakService.isLoggedIn()) {
        observer.next(this.router.createUrlTree(['/home']));
        observer.complete();
        return;
      }

      // Verificar si tiene admin o personal_medico
      const hasRequiredRole = this.keycloakService.hasAnyRole(['admin', 'personal_medico']);
      
      if (hasRequiredRole) {
        observer.next(true);
      } else {
        observer.next(this.router.createUrlTree(['/home']));
      }
      
      observer.complete();
    });
  }
}

/**
 * Guard específico para admin
 */
@Injectable({
  providedIn: 'root'
})
export class RoleAGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return new Observable(observer => {
      if (!this.keycloakService.isLoggedIn()) {
        observer.next(this.router.createUrlTree(['/home']));
        observer.complete();
        return;
      }

      if (this.keycloakService.hasRole('admin')) {
        observer.next(true);
      } else {
        observer.next(this.router.createUrlTree(['/home']));
      }
      
      observer.complete();
    });
  }
}

/**
 * Guard específico para personal_medico
 */
@Injectable({
  providedIn: 'root'
})
export class RoleBGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return new Observable(observer => {
      if (!this.keycloakService.isLoggedIn()) {
        observer.next(this.router.createUrlTree(['/home']));
        observer.complete();
        return;
      }

      // Personal médico o admin pueden acceder
      if (this.keycloakService.hasAnyRole(['personal_medico', 'admin'])) {
        observer.next(true);
      } else {
        observer.next(this.router.createUrlTree(['/home']));
      }
      
      observer.complete();
    });
  }
}
