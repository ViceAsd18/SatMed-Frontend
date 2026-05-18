import { Routes } from '@angular/router';
import { HomeUsuarioComponent } from './pages/usuario/home-usuario-component/home-usuario-component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { ProfesionalComponent } from './pages/profesional/profesional.component';
import { CitaComponent } from './pages/cita/cita.component';
import { RegistroComponent } from './pages/registro-component/registro-component';
import { AdminComponent } from './pages/admin/admin';
import { LoginComponent } from './pages/login-component/login-component';

export const routes: Routes = [

    {
        path : '',
        component : HomeUsuarioComponent
    },
    {
        path: 'pacientes',
        component: PacienteComponent
    },
    {
        path: 'profesionales',
        component: ProfesionalComponent
    },
    {
        path: 'citas',
        component: CitaComponent
    },
    {
        path : 'registro',
        component : RegistroComponent
    },

    {
        path: 'login',
        component: LoginComponent
    },

    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
];