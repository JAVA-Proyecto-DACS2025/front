export interface IPersonal {
  legajo: string;
  nombre: string;
  especialidad: string;
  rol: string;
  estado: string;
  telefono: string;
}

export interface IPersonalUpdate extends IPersonal {
  id: number;
}