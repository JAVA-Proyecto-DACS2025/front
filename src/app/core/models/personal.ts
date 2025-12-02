

export interface IPersonalLite {
  id: number;
  legajo: string;
  nombre: string;
}

export interface IPersonal extends IPersonalLite {
  rol: string;
  estado: string;
  telefono: string;
  especialidad: string;
}