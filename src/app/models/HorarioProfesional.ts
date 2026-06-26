import { DiaSemana } from "./DiaSemana";

export interface HorarioProfesional {
  idHorarioProfesional: number;
  horaInicio: string;
  horaFin: string;
  idProfesional: number;
  diaSemana: DiaSemana;
}