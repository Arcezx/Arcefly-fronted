import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { LoginAnimationComponent } from '../login-animation/login-animation.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule completo

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Incluye NgIf, NgClass y otras directivas comunes
    FormsModule,  // Para soporte de ngModel
    LoginAnimationComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showAnimation: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    this.isLoading = true;
    this.message = '';

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.user) {
          this.showAnimation = true;
        } else {
          this.message = response.message || 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        this.message = 'Error de conexión con el servidor';
        this.isLoading = false;
        console.error('Login error:', err);
      }
    });
  }

  onAnimationFinished() {
    this.showAnimation = false;
    this.cdr.detectChanges();
    this.router.navigate(['/panel']).then(() => {
      window.location.reload();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.router.navigate(['/registro']);
  }
}