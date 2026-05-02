/**
 * @fileoverview Servicio de autenticación con Supabase.
 * Maneja el login, registro y cierre de sesión del usuario.
 * También expone el estado del usuario actual como Signal
 * para que los componentes reaccionen automáticamente a los cambios.
 */
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  /** Signal con el usuario actual — null si no hay sesión activa */
  usuarioActual = signal<User | null>(null);

  constructor() {
    this.verificarSesion();
    this.escucharCambiosDeSesion();
  }

  /**
   * Verifica si hay una sesión activa al iniciar la app.
   * Actualiza la signal usuarioActual con el usuario de la sesión.
   */
  private async verificarSesion(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this.usuarioActual.set(data.session?.user ?? null);
  }

  /**
   * Se suscribe a los cambios de sesión de Supabase.
   * Actualiza la signal automáticamente cuando el usuario
   * inicia sesión, cierra sesión o el token se refresca.
   */
  private escucharCambiosDeSesion(): void {
    this.supabase.client.auth.onAuthStateChange((_, sesion) => {
      this.usuarioActual.set(sesion?.user ?? null);
    });
  }

  /**
   * Registra un nuevo usuario en Supabase Auth
   * y guarda sus datos adicionales en la tabla usuarios.
   * @param email - Correo del nuevo usuario
   * @param password - Contraseña del nuevo usuario
   * @param nombre - Nombre del usuario
   * @param apellido - Apellido del usuario
   * @param edad - Edad del usuario
   */
  async registrar(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    edad: number,
  ): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: errorDB } = await this.supabase.client.from('usuarios').insert({
        id: data.user.id,
        email,
        nombre,
        apellido,
        edad,
      });

      if (errorDB) throw errorDB;
    }

    await this.router.navigate(['/home']);
  }

  /**
   * Inicia sesión con email y contraseña.
   * Navega automáticamente al home si el login es exitoso.
   * @param email - Correo del usuario
   * @param password - Contraseña del usuario
   */
  async iniciarSesion(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    await this.router.navigate(['/home']);
  }

  /**
   * Cierra la sesión del usuario actual
   * y navega automáticamente al home.
   */
  async cerrarSesion(): Promise<void> {
    await this.supabase.client.auth.signOut();
    await this.router.navigate(['/home']);
  }
}
