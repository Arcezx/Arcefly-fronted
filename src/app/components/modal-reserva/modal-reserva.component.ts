import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../models/reserva.model';
import { ReservaService } from '../../services/reserva.service';
import { ViajeService } from '../../services/viaje.service';
import { ClienteService } from '../../services/cliente.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

interface ClienteParaSelector {
  id: number;
  textoOpcion: string;
}

interface ViajeParaSelector {
  id: number;
  textoOpcion: string;
}

@Component({
  selector: 'app-modal-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgFor, NgIf],
  templateUrl: './modal-reserva.component.html',
  styleUrls: ['./modal-reserva.component.scss']
})
export class ModalReservaComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() reserva: Reserva | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<Reserva>();

  formulario: FormGroup;
  esEdicion: boolean = false;
  estadosReserva = ['ACTIVA', 'POR CONFIRMAR', 'CANCELADA'];
  clientes: ClienteParaSelector[] = [];
  viajes: ViajeParaSelector[] = [];
  asientoDisponible: boolean = true;
  loading = false;
  verificandoAsiento = false;
  clienteYaReservado: boolean = false;
  private asientoOriginal: string = '';
  private idViajeOriginal: number | null = null;
  private idUsuarioOriginal: number | null = null;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private viajeService: ViajeService,
    private clienteService: ClienteService
  ) {
    this.formulario = this.fb.group({
      idReserva: [null],
      idViaje: ['', [Validators.required, Validators.min(1)]],
      idUsuario: ['', [Validators.required, Validators.min(1)]],
      fechaReserva: ['', Validators.required],
      asiento: ['', [Validators.required, Validators.pattern(/^[0-9]+[A-Za-z]?$/)]],
      estado: ['POR CONFIRMAR', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    this.formulario.get('asiento')?.valueChanges.subscribe(() => {
      if (!this.esEdicion || this.formulario.get('asiento')?.value !== this.asientoOriginal) {
        this.verificarAsiento();
      }
    });

    this.formulario.get('idViaje')?.valueChanges.subscribe(() => {
      if (!this.esEdicion || this.formulario.get('idViaje')?.value !== this.idViajeOriginal) {
        this.verificarClienteConReserva();
      }
    });

    this.formulario.get('idUsuario')?.valueChanges.subscribe(() => {
      if (!this.esEdicion || this.formulario.get('idUsuario')?.value !== this.idUsuarioOriginal) {
        this.verificarClienteConReserva();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reserva'] && this.reserva) {
      this.esEdicion = true;
      this.asientoOriginal = this.reserva.asiento;
      this.idViajeOriginal = this.reserva.idViaje;
      this.idUsuarioOriginal = this.reserva.idUsuario;
      
      this.asientoDisponible = true;
      this.clienteYaReservado = false;
      this.verificandoAsiento = false;
      
      this.formulario.patchValue({
        idReserva: this.reserva.idReserva,
        idViaje: this.reserva.idViaje,
        idUsuario: this.reserva.idUsuario,
        fechaReserva: this.formatDateForInput(this.reserva.fechaReserva),
        asiento: this.reserva.asiento,
        estado: this.reserva.estado
      });
    } else if (changes['reserva'] && !this.reserva) {
      this.resetFormulario();
    }
  }

  private cargarDatosIniciales(): void {
    this.loading = true;

    this.clienteService.obtenerClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.map(c => ({
          id: c.id,
          textoOpcion: `${c.id} - ${c.nombre} (${c.email})`
        }));
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    });

    this.viajeService.obtenerViajes().subscribe({
      next: (viajes) => {
        this.viajes = viajes.map(v => ({
          id: v.idViaje,
          textoOpcion: `${v.idViaje} - ${v.origen} a ${v.destino} (${new Date(v.fechaSalida).toLocaleDateString()})`
        }));
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los viajes', 'error');
        this.loading = false;
      }
    });
  }

  verificarAsiento(): void {
    const idViaje = this.formulario.get('idViaje')?.value;
    const asiento = this.formulario.get('asiento')?.value;

    if (!idViaje || !asiento || !this.formulario.get('asiento')?.valid) return;

    this.verificandoAsiento = true;

    this.reservaService.verificarAsiento(idViaje, asiento).pipe(
      catchError(() => of(true))
    ).subscribe({
      next: (disponible) => {
        this.asientoDisponible = disponible;
        this.verificandoAsiento = false;
      },
      error: () => {
        this.verificandoAsiento = false;
        this.asientoDisponible = true;
      }
    });
  }

  private verificarClienteConReserva(): void {
    const idViaje = this.formulario.get('idViaje')?.value;
    const idUsuario = this.formulario.get('idUsuario')?.value;

    if (!idViaje || !idUsuario) return;

    this.reservaService.existeReservaParaCliente(idViaje, idUsuario).pipe(
      catchError(() => of(false))
    ).subscribe({
      next: (existe) => {
        this.clienteYaReservado = existe;
      }
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      Swal.fire('Error', 'Complete todos los campos correctamente', 'error');
      return;
    }

    if (this.clienteYaReservado && !this.esEdicion) {
      Swal.fire('Error', 'Este cliente ya tiene una reserva en este viaje', 'error');
      return;
    }

    if (!this.esEdicion || this.formulario.get('asiento')?.value !== this.asientoOriginal) {
      if (!this.asientoDisponible) {
        Swal.fire('Error', 'El asiento seleccionado no está disponible', 'error');
        return;
      }
    }

    if (this.verificandoAsiento) {
      Swal.fire('Advertencia', 'Espere mientras verificamos el asiento', 'warning');
      return;
    }

    const reservaData: Reserva = {
      ...this.formulario.getRawValue(),
      fechaReserva: new Date(this.formulario.get('fechaReserva')?.value)
    };

    if (this.esEdicion) {
      this.actualizarReserva(reservaData);
    } else {
      this.crearReserva(reservaData);
    }
  }

  private crearReserva(reservaData: Reserva): void {
    this.loading = true;
    Swal.fire({
      title: 'Creando reserva...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.reservaService.crearReserva(reservaData).subscribe({
      next: (nuevaReserva) => {
        Swal.fire({
          title: '¡Reserva creada!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.submitForm.emit(nuevaReserva);
          this.resetFormulario();
          this.close.emit();
        });
      },
      error: (error: HttpErrorResponse) => {
        Swal.fire('Error', error.error?.message || 'Error al crear reserva', 'error');
        this.loading = false;
      }
    });
  }

  private actualizarReserva(reservaData: Reserva): void {
    this.loading = true;
    Swal.fire({
      title: 'Actualizando reserva...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.reservaService.actualizarReserva(reservaData.idReserva!, reservaData).subscribe({
      next: (reservaActualizada) => {
        Swal.fire({
          title: '¡Reserva actualizada!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.submitForm.emit(reservaActualizada);
          this.resetFormulario();
          this.close.emit();
        });
      },
      error: (error: HttpErrorResponse) => {
        Swal.fire('Error', error.error?.message || 'Error al actualizar reserva', 'error');
        this.loading = false;
      }
    });
  }

  cerrar(): void {
    this.resetFormulario();
    this.close.emit();
  }

  private resetFormulario(): void {
    this.formulario.reset({
      idReserva: null,
      idViaje: '',
      idUsuario: '',
      fechaReserva: this.formatDateForInput(new Date()),
      asiento: '',
      estado: 'POR CONFIRMAR'
    });
    this.esEdicion = false;
    this.loading = false;
    this.verificandoAsiento = false;
    this.asientoDisponible = true;
    this.clienteYaReservado = false;
    this.asientoOriginal = '';
    this.idViajeOriginal = null;
    this.idUsuarioOriginal = null;
  }

  private formatDateForInput(date: Date | string): string {
    return new Date(date).toISOString().split('T')[0];
  }
}