/**
 * @fileoverview Componente Registro — pantalla de creación de cuenta.
 * Utiliza Template-driven forms con ngModel para capturar los datos del usuario.
 * Se conecta con AuthService para crear la cuenta en Supabase Auth
 * y guardar los datos adicionales en la tabla usuarios.
 */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private authService = inject(AuthService);

  // Modelo del formulario — se bindea con ngModel en el template
  nombre: string = '';
  apellido: string = '';
  edad: number | null = null;
  email: string = '';
  password: string = '';

  // Signal para manejar el estado de carga
  cargando = signal<boolean>(false);

  // Signal para mostrar errores al usuario sin usar alert()
  errorMensaje = signal<string | null>(null);

  /**
   * Se ejecuta al hacer submit del formulario.
   * Llama al AuthService para registrar el usuario en Supabase.
   * Si hay error, muestra el mensaje correspondiente.
   */
  async onSubmit(): Promise<void> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    try {
      await this.authService.registrar(
        this.email,
        this.password,
        this.nombre,
        this.apellido,
        this.edad!,
      );
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        this.errorMensaje.set('Este email ya está registrado. Intentá iniciar sesión.');
      } else {
        this.errorMensaje.set('Error al registrarse. Intentá de nuevo.');
      }
    } finally {
      this.cargando.set(false);
    }
  }
}
