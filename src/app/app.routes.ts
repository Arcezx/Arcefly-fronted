import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PanelComponent } from './panel/panel.component';
import { TablaReservasComponent } from './tabla-reservas/tabla-reservas.component';
import { TablaClientesComponent } from './tabla-clientes/tabla-clientes.component';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'panel', 
    component: PanelComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'reservas', 
    component: TablaReservasComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clientes', 
    component: TablaClientesComponent,
    canActivate: [AuthGuard] 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } // Manejo de rutas no encontradas
];