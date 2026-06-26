import { AtencionMedica } from "./AtencionMedica";

export interface BitacoraAtencion {
  idBitacoraAtencion: number;
  fechaHoraRealizada: string;
  descripcion: string;
  idTipoEvento: number;
  idUsuario: number;
  atencionMedica: AtencionMedica;
}