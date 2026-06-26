export interface AtencionMedica {
  idAtencion: number;
  fechaAtencion: string;
  motivo: string;
  diagnostico: string;
  indicaciones: string;
  idProfesional: number;
  idPaciente: number;
}