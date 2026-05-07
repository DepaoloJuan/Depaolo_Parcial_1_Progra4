/**
 * @fileoverview Guard de autenticación.
 * Protege las rutas que requieren que el usuario esté logueado.
 * Si el usuario no está autenticado, lo redirige al login.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que Supabase termine de verificar la sesión guardada en localStorage
  // antes de decidir si el usuario está logueado o no.
  await authService.sesionVerificada;

  if (authService.usuarioActual()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
