/**
 * @fileoverview Componente Navbar — barra de navegación principal de la app.
 * Se muestra en todas las pantallas. Contiene el título de la app
 * y los enlaces de navegación entre secciones.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  /** Título que se muestra en la barra de navegación */
  titulo = 'Sala de Juegos';
}
