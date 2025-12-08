import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { HttpParams } from '@angular/common/http';
import { IPaciente } from '../models/paciente';
import { IPacienteExterno } from '../models/paciente-externo';

@Injectable({
  providedIn: 'root',
})
export class PacienteService extends BaseApiService {
  searchPacientes(q: string) {
    return this.get<IPaciente[]>(API_ENDPOINTS.BFF.PACIENTE, { search: q });
  }

  // Se utiliza una api que genera datos de pacientes externos aleatorios
  getPacientesExternos(cantidad: number): Observable<IPacienteExterno[]> {
    return this.get<IPacienteExterno[]>(
      API_ENDPOINTS.BFF.PACIENTES_EXTERNOS,
      { cantidad }
    );
  }
}
