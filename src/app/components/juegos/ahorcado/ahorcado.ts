/**
 * @fileoverview Componente Ahorcado — juego de adivinanza de palabras.
 * El jugador debe adivinar la palabra seleccionando letras del abecedario.
 * Tiene un máximo de 6 errores antes de perder la partida.
 * Al finalizar guarda el resultado en Supabase.
 */
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth';
import { SupabaseService } from '../../../service/supabase';
import { PALABRAS } from '../../../models/palabras';

@Component({
  selector: 'app-ahorcado',
  imports: [RouterLink],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);

  // Letras del abecedario español
  readonly abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // Estado del juego
  palabra = signal<string>('');
  letrasUsadas = signal<string[]>([]);
  errores = signal<number>(0);
  juegoTerminado = signal<boolean>(false);
  gano = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Temporizador
  tiempoSegundos = signal<number>(0);
  private intervalo: any;

  // Máximo de errores permitidos antes de perder
  readonly MAX_ERRORES = 6;

  // Letras correctamente adivinadas
  letrasCorrectas = computed(() =>
    this.palabra()
      .split('')
      .filter((letra) => this.letrasUsadas().includes(letra)),
  );

  // Letras de la palabra que aún no fueron adivinadas
  palabraMostrada = computed(() =>
    this.palabra()
      .split('')
      .map((letra) => (this.letrasUsadas().includes(letra) ? letra : '_')),
  );

  // Verifica si el jugador ganó
  ganoPartida = computed(
    () => this.palabra().length > 0 && this.palabraMostrada().every((letra) => letra !== '_'),
  );

  ngOnInit(): void {
    this.iniciarJuego();
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  /**
   * Inicia una nueva partida seleccionando una palabra aleatoria
   * y reiniciando todos los estados del juego.
   */
  iniciarJuego(): void {
    const palabraAleatoria = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    this.palabra.set(palabraAleatoria.toUpperCase());
    this.letrasUsadas.set([]);
    this.errores.set(0);
    this.juegoTerminado.set(false);
    this.gano.set(false);
    this.tiempoSegundos.set(0);
    this.iniciarTemporizador();
  }

  /**
   * Procesa la selección de una letra por parte del jugador.
   * Verifica si la letra está en la palabra y actualiza el estado.
   * @param letra - La letra seleccionada por el jugador
   */
  seleccionarLetra(letra: string): void {
    if (this.juegoTerminado() || this.letrasUsadas().includes(letra)) return;

    this.letrasUsadas.update((letras) => [...letras, letra]);

    if (!this.palabra().includes(letra)) {
      this.errores.update((e) => e + 1);
    }

    // Verificar condiciones de fin de juego
    if (this.errores() >= this.MAX_ERRORES) {
      this.finalizarJuego(false);
    } else if (this.ganoPartida()) {
      this.finalizarJuego(true);
    }
  }

  /**
   * Finaliza la partida, detiene el temporizador y guarda el resultado.
   * @param gano - true si el jugador ganó, false si perdió
   */
  private finalizarJuego(gano: boolean): void {
    this.detenerTemporizador();
    this.gano.set(gano);
    this.juegoTerminado.set(true);
    this.guardarResultado(gano);
  }

  /**
   * Guarda el resultado de la partida en Supabase.
   * @param gano - true si el jugador ganó
   */
  private async guardarResultado(gano: boolean): Promise<void> {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    this.guardando.set(true);

    await this.supabase.client.from('partidas_ahorcado').insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      palabra: this.palabra(),
      letras_usadas: this.letrasUsadas().length,
      tiempo_segundos: this.tiempoSegundos(),
      gano,
    });

    this.guardando.set(false);
  }

  /** Inicia el temporizador de la partida */
  private iniciarTemporizador(): void {
    this.intervalo = setInterval(() => {
      this.tiempoSegundos.update((t) => t + 1);
    }, 1000);
  }

  /** Detiene el temporizador de la partida */
  private detenerTemporizador(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  /**
   * Verifica si una letra ya fue usada en la partida.
   * @param letra - La letra a verificar
   */
  letraUsada(letra: string): boolean {
    return this.letrasUsadas().includes(letra);
  }

  /**
   * Verifica si una letra usada es correcta (está en la palabra).
   * @param letra - La letra a verificar
   */
  letraCorrecta(letra: string): boolean {
    return this.letraUsada(letra) && this.palabra().includes(letra);
  }

  /** Formatea el tiempo en formato MM:SS */
  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoSegundos() / 60);
    const segundos = this.tiempoSegundos() % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
}
