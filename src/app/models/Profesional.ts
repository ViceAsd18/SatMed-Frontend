import { Especialidad } from "./Especialidad";
import { Usuario } from "./Usuario";

export interface Profesional {
  idProfesional: number;
  numeroRegistroProfesional: string;
  usuario: Usuario;
  especialidad: Especialidad;
}