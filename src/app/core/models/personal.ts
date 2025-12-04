

export interface IPersonalLite {
  id: number;
  legajo: string;
  nombre: string;
  rol: string;
}

export interface IPersonal extends IPersonalLite {
  estado: string;
  telefono: string;
  especialidad: string;
}