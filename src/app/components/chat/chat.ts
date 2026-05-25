/**
 * @fileoverview Componente Chat — sala de chat en tiempo real.
 * Usa Supabase Realtime para mostrar mensajes nuevos automáticamente
 * sin necesidad de recargar la página.
 * Solo accesible para usuarios logueados (protegido por authGuard).
 */
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { SupabaseService } from '../../service/supabase';
import { RouterLink } from '@angular/router';

/** Interfaz que representa un mensaje del chat */
interface Mensaje {
  id: string;
  usuario_id: string;
  usuario_email: string;
  mensaje: string;
  created_at: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);

  // Lista de mensajes del chat
  mensajes = signal<Mensaje[]>([]);

  // Texto del nuevo mensaje a enviar
  nuevoMensaje: string = '';

  // Estado de carga al enviar un mensaje
  enviando = signal<boolean>(false);

  // Suscripción al canal de Realtime
  private canal: any;

  ngOnInit(): void {
    this.cargarMensajes();
    this.suscribirseAlChat();
  }

  ngOnDestroy(): void {
    // Es importante desuscribirse cuando el componente se destruye
    // para evitar memory leaks
    if (this.canal) {
      this.supabase.client.removeChannel(this.canal);
    }
  }

  /**
   * Carga los mensajes existentes ordenados por fecha de creación.
   */
  private async cargarMensajes(): Promise<void> {
    const { data } = await this.supabase.client
      .from('mensajes_chat')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      this.mensajes.set(data);
    }
  }

  /**
   * Se suscribe al canal de Realtime de Supabase.
   * Cada vez que se inserta un mensaje nuevo en la tabla,
   * lo agrega automáticamente a la lista sin recargar.
   */
  private suscribirseAlChat(): void {
    this.canal = this.supabase.client
      .channel('mensajes_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat' },
        (payload) => {
          this.mensajes.update((msgs) => [...msgs, payload.new as Mensaje]);
        },
      )
      .subscribe();
  }

  /**
   * Envía un nuevo mensaje al chat.
   * Guarda el mensaje en Supabase y el Realtime lo distribuye
   * automáticamente a todos los clientes conectados.
   */
  async enviarMensaje(): Promise<void> {
    if (!this.nuevoMensaje.trim()) return;

    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    this.enviando.set(true);

    await this.supabase.client.from('mensajes_chat').insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      mensaje: this.nuevoMensaje.trim(),
    });

    this.nuevoMensaje = '';
    this.enviando.set(false);
  }

  /**
   * Verifica si un mensaje fue enviado por el usuario actual.
   * Se usa para diferenciar visualmente los mensajes propios.
   * @param mensaje - El mensaje a verificar
   */
  esMiMensaje(mensaje: Mensaje): boolean {
    return mensaje.usuario_id === this.authService.usuarioActual()?.id;
  }

  /**
   * Formatea la fecha de un mensaje en formato HH:MM.
   * @param fecha - La fecha en formato ISO
   */
  formatearHora(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
