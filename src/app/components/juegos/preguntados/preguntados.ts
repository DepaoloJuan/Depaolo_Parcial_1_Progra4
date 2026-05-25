/**
 * @fileoverview Componente Preguntados — juego de preguntas y respuestas.
 * Consume la API pública Open Trivia DB para obtener las preguntas.
 * El jugador debe responder 10 preguntas de opción múltiple.
 * Al finalizar guarda el resultado en Supabase.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth';
import { SupabaseService } from '../../../service/supabase';

/** Lo que devuelve la API de Open Trivia DB */
interface PreguntaApi {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
}

/** Lo que usamos internamente — ya procesado y con opciones mezcladas */
interface Pregunta {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: string;
  categoria: string;
}

/** Respuesta completa de la API */
interface RespuestaApi {
  response_code: number;
  results: PreguntaApi[];
}

@Component({
  selector: 'app-preguntados',
  imports: [RouterLink],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);

  // Estado del juego
  preguntas = signal<Pregunta[]>([]);
  indiceActual = signal<number>(0);
  respuestaSeleccionada = signal<string | null>(null);
  correctas = signal<number>(0);
  juegoTerminado = signal<boolean>(false);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  guardando = signal<boolean>(false);

  readonly TOTAL_PREGUNTAS = 10;
  readonly API_URL = `https://opentdb.com/api.php?amount=${this.TOTAL_PREGUNTAS}&type=multiple`;

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  /**
   * Consume la API y transforma las preguntas al formato interno.
   */
  cargarPreguntas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.http.get<RespuestaApi>(this.API_URL).subscribe({
      next: (respuesta) => {
        const preguntasProcesadas = respuesta.results.map((p) => this.procesarPregunta(p));
        this.preguntas.set(preguntasProcesadas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las preguntas. Intentá de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  /**
   * Transforma una pregunta de la API al formato interno.
   * Mezcla las opciones para que la correcta no siempre esté en el mismo lugar.
   * Decodifica los HTML entities que devuelve la API.
   * @param p - Pregunta en formato API
   */
  private procesarPregunta(p: PreguntaApi): Pregunta {
    const opciones = [...p.incorrect_answers, p.correct_answer]
      .map((op) => this.decodificarHtml(op))
      .sort(() => Math.random() - 0.5); // mezcla aleatoria

    return {
      enunciado: this.decodificarHtml(p.question),
      opciones,
      respuestaCorrecta: this.decodificarHtml(p.correct_answer),
      categoria: this.decodificarHtml(p.category),
    };
  }

  /**
   * Decodifica HTML entities como &amp; &quot; &#039; etc.
   * La API devuelve los textos con estas entidades sin decodificar.
   * @param texto - Texto con posibles HTML entities
   */
  private decodificarHtml(texto: string): string {
    const elemento = document.createElement('textarea');
    elemento.innerHTML = texto;
    return elemento.value;
  }

  /**
   * Pregunta actual según el índice.
   */
  get preguntaActual(): Pregunta | null {
    return this.preguntas()[this.indiceActual()] ?? null;
  }

  /**
   * Procesa la respuesta elegida por el jugador.
   * @param opcion - La opción seleccionada
   */
  responder(opcion: string): void {
    if (this.respuestaSeleccionada()) return;

    this.respuestaSeleccionada.set(opcion);

    if (opcion === this.preguntaActual?.respuestaCorrecta) {
      this.correctas.update((n) => n + 1);
    }
  }

  /**
   * Avanza a la siguiente pregunta o finaliza el juego.
   */
  siguientePregunta(): void {
    const siguiente = this.indiceActual() + 1;

    if (siguiente >= this.TOTAL_PREGUNTAS) {
      this.juegoTerminado.set(true);
      this.guardarResultado();
    } else {
      this.indiceActual.set(siguiente);
      this.respuestaSeleccionada.set(null);
    }
  }

  /**
   * Guarda el resultado de la partida en Supabase.
   */
  private async guardarResultado(): Promise<void> {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    this.guardando.set(true);

    await this.supabase.client.from('partidas_preguntados').insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      preguntas_correctas: this.correctas(),
      total_preguntas: this.TOTAL_PREGUNTAS,
      gano: this.correctas() >= Math.ceil(this.TOTAL_PREGUNTAS / 2),
    });

    this.guardando.set(false);
  }

  /**
   * Reinicia el juego cargando nuevas preguntas.
   */
  reiniciar(): void {
    this.indiceActual.set(0);
    this.respuestaSeleccionada.set(null);
    this.correctas.set(0);
    this.juegoTerminado.set(false);
    this.cargarPreguntas();
  }

  /**
   * Devuelve la clase CSS del botón según el estado de la respuesta.
   * @param opcion - La opción del botón
   */
  claseBoton(opcion: string): string {
    if (!this.respuestaSeleccionada()) return 'btn-outline-primary';

    if (opcion === this.preguntaActual?.respuestaCorrecta) return 'btn-success';

    if (opcion === this.respuestaSeleccionada()) return 'btn-danger';

    return 'btn-outline-secondary';
  }
}
