export interface CurrentUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  telefono?: string;
  fecha_registro?: string;
}