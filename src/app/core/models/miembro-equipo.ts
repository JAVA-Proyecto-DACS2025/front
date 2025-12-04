import { IPersonal, IPersonalLite } from "./personal";



export interface IMiembroEquipoMedico {
  personalId: number;
  cirugiaId: number;
  legajo: string;
  nombre: string;
  rol: string;
}