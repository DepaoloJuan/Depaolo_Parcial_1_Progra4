/**
 * @fileoverview Componente Registro — pantalla de creación de cuenta.
 * Utiliza Template-driven forms con ngModel para capturar los datos del usuario.
 * En el Sprint #2 se conectará con Supabase Auth para crear la cuenta
 * y guardar los datos en la tabla usuarios.
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  /** Modelo del formulario — se bindea con ngModel en el template */
  nombre: string = '';
  apellido: string = '';
  edad: number | null = null;
  email: string = '';
  password: string = '';

  /**
   * Se ejecuta al hacer submit del formulario.
   * En el Sprint #2 llamará al servicio de autenticación con Supabase.
   */
  onSubmit(): void {
    console.log('Registro:', this.nombre, this.apellido, this.edad, this.email);
  }
}
