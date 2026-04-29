/**
 * @fileoverview Componente raíz de la aplicación.
 * Es el punto de entrada de la UI. Contiene la navbar y el router-outlet
 * que renderiza el componente correspondiente según la ruta activa.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
