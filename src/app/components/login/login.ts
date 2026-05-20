/**
 * @fileoverview Componente Login — pantalla de inicio de sesión.
 * Utiliza Reactive Forms con FormBuilder para capturar email y contraseña.
 * Se conecta con AuthService para validar las credenciales contra Supabase.
 */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signal para manejar el estado de carga
  cargando = signal<boolean>(false);

  // Signal para mostrar errores
  errorMensaje = signal<string | null>(null);

  // FormGroup con validaciones definidas en TypeScript
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Se ejecuta al hacer submit del formulario.
   * Si el form es inválido, marca todos los campos como tocados para mostrar errores.
   * Si es válido, intenta iniciar sesión con Supabase.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.iniciarSesion(email!, password!);
    } catch {
      this.errorMensaje.set('Credenciales incorrectas. Verificá tu email y contraseña.');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Autocompleta las credenciales de un usuario de prueba en el formulario.
   * @param email - Email del usuario de prueba
   * @param password - Contraseña del usuario de prueba
   */
  loginRapido(email: string, password: string): void {
    this.loginForm.setValue({ email, password });
  }
}
