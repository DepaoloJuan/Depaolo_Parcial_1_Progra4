/**
 * @fileoverview Guard de autenticación.
 * Protege las rutas que requieren que el usuario esté logueado.
 * Espera a que Supabase termine de verificar la sesión antes de decidir,
 * evitando redirigir al login por una race condition al recargar la página.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que Supabase termine de restaurar la sesión desde localStorage
  await authService.sesionVerificada;

  if (authService.usuarioActual()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
