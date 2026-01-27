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
    return this.post<IApiResponse<ICirugia>>('/cirugias', data);
  }

  updateCirugia(data: ICirugia) {
    return this.put<IApiResponse<ICirugia>>(`/cirugias/${data.id}`, data);
  }

  getCirugias(page = 0, pageSize = 16) {
    const params = { pagina: String(page), tamano: String(pageSize) };
    return this.get<IPaginatedResponse<ICirugia>>('/cirugias', params);
  }

  getCirugiasPorFechas(fechaInicio: string, fechaFin: string, pagina=0, tamano=1000) {
    const params = { fechaInicio, fechaFin, pagina: String(pagina), tamano: String(tamano) };
    return this.get<IApiResponse<ICirugia[]>>('/cirugias', params);
  }   

  deleteCirugia(cirugiaId: number) {
    return this.delete<void>(`/cirugias/${cirugiaId}`);
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number) {
    return this.get<IApiResponse<IMiembroEquipoMedico[]>>(`/cirugias/${cirugiaId}/equipo-medico`);
  }

  saveEquipoMedico(equipo: IMiembroEquipoMedico, cirugiaId: number) {
    return this.post<IApiResponse<IMiembroEquipoMedico[]>>(
      `/cirugias/${cirugiaId}/equipo-medico`,
      equipo
    );
  }

  getTurnosDisponibles(quirofanoId: number, fechaInicio: string, fechaFin: string, pagina: number, tamano: number, estado: string = '') {
    const params = { fechaInicio, fechaFin, pagina, tamano, quirofanoId, estado };
    return this.get<IApiResponse<any>>('/turnos', params);
  }

  getServicios() {
    return this.get<IApiResponse<any>>('/cirugias/servicios');
  }
}
