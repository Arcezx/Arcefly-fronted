import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PanelComponent } from './panel/panel.component';
import { AuthGuard } from '../guards/auth.guard';
import { TablaReservasComponent } from './tabla-reservas/tabla-reservas.component';
import { TablaClientesComponent } from './tabla-clientes/tabla-clientes.component';
import { TablaViajesComponent } from './tabla-viajes/tabla-viajes.component';
import { ReporteIncidenteComponent } from './components/reporte-incidente/reporte-incidente.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'panel', 
    component: PanelComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TablaViajesComponent }, 
      { path: 'viajes', component: TablaViajesComponent },
      { path: 'clientes', component: TablaClientesComponent },
      { path: 'reservas', component: TablaReservasComponent },
      { path: 'reporte', component: ReporteIncidenteComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } // Ruta por defecto para errores
];
