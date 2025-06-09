import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-modal-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './modal-cliente.component.html',
  styleUrls: ['./modal-cliente.component.scss']
})
export class ModalClienteComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() cliente: Cliente | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<Cliente>();

  formulario: FormGroup;
  esEdicion: boolean = false;
  showPassword = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  tiposCliente = ['ESTANDAR', 'PREMIUM'];
  estadosCliente = ['ACTIVO', 'INACTIVO'];

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) {
    this.formulario = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    tipo: ['', Validators.required],  
    estado: ['', Validators.required] 
  });
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
  if (this.cliente) {
    this.esEdicion = true;
    this.formulario.reset({ 
      id: this.cliente.id,
      nombre: this.cliente.nombre,
      email: this.cliente.email,
      tipo: this.cliente.tipo,
      estado: this.cliente.estado,
      password: ''
    });
    
    this.formulario.get('password')?.clearValidators();
    this.formulario.get('password')?.updateValueAndValidity();
  } else {
    this.esEdicion = false;
    this.formulario.reset({
      id: null,
      nombre: '',
      email: '',
      password: '',
      tipo: '',
      estado: ''
    });
    this.formulario.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();
  }
}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

 onSubmit(): void {
  if (this.formulario.invalid) {
    this.formulario.markAllAsTouched();
    this.toastr.error('Por favor complete todos los campos requeridos correctamente');
    return;
  }

  const formValue = this.formulario.getRawValue();
  
  
  if (this.esEdicion && !formValue.password) {
    delete formValue.password;
  }

  const clienteData = {
    ...formValue,
    tipo: formValue.tipo,
    estado: formValue.estado
  };

  if (this.esEdicion) {
    this.clienteService.actualizarCliente(formValue.id, clienteData).subscribe({
      next: (clienteActualizado) => {
        this.toastr.success('Cliente actualizado correctamente');
        this.submitForm.emit(clienteActualizado);
        this.cerrar();
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error?.message || 'Error al actualizar cliente');
      }
    });
  } else {
    this.clienteService.crearCliente(clienteData).subscribe({
      next: (nuevoCliente) => {
        this.toastr.success('Cliente creado correctamente');
        this.submitForm.emit(nuevoCliente);
        this.cerrar();
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error?.message || 'Error al crear cliente');
      }
    });
  }
}

 cerrar(): void {
  this.formulario.reset({
    id: null,
    nombre: '',
    email: '',
    password: '',
    tipo: '',
    estado: ''
  });
  this.showPassword = false;
  this.close.emit();
}
}