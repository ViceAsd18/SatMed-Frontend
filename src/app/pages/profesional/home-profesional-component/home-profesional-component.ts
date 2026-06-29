import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedLayoutComponent } from '../../../components/shared-layout-component/shared-layout-component';
import { HorarioProfesional } from '../../../models/HorarioProfesional';
import { Cita } from '../../../models/cita';

@Component({
  selector: 'app-home-profesional',
  standalone: true,
  imports: [CommonModule, SharedLayoutComponent],
  templateUrl: './home-profesional.component.html',
  styleUrls: ['./home-profesional.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeProfesionalComponent implements OnInit {
  
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  /* Datos del profesional logueado */
  readonly profesionalId = 10;
  readonly nombreProfesional = 'Vicente Ramírez';

  /* Colecciones de datos */
  bloquesHorarios: HorarioProfesional[] = [
    { idHorarioProfesional: 1, horaInicio: '08:00', horaFin: '12:00', activo: true, profesionalIdProfesional: 10, diaSemanaIdDiaSemana: 1 },
    { idHorarioProfesional: 2, horaInicio: '14:00', horaFin: '18:00', activo: true, profesionalIdProfesional: 10, diaSemanaIdDiaSemana: 1 }
  ];

  citasDelDia: any[] = [
    { idCita: 101, fechaHora: '2026-06-29T08:30:00', motivoCita: 'Control de hipertensión', pacienteNombre: 'Juan Pérez', estadoCitaIdEstadoCita: 1 },
    { idCita: 102, fechaHora: '2026-06-29T09:15:00', motivoCita: 'Revisión de exámenes', pacienteNombre: 'María Loaiza', estadoCitaIdEstadoCita: 1 }
  ];

  ngOnInit(): void {
    this.cdr.markForCheck();
  }

  formatHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  atenderPaciente(cita: any): void {
    console.log('Abriendo ficha clínica para la cita:', cita.idCita);
    this.router.navigate(['/profesional/atencion', cita.idCita]);
  }
}