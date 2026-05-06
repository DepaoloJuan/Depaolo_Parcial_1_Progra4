/**
 * @fileoverview Configuración de rutas de la aplicación.
 * Define qué componente se renderiza según la URL activa.
 * Se usa lazy loading con loadComponent() para cargar cada componente
 * solo cuando el usuario navega a esa ruta, mejorando el rendimiento.
 * Las rutas protegidas se agrupan bajo una ruta padre con canActivate,
 * evitando repetir el guard en cada ruta individualmente.
 */
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
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
    path: '',
    canActivate: [authGuard],
    children: [
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
        path: 'juegos/ahorcado',
        loadComponent: () =>
          import('./components/juegos/ahorcado/ahorcado').then((m) => m.Ahorcado),
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
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
