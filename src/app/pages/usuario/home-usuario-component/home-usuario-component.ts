import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AtencionMedica } from '../../../models/AtencionMedica';
import { Tratamiento } from '../../../models/Tratamiento';
import { DashboardService } from '../../../services/DashboardService/dashboard-service';
import { Cita } from '../../../models/cita';

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-usuario-component.html',
  styleUrls: ['./home-usuario-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeUsuarioComponent implements OnInit, OnDestroy {

  private dashboardService = inject(DashboardService);
  private cdr              = inject(ChangeDetectorRef);
  private destroy$         = new Subject<void>();

  loading = true;
  error: string | null = null;

  readonly pacienteId     = 500; // ajusta al ID real del paciente logueado
  readonly nombrePaciente = 'Vicente Ramírez';
  readonly numeroPaciente = '#12044';

  proximaCita: Cita | null              = null;
  ultimaAtencion: AtencionMedica | null = null;
  tratamientoActivo: Tratamiento | null = null;
  citasPendientes = 0;
  sidebarOpen     = false;

  ngOnInit(): void {
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDashboard(): void {
    this.loading = true;
    this.error   = null;
    this.cdr.markForCheck();

    this.dashboardService.getDashboardData(this.pacienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const hoy     = new Date();
          const futuras = data.citas.filter(
            (c) => new Date(c.fechaHora) >= hoy && c.estadoCitaIdEstadoCita === 1
          );
          this.proximaCita       = futuras[0] ?? null;
          this.citasPendientes   = futuras.length;
          this.ultimaAtencion    = data.ultimaAtencion;
          this.tratamientoActivo = data.tratamientoActivo;
          this.loading           = false;
          this.error             = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error cargando dashboard:', err);
          this.error   = 'No se pudo cargar la información. Intenta nuevamente.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getDia(fecha: string): string {
    return new Date(fecha).getDate().toString().padStart(2, '0');
  }

  getMes(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', { month: 'long' });
  }

  getHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-CL', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  cancelarCita(): void {
    if (!this.proximaCita) return;
    const confirmar = confirm('¿Estás seguro que deseas cancelar esta cita?');
    if (!confirmar) return;

    this.dashboardService.cancelarCita(this.proximaCita.id_cita)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Cita cancelada correctamente.');
          this.cargarDashboard();
        },
        error: () => alert('No se pudo cancelar la cita. Intenta nuevamente.')
      });
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; this.cdr.markForCheck(); }
  closeSidebar(): void  { this.sidebarOpen = false; this.cdr.markForCheck(); }
}
