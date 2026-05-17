import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comuna } from '../../models/Comuna';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  private http = inject(HttpClient);
  private baseUrl = environment.urlComuna;

  obtenerComunasPorRegion(idRegion: number): Observable<Comuna[]> {
    return this.http.get<Comuna[]>(`${this.baseUrl}/comunas/region/${idRegion}`);
  }
}