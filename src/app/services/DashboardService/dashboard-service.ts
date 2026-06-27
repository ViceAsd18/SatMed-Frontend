import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tratamiento } from '../../models/Tratamiento';
import { AtencionMedica } from '../../models/AtencionMedica';
import { Cita } from '../../models/cita';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  citas: Cita[];
  ultimaAtencion: AtencionMedica | null;
  tratamientoActivo: Tratamiento | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);

  private urlTratamiento    = environment.urlTratamiento;
  private urlAtencionMedica = environment.urlAtencionMedica;
  private urlCitas          = environment.urlCitas;

  // ── Citas ──────────────────────────────────────────────────────
  // Endpoint real: GET /api/citas/listar
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.urlCitas}/api/citas/listar`);
  }

  getCitasPaciente(pacienteId: number): Observable<Cita[]> {
    return this.getCitas().pipe(
      map((citas: Cita[]) =>
        citas
          .filter((c) => c.pacienteIdPaciente === pacienteId)
          .sort((a, b) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          )
      )
    );
  }



  cancelarCita(id: number): Observable<any> {
    return this.http.put(`${this.urlCitas}/api/citas/actualizar/${id}`, {
      estadoCitaIdEstadoCita: 3
    });
  }

  // ── Atenciones Médicas ─────────────────────────────────────────
  // Endpoint real: GET /atenciones-medicas/paciente/{id}
  getAtencionesPaciente(pacienteId: number): Observable<AtencionMedica[]> {
  return this.http.get<AtencionMedica[]>(
    `${this.urlAtencionMedica}/atenciones-medicas/paciente/${pacienteId}`
  );
}

  getUltimaAtencion(pacienteId: number): Observable<AtencionMedica | null> {
    return this.getAtencionesPaciente(pacienteId).pipe(
      map((atenciones: AtencionMedica[]) => {
        if (!atenciones.length) return null;
        return atenciones.sort((a, b) =>
          new Date(b.fechaAtencion).getTime() - new Date(a.fechaAtencion).getTime()
        )[0];
      })
    );
  }

  // ── Tratamientos ──────────────────────────────────────────────
  // Endpoint real: GET /tratamiento
  getTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.urlTratamiento}/tratamiento`);
  }

  getTratamientoActivo(pacienteId: number): Observable<Tratamiento | null> {
    return this.getTratamientos().pipe(
      map((tratamientos: Tratamiento[]) => {
        const hoy = new Date();
        const activo = tratamientos.find((t) => {
          const inicio = new Date(t.fechaInicio);
          const fin    = new Date(t.fechaFin);
          return hoy >= inicio && hoy <= fin && t.idEstadoTratamiento === 1;
        });
        return activo ?? null;
      })
    );
  }

  // ── Dashboard completo ─────────────────────────────────────────
  getDashboardData(pacienteId: number): Observable<DashboardData> {
    return forkJoin({
      citas:             this.getCitasPaciente(pacienteId),
      ultimaAtencion:    this.getUltimaAtencion(pacienteId),
      tratamientoActivo: this.getTratamientoActivo(pacienteId)
    });
  }
}
