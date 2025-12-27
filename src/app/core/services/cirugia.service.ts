import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugia } from '../models/cirugia';
import { IApiResponse, IPaginatedResponse } from '../models/api-response';
import { IMiembroEquipoMedico } from '../models/miembro-equipo';
import { IQuirofano } from '../models/quirofano';

@Injectable({
  providedIn: 'root',
})
export class CirugiaService extends BaseApiService {
  createCirugia(data: ICirugia) {
    return this.post<IApiResponse<ICirugia>>('/cirugia', data);
  }

  updateCirugia(data: ICirugia) {
    return this.put<IApiResponse<ICirugia>>(`/cirugia/${data.id}`, data);
  }

  getCirugias(page = 0, pageSize = 16) {
    const params = { page: String(page), size: String(pageSize) };
    return this.get<IPaginatedResponse<ICirugia>>('/cirugia', params);
  }

  getCirugiasPorFechas(fechaInicio: string, fechaFin: string) {
    const params = { fechaInicio, fechaFin };
    return this.get<IApiResponse<ICirugia[]>>('/cirugia/por-fechas', params);
  }   

  deleteCirugia(cirugiaId: number) {
    return this.delete<void>(`/cirugia/${cirugiaId}`);
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number) {
    return this.get<IApiResponse<IMiembroEquipoMedico[]>>(`/cirugia/${cirugiaId}/equipo-medico`);
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, cirugiaId: number) {
    return this.post<IApiResponse<IMiembroEquipoMedico[]>>(
      `/cirugia/${cirugiaId}/equipo-medico`,
      equipo
    );
  }

  getTurnosDisponibles(servicioId: number, cantidadProximosDias: number) {
    const params = { servicioId, cantidadProximosDias };
    return this.get<IApiResponse<any>>('/cirugia/horarios-disponibles', params);
  }

  getServicios() {
    return this.get<IApiResponse<any>>('/cirugia/servicios');
  }
}
