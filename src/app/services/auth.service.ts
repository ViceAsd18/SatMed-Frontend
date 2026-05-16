import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta la URL al puerto donde corra tu SpringBoot (ej: 8080)
  private apiUrl = 'http://localhost:8080/api/auth'; 

  constructor(private http: HttpClient) { }

  // Método para iniciar sesión
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token y el rol que nos devuelve tu backend en Java
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role); // Ej: 'ADMIN', 'PACIENTE', 'PROFESIONAL'
        }
      })
    );
  }

  // Obtener el rol actual del usuario logueado
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Saber si el usuario está autenticado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}