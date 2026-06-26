import { ReunionClinica } from "./ReunionClinica";

export interface BitacoraReunion {
  idBitacora: number;
  descripcion: string;
  fechaEmision: string;
  idTipoEvento: number;
  reunionClinica: ReunionClinica;
}