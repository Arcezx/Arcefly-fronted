import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Viaje } from '../../models/viaje.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ViajeService } from '../../services/viaje.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-viaje.component.html',
  styleUrls: ['./modal-viaje.component.scss']
})
export class ModalViajeComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() viaje: Viaje | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<Viaje>();

  formulario: FormGroup;
  esEdicion: boolean = false;

  ciudadesDisponibles: string[] = [
    'MADRID', 'BARCELONA', 'VALENCIA', 'SEVILLA',
    'MALAGA', 'BILBAO', 'GRANADA', 'ZARAGOZA',
    'PALMA', 'PARIS', 'LONDRES', 'ROMA',
    'BERLIN', 'IBIZA'
  ];

  estados = ['ACTIVO', 'PROGRAMADO', 'REPROGRAMADO', 'CANCELADO', 'EMBARCANDO', 'ATERRIZADO', 'EN HORA', 'POR CONFIRMAR'];
  clases = ['ECONOMICA', 'BUSINESS', 'VIP'];
  tipos = ['NACIONAL', 'INTERNACIONAL', 'PROMOCIONAL'];

  constructor(
    private fb: FormBuilder,
    private viajeService: ViajeService,
    private toastr: ToastrService
  ) {
    this.formulario = this.fb.group({
      id: [null],
      origen: [null, Validators.required],
      destino: [null, [Validators.required, this.validarDestino.bind(this)]],
      fechaSalida: ['', [Validators.required, this.validarFechaFutura]],
      fechaRegreso: ['', [this.validarFechaRegreso.bind(this)]],
      capacidad: ['', [Validators.required, Validators.min(70)]],
      direccion: [{ value: 'IDA', disabled: true }],
      estado: [null, Validators.required],
      clase: [null, Validators.required],
      tipo: [null, Validators.required]
    });

    this.formulario.get('fechaRegreso')?.valueChanges.subscribe((fechaRegreso) => {
      const direccion = fechaRegreso ? 'IDA Y VUELTA' : 'IDA';
      this.formulario.get('direccion')?.setValue(direccion);
    });
  }

  ngOnInit(): void {
    this.cargarCiudadesDeBD();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viaje']) {
      if (this.viaje) {
        this.esEdicion = true;
        const viajeConFechasFormateadas = {
          ...this.viaje,
          fechaSalida: this.formatDateForInput(this.viaje.fechaSalida),
          fechaRegreso: this.viaje.fechaRegreso ? this.formatDateForInput(this.viaje.fechaRegreso) : '',
          direccion: this.viaje.fechaRegreso ? 'IDA Y VUELTA' : 'IDA'
        };
        this.formulario.patchValue(viajeConFechasFormateadas);

        if (this.viaje.origen && !this.ciudadesDisponibles.includes(this.viaje.origen)) {
          this.ciudadesDisponibles.push(this.viaje.origen);
          this.ciudadesDisponibles.sort();
        }
        if (this.viaje.destino && !this.ciudadesDisponibles.includes(this.viaje.destino)) {
          this.ciudadesDisponibles.push(this.viaje.destino);
          this.ciudadesDisponibles.sort();
        }
      } else {
        this.esEdicion = false;
        this.formulario.reset({
          id: null,
          origen: null,
          destino: null,
          fechaSalida: '',
          fechaRegreso: '',
          capacidad: '',
          direccion: 'IDA',
          estado: null,
          clase: null,
          tipo: null
        });
      }
    }
  }

  cargarCiudadesDeBD(): void {
    this.viajeService.obtenerViajes().subscribe({
      next: (viajes) => {
        const origenesBD = [...new Set(viajes.map(v => v.origen))];
        const destinosBD = [...new Set(viajes.map(v => v.destino))];
        this.ciudadesDisponibles = [...new Set([...this.ciudadesDisponibles, ...origenesBD, ...destinosBD])];
        this.ciudadesDisponibles.sort();
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
      }
    });
  }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  validarDestino(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.parent) return null;
    const origen = control.parent.get('origen')?.value;
    if (origen && control.value && origen === control.value) {
      return { mismoDestino: true };
    }
    return null;
  }

  validarFechaFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fecha = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy ? { fechaPasada: true } : null;
  }

  validarFechaRegreso(control: AbstractControl): ValidationErrors | null {
    const fechaSalida = this.formulario?.get('fechaSalida')?.value;
    if (!fechaSalida || !control.value) return null;
    
    const fechaRegreso = new Date(control.value);
    const salida = new Date(fechaSalida);
    
    return fechaRegreso <= salida ? { fechaRegresoInvalida: true } : null;
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const formValue = this.formulario.getRawValue();
    const viajeData: Viaje = {
      ...formValue,
      fechaSalida: new Date(formValue.fechaSalida),
      fechaRegreso: formValue.fechaRegreso ? new Date(formValue.fechaRegreso) : null
    };

    this.submitForm.emit(viajeData);
    this.cerrar();
  }

  cerrar(): void {
    this.close.emit();
  }
}