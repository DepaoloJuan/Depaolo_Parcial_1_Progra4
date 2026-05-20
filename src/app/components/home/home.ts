/**
 * @fileoverview Componente Home — pantalla principal de la Sala de Juegos.
 * Muestra los accesos a los juegos disponibles si el usuario está logueado.
 * Si no está logueado, muestra los botones de login y registro.
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // authService es público para poder acceder a usuarioActual() desde el template
  authService = inject(AuthService);

  // Lista de juegos disponibles en la sala
  juegos = [
    { nombre: 'Ahorcado', icono: 'bi-alphabet', ruta: '/juegos/ahorcado' },
    { nombre: 'Mayor o Menor', icono: 'bi-suit-spade-fill', ruta: '/juegos/mayor-o-menor' },
    { nombre: 'Preguntados', icono: 'bi-question-circle-fill', ruta: '/juegos/preguntados' },
    { nombre: 'Buscaminas', icono: 'bi-bullseye', ruta: '/juegos/buscaminas' },
  ];

  /**
   * Cierra la sesión del usuario actual.
   * Llama al AuthService que se encarga de la navegación.
   */
  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
  }
}
