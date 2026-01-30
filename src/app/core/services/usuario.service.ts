import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { IUser } from '../models/user';
import { IApiResponse, IPaginatedResponseES } from '../models/api-response';
import { API_ENDPOINTS } from '../constants/api-endpoints';

/**
 * Interfaz para usuario de Keycloak
 */
export interface IKeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp?: number;
  roles?: string[];
  attributes?: Record<string, string[]>;
}

/**
 * Interfaz para credenciales de Keycloak
 */
export interface IKeycloakCredential {
  type: string;
  value: string;
  temporary: boolean;
}

/**
 * Interfaz para crear usuario en Keycloak
 */
export interface IKeycloakUserCreate {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  credentials: IKeycloakCredential[];
  roles?: string[];
  attributes?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService extends BaseApiService {
  /**
   * Obtiene la lista de usuarios de Keycloak
   */
  getUsuarios(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponseES<IKeycloakUser>>(API_ENDPOINTS.BFF.USER, params);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById(id: string) {
    return this.get<IApiResponse<IKeycloakUser>>(`${API_ENDPOINTS.BFF.USER}/${id}`);
  }

  /**
   * Busca usuarios por término
   */
  searchUsuarios(page = 0, pageSize = 16, search: string) {
    const params = { page: String(page), size: String(pageSize), search };
    return this.get<IPaginatedResponseES<IKeycloakUser>>(API_ENDPOINTS.BFF.USER, params);
  }

  /**
   * Activa o desactiva un usuario
   */
  toggleUsuarioStatus(id: string, enabled: boolean) {
    return this.put<IApiResponse<IKeycloakUser>>(`${API_ENDPOINTS.BFF.USER}/${id}/status`, { enabled });
  }

  /**
   * Crea un nuevo usuario en Keycloak
   */
  createUsuario(userData: IKeycloakUserCreate) {
    return this.post<IApiResponse<IKeycloakUser>>(API_ENDPOINTS.BFF.USER, userData);
  }
}
