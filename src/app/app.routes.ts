import { Routes } from '@angular/router';
import { HomeUsuarioComponent } from './pages/usuario/home-usuario-component/home-usuario-component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { CitaComponent } from './pages/cita/cita.component';
import { RegistroComponent } from './pages/registro-component/registro-component';
import { AdminComponent } from './pages/admin/admin';
import { LoginComponent } from './pages/login-component/login-component';
import { AgendarCitaComponent } from './pages/usuario/agendar-cita-component/agendar-cita-component';

export const routes: Routes = [
    {
        path: '',
        component: HomeUsuarioComponent
    },
    { 
        path: 'agendar-cita', 
        component: AgendarCitaComponent 
    },
    {
        path: 'pacientes',
        component: PacienteComponent
    },
    
    /* ─────────────────────────────────────────────────────────── */
    /* SECCIÓN SECTOR PROFESIONAL (UNIFICADO CON SUB-RUTAS)         */
    /* ─────────────────────────────────────────────────────────── */
    {
        path: 'profesionales',
        children: [
            {
                path: '',
                loadComponent: () => 
                    import('./pages/profesional/home-profesional-component/home-profesional-component')
                        .then(m => m.HomeProfesionalComponent)
            },
            {
                path: 'atencion/:id',
                loadComponent: () => 
                    import('./pages/profesional/atencion-paciente-component/atencion-paciente-component')
                        .then(m => m.AtencionPacienteComponent)
            }
        ]
    },
    /* ─────────────────────────────────────────────────────────── */

    {
        path: 'citas',
        component: CitaComponent
    },
    {
        path: 'registro',
        component: RegistroComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    { 
        path: 'admin', 
        component: AdminComponent 
    },
    { 
        path: '**', 
        redirectTo: '' 
    }
];