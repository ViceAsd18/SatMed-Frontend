import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { Profesional } from '../../models/Profesional';
import { ProfesionalService } from '../../services/profesional.service';

@Component({
  selector: 'app-profesional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profesional.component.html',
  styleUrls: ['./profesional.component.css']
})
export class ProfesionalComponent implements OnInit {
  private profesionalService = inject(ProfesionalService);
  private formBuilder = inject(FormBuilder);

  public listaProfesionales = signal<Profesional[]>([]);
  public cargando = signal(false);
  public guardando = signal(false);
  public mensajeError = signal<string | null>(null);

  /** Si no es null, el formulario edita ese idProfesional. */
  public idProfesionalEnEdicion = signal<number | null>(null);

  public formularioProfesional: FormGroup = this.formBuilder.group({
    idProfesional: [{ value: 0, disabled: true }, [Validators.min(0)]],
    numeroRegistroProfesional: [
      '',
      [Validators.required, Validators.maxLength(80)]
    ],
    idUsuario: [null, [Validators.required, Validators.min(1)]],
    idEspecialidad: [null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarProfesionales();
    this.prepararFormularioNuevo();
  }

  cargarProfesionales(): void {
    this.mensajeError.set(null);
    this.cargando.set(true);
    this.profesionalService
      .getAll()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (lista) => this.listaProfesionales.set(lista),
        error: () =>
          this.mensajeError.set(
            'No se pudo cargar la lista de profesionales. Verifique la API.'
          )
      });
  }

  prepararFormularioNuevo(): void {
    this.idProfesionalEnEdicion.set(null);
    this.formularioProfesional.reset({
      idProfesional: 0,
      numeroRegistroProfesional: '',
      idUsuario: null,
      idEspecialidad: null
    });
    this.formularioProfesional.get('idProfesional')?.disable();
  }

  editarProfesional(profesional: Profesional): void {
    this.idProfesionalEnEdicion.set(profesional.idProfesional);
    this.formularioProfesional.patchValue(profesional);
  }

  private obtenerValorFormulario(): Profesional {
    const raw = this.formularioProfesional.getRawValue();
    return {
      idProfesional: Number(raw.idProfesional ?? 0),
      numeroRegistroProfesional: String(raw.numeroRegistroProfesional).trim(),
      idUsuario: Number(raw.idUsuario),
      idEspecialidad: Number(raw.idEspecialidad)
    };
  }

  enviarFormulario(): void {
    this.mensajeError.set(null);
    if (this.formularioProfesional.invalid) {
      this.formularioProfesional.markAllAsTouched();
      return;
    }

    const datos = this.obtenerValorFormulario();
    const idEdicion = this.idProfesionalEnEdicion();

    this.guardando.set(true);
    const peticion =
      idEdicion === null
        ? this.profesionalService.create(datos)
        : this.profesionalService.update(idEdicion, datos);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.cargarProfesionales();
        this.prepararFormularioNuevo();
      },
      error: () =>
        this.mensajeError.set(
          idEdicion === null
            ? 'No se pudo crear el profesional.'
            : 'No se pudo actualizar el profesional.'
        )
    });
  }

  eliminarProfesional(profesional: Profesional): void {
    const confirmar = window.confirm(
      `¿Eliminar al profesional con registro ${profesional.numeroRegistroProfesional}?`
    );
    if (!confirmar) {
      return;
    }

    this.mensajeError.set(null);
    this.guardando.set(true);
    this.profesionalService
      .delete(profesional.idProfesional)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          if (this.idProfesionalEnEdicion() === profesional.idProfesional) {
            this.prepararFormularioNuevo();
          }
          this.cargarProfesionales();
        },
        error: () =>
          this.mensajeError.set('No se pudo eliminar el profesional.')
      });
  }

  tituloFormulario(): string {
    return this.idProfesionalEnEdicion() === null
      ? 'Registrar profesional'
      : 'Editar profesional';
  }
}
