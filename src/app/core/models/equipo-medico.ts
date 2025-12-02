import { IPersonal, IPersonalLite } from "./personal";



export interface IEquipoMedico {
  id_cirugia: number;
  equipo: IPersonalLite[];
  rol: string;
}