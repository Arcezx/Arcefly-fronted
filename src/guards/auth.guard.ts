import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuthenticated) {
      return true;
    }
    
    this.toastr.warning('Debes iniciar sesión para acceder a esta página', 'Acceso restringido');
    return this.router.createUrlTree(['/login']);
  }
}