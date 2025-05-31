import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../models/reserva.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroReservaPipe } from '../pipes/filtro-reserva.pipe';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18nService } from '../services/paginator-i18n.service';
import Swal from 'sweetalert2';
import { ModalReservaComponent } from '../components/modal-reserva/modal-reserva.component';

@Component({
  selector: 'app-tabla-reservas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FiltroReservaPipe,
    MatPaginatorModule,
    ModalReservaComponent
  ],
  templateUrl: './tabla-reservas.component.html',
  styleUrls: ['./tabla-reservas.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: PaginatorI18nService }
  ]
})
export class TablaReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  reservaSeleccionada: Reserva | null = null;
  filtroTexto = '';
  filtroEstado = '';
  mostrarModalReserva = false;
  modoModal: 'crear' | 'editar' = 'crear';
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  currentPage = 0;

  constructor(
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.suscribirACambios();
  }

  private suscribirACambios(): void {
    this.reservaService.reservas$.subscribe(reservas => {
      this.reservas = reservas;
      this.isLoading = false;
    });
  }

  cargarReservas(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.reservaService.obtenerReservas().subscribe({
      error: (err) => {
        this.errorMessage = 'Error al cargar reservas';
        this.isLoading = false;
        this.mostrarError('Error al cargar reservas', err.error?.message || 'No se pudieron obtener las reservas');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  seleccionarReserva(reserva: Reserva): void {
    this.reservaSeleccionada = this.reservaSeleccionada?.idReserva === reserva.idReserva ? null : reserva;
  }

  verDetalles(event: Event, reserva: Reserva): void {
    event.stopPropagation();
    
    const detallesHtml = `
      <div class="reserva-details">
        <div class="detail-row">
          <span class="detail-label">ID Reserva:</span>
          <span class="detail-value">${reserva.idReserva}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID Viaje:</span>
          <span class="detail-value">${reserva.idViaje}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID Usuario:</span>
          <span class="detail-value">${reserva.idUsuario}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha Reserva:</span>
          <span class="detail-value">${new Date(reserva.fechaReserva).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Asiento:</span>
          <span class="detail-value">${reserva.asiento}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="badge-${reserva.estado.toLowerCase()}">
            ${reserva.estado}
          </span>
        </div>
      </div>
    `;

    const swalConfig: any = {
      title: `Detalles de Reserva #${reserva.idReserva}`,
      html: detallesHtml,
      customClass: {
        popup: 'animated bounceIn',
        htmlContainer: 'text-left',
        actions: 'swal-actions-reserva'
      },
      buttonsStyling: true,
      backdrop: `rgba(0,0,0,0.4)`
    };

    if (reserva.estado === 'POR CONFIRMAR') {
      swalConfig.showCancelButton = true;
      swalConfig.confirmButtonText = 'Confirmar Reserva';
      swalConfig.confirmButtonColor = '#28a745';
      swalConfig.showDenyButton = true;
      swalConfig.denyButtonText = 'Cancelar Reserva';
      swalConfig.denyButtonColor = '#dc3545';
      swalConfig.cancelButtonText = 'Cerrar';
      swalConfig.cancelButtonColor = '#6c757d';
    } else {
      swalConfig.confirmButtonText = 'Cerrar';
      swalConfig.confirmButtonColor = '#3498db';
    }

    Swal.fire(swalConfig).then((result) => {
      if (result.isConfirmed && reserva.estado === 'POR CONFIRMAR') {
        this.confirmarReserva(reserva);
      } else if (result.isDenied) {
        this.procesarCancelacion(reserva);
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.modoModal = 'crear';
    this.reservaSeleccionada = null;
    this.mostrarModalReserva = true;
  }

  editarReserva(): void {
    if (this.reservaSeleccionada) {
      this.modoModal = 'editar';
      this.mostrarModalReserva = true;
    }
  }

  cancelarReserva(): void {
    if (!this.reservaSeleccionada) return;
    this.procesarCancelacion(this.reservaSeleccionada);
  }

  confirmarReserva(reserva: Reserva): void {
    const swalLoading = Swal.fire({
      title: 'Confirmando reserva...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.reservaService.confirmarReserva(reserva.idReserva).subscribe({
      next: () => {
        Swal.close();
        Swal.fire({
          title: 'Reserva confirmada',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.close();
        this.mostrarError('Error', 'No se pudo confirmar la reserva');
      }
    });
  }

  procesarCancelacion(reserva: Reserva): void {
    Swal.fire({
      title: 'Confirmar cancelación',
      html: `
        <div style="text-align: center;">
          <p>¿Está seguro que desea cancelar la reserva <strong>${reserva.idReserva}</strong>?</p>
          <small class="text-muted">Esta acción cambiará el estado a CANCELADA</small>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '<i class="fas fa-ban"></i> Sí, cancelar',
      cancelButtonText: 'No, volver',
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancelarReservaConfirmado(reserva);
      }
    });
  }

  cancelarReservaConfirmado(reserva: Reserva): void {
    const swalLoading = Swal.fire({
      title: 'Cancelando reserva...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.reservaService.cancelarReserva(reserva.idReserva).subscribe({
      next: () => {
        Swal.close();
        Swal.fire({
          title: 'Reserva cancelada',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.close();
        this.mostrarError('Error', 'No se pudo cancelar la reserva');
      }
    });
  }

  eliminarReserva(): void {
    if (!this.reservaSeleccionada) return;

    Swal.fire({
      title: '¿Eliminar reserva?',
      text: `¿Estás seguro de que deseas eliminar la reserva ${this.reservaSeleccionada.idReserva}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const swalLoading = Swal.fire({
          title: 'Eliminando reserva...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.reservaService.eliminarReserva(this.reservaSeleccionada!.idReserva).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({
              title: 'Reserva eliminada',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.close();
            this.mostrarError('Error al eliminar reserva', err.error?.message || 'No se pudo eliminar la reserva');
          }
        });
      }
    });
  }

  private mostrarError(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'animated shakeX'
      }
    });
  }

  cerrarModalReserva(): void {
    this.mostrarModalReserva = false;
    this.reservaSeleccionada = null;
  }

  onReservaGuardada(reserva: Reserva): void {
    Swal.fire({
      title: this.modoModal === 'crear' ? 'Reserva creada' : 'Reserva actualizada',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
}