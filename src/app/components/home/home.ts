/**
 * @fileoverview Componente Home — pantalla principal de la Sala de Juegos.
 * Muestra los accesos a los juegos disponibles y los botones de login/registro.
 * En el Sprint #2 se va a adaptar según si el usuario está logueado o no.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  /** Lista de juegos disponibles en la sala */
  juegos = [
    { nombre: 'Ahorcado', icono: 'bi-alphabet', ruta: '/juegos/ahorcado' },
    { nombre: 'Mayor o Menor', icono: 'bi-suit-spade-fill', ruta: '/juegos/mayor-o-menor' },
    { nombre: 'Preguntados', icono: 'bi-question-circle-fill', ruta: '/juegos/preguntados' },
    { nombre: 'Buscaminas', icono: 'bi-bullseye', ruta: '/juegos/buscaminas' },
  ];
}
