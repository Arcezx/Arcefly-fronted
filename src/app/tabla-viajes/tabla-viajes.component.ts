import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViajeService } from '../services/viaje.service';
import { Viaje } from '../models/viaje.model';
import { FiltroViajePipe } from '../pipes/filtro-viaje.pipe';
import { ModalViajeComponent } from '../components/modal-viaje/modal-viaje.component';
import { ViajeBackendResponse } from '../models/viaje-response.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatorI18nService } from '../services/paginator-i18n.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tabla-viajes',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FiltroViajePipe,
    ModalViajeComponent,
    MatPaginatorModule
  ],
  templateUrl: './tabla-viajes.component.html',
  styleUrls: ['./tabla-viajes.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: PaginatorI18nService }
  ]
})
export class TablaViajesComponent implements OnInit, OnDestroy {
  viajes: Viaje[] = [];
  loading = true;
  error: string | null = null;
  viajeSeleccionado: Viaje | null = null;
  filtroTexto = '';
  filtroTipo = '';
  
  // Paginación
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  currentPage = 0;
  
  mostrarModal = false;
  modoEdicion = false;
  
  private viajesUpdateSubscription!: Subscription;

  constructor(private viajeService: ViajeService) {}

  ngOnInit(): void {
    this.obtenerViajes();
    
    // Suscribirse a las actualizaciones
    this.viajesUpdateSubscription = this.viajeService.viajesUpdated$.subscribe(() => {
      this.obtenerViajes();
    });
  }

  ngOnDestroy(): void {
    if (this.viajesUpdateSubscription) {
      this.viajesUpdateSubscription.unsubscribe();
    }
  }

  obtenerViajes(): void {
    this.loading = true;
    this.error = null;
    
    this.viajeService.obtenerViajes().subscribe({
      next: (viajesBackend: ViajeBackendResponse[]) => {
        this.viajes = viajesBackend.map(v => ({
          id: v.idViaje,
          origen: v.origen,
          destino: v.destino,
          fechaSalida: new Date(v.fechaSalida),
          fechaRegreso: v.fechaRegreso ? new Date(v.fechaRegreso) : null,
          direccion: v.direccion || this.determinarTipoTrayecto(v.fechaRegreso),
          capacidad: v.capacidad,
          estado: v.estado.toUpperCase() as Viaje['estado'],
          clase: v.clase,
          tipo: v.tipo
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar viajes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private determinarTipoTrayecto(fechaRegreso: string | null): string {
    return fechaRegreso ? 'IDA Y VUELTA' : 'IDA';
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  seleccionarViaje(viaje: Viaje): void {
    this.viajeSeleccionado = this.viajeSeleccionado?.id === viaje.id ? null : viaje;
  }

  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.viajeSeleccionado = null;
    this.mostrarModal = true;
  }

  editarViaje(viaje: Viaje): void {
    if (!viaje) return;
    this.modoEdicion = true;
    this.viajeSeleccionado = viaje;
    this.mostrarModal = true;
  }

eliminarViaje(viaje: Viaje): void {
  Swal.fire({
    title: 'Confirmar eliminación',
    html: `
      <div style="text-align: center;">
        <p>¿Está seguro que desea eliminar el viaje a <strong>${viaje.destino}</strong>?</p>
        <small class="text-muted">Esta acción no se puede deshacer</small>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
    cancelButtonText: 'Cancelar',
    backdrop: `
      rgba(0,0,0,0.4)
      url("/assets/images/airplane.gif")
      center top
      no-repeat
    `,
    width: '500px',
    customClass: {
      popup: 'animated bounceIn'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.viajeService.eliminarViaje(viaje.id).subscribe({
        next: () => {
          // Eliminar de la lista local
          this.viajes = this.viajes.filter(v => v.id !== viaje.id);
          
          // Mostrar confirmación
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El viaje ha sido eliminado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
              this.viajeSeleccionado = null;
            }
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'No se pudo eliminar el viaje',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      });
    }
  });
}
  manejarSubmit(viaje: Viaje): void {
if (this.modoEdicion && this.viajeSeleccionado) {
  const estadoValidado = viaje.estado.toUpperCase() as 
    'PROGRAMADO' | 'REPROGRAMADO' | 'CANCELADO' | 'EMBARCANDO' | 
    'ATERRIZADO' | 'EN HORA' | 'POR CONFIRMAR' | 'ACTIVO';

  const viajeValidado: Viaje = {
    ...viaje,
    estado: estadoValidado,
    direccion: viaje.fechaRegreso ? 'IDA Y VUELTA' : 'IDA'
  };

  Swal.fire({
    title: 'Actualizando viaje...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'animated bounceIn'
    }
  });

  this.viajeService.actualizarViaje(this.viajeSeleccionado.id, viajeValidado).subscribe({
    next: (response) => {
      const viajeActualizado: Viaje = {
        ...response,
        fechaSalida: new Date(response.fechaSalida),
        fechaRegreso: response.fechaRegreso ? new Date(response.fechaRegreso) : null
      };
      
      const index = this.viajes.findIndex(v => v.id === viajeActualizado.id);
      if (index !== -1) {
        this.viajes[index] = viajeActualizado;
      }
      
      Swal.fire({
        title: '¡Actualizado!',
        text: 'Cambios guardados correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'animated fadeIn'
        },
        willClose: () => {
          this.mostrarModal = false;
        }
      });
    },
    error: (err) => {
      Swal.fire({
        title: 'Error',
        text: err.error?.message || 'Error al actualizar el viaje',
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'animated shakeX'
        }
      });
    }
  });
} else {
  Swal.fire({
    title: 'Creando viaje...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'animated bounceIn'
    }
  });

  this.viajeService.crearViaje(viaje).subscribe({
    next: (nuevoViaje) => {
      this.viajes.unshift({
        ...nuevoViaje,
        fechaSalida: new Date(nuevoViaje.fechaSalida),
        fechaRegreso: nuevoViaje.fechaRegreso ? new Date(nuevoViaje.fechaRegreso) : null
      });
      
      Swal.fire({
        title: '¡Creado!',
        text: 'Viaje registrado exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'animated fadeIn'
        },
        willClose: () => {
          this.mostrarModal = false;
        }
      });
    },
    error: (err) => {
      Swal.fire({
        title: 'Error',
        text: err.error?.message || 'Error al crear el viaje',
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'animated shakeX'
        }
      });
    }
  });
}
  }
}