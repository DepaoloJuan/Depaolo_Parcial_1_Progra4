/**
 * @fileoverview Componente Registro — pantalla de creación de cuenta.
 * Sprint #1: solo estructura y validaciones del formulario.
 * La conexión con Supabase se agrega en el Sprint #2.
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
  /** Modelo del formulario */
  nombre: string = '';
  apellido: string = '';
  edad: number | null = null;
  email: string = '';
  password: string = '';

  /**
   * Se ejecuta al hacer submit del formulario.
   * Sprint #2: se conectará con Supabase Auth.
   */
  onSubmit(): void {
    console.log('Registro:', this.nombre, this.apellido, this.edad, this.email);
  }
}
