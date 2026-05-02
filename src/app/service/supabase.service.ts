/**
 * @fileoverview Servicio de Supabase — cliente central de la aplicación.
 * Inicializa y expone el cliente de Supabase para ser usado por otros servicios.
 * Se inyecta como singleton en toda la app gracias a providedIn: 'root'.
 */
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  /** Instancia única del cliente de Supabase */
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Devuelve la instancia del cliente de Supabase.
   * Otros servicios la usan para acceder a auth y base de datos.
   */
  get client(): SupabaseClient {
    return this.supabase;
  }
}
