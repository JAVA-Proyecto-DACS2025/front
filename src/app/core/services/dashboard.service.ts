import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugia } from '../models/cirugia';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IQuirofano } from '../models/quirofano';
import { IIntervencion, ITipoIntervencion } from '../models/intervencion';
import { IEstadisticasGenerales } from '../models/estadisticas-generales';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService {
  getEstadisticasGenerales() {
    return this.get<IApiResponse<IEstadisticasGenerales>>('/dashboard/general');    
  }
}