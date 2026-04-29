/**
 * @fileoverview Configuración de rutas de la aplicación.
 * Define qué componente se renderiza según la URL activa.
 * Se usa lazy loading con loadComponent() para cargar cada componente
 * solo cuando el usuario navega a esa ruta, mejorando el rendimiento.
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'quien-soy',
    loadComponent: () => import('./components/quien-soy/quien-soy').then((m) => m.QuienSoy),
  },
  {
    path: 'juegos/ahorcado',
    loadComponent: () => import('./components/juegos/ahorcado/ahorcado').then((m) => m.Ahorcado),
  },
  {
    path: 'juegos/mayor-o-menor',
    loadComponent: () =>
      import('./components/juegos/mayor-o-menor/mayor-o-menor').then((m) => m.MayorOMenor),
  },
  {
    path: 'juegos/preguntados',
    loadComponent: () =>
      import('./components/juegos/preguntados/preguntados').then((m) => m.Preguntados),
  },
  {
    path: 'juegos/buscaminas',
    loadComponent: () =>
      import('./components/juegos/buscaminas/buscaminas').then((m) => m.Buscaminas),
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat').then((m) => m.Chat),
  },
  {
    path: 'resultados',
    loadComponent: () => import('./components/resultados/resultados').then((m) => m.Resultados),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
