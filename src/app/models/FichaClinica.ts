export interface FichaClinica {
  idFichaClinica: number;
  idPaciente: number;
  observaciones: string;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}