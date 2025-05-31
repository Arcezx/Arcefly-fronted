import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../services/cliente.service';
import { Cliente } from '../models/cliente.model';
import { FiltroClientePipe } from '../pipes/filtro-cliente.pipe';
import { ModalClienteComponent } from '../components/modal-cliente/modal-cliente.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18nService } from '../services/paginator-i18n.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tabla-clientes',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FiltroClientePipe,
    ModalClienteComponent,
    MatPaginatorModule
  ],
  templateUrl: './tabla-clientes.component.html',
  styleUrls: ['./tabla-clientes.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: PaginatorI18nService }
  ]
})
export class TablaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  isLoading = true;
  error: string | null = null;
  clienteSeleccionado: Cliente | null = null;
  filtroTexto = '';
  filtroTipo = '';
  
  // Paginación
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  currentPage = 0;
  
  // Modal
  mostrarModal = false;
  clienteEdicion: Cliente | null = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.clienteService.obtenerClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar clientes';
        this.isLoading = false;
        this.mostrarError('Error al cargar clientes', err.error?.message || 'No se pudieron obtener los clientes');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = this.clienteSeleccionado?.id === cliente.id ? null : cliente;
  }

  abrirFormularioNuevo(): void {
    this.clienteEdicion = null;
    this.mostrarModal = true;
  }

  editarCliente(cliente: Cliente): void {
    if (!cliente) return;
    this.clienteEdicion = { ...cliente };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.clienteEdicion = null;
  }

  guardarCliente(cliente: Cliente): void {
    const esEdicion = !!cliente.id;
    const operacion = esEdicion 
      ? this.clienteService.actualizarCliente(cliente.id, cliente)
      : this.clienteService.crearCliente(cliente);

    Swal.fire({
      title: esEdicion ? 'Actualizando cliente...' : 'Creando cliente...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: {
        popup: 'animated bounceIn'
      }
    });

    operacion.subscribe({
      next: (clienteGuardado) => {
        if (esEdicion) {
          this.clientes = this.clientes.map(c => 
            c.id === clienteGuardado.id ? clienteGuardado : c
          );
        } else {
          this.clientes = [...this.clientes, clienteGuardado];
        }

        Swal.fire({
          title: esEdicion ? '¡Actualizado!' : '¡Creado!',
          text: esEdicion ? 'Cliente actualizado correctamente' : 'Cliente creado exitosamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'animated fadeIn'
          },
          willClose: () => this.cerrarModal()
        });
      },
      error: (err) => {
        this.mostrarError(
          esEdicion ? 'Error al actualizar cliente' : 'Error al crear cliente',
          err.error?.message || 'Ocurrió un error al guardar los datos'
        );
      }
    });
  }

  eliminarCliente(cliente: Cliente): void {
    Swal.fire({
      title: 'Confirmar eliminación',
      html: `
        <div style="text-align: center;">
          <p>¿Está seguro que desea eliminar al cliente <strong>${cliente.nombre}</strong>?</p>
          <small class="text-muted">Esta acción no se puede deshacer</small>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: `
        rgba(0,0,0,0.4)
        url("/assets/images/alert-background.gif")
        center top
        no-repeat
      `,
      width: '500px',
      customClass: {
        popup: 'animated bounceIn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.clienteService.eliminarCliente(cliente.id).subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.id !== cliente.id);
            this.clienteSeleccionado = null;
            
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El cliente ha sido eliminado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            this.mostrarError('Error al eliminar cliente', err.error?.message || 'No se pudo completar la eliminación');
          }
        });
      }
    });
  }

  verDetalles(cliente: Cliente): void {
    Swal.fire({
      title: `Detalles de ${cliente.nombre}`,
      html: `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${cliente.id}</p>
          <p><strong>Email:</strong> ${cliente.email}</p>
          <p><strong>Tipo:</strong> <span class="badge ${cliente.tipo === 'PREMIUM' ? 'badge-premium' : 'badge-estandar'}">${cliente.tipo}</span></p>
          <p><strong>Estado:</strong> <span class="badge ${cliente.estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo'}">${cliente.estado}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      customClass: {
        popup: 'animated zoomIn'
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
}