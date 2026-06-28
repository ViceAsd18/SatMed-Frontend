import {
  Component, OnInit, OnDestroy,
  inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

// IDs de estado según tu BD — ajusta si difieren
const ESTADO = {
  PENDIENTE:  1,
  CONFIRMADA: 2,
  REALIZADA:  3,
  CANCELADA:  4,
  NO_ASISTIO: 5
} as const;

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

  // ── Pestañas ───────────────────────────────────────────────────
  tabActiva: 'proximas' | 'historial' | 'agendar' = 'proximas';

  // ── Citas del paciente ─────────────────────────────────────────
  citasProximas:  Cita[] = [];
  citasHistorial: Cita[] = [];
  cargandoCitas    = false;
  cargandoHistorial = false;

  // ── Cita seleccionada para cancelar / reprogramar ──────────────
  citaSeleccionada: Cita | null = null;

  // ── Modal cancelar ─────────────────────────────────────────────
  mostrarModalCancelar  = false;
  errorCancelar         = false;
  mensajeErrorCancelar  = '';

  // ── Modal reprogramar ──────────────────────────────────────────
  mostrarModalReprogramar       = false;
  fechaReprogramar              = '';
  horaReprogramar               = '';
  horariosReprogramar: string[] = [];
  cargandoHorariosReprogramar   = false;
  errorReprogramar              = false;
  mensajeErrorReprogramar       = '';

  // ── Datos agendar (flujo original) ────────────────────────────
  especialidades: Especialidad[]       = [];
  profesionales:  Profesional[]        = [];
  horarios:       string[]             = [];

  especialidadSeleccionada: number | null  = null;
  profesionalSeleccionado:  Profesional | null = null;

  cargandoProfesionales = false;
  cargandoHorarios      = false;

  // ── Modal confirmar reserva ────────────────────────────────────
  mostrarModal  = false;
  exitoReserva  = false;
  errorReserva  = false;
  mensajeError  = '';

  // ── Calendario semanal ─────────────────────────────────────────
  diasSemana: DiaCalendario[] = [];
  fechaSeleccionada           = '';
  mesAnioLabel                = '';

  // ── Payload nueva cita ─────────────────────────────────────────
  nuevaCita: Cita = {
    fechaHora:                '',
    motivoCita:               '',
    estadoCitaIdEstadoCita:   ESTADO.PENDIENTE,
    profesionalIdProfesional: 0,
    pacienteIdPaciente:       12044   // ← reemplazar con AuthService
  };

  horaSeleccionada = '';

  // ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.generarSemanaActual();
    this.cargarEspecialidades();
    this.cargarCitasProximas();
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Navegación de pestañas ────────────────────────────────────
  cambiarTab(tab: 'proximas' | 'historial' | 'agendar'): void {
    this.tabActiva = tab;
    this.cdr.markForCheck();
  }

  // ── Carga de citas próximas ───────────────────────────────────
  cargarCitasProximas(): void {
    this.cargandoCitas = true;
    this.cdr.markForCheck();

    this.service.getCitasPorPaciente(this.nuevaCita.pacienteIdPaciente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Cita[]) => {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          // Próximas = fecha futura + estados no terminales
          this.citasProximas = citas.filter(c => {
            const fecha = new Date(c.fechaHora);
            return fecha >= hoy && c.estadoCitaIdEstadoCita !== ESTADO.CANCELADA;
          });
          this.cargandoCitas = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.citasProximas = [];
          this.cargandoCitas = false;
          this.cdr.markForCheck();
        }
      });
  }

  // ── Carga de historial ────────────────────────────────────────
  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.cdr.markForCheck();

    this.service.getCitasPorPaciente(this.nuevaCita.pacienteIdPaciente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas: Cita[]) => {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          // Historial = fecha pasada O estados terminales (cancelada, realizada, no asistió)
          this.citasHistorial = citas.filter(c => {
            const fecha = new Date(c.fechaHora);
            return fecha < hoy
              || c.estadoCitaIdEstadoCita === ESTADO.REALIZADA
              || c.estadoCitaIdEstadoCita === ESTADO.CANCELADA
              || c.estadoCitaIdEstadoCita === ESTADO.NO_ASISTIO;
          });
          this.cargandoHistorial = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.citasHistorial   = [];
          this.cargandoHistorial = false;
          this.cdr.markForCheck();
        }
      });
  }

  // ── Modal cancelar ────────────────────────────────────────────
  abrirModalCancelar(cita: Cita): void {
    this.citaSeleccionada    = cita;
    this.errorCancelar       = false;
    this.mensajeErrorCancelar = '';
    this.mostrarModalCancelar = true;
    this.cdr.markForCheck();
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.citaSeleccionada    = null;
    this.cdr.markForCheck();
  }

  confirmarCancelacion(): void {
    if (!this.citaSeleccionada?.idCita) return;

    this.service.cancelarCita(this.citaSeleccionada.idCita)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cerrarModalCancelar();
          this.cargarCitasProximas();
          this.cargarHistorial();
        },
        error: () => {
          this.errorCancelar       = true;
          this.mensajeErrorCancelar = 'No se pudo cancelar la cita. Intenta nuevamente.';
          this.cdr.markForCheck();
        }
      });
  }

  // ── Modal reprogramar ─────────────────────────────────────────
  abrirModalReprogramar(cita: Cita): void {
    this.citaSeleccionada         = cita;
    this.fechaReprogramar         = '';
    this.horaReprogramar          = '';
    this.horariosReprogramar      = [];
    this.errorReprogramar         = false;
    this.mensajeErrorReprogramar  = '';
    this.mostrarModalReprogramar  = true;
    this.cdr.markForCheck();
  }

  cerrarModalReprogramar(): void {
    this.mostrarModalReprogramar = false;
    this.citaSeleccionada        = null;
    this.cdr.markForCheck();
  }

  seleccionarFechaReprogramar(dia: DiaCalendario): void {
    if (!dia.activo || !this.citaSeleccionada) return;
    this.fechaReprogramar    = dia.fecha;
    this.horaReprogramar     = '';
    this.horariosReprogramar = [];
    this.cargandoHorariosReprogramar = true;
    this.cdr.markForCheck();

    this.service.getHorariosDisponibles(
      this.citaSeleccionada.profesionalIdProfesional,
      dia.fecha
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (horarios: string[]) => {
          this.horariosReprogramar         = horarios;
          this.cargandoHorariosReprogramar = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.horariosReprogramar         = [];
          this.cargandoHorariosReprogramar = false;
          this.cdr.markForCheck();
        }
      });
  }

  confirmarReprogramacion(): void {
    if (!this.fechaReprogramar || !this.horaReprogramar) {
      this.errorReprogramar        = true;
      this.mensajeErrorReprogramar = 'Debes seleccionar una fecha y un horario.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.citaSeleccionada?.idCita) return;

    const citaActualizada: Cita = {
      ...this.citaSeleccionada,
      fechaHora: `${this.fechaReprogramar}T${this.horaReprogramar}:00`
    };

    this.service.reprogramarCita(this.citaSeleccionada.idCita, citaActualizada)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cerrarModalReprogramar();
          this.cargarCitasProximas();
        },
        error: () => {
          this.errorReprogramar        = true;
          this.mensajeErrorReprogramar = 'No se pudo reprogramar la cita. Intenta nuevamente.';
          this.cdr.markForCheck();
        }
      });
  }

  // ── Acciones del historial ────────────────────────────────────
  verInforme(cita: Cita): void {
    // Implementar según tu lógica: navegar a detalle, descargar PDF, etc.
    console.log('Ver informe de cita:', cita.idCita);
  }

  reagendarCita(cita: Cita): void {
    this.abrirModalReprogramar(cita);
    this.cambiarTab('historial');
  }

  // ── Helpers de formato ─────────────────────────────────────────
  // El backend devuelve fechaHora con espacio: "2026-07-01 09:00:00"
  // new Date() no parsea eso bien en todos los navegadores, así que normalizamos
  private normalizarFecha(fechaHora: string): Date {
    return new Date(fechaHora.replace(' ', 'T'));
  }

  formatearFechaDia(fechaHora: string): string {
    return this.normalizarFecha(fechaHora)
      .toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  }

  formatearHora(fechaHora: string): string {
    return this.normalizarFecha(fechaHora)
      .toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  formatearFechaCompleta(fechaHora: string): string {
    return this.normalizarFecha(fechaHora)
      .toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ── Helpers de estado ─────────────────────────────────────────
  getEstadoLabel(idEstado: number): string {
    const labels: Record<number, string> = {
      [ESTADO.PENDIENTE]:  'Pendiente',
      [ESTADO.CONFIRMADA]: 'Confirmada',
      [ESTADO.REALIZADA]:  'Realizada',
      [ESTADO.CANCELADA]:  'Cancelada',
      [ESTADO.NO_ASISTIO]: 'No Asistió'
    };
    return labels[idEstado] ?? 'Desconocido';
  }

  getEstadoBadgeClass(idEstado: number): string {
    const classes: Record<number, string> = {
      [ESTADO.PENDIENTE]:  'estado-badge--pendiente',
      [ESTADO.CONFIRMADA]: 'estado-badge--confirmada',
      [ESTADO.REALIZADA]:  'estado-badge--realizada',
      [ESTADO.CANCELADA]:  'estado-badge--cancelada',
      [ESTADO.NO_ASISTIO]: 'estado-badge--no-asistio'
    };
    return classes[idEstado] ?? '';
  }

  getEstadoHeaderClass(idEstado: number): string {
    return idEstado === ESTADO.CONFIRMADA
      ? 'cita-card__header--confirmada'
      : 'cita-card__header--pendiente';
  }

  // ── Helpers de profesional ────────────────────────────────────
  // El servicio adjunta el profesional como { ...cita, profesional: Profesional }
  getInicialProfesional(cita: Cita): string {
    const prof = (cita as any).profesional;
    if (prof?.usuario?.pnombreUsuario) {
      return `${prof.usuario.pnombreUsuario.charAt(0)}${prof.usuario.apaternoUsuario?.charAt(0) ?? ''}`;
    }
    return 'P';
  }

  getNombreProfesional(cita: Cita): string {
    const prof = (cita as any).profesional;
    if (prof?.usuario) {
      const u = prof.usuario;
      return `${u.pnombreUsuario ?? ''} ${u.snombreUsuario ?? ''} ${u.apaternoUsuario ?? ''}`.trim();
    }
    return `Profesional #${cita.profesionalIdProfesional}`;
  }

  getEspecialidadProfesional(cita: Cita): string {
    const prof = (cita as any).profesional;
    return prof?.especialidad?.nombreEspecialidad ?? '—';
  }

  // El backend devuelve "motivo" en GET pero el modelo también acepta "motivoCita"
  getMotivoCita(cita: Cita): string {
    return (cita as any).motivo ?? cita.motivoCita ?? '—';
  }

  // ══════════════════════════════════════════
  // LÓGICA ORIGINAL (sin cambios) — agendar
  // ══════════════════════════════════════════

  generarSemanaActual(): void {
    const hoy    = new Date();
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
        activo:       dia.getDay() !== 0,
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
    dia.seleccionado       = true;
    this.fechaSeleccionada = dia.fecha;
    this.horarios          = [];
    this.horaSeleccionada  = '';

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

  cargarEspecialidades(): void {
    this.service.getEspecialidades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.especialidades = data;
          this.cdr.markForCheck();
        },
        error: () => {
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

  onEspecialidadChange(idEspecialidad: number): void {
    this.especialidadSeleccionada = idEspecialidad;
    this.profesionalSeleccionado  = null;
    this.horarios                 = [];
    this.horaSeleccionada         = '';
    this.cargandoProfesionales    = true;
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
          this.profesionales         = [];
          this.cargandoProfesionales = false;
          this.cdr.markForCheck();
        }
      });
  }

  seleccionarProfesional(profesional: Profesional): void {
    this.profesionalSeleccionado            = profesional;
    this.nuevaCita.profesionalIdProfesional = profesional.idProfesional;
    this.horarios                           = [];
    this.horaSeleccionada                   = '';
    this.cargarHorarios(profesional.idProfesional, this.fechaSeleccionada);
    this.cdr.markForCheck();
  }

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
    this.horaSeleccionada    = hora;
    this.nuevaCita.fechaHora = `${this.fechaSeleccionada}T${hora}:00`;
    this.mostrarModal        = true;
    this.exitoReserva        = false;
    this.errorReserva        = false;
    this.cdr.markForCheck();
  }

  openModal(hora: string): void {
    this.seleccionarHora(hora);
  }

  cerrarModal(): void {
    this.mostrarModal     = false;
    this.horaSeleccionada = '';
    this.cdr.markForCheck();
  }

  confirmarReserva(): void {
    if (!(this.nuevaCita.motivoCita ?? '').trim()) {
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
          setTimeout(() => {
            this.cerrarModal();
            this.nuevaCita.motivoCita = '';
            this.cargarCitasProximas();
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
    const u = this.profesionalSeleccionado.usuario;
    return `${u.pnombreUsuario} ${u.snombreUsuario} ${u.apaternoUsuario} ${u.amaternornoUsuario}`;
  }

  get fechaLegible(): string {
    if (!this.fechaSeleccionada) return '';
    return new Date(this.fechaSeleccionada + 'T12:00:00')
      .toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
