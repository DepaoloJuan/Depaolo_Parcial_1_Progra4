/**
 * @fileoverview Guard de autenticación.
 * Protege las rutas que requieren que el usuario esté logueado.
 * Si el usuario no está autenticado, lo redirige al login.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si hay un usuario logueado, permite el acceso a la ruta
  if (authService.usuarioActual()) {
    return true;
  }

  // Si no hay usuario, redirige al login
  router.navigate(['/login']);
  return false;
};
