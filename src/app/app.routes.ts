import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PanelComponent } from './panel/panel.component';
import { TablaReservasComponent } from './tabla-reservas/tabla-reservas.component';
import { TablaClientesComponent } from './tabla-clientes/tabla-clientes.component';
import { AuthGuard } from '../guards/auth.guard'; // 👈 Asegúrate de importar el guard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'panel', component: PanelComponent, canActivate: [AuthGuard] }, // 👈 Aquí se aplica el guard
  { path: 'reservas', component: TablaReservasComponent },
  { path: 'clientes', component: TablaClientesComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
