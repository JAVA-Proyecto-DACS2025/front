import { IPacienteLite } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugia {
  id?: number ;
  pacienteId: string;
  paciente: string;
  dni: string;
  quirofano: string;
  quirofanoId: string;
  servicio: string;
  fechanicio: Date;
  horaInicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

