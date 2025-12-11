export interface IPacienteExterno {
  id: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  fecha_nacimiento: Date; // ISO yyyy-MM-dd
  direccion: string;
  telefono: string;
  peso?: number;
  altura?: number;
}