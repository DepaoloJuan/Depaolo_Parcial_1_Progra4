/**
 * @fileoverview Componente Login — pantalla de inicio de sesión.
 * Sprint #1: solo estructura y validaciones del formulario.
 * La conexión con Supabase se agrega en el Sprint #2.
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
  /** Modelo del formulario */
  email: string = '';
  password: string = '';

  /**
   * Se ejecuta al hacer submit del formulario.
   * Sprint #2: se conectará con Supabase Auth.
   */
  onSubmit(): void {
    console.log('Login:', this.email, this.password);
  }
}
