import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reporte-incidente',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './reporte-incidente.component.html',
  styleUrls: ['./reporte-incidente.component.scss']
})
export class ReporteIncidenteComponent {
  icons = {
    send: faPaperPlane,
    spinner: faSpinner
  };
  
  incidente = {
    area: '',
    descripcion: '',
    email: ''
  };

  enviado = false;
  cargando = false;
  error = '';

  constructor(private apiService: ApiService) {}
enviarReporte() {
  if (this.cargando) return;
  
  this.cargando = true;
  this.error = '';

  this.apiService.enviarIncidente(this.incidente).subscribe({
    next: (response: any) => {
      this.enviado = true;
      this.cargando = false;
      this.incidente.descripcion = '';
    },
    error: (err) => {
      console.error('Error detallado:', err);
      this.error = err.error?.message || 'Error al enviar. Por favor intenta nuevamente.';
      this.cargando = false;
    }
  });
}
}