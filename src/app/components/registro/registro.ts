/**
 * @fileoverview Componente Registro — pantalla de creación de cuenta.
 * Utiliza Reactive Forms con FormBuilder para capturar los datos del usuario.
 * Se conecta con AuthService para crear la cuenta en Supabase Auth
 * y guardar los datos adicionales en la tabla usuarios.
 */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signal para manejar el estado de carga
  cargando = signal<boolean>(false);

  // Signal para mostrar errores sin usar alert()
  errorMensaje = signal<string | null>(null);

  // FormGroup con todos los campos y sus validaciones
  registroForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    edad: [null as number | null, [Validators.required, Validators.min(1), Validators.max(99)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Se ejecuta al hacer submit del formulario.
   * Si el form es inválido, marca todos los campos como tocados para mostrar errores.
   * Si es válido, intenta registrar el usuario en Supabase.
   */
  async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    try {
      const { email, password, nombre, apellido, edad } = this.registroForm.value;
      await this.authService.registrar(email!, password!, nombre!, apellido!, edad!);
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
