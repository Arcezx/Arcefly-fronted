import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TablaClientesComponent } from '../tabla-clientes/tabla-clientes.component';
import { TablaViajesComponent } from '../tabla-viajes/tabla-viajes.component';
import { AuthService } from '../services/auth.service';
import { TablaReservasComponent } from '../tabla-reservas/tabla-reservas.component';
import { ReporteIncidenteComponent } from '../components/reporte-incidente/reporte-incidente.component';
@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
mostrarInicio(): void {
 
}
  // Métodos que coinciden con los usados en la plantilla
  darAltaAdmin() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

  }

mostrarViajes() {
  this.router.navigate(['panel/viajes']); 
}

mostrarClientes() {
  this.router.navigate(['panel/clientes']);
}

mostrarReservas() {
  this.router.navigate(['panel/reservas']);
}

generarReporte() {
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }
  this.router.navigate(['panel/reporte']); // Navega a la ruta hija
}

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}