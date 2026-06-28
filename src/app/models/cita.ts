export interface Cita {
  idCita?:                   number; 
  fechaHora:                 string;
  motivo?:                   string;  
  motivoCita?:               string; 
  estadoCitaIdEstadoCita:    number;
  profesionalIdProfesional:  number;
  pacienteIdPaciente:        number;
}
