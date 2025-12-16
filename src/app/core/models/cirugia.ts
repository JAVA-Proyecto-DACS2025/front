import { IPacienteLite } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugia {
  id?: number ;
  pacienteId: number;
  paciente: string;
  dni: string;
  quirofano: string;
  quirofanoId: number;
  servicio: string;
  servicioId: number;
  fechaInicio: Date;
  horaInicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

