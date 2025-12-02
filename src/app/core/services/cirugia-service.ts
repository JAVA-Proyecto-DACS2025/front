import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ICirugia } from '../models/cirugia';
import { IApiResponse, IPaginatedResponse } from '../../core/models/api-response';
import { IEquipoMedico } from '../models/equipo-medico';

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
  
  deleteCirugia(cirugiaId: number) {
    return this.delete<void>(`/cirugia/${cirugiaId}`);
  }

  getEquipoMedicoByCirugiaId(cirugiaId: number) {
    return this.get<IApiResponse<IEquipoMedico[]>>(`/cirugia/${cirugiaId}/equipo-medico`);
  }

  removeMiembroFromEquipo(id: any, id1: any) {
    return this.delete<IApiResponse>(`/cirugia/${id}/equipo-medico/${id1}`);
  }

  addMiembroToEquipo(id: any, id1: number) {
    return this.post<IApiResponse<IEquipoMedico>>(`/cirugia/${id}/equipo-medico`, { personalId: id1 });
  }

  saveEquipoMedico(equipo: IEquipoMedico) {
    return this.post<IApiResponse<IEquipoMedico>>(`/cirugia/equipo-medico`, equipo);
  }
}
