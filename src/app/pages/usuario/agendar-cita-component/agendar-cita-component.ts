import {
  Component, OnInit, OnDestroy,
  inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Especialidad } from '../../../models/Especialidad';
import { Profesional } from '../../../models/Profesional';
import { Cita } from '../../../models/cita';
import { AgendarCitaService } from '../../../services/AgendaCitaService/agendar-cita-service';
import { SharedLayoutComponent } from '../../../components/shared-layout-component/shared-layout-component';

interface DiaCalendario {
  label: string;
  numero: number;
  fecha: string;
  activo: boolean;
  seleccionado: boolean;
}

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedLayoutComponent],
  templateUrl: './agendar-cita-component.html',
  styleUrls: ['./agendar-cita-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendarCitaComponent implements OnInit, OnDestroy {

  private service  = inject(AgendarCitaService);
  private cdr      = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // ── Datos ──────────────────────────────────────────────────────
  especialidades: Especialidad[]  = [];
  profesionales: Profesional[]    = [];

  horarios: string[]              = [];

  especialidadSeleccionada: number | null = null;
  profesionalSeleccionado: Profesional | null = null;

  // ── Estado UI ─────────────────────────────────────────────────
  cargandoProfesionales = false;
  cargandoHorarios      = false;
  mostrarModal          = false;
  exitoReserva          = false;
  errorReserva          = false;
  mensajeError          = '';

  // ── Calendario semanal ─────────────────────────────────────────
  diasSemana: DiaCalendario[] = [];
  fechaSeleccionada           = '';
  mesAnioLabel                = '';

  // ── Payload cita ──────────────────────────────────────────────
  // pacienteIdPaciente: ID simulado de sesión activa
  nuevaCita: Cita = {
    fechaHora:               '',
    motivoCita:              '',
    estadoCitaIdEstadoCita:  1,
    profesionalIdProfesional: 0,
    pacienteIdPaciente:      12044   // ← reemplazar con AuthService
  };

  horaSeleccionada = '';

  ngOnInit(): void {
    this.generarSemanaActual();
    this.cargarEspecialidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Calendario ────────────────────────────────────────────────
  generarSemanaActual(): void {
    const hoy    = new Date();
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Inicio de semana (lunes)
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

    this.diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia   = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      const iso   = dia.toISOString().split('T')[0];
      const esHoy = iso === hoy.toISOString().split('T')[0];
      return {
        label:        labels[dia.getDay()],
        numero:       dia.getDate(),
        fecha:        iso,
        activo:       dia.getDay() !== 0,   // domingo deshabilitado
        seleccionado: esHoy
      };
    });

    const diaActivo = this.diasSemana.find(d => d.seleccionado) ?? this.diasSemana[1];
    this.fechaSeleccionada = diaActivo.fecha;
    this.mesAnioLabel = new Date(diaActivo.fecha + 'T12:00:00')
      .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

    this.cdr.markForCheck();
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.activo) return;
    this.diasSemana.forEach(d => d.seleccionado = false);
    dia.seleccionado        = true;
    this.fechaSeleccionada  = dia.fecha;
    this.horarios           = [];
    this.horaSeleccionada   = '';

    if (this.profesionalSeleccionado) {
      this.cargarHorarios(this.profesionalSeleccionado.idProfesional, dia.fecha);
    }
    this.cdr.markForCheck();
  }

  get labelDiaSeleccionado(): string {
    const dia = this.diasSemana.find(d => d.seleccionado);
    if (!dia) return '';
    return new Date(dia.fecha + 'T12:00:00')
      .toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // ── Especialidades ─────────────────────────────────────────────
  cargarEspecialidades(): void {
    this.service.getEspecialidades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.especialidades = data;
          this.cdr.markForCheck();
        },
        error: () => {
          // Fallback con datos de muestra si el endpoint aún no existe
          this.especialidades = [
            { idEspecialidad: 1, nombreEspecialidad: 'Medicina General' },
            { idEspecialidad: 2, nombreEspecialidad: 'Cardiología' },
            { idEspecialidad: 3, nombreEspecialidad: 'Pediatría' },
            { idEspecialidad: 4, nombreEspecialidad: 'Dermatología' },
            { idEspecialidad: 5, nombreEspecialidad: 'Ginecología' }
          ];
          this.cdr.markForCheck();
        }
      });
  }

  // ── Profesionales ──────────────────────────────────────────────
  onEspecialidadChange(idEspecialidad: number): void {
    this.especialidadSeleccionada   = idEspecialidad;
    this.profesionalSeleccionado    = null;
    this.horarios                   = [];
    this.horaSeleccionada           = '';
    this.cargandoProfesionales      = true;
    this.cdr.markForCheck();

    this.service.getProfesionalesPorEspecialidad(idEspecialidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.profesionales         = data;
          this.cargandoProfesionales = false;
          this.cdr.markForCheck();
        },
        error: () => {
          // Fallback
          this.profesionales = [];
          this.cargandoProfesionales = false;
          this.cdr.markForCheck();
        }
      });
  }

  seleccionarProfesional(profesional: Profesional): void {
    this.profesionalSeleccionado              = profesional;
    this.nuevaCita.profesionalIdProfesional   = profesional.idProfesional;
    this.horarios                             = [];
    this.horaSeleccionada                     = '';
    this.cargarHorarios(profesional.idProfesional, this.fechaSeleccionada);
    this.cdr.markForCheck();
  }

  // ── Horarios ──────────────────────────────────────────────────
  cargarHorarios(idProfesional: number, fecha: string): void {
    this.cargandoHorarios = true;
    this.cdr.markForCheck();

    this.service.getHorariosDisponibles(idProfesional, fecha)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.horarios         = data;
          this.cargandoHorarios = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.horarios         = [];
          this.cargandoHorarios = false;
          this.cdr.markForCheck();
        }
      });
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada        = hora;
    this.nuevaCita.fechaHora     = `${this.fechaSeleccionada}T${hora}:00`;
    this.mostrarModal            = true;
    this.exitoReserva            = false;
    this.errorReserva            = false;
    this.cdr.markForCheck();
  }

  // ── Modal ─────────────────────────────────────────────────────
  openModal(hora: string): void {
    this.seleccionarHora(hora);
  }

  cerrarModal(): void {
    this.mostrarModal     = false;
    this.horaSeleccionada = '';
    this.cdr.markForCheck();
  }

  // ── Confirmar reserva ─────────────────────────────────────────
  confirmarReserva(): void {
    if (!this.nuevaCita.motivoCita.trim()) {
      this.mensajeError = 'Por favor ingresa el motivo de la consulta.';
      this.errorReserva = true;
      this.cdr.markForCheck();
      return;
    }

    this.service.guardarCita(this.nuevaCita)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.exitoReserva = true;
          this.errorReserva = false;
          // Reset tras 2 segundos
          setTimeout(() => {
            this.cerrarModal();
            this.nuevaCita.motivoCita = '';
            this.cdr.markForCheck();
          }, 2000);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorReserva = true;
          this.mensajeError = 'No se pudo registrar la cita. Intenta nuevamente.';
          console.error('Error al guardar cita:', err);
          this.cdr.markForCheck();
        }
      });
  }



  get nombreProfesionalSeleccionado(): string {
    if (!this.profesionalSeleccionado) return '—';

    const usuario = this.profesionalSeleccionado.usuario;

    return `${usuario.pnombreUsuario} ${usuario.snombreUsuario} ${usuario.apaternoUsuario} ${usuario.amaternornoUsuario}`;
  }

  get fechaLegible(): string {
    if (!this.fechaSeleccionada) return '';
    return new Date(this.fechaSeleccionada + 'T12:00:00')
      .toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
