/**
 * @fileoverview Componente Login — pantalla de inicio de sesión.
 * Utiliza Template-driven forms con ngModel para capturar email y contraseña.
 * Se conecta con AuthService para validar las credenciales contra Supabase.
 */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);

  // Modelo del formulario — se bindea con ngModel en el template
  email: string = '';
  password: string = '';

  // Signal para manejar el estado de carga mientras espera respuesta de Supabase
  cargando = signal<boolean>(false);

  // Signal para mostrar errores al usuario sin usar alert()
  errorMensaje = signal<string | null>(null);

  /**
   * Se ejecuta al hacer submit del formulario.
   * Llama al AuthService para iniciar sesión con Supabase.
   * Si hay error, muestra el mensaje correspondiente.
   */
  async onSubmit(): Promise<void> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    try {
      await this.authService.iniciarSesion(this.email, this.password);
    } catch (error: any) {
      this.errorMensaje.set('Credenciales incorrectas. Verificá tu email y contraseña.');
    } finally {
      this.cargando.set(false);
    }
  }
}
