import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Region } from '../../models/Region';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.urlRegion;

  obtenerRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.baseUrl}/regiones`);
  }

  obtenerRegionPorId(id: number): Observable<Region> {
    return this.http.get<Region>(`${this.baseUrl}/regiones/${id}`);
  }
}
