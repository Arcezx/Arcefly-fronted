import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { LoginAnimationComponent } from '../login-animation/login-animation.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoginAnimationComponent,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showAnimation: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.toastr.warning('Por favor, ingresa email y contraseña', 'Campos requeridos');
      return;
    }

    this.isLoading = true;
    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success && response.user) {
          this.showAnimation = true;
          this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
        } else {
          this.toastr.error(response.message || 'Credenciales incorrectas', 'Error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Error de conexión con el servidor', 'Error');
        console.error('Login error:', err);
      }
    });
  }

  onAnimationFinished(): void {
    this.showAnimation = false;
    this.cdr.detectChanges();
    this.router.navigate(['/panel']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}