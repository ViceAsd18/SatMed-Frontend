import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { Paciente } from '../../models/paciente';
import { PacienteService } from '../../services/paciente.service';

/** Rol por defecto asignado a pacientes en el sistema. */
const ID_ROL_PACIENTE = 3;

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private formBuilder = inject(FormBuilder);

  public pacientes = signal<Paciente[]>([]);
  public cargando = signal(false);
  public guardando = signal(false);
  public mensajeError = signal<string | null>(null);

  /** Si es distinto de null, el formulario está en modo edición para ese idUsuario. */
  public idUsuarioEnEdicion = signal<number | null>(null);

  public formularioPaciente: FormGroup = this.formBuilder.group({
    idUsuario: [{ value: 0, disabled: true }, [Validators.min(0)]],
    rutUsuario: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{7,8}-[0-9kK]{1}$/)
      ]
    ],
    pnombreUsuario: ['', [Validators.required, Validators.maxLength(100)]],
    snombreUsuario: ['', [Validators.required, Validators.maxLength(100)]],
    apaternoUsuario: ['', [Validators.required, Validators.maxLength(100)]],
    amaternoUsuario: ['', [Validators.required, Validators.maxLength(100)]],
    emailUsuario: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(150)]
    ],
    telefonoUsuario: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9+\s-]{8,20}$/)
      ]
    ],
    fechaNacimientoUsuario: ['', [Validators.required]],
    contrasenaUsuario: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(120)]
    ],
    activo: [true],
    fechaCreacionUsuario: ['', [Validators.required]],
    idGenero: [null, [Validators.required, Validators.min(1)]],
    idDireccion: [null, [Validators.required, Validators.min(1)]],
    idRol: [
      ID_ROL_PACIENTE,
      [Validators.required, Validators.min(1)]
    ]
  });

  ngOnInit(): void {
    this.cargarPacientes();
    this.prepararFormularioNuevo();
  }

  /** Construye el nombre completo para mostrar en la tabla. */
  obtenerNombreCompleto(paciente: Paciente): string {
    return [
      paciente.pnombreUsuario,
      paciente.snombreUsuario,
      paciente.apaternoUsuario,
      paciente.amaternoUsuario
    ]
      .filter((parte) => parte?.trim().length > 0)
      .join(' ');
  }

  cargarPacientes(): void {
    this.mensajeError.set(null);
    this.cargando.set(true);
    this.pacienteService
      .getAll()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.pacientes.set(lista),
        error: () =>
          this.mensajeError.set(
            'No se pudo cargar la lista de pacientes. Verifique la API.'
          )
      });
  }

  prepararFormularioNuevo(): void {
    this.idUsuarioEnEdicion.set(null);
    const hoy = new Date().toISOString().slice(0, 10);
    this.formularioPaciente.reset({
      idUsuario: 0,
      rutUsuario: '',
      pnombreUsuario: '',
      snombreUsuario: '',
      apaternoUsuario: '',
      amaternoUsuario: '',
      emailUsuario: '',
      telefonoUsuario: '',
      fechaNacimientoUsuario: '',
      contrasenaUsuario: '',
      activo: true,
      fechaCreacionUsuario: hoy,
      idGenero: null,
      idDireccion: null,
      idRol: ID_ROL_PACIENTE
    });
    this.formularioPaciente.get('idUsuario')?.disable();
  }

  editarPaciente(paciente: Paciente): void {
    this.idUsuarioEnEdicion.set(paciente.idUsuario);
    this.formularioPaciente.patchValue({
      ...paciente,
      fechaNacimientoUsuario: this.normalizarFechaParaInput(
        paciente.fechaNacimientoUsuario
      ),
      fechaCreacionUsuario: this.normalizarFechaParaInput(
        paciente.fechaCreacionUsuario
      )
    });
  }

  private normalizarFechaParaInput(valor: string): string {
    if (!valor) {
      return '';
    }
    return valor.length >= 10 ? valor.slice(0, 10) : valor;
  }

  private obtenerValorFormulario(): Paciente {
    const raw = this.formularioPaciente.getRawValue();
    return {
      ...raw,
      idUsuario: raw.idUsuario ?? 0,
      idGenero: Number(raw.idGenero),
      idDireccion: Number(raw.idDireccion),
      idRol: Number(raw.idRol)
    } as Paciente;
  }

  enviarFormulario(): void {
    this.mensajeError.set(null);
    if (this.formularioPaciente.invalid) {
      this.formularioPaciente.markAllAsTouched();
      return;
    }

    const datos = this.obtenerValorFormulario();
    const idEdicion = this.idUsuarioEnEdicion();

    this.guardando.set(true);
    const peticion =
      idEdicion === null
        ? this.pacienteService.create(datos)
        : this.pacienteService.update(idEdicion, datos);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.cargarPacientes();
        this.prepararFormularioNuevo();
      },
      error: () =>
        this.mensajeError.set(
          idEdicion === null
            ? 'No se pudo crear el paciente.'
            : 'No se pudo actualizar el paciente.'
        )
    });
  }

  eliminarPaciente(paciente: Paciente): void {
    const confirmar = window.confirm(
      `¿Eliminar al paciente con RUT ${paciente.rutUsuario}?`
    );
    if (!confirmar) {
      return;
    }

    this.mensajeError.set(null);
    this.guardando.set(true);
    this.pacienteService
      .delete(paciente.idUsuario)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          if (this.idUsuarioEnEdicion() === paciente.idUsuario) {
            this.prepararFormularioNuevo();
          }
          this.cargarPacientes();
        },
        error: () =>
          this.mensajeError.set('No se pudo eliminar el paciente.')
      });
  }

  tituloFormulario(): string {
    return this.idUsuarioEnEdicion() === null
      ? 'Registrar paciente'
      : 'Editar paciente';
  }
}
