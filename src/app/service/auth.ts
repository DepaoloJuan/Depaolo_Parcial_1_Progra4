/**
 * @fileoverview Servicio de autenticación con Supabase.
 * Maneja el login, registro y cierre de sesión del usuario.
 * Expone el estado del usuario actual como Signal para que
 * los componentes reaccionen automáticamente a los cambios.
 */
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  // Signal con el usuario actual — null si no hay sesión activa.
  // Al ser pública, los componentes pueden leerla directamente desde el template.
  usuarioActual = signal<User | null>(null);

  constructor() {
    // Al iniciar la app verificamos si hay una sesión activa guardada
    // y nos suscribimos a futuros cambios de sesión.
    this.verificarSesion();
    this.escucharCambiosDeSesion();
  }

  // Verifica si hay una sesión activa al iniciar la app.
  // Supabase guarda la sesión en localStorage, por eso persiste al recargar.
  private async verificarSesion(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this.usuarioActual.set(data.session?.user ?? null);
  }

  // Se suscribe a los cambios de sesión de Supabase.
  // Se dispara automáticamente en login, logout y refresh del token.
  private escucharCambiosDeSesion(): void {
    this.supabase.client.auth.onAuthStateChange((_event, sesion) => {
      this.usuarioActual.set(sesion?.user ?? null);
    });
  }

  /**
   * Registra un nuevo usuario en Supabase Auth y guarda sus datos
   * adicionales en la tabla usuarios de la base de datos.
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
    // Paso 1: crear el usuario en el sistema de autenticación de Supabase
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Paso 2: guardar los datos adicionales en nuestra tabla usuarios
    // Usamos el mismo UUID que Supabase Auth asignó al usuario como id
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
   * Cierra la sesión del usuario actual y navega al home.
   */
  async cerrarSesion(): Promise<void> {
    await this.supabase.client.auth.signOut();
    await this.router.navigate(['/home']);
  }
}
