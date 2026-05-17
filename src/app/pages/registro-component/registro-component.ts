import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RegionService } from '../../services/RegionService/region-service';
import { ComunaService } from '../../services/ComunaService/comuna-service';
import { Region } from '../../models/Region';
import { Comuna } from '../../models/Comuna';
import { Genero } from '../../models/Genero';
import { GeneroService } from '../../services/GeneroService/genero-service';

@Component({
  selector: 'app-registro-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-component.html',
  styleUrl: './registro-component.css'
})
export class RegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly regionService = inject(RegionService);
  private readonly comunaService = inject(ComunaService);
  private readonly generoService = inject(GeneroService);

  regiones: Region[] = [];
  comunas: Comuna[] = [];
  generos: Genero[] = [];

  currentStep = 1;
  loading = false;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  cargandoRegiones = false;
  cargandoComunas = false;
  cargandoGeneros = false;

  readonly registroForm = this.fb.group(
    {
      rutUsuario: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)]],
      pnombreUsuario: ['', [Validators.required, Validators.minLength(2)]],
      snombreUsuario: [''],
      apaternoUsuario: ['', [Validators.required, Validators.minLength(2)]],
      amaternoUsuario: ['', [Validators.required, Validators.minLength(2)]],
      emailUsuario: ['', [Validators.required, Validators.email]],
      telefonoUsuario: ['', [Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
      diaNacimientoUsuario: ['', [Validators.required, Validators.pattern(/^\d{1,2}$/)]],
      mesNacimientoUsuario: ['', [Validators.required]],
      anioNacimientoUsuario: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      calleUsuario: ['', [Validators.required, Validators.minLength(3)]],
      numeroUsuario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      regionUsuario: ['', [Validators.required]],
      comunaUsuario: ['', [Validators.required, Validators.minLength(2)]],
      idGenero: ['', [Validators.required]],
      contrasenaUsuario: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasenaUsuario: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]]
    },
    { validators: [this.passwordMatchValidator(), this.birthDateValidator()] }
  );

  ngOnInit(): void {
    this.cargarRegiones();
    this.cargarGeneros();
    this.configurarCambioRegion();
  }

  cargarRegiones(): void {
    this.cargandoRegiones = true;

    this.regionService.obtenerRegiones().subscribe({
      next: (data) => {
        this.regiones = data;
        this.cargandoRegiones = false;
      },
      error: () => {
        this.regiones = [];
        this.cargandoRegiones = false;
      }
    });
  }

  cargarGeneros(): void {
    this.cargandoGeneros = true;

    this.generoService.obtenerGeneros().subscribe({
      next: (data) => {
        this.generos = data;
        this.cargandoGeneros = false;
      },
      error: () => {
        this.generos = [];
        this.cargandoGeneros = false;
      }
    });
  }

  configurarCambioRegion(): void {
    this.registroForm.get('regionUsuario')?.valueChanges.subscribe((idRegion) => {
      this.registroForm.get('comunaUsuario')?.setValue('');
      this.comunas = [];

      if (idRegion) {
        this.cargarComunas(Number(idRegion));
      }
    });
  }

  cargarComunas(idRegion: number): void {
    this.cargandoComunas = true;

    this.comunaService.obtenerComunasPorRegion(idRegion).subscribe({
      next: (data) => {
        this.comunas = data;
        this.cargandoComunas = false;
      },
      error: () => {
        this.comunas = [];
        this.cargandoComunas = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep(): void {
    if (this.validateCurrentStep()) this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  onSubmit(): void {
    this.submitted = true;
    this.markStepTouched(3);

    if (this.registroForm.invalid) return;

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      console.log({
        ...this.registroForm.getRawValue(),
        fechaNacimientoUsuario: this.fechaNacimientoUsuario
      });
    }, 1200);
  }

  isInvalid(controlName: string): boolean {
    const control = this.registroForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty || this.submitted);
  }

  getError(controlName: string): string {
    const control = this.registroForm.get(controlName);
    if (!control?.errors) return 'Campo inválido.';

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['minlength']) return 'El valor ingresado es demasiado corto.';
    if (control.errors['email']) return 'Ingrese un email válido.';
    if (control.errors['pattern'] && controlName === 'rutUsuario') return 'RUT inválido. Use el formato 12.345.678-k.';
    if (control.errors['pattern'] && controlName === 'numeroUsuario') return 'Ingrese solo números.';
    if (control.errors['pattern'] && controlName === 'diaNacimientoUsuario') return 'El día debe contener solo números.';
    if (control.errors['pattern'] && controlName === 'anioNacimientoUsuario') return 'El año debe contener solo números.';
    if (control.errors['pattern'] && controlName === 'telefonoUsuario') return 'Teléfono inválido.';
    if (control.errors['requiredTrue']) return 'Debe aceptar los términos.';
    if (controlName === 'confirmarContrasenaUsuario' && this.registroForm.errors?.['passwordMismatch']) return 'Las contraseñas no coinciden.';
    if (
      (controlName === 'diaNacimientoUsuario' || controlName === 'mesNacimientoUsuario' || controlName === 'anioNacimientoUsuario') &&
      this.registroForm.errors?.['invalidBirthDate']
    ) {
      return 'La fecha de nacimiento no es válida.';
    }
    return 'Campo inválido.';
  }

  get fechaNacimientoUsuario(): string {
    const dia = String(this.registroForm.get('diaNacimientoUsuario')?.value ?? '').padStart(2, '0');
    const mes = String(this.registroForm.get('mesNacimientoUsuario')?.value ?? '');
    const anio = String(this.registroForm.get('anioNacimientoUsuario')?.value ?? '');
    return dia && mes && anio ? `${dia}-${mes}-${anio}` : '';
  }

  private validateCurrentStep(): boolean {
    this.markStepTouched(this.currentStep);
    return this.getStepControls(this.currentStep).every(name => this.registroForm.get(name)?.valid);
  }

  private markStepTouched(step: number): void {
    this.getStepControls(step).forEach(name => this.registroForm.get(name)?.markAsTouched());
    this.registroForm.updateValueAndValidity();
  }

  private getStepControls(step: number): string[] {
    if (step === 1) {
      return [
        'rutUsuario',
        'pnombreUsuario',
        'snombreUsuario',
        'apaternoUsuario',
        'amaternoUsuario',
        'emailUsuario',
        'telefonoUsuario',
        'diaNacimientoUsuario',
        'mesNacimientoUsuario',
        'anioNacimientoUsuario'
      ];
    }
    if (step === 2) return ['calleUsuario', 'numeroUsuario', 'regionUsuario', 'comunaUsuario', 'idGenero'];
    return ['contrasenaUsuario', 'confirmarContrasenaUsuario', 'terminos'];
  }

  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('contrasenaUsuario')?.value;
      const confirm = group.get('confirmarContrasenaUsuario')?.value;
      return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
    };
  }

  private birthDateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const d = Number(group.get('diaNacimientoUsuario')?.value);
      const m = Number(group.get('mesNacimientoUsuario')?.value);
      const y = Number(group.get('anioNacimientoUsuario')?.value);

      if (!d || !m || !y) return null;

      const date = new Date(y, m - 1, d);
      const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
      return valid ? null : { invalidBirthDate: true };
    };
  }
}