import {
  Component, OnInit, OnDestroy,
  inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AtencionMedica } from '../../../models/AtencionMedica';
import { Tratamiento } from '../../../models/Tratamiento';
import { Interconsulta } from '../../../models/Interconsulta';
import { SharedLayoutComponent } from '../../../components/shared-layout-component/shared-layout-component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-atencion-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedLayoutComponent],
  templateUrl: './atencion-paciente-component.html',
  styleUrls: ['./atencion-paciente-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtencionPacienteComponent implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  /* Datos del paciente actual */
  pacienteNombre = 'Juan Pérez';

  /* Objetos basados en sus modelos de backend */
  //Le faltaba propiedades para complir con el model
  nuevaAtencion: AtencionMedica = {
    idAtencion: 0,
    fechaAtencion: new Date().toISOString(),
    diagnostico: '',
    indicaciones: '',
    motivo : '',
    idProfesional: 10,
    idPaciente: 1
  };

  //No coincide con el model
  nuevoTratamiento: Tratamiento = {
    idTratamiento: 0,
    descripcionTratamiento: '',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date().toISOString(),
    idAtencionMedica: 0,
    idEstadoTratamiento: 1
  };

  //No coincide con el model
  nuevaInterconsulta: Interconsulta = {
    idInterconsulta: 0,
    motivo: '',
    fechaEmision: new Date().toISOString(),
    idProfesional: 10,
    atencionMedica: this.nuevaAtencion
  };

  ngOnInit(): void {
    this.cdr.markForCheck();
  }

  /* Guardar los datos en el sistema */
  guardarFichaClinica(): void {
    console.log('Guardando Atención Médica:', this.nuevaAtencion);
    console.log('Guardando Tratamiento:', this.nuevoTratamiento);
    alert('Atención clínica guardada con éxito.');
    this.router.navigate(['/profesional']);
  }

  /* Salir sin guardar */
  cancelarAtencion(): void {
    this.router.navigate(['/profesional']);
  }
}