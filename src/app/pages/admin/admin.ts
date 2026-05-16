import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesionalService } from '../../services/profesional.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  
  listaProfesionales: any[] = [];

  constructor(private profesionalService: ProfesionalService) {}

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.profesionalService.getAll().subscribe({
      next: (datos) => {
        // Si SpringBoot responde bien, usamos sus datos reales
        if(datos && datos.length > 0) {
          this.listaProfesionales = datos;
        }
      },
      error: (err) => {
        console.error('El backend no respondió, usando datos estables de maqueta:', err);
      }
    });
  }
}