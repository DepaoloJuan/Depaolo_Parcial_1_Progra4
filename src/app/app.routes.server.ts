import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'registro',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'quien-soy',
    renderMode: RenderMode.Prerender,
  },
  {
    // Rutas protegidas: solo se renderizan en el cliente
    // porque requieren localStorage para leer la sesión de Supabase.
    path: '**',
    renderMode: RenderMode.Client,
  },
];
