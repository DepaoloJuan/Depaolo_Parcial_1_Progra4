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
  // Instancia única del cliente de Supabase.
  // Se crea una sola vez y se reutiliza en toda la app (patrón Singleton).
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Getter que expone el cliente de forma controlada.
  // Otros servicios acceden a auth y DB a través de este getter.
  get client(): SupabaseClient {
    return this.supabase;
  }
}
