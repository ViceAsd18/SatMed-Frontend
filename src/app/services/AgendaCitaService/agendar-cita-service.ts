import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Especialidad } from '../EspecialidadService/especialidad-service';
import { environment } from '../../../environments/environment';
import { Profesional } from '../../models/Profesional';
import { Cita } from '../../models/cita';

@Injectable({
  providedIn: 'root'
})
export class AgendarCitaService {

  private http      = inject(HttpClient);
  private apiUrl    = environment.apiUrl;
  private urlCitas  = environment.urlCitas;

  // ── Especialidades ─────────────────────────────────────────────
  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/especialidades`);
  }

  // ── Profesionales ──────────────────────────────────────────────
  getProfesionalesPorEspecialidad(idEspecialidad: number): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(
      `${this.apiUrl}/profesionales/especialidad/${idEspecialidad}`
    );
  }

  // ── Horarios disponibles (simulados) ──────────────────────────
  // Si tu backend tiene endpoint real, reemplaza el of() por http.get()
  getHorariosDisponibles(idProfesional: number, fecha: string): Observable<string[]> {
    // Simulación de horarios disponibles
    const todosLosHorarios = [
      '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '14:00',
      '14:30', '15:00', '15:30', '16:00'
    ];
    // Simula algunos ocupados aleatoriamente usando idProfesional como semilla
    const ocupados = idProfesional % 2 === 0
      ? ['10:00', '12:00', '14:30']
      : ['09:30', '11:00', '15:00'];

    const disponibles = todosLosHorarios.filter(h => !ocupados.includes(h));
    return of(disponibles);

    // Cuando tengas el endpoint real, usa esto:
    // return this.http.get<string[]>(
    //   `${this.apiUrl}/horarios/disponibles?profesional=${idProfesional}&fecha=${fecha}`
    // );
  }

  // ── Guardar Cita ───────────────────────────────────────────────
  guardarCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.urlCitas}/api/citas/agregar`, cita);
  }
}
