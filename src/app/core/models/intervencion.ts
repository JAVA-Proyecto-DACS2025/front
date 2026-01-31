export interface IIntervencion {
  id?: number;
  cirugiaId: number;
  tipoIntervencionId: number;
  tipoIntervencionNombre?: string;
  observaciones: string;
}

export interface ITipoIntervencion {
  id: number;
  nombre: string;
  descripcion?: string;
}
