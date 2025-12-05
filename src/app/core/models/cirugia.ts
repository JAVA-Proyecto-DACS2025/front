import { IPaciente } from './paciente';
import { IQuirofano } from './quirofano';

export interface ICirugia {
  id?: number ;
  paciente: IPaciente;
  quirofano: IQuirofano;
  servicio: string;
  fecha_hora_inicio: string;
  estado: string;
  prioridad: string;
  anestesia: string;
  tipo: string;
}

