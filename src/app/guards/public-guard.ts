/**
 * @fileoverview Guard para rutas públicas (login, registro).
 * Evita que un usuario ya logueado pueda acceder a estas rutas.
 * Si el usuario tiene sesión activa, lo redirige al home.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const publicGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.sesionVerificada;

  if (authService.usuarioActual()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
