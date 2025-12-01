import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { HttpParams } from '@angular/common/http';
import { IPaciente } from '../models/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService extends BaseApiService {

    searchPacientes(q: string) {
    return this.get<IPaciente[]>('/paciente', { search: q });
}
}