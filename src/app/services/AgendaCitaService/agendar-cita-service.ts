import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Especialidad } from '../EspecialidadService/especialidad-service';
import { environment } from '../../../environments/environment';
import { Profesional } from '../../models/Profesional';
import { Cita } from '../../models/cita';

@Injectable({
  providedIn: 'root'
})
export class AgendarCitaService {

  private http     = inject(HttpClient);
  private apiUrl   = environment.apiUrl;
  private urlCitas = environment.urlCitas;

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

  getProfesionalPorId(idProfesional: number): Observable<Profesional | null> {
    return this.http.get<Profesional>(
      `${this.apiUrl}/profesionales/${idProfesional}`
    ).pipe(
      catchError(() => of(null))
    );
  }

  // ── Horarios disponibles ───────────────────────────────────────
  getHorariosDisponibles(idProfesional: number, fecha: string): Observable<string[]> {
    const todos = [
      '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '14:00',
      '14:30', '15:00', '15:30', '16:00'
    ];
    const ocupados = idProfesional % 2 === 0
      ? ['10:00', '12:00', '14:30']
      : ['09:30', '11:00', '15:00'];

    return of(todos.filter(h => !ocupados.includes(h)));

    // Cuando tengas endpoint real:
    // return this.http.get<string[]>(
    //   `${this.apiUrl}/horarios/disponibles?profesional=${idProfesional}&fecha=${fecha}`
    // );
  }

  // ── Guardar Cita ───────────────────────────────────────────────
  guardarCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.urlCitas}/api/citas/agregar`, cita);
  }

  // ── Citas por paciente (con profesional expandido) ─────────────
  // El backend no devuelve el profesional dentro de la cita, así que:
  // 1. Trae todas las citas y filtra por paciente
  // 2. Por cada profesional único, llama al endpoint de profesional
  // 3. Adjunta el objeto profesional a cada cita
  getCitasPorPaciente(idPaciente: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.urlCitas}/api/citas/listar`).pipe(
      switchMap((todasLasCitas: Cita[]) => {
        const citasPaciente = todasLasCitas.filter(
          c => c.pacienteIdPaciente === idPaciente
        );

        if (citasPaciente.length === 0) return of([]);

        // IDs únicos de profesionales en estas citas
        const idsProfesionales = [...new Set(
          citasPaciente.map(c => c.profesionalIdProfesional)
        )];

        // Llama al endpoint de profesional por cada ID en paralelo
        return forkJoin(
          idsProfesionales.map(id => this.getProfesionalPorId(id))
        ).pipe(
          map((profesionales: (Profesional | null)[]) => {
            const mapaProf = new Map<number, Profesional | null>();
            idsProfesionales.forEach((id, i) => mapaProf.set(id, profesionales[i]));

            // Adjunta el profesional a cada cita
            return citasPaciente.map(cita => ({
              ...cita,
              profesional: mapaProf.get(cita.profesionalIdProfesional) ?? null
            }));
          })
        );
      }),
      catchError(() => of([]))
    );
  }

  // ── Cancelar Cita ──────────────────────────────────────────────
  cancelarCita(idCita: number): Observable<void> {
    return this.http.delete<void>(`${this.urlCitas}/api/citas/eliminar/${idCita}`);
  }

  // ── Reprogramar / Actualizar Cita ──────────────────────────────
  reprogramarCita(idCita: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.urlCitas}/api/citas/actualizar/${idCita}`, cita);
  }
}
