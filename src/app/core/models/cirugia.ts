import { IPaciente } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugiaResponse {
  id: number ;
  paciente: IPaciente;
  quirofano: IQuirofano;
  servicio: string;
  fecha_hora_inicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

export interface ICirugiaRequest {
  fecha_hora_inicio: string;
  pacienteId: string;
  quirofanoId: string;
  tipo: string;
  anestesia: string;
  prioridad: string;
  servicio: string;
  estado: string;
}

export interface ICirugiaUpdateRequest extends ICirugiaRequest {
  id: number;
}