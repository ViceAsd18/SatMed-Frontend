import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Especialidad } from '../../../models/Especialidad';
import { EspecialidadesService } from '../../../services/especialidad-service';

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-usuario-component.html',
  styleUrls: ['./home-usuario-component.css']
})
export class HomeUsuarioComponent implements OnInit {
  private especialidadesService = inject(EspecialidadesService);

  especialidades$!: Observable<Especialidad[]>;

  ngOnInit(): void {
    this.especialidades$ = this.especialidadesService.getEspecialidades();
  }

  obtenerImagenEspecialidad(id: number): string {
    const mapa: Record<number, string> = {
      1: '/img/especialidades/cardiology.svg',
      2: '/img/especialidades/pediatria.svg',
      3: '/img/especialidades/neurologia.svg',
      4: '/img/especialidades/dermatologia.svg'
    };

    return mapa[id] ?? '/img/especialidades/default.png';
  }
}