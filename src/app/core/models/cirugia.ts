import { IPacienteLite } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugia {
  id?: number ;
  pacienteId: number;
  pacienteNombre: string;
  dni: string;
  quirofanoNombre: string;
  quirofanoId: number;
  servicioNombre: string;
  servicioId: number;
  fechaInicio: Date;
  horaInicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

