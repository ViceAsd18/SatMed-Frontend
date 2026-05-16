import { Routes } from '@angular/router';
import { HomeUsuarioComponent } from './pages/usuario/home-usuario-component/home-usuario-component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { ProfesionalComponent } from './pages/profesional/profesional.component';
import { AdminComponent } from './pages/admin/admin';

export const routes: Routes = [
    { path: '', component: HomeUsuarioComponent },
    { path: 'pacientes', component: PacienteComponent },
    { path: 'profesionales', component: ProfesionalComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
];