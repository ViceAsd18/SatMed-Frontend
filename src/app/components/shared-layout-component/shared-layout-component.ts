import { Component, Input, OnInit } from '@angular/core';
import { CommonModule }             from '@angular/common';
import { RouterModule }             from '@angular/router';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-layout-component.html',
  styleUrls:   ['./shared-layout-component.css'],
})
export class SharedLayoutComponent implements OnInit {

  /* ── Datos del paciente ──────────────────────────────────── */
  // Reemplaza con tu servicio de autenticación real
  nombrePaciente  = 'Carlos Morales';
  numeroPaciente  = '#12044';

  /* ── Estado del sidebar (drawer móvil) ───────────────────── */
  sidebarOpen = false;

  ngOnInit(): void {
    // Aquí puedes inyectar tu AuthService y obtener el nombre real:
    // this.nombrePaciente = this.authService.getCurrentUser().nombre;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
