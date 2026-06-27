import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { Cita } from '../../models/cita';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cita.component.html',
  styleUrls: ['./cita.component.css']
})
export class CitaComponent implements OnInit {
  private citaService = inject(CitaService);
  private formBuilder = inject(FormBuilder);

  public citas = signal<Cita[]>([]);
  public cargando = signal(false);
  public guardando = signal(false);
  public mensajeError = signal<string | null>(null);

  /** Si es distinto de null, el formulario está en modo edición para ese id_cita. */
  public idCitaEnEdicion = signal<number | null>(null);

  public formularioCita: FormGroup = this.formBuilder.group({
    id_cita: [{ value: 0, disabled: true }, [Validators.min(0)]],
    fecha_hora: ['', [Validators.required]],
    motivo: ['', [Validators.required, Validators.maxLength(500)]],
    estado_cita_id_estado_cita: [null, [Validators.required, Validators.min(1)]],
    profesional_id_profesional: [null, [Validators.required, Validators.min(1)]],
    paciente_id_paciente: [null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarCitas();
    this.prepararFormularioNuevo();
  }

  cargarCitas(): void {
    this.mensajeError.set(null);
    this.cargando.set(true);
    this.citaService
      .getAll()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.citas.set(lista),
        error: () =>
          this.mensajeError.set(
            'No se pudo cargar la lista de citas. Verifique la API.'
          )
      });
  }

  prepararFormularioNuevo(): void {
    this.idCitaEnEdicion.set(null);
    this.formularioCita.reset({
      id_cita: 0,
      fecha_hora: '',
      motivo: '',
      estado_cita_id_estado_cita: null,
      profesional_id_profesional: null,
      paciente_id_paciente: null
    });
    this.formularioCita.get('id_cita')?.disable();
  }

  editarCita(cita: Cita): void {
    this.idCitaEnEdicion.set(cita.id_cita);
    this.formularioCita.patchValue({
      ...cita,
      fecha_hora: this.normalizarFechaHoraParaInput(cita.fechaHora)
    });
  }

  private normalizarFechaHoraParaInput(valor: string): string {
    if (!valor) {
      return '';
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor.length >= 16 ? valor.slice(0, 16) : valor;
    }
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
  }

  private formatearFechaHoraParaApi(valor: string): string {
    if (!valor) {
      return '';
    }
    if (valor.length === 16) {
      return `${valor}:00`;
    }
    return valor;
  }

  private obtenerValorFormulario(): Cita {
    const raw = this.formularioCita.getRawValue();
    return {
      id_cita: Number(raw.id_cita ?? 0),
      fechaHora: this.formatearFechaHoraParaApi(String(raw.fecha_hora)),
      motivoCita: String(raw.motivo).trim(),
      estadoCitaIdEstadoCita: Number(raw.estado_cita_id_estado_cita),
      profesionalIdProfesional: Number(raw.profesional_id_profesional),
      pacienteIdPaciente: Number(raw.paciente_id_paciente)
    };
  }

  enviarFormulario(): void {
    this.mensajeError.set(null);
    if (this.formularioCita.invalid) {
      this.formularioCita.markAllAsTouched();
      return;
    }

    const datos = this.obtenerValorFormulario();
    const idEdicion = this.idCitaEnEdicion();

    this.guardando.set(true);
    const peticion =
      idEdicion === null
        ? this.citaService.create(datos)
        : this.citaService.update(idEdicion, datos);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.cargarCitas();
        this.prepararFormularioNuevo();
      },
      error: () =>
        this.mensajeError.set(
          idEdicion === null
            ? 'No se pudo agendar la cita.'
            : 'No se pudo actualizar la cita.'
        )
    });
  }

  eliminarCita(cita: Cita): void {
    const confirmar = window.confirm(
      `¿Eliminar la cita #${cita.id_cita} del paciente ${cita.pacienteIdPaciente}?`
    );
    if (!confirmar) {
      return;
    }

    this.mensajeError.set(null);
    this.guardando.set(true);
    this.citaService
      .delete(cita.id_cita)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          if (this.idCitaEnEdicion() === cita.id_cita) {
            this.prepararFormularioNuevo();
          }
          this.cargarCitas();
        },
        error: () => this.mensajeError.set('No se pudo eliminar la cita.')
      });
  }

  tituloFormulario(): string {
    return this.idCitaEnEdicion() === null
      ? 'Agendar cita'
      : 'Editar cita';
  }

  formatearFechaHoraTabla(valor: string): string {
    if (!valor) {
      return '—';
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }
    return fecha.toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }
}
