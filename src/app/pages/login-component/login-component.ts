import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  loading = false;
  submitted = false;
  message = '';

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.message = 'Iniciando sesión...';

    setTimeout(() => {
      this.loading = false;
      this.message = 'Inicio de sesión exitoso';
      this.router.navigate(['/registro']);
    }, 800);
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty || this.submitted);
  }

  getError(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control?.errors) return 'Campo inválido.';
    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['email']) return 'Ingrese un email válido.';
    if (control.errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres.';
    return 'Campo inválido.';
  }
}