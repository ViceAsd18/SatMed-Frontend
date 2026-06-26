import { AtencionMedica } from "./AtencionMedica";

export interface Interconsulta {
  idInterconsulta: number;
  motivo: string;
  fechaEmision: string;
  idProfesional: number;
  atencionMedica: AtencionMedica;
}