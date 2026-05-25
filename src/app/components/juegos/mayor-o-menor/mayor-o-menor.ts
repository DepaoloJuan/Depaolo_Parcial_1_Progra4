/**
 * @fileoverview Componente Mayor o Menor — juego de adivinanza con baraja española.
 * El jugador debe adivinar si la siguiente carta será mayor o menor que la actual.
 * Al finalizar guarda el resultado en Supabase.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth';
import { SupabaseService } from '../../../service/supabase';

/** Interfaz que representa una carta de la baraja española */
interface Carta {
  valor: number;
  palo: 'oros' | 'copas' | 'espadas' | 'bastos';
  imagen: string;
}

@Component({
  selector: 'app-mayor-o-menor',
  imports: [RouterLink],
  templateUrl: './mayor-o-menor.html',
  styleUrl: './mayor-o-menor.css',
})
export class MayorOMenor implements OnInit {
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);

  // Palos de la baraja española
  private readonly palos: Carta['palo'][] = ['oros', 'copas', 'espadas', 'bastos'];

  // Estado del juego
  cartaActual = signal<Carta | null>(null);
  cartaSiguiente = signal<Carta | null>(null);
  cartasAcertadas = signal<number>(0);
  juegoTerminado = signal<boolean>(false);
  gano = signal<boolean>(false);
  mostrarSiguiente = signal<boolean>(false);
  mensaje = signal<string>('');
  guardando = signal<boolean>(false);

  // Total de rondas por partida
  readonly TOTAL_RONDAS = 10;

  ngOnInit(): void {
    this.iniciarJuego();
  }

  /**
   * Genera una carta aleatoria de la baraja española.
   * Valores del 1 al 12, 4 palos.
   */
  private generarCarta(): Carta {
    const valor = Math.floor(Math.random() * 12) + 1;
    const palo = this.palos[Math.floor(Math.random() * this.palos.length)];
    const imagen = this.obtenerEmoji(palo);
    return { valor, palo, imagen };
  }

  /**
   * Devuelve el emoji correspondiente al palo de la carta.
   * @param palo - El palo de la carta
   */
  private obtenerEmoji(palo: Carta['palo']): string {
    const emojis = {
      oros: '🪙',
      copas: '🏆',
      espadas: '⚔️',
      bastos: '🪄',
    };
    return emojis[palo];
  }

  /** Inicia una nueva partida */
  iniciarJuego(): void {
    this.cartaActual.set(this.generarCarta());
    this.cartaSiguiente.set(null);
    this.cartasAcertadas.set(0);
    this.juegoTerminado.set(false);
    this.gano.set(false);
    this.mostrarSiguiente.set(false);
    this.mensaje.set('');
  }

  /**
   * Procesa la elección del jugador (mayor o menor).
   * Genera la siguiente carta asegurándose de que sea distinta a la actual
   * para evitar empates donde ninguna elección sería correcta.
   * @param eleccion - 'mayor' o 'menor'
   */
  elegir(eleccion: 'mayor' | 'menor'): void {
    if (this.juegoTerminado() || this.mostrarSiguiente()) return;

    // Regenera hasta obtener una carta con valor distinto a la actual
    let siguiente = this.generarCarta();
    while (siguiente.valor === this.cartaActual()!.valor) {
      siguiente = this.generarCarta();
    }

    this.cartaSiguiente.set(siguiente);
    this.mostrarSiguiente.set(true);

    const actual = this.cartaActual()!;
    const acerto =
      (eleccion === 'mayor' && siguiente.valor > actual.valor) ||
      (eleccion === 'menor' && siguiente.valor < actual.valor);

    if (acerto) {
      this.cartasAcertadas.update((n) => n + 1);
      this.mensaje.set('¡Correcto! 🎉');

      if (this.cartasAcertadas() >= this.TOTAL_RONDAS) {
        this.finalizarJuego(true);
      }
    } else {
      this.mensaje.set('¡Incorrecto! 😞');
      this.finalizarJuego(false);
    }
  }

  /** Pasa a la siguiente ronda */
  siguienteRonda(): void {
    this.cartaActual.set(this.cartaSiguiente()!);
    this.cartaSiguiente.set(null);
    this.mostrarSiguiente.set(false);
    this.mensaje.set('');
  }

  /**
   * Finaliza la partida y guarda el resultado en Supabase.
   * @param gano - true si el jugador ganó
   */
  private async finalizarJuego(gano: boolean): Promise<void> {
    this.gano.set(gano);
    this.juegoTerminado.set(true);
    await this.guardarResultado(gano);
  }

  /**
   * Guarda el resultado de la partida en Supabase.
   * @param gano - true si el jugador ganó
   */
  private async guardarResultado(gano: boolean): Promise<void> {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    this.guardando.set(true);

    await this.supabase.client.from('partidas_mayor_menor').insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      cartas_acertadas: this.cartasAcertadas(),
      total_cartas: this.TOTAL_RONDAS,
      gano,
    });

    this.guardando.set(false);
  }
}
