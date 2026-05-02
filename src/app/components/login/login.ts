/**
 * @fileoverview Componente Login — pantalla de inicio de sesión.
 * Utiliza Template-driven forms con ngModel para capturar email y contraseña.
 * En el Sprint #2 se conectará con Supabase Auth para validar las credenciales.
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** Modelo del formulario — se bindea con ngModel en el template */
  email: string = '';
  password: string = '';

  /**
   * Se ejecuta al hacer submit del formulario.
   * En el Sprint #2 llamará al servicio de autenticación con Supabase.
   */
  onSubmit(): void {
    console.log('Login:', this.email, this.password);
  }
}
