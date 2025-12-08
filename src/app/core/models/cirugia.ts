import { IPaciente } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugia {
  id?: number ;
  pacienteId: string;
  paciente: string;
  dni: string;
  quirofano: string;
  quirofanoId: string;
  servicio: string;
  fechaInicio: string;
  horaInicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

