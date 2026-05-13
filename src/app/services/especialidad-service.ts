import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Especialidad {
  idEspecialidad: number;
  nombreEspecialidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:7000/especialidades';

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl);
  }
}