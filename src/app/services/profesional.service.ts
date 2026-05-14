import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Profesional } from '../models/Profesional';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/profesionales';

  getAll(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.apiUrl);
  }

  getById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.apiUrl}/${id}`);
  }

  create(p: Profesional): Observable<Profesional> {
    return this.http.post<Profesional>(this.apiUrl, p);
  }

  update(id: number, p: Profesional): Observable<Profesional> {
    return this.http.put<Profesional>(`${this.apiUrl}/${id}`, p);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
