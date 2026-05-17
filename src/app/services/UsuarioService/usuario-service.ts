import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.urlUsuario;

  registrarUsuario(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios`, payload);
  }
}