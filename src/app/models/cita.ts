export interface Cita {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado_cita_id_estado_cita: number;
  profesional_id_profesional: number;
  paciente_id_paciente: number;
}
