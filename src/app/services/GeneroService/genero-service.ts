import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Genero } from '../../models/Genero';

@Injectable({
  providedIn: 'root',
})
export class GeneroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.urlGenero;

  obtenerGeneros(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.baseUrl}/generos`);
  }
}
