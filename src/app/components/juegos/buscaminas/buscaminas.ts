/**
 * @fileoverview Componente Buscaminas — juego de lógica con grilla de celdas.
 * El jugador debe descubrir todas las celdas sin hacer clic en ninguna mina.
 * Tiene tres dificultades: Fácil, Medio y Difícil.
 * Al finalizar guarda el resultado en Supabase.
 */
import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth';
import { SupabaseService } from '../../../service/supabase';

/** Representa una celda individual del tablero */
interface Celda {
  esMina: boolean;
  descubierta: boolean;
  marcada: boolean;
  minasCercanas: number;
}

/** Configuración de cada nivel de dificultad */
interface Dificultad {
  nombre: string;
  filas: number;
  columnas: number;
  minas: number;
}

@Component({
  selector: 'app-buscaminas',
  imports: [RouterLink, KeyValuePipe],
  templateUrl: './buscaminas.html',
  styleUrl: './buscaminas.css',
})
export class Buscaminas implements OnDestroy {
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);

  // Dificultades disponibles
  readonly DIFICULTADES: Record<string, Dificultad> = {
    facil: { nombre: 'Fácil', filas: 9, columnas: 9, minas: 10 },
    medio: { nombre: 'Medio', filas: 16, columnas: 16, minas: 40 },
    dificil: { nombre: 'Difícil', filas: 16, columnas: 30, minas: 99 },
  };

  // Estado del juego
  dificultadSeleccionada = signal<string>('facil');
  tablero = signal<Celda[][]>([]);
  juegoIniciado = signal<boolean>(false); // true después del primer clic
  juegoTerminado = signal<boolean>(false);
  gano = signal<boolean>(false);
  tiempoSegundos = signal<number>(0);
  guardando = signal<boolean>(false);
  private intervalo: any;

  // Computed: configuración de la dificultad activa
  configActual = computed(() => this.DIFICULTADES[this.dificultadSeleccionada()]);

  // Computed: cantidad de minas sin marcar (minas totales - banderas puestas)
  minasSinMarcar = computed(() => {
    const config = this.configActual();
    const banderas = this.tablero()
      .flat()
      .filter((c) => c.marcada).length;
    return config.minas - banderas;
  });

  /** Tiempo formateado en MM:SS */
  get tiempoFormateado(): string {
    const m = Math.floor(this.tiempoSegundos() / 60);
    const s = this.tiempoSegundos() % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  /**
   * Cambia la dificultad y reinicia el tablero.
   * @param dificultad - clave de la dificultad elegida
   */
  elegirDificultad(dificultad: string): void {
    this.dificultadSeleccionada.set(dificultad);
    this.iniciarTablero();
  }

  /**
   * Genera un tablero vacío (sin minas) con la configuración actual.
   * Las minas se colocan en el primer clic para que nunca sea mina.
   */
  iniciarTablero(): void {
    this.detenerTemporizador();
    const { filas, columnas } = this.configActual();

    const tablero: Celda[][] = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => ({
        esMina: false,
        descubierta: false,
        marcada: false,
        minasCercanas: 0,
      })),
    );

    this.tablero.set(tablero);
    this.juegoIniciado.set(false);
    this.juegoTerminado.set(false);
    this.gano.set(false);
    this.tiempoSegundos.set(0);
  }

  /**
   * Maneja el clic izquierdo sobre una celda.
   * En el primer clic coloca las minas evitando la celda clickeada.
   * @param fila - índice de fila
   * @param col - índice de columna
   */
  clicCelda(fila: number, col: number): void {
    if (this.juegoTerminado()) return;

    const celda = this.tablero()[fila][col];
    if (celda.descubierta || celda.marcada) return;

    // Primer clic: colocar minas y arrancar temporizador
    if (!this.juegoIniciado()) {
      this.colocarMinas(fila, col);
      this.calcularNumeros();
      this.juegoIniciado.set(true);
      this.iniciarTemporizador();
    }

    // Si es mina, el jugador pierde
    if (this.tablero()[fila][col].esMina) {
      this.revelarTodasLasMinas();
      this.finalizarJuego(false);
      return;
    }

    // Descubrir celda (y propagación si minasCercanas === 0)
    this.descubrirCelda(fila, col);
    this.verificarVictoria();
  }

  /**
   * Maneja el clic derecho sobre una celda — pone o saca bandera.
   * @param evento - evento del mouse para prevenir el menú contextual
   * @param fila - índice de fila
   * @param col - índice de columna
   */
  clicDerecho(evento: MouseEvent, fila: number, col: number): void {
    evento.preventDefault();
    if (this.juegoTerminado()) return;

    const celda = this.tablero()[fila][col];
    if (celda.descubierta) return;

    // Copia inmutable del tablero para que Angular detecte el cambio
    const nuevoTablero = this.tablero().map((f) => f.map((c) => ({ ...c })));
    nuevoTablero[fila][col].marcada = !nuevoTablero[fila][col].marcada;
    this.tablero.set(nuevoTablero);
  }

  /**
   * Coloca las minas aleatoriamente evitando la celda del primer clic.
   * @param filaSegura - fila del primer clic
   * @param colSegura - columna del primer clic
   */
  private colocarMinas(filaSegura: number, colSegura: number): void {
    const { filas, columnas, minas } = this.configActual();
    const nuevoTablero = this.tablero().map((f) => f.map((c) => ({ ...c })));
    let minasColocadas = 0;

    while (minasColocadas < minas) {
      const f = Math.floor(Math.random() * filas);
      const c = Math.floor(Math.random() * columnas);

      // No colocar mina en la celda segura ni donde ya hay una
      if ((f === filaSegura && c === colSegura) || nuevoTablero[f][c].esMina) continue;

      nuevoTablero[f][c].esMina = true;
      minasColocadas++;
    }

    this.tablero.set(nuevoTablero);
  }

  /**
   * Calcula el número de minas adyacentes para cada celda.
   */
  private calcularNumeros(): void {
    const { filas, columnas } = this.configActual();
    const nuevoTablero = this.tablero().map((f) => f.map((c) => ({ ...c })));

    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        if (nuevoTablero[f][c].esMina) continue;
        nuevoTablero[f][c].minasCercanas = this.contarMinasAdyacentes(nuevoTablero, f, c);
      }
    }

    this.tablero.set(nuevoTablero);
  }

  /**
   * Cuenta las minas en las 8 celdas adyacentes a una posición.
   * @param tablero - el tablero actual
   * @param fila - índice de fila
   * @param col - índice de columna
   */
  private contarMinasAdyacentes(tablero: Celda[][], fila: number, col: number): number {
    const { filas, columnas } = this.configActual();
    let count = 0;

    for (let df = -1; df <= 1; df++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (df === 0 && dc === 0) continue;
        const nf = fila + df;
        const nc = col + dc;
        if (nf >= 0 && nf < filas && nc >= 0 && nc < columnas) {
          if (tablero[nf][nc].esMina) count++;
        }
      }
    }

    return count;
  }

  /**
   * Descubre una celda. Si tiene 0 minas adyacentes, propaga
   * el descubrimiento recursivamente a las celdas vecinas.
   * @param fila - índice de fila
   * @param col - índice de columna
   */
  private descubrirCelda(fila: number, col: number): void {
    const { filas, columnas } = this.configActual();
    const nuevoTablero = this.tablero().map((f) => f.map((c) => ({ ...c })));

    const propagar = (f: number, c: number) => {
      if (f < 0 || f >= filas || c < 0 || c >= columnas) return;
      if (nuevoTablero[f][c].descubierta || nuevoTablero[f][c].marcada) return;

      nuevoTablero[f][c].descubierta = true;

      // Si no hay minas alrededor, propaga a los vecinos
      if (nuevoTablero[f][c].minasCercanas === 0) {
        for (let df = -1; df <= 1; df++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (df === 0 && dc === 0) continue;
            propagar(f + df, c + dc);
          }
        }
      }
    };

    propagar(fila, col);
    this.tablero.set(nuevoTablero);
  }

  /**
   * Revela todas las minas al perder.
   */
  private revelarTodasLasMinas(): void {
    const nuevoTablero = this.tablero().map((f) =>
      f.map((c) => (c.esMina ? { ...c, descubierta: true } : { ...c })),
    );
    this.tablero.set(nuevoTablero);
  }

  /**
   * Verifica si el jugador ganó:
   * todas las celdas sin mina deben estar descubiertas.
   */
  private verificarVictoria(): void {
    const gano = this.tablero()
      .flat()
      .filter((c) => !c.esMina)
      .every((c) => c.descubierta);

    if (gano) this.finalizarJuego(true);
  }

  /**
   * Finaliza el juego, detiene el temporizador y guarda el resultado.
   * @param gano - true si el jugador ganó
   */
  private finalizarJuego(gano: boolean): void {
    this.detenerTemporizador();
    this.gano.set(gano);
    this.juegoTerminado.set(true);
    this.guardarResultado(gano);
  }

  /**
   * Guarda el resultado en Supabase.
   * @param gano - true si el jugador ganó
   */
  private async guardarResultado(gano: boolean): Promise<void> {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    this.guardando.set(true);

    await this.supabase.client.from('partidas_buscaminas').insert({
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      dificultad: this.configActual().nombre,
      gano,
      tiempo_segundos: this.tiempoSegundos(),
    });

    this.guardando.set(false);
  }

  /** Inicia el temporizador */
  private iniciarTemporizador(): void {
    this.intervalo = setInterval(() => {
      this.tiempoSegundos.update((t) => t + 1);
    }, 1000);
  }

  /** Detiene el temporizador */
  private detenerTemporizador(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  /**
   * Devuelve la clase CSS de una celda según su estado.
   * @param celda - la celda a evaluar
   */
  claseCelda(celda: Celda): string {
    if (celda.descubierta && celda.esMina) return 'celda-mina';
    if (celda.descubierta) return 'celda-descubierta';
    if (celda.marcada) return 'celda-marcada';
    return 'celda-oculta';
  }

  /**
   * Devuelve el color CSS para el número de minas cercanas.
   * Cada número tiene su color clásico del Buscaminas.
   * @param n - cantidad de minas adyacentes
   */
  colorNumero(n: number): string {
    const colores: Record<number, string> = {
      1: '#0000ff',
      2: '#008000',
      3: '#ff0000',
      4: '#000080',
      5: '#800000',
      6: '#008080',
      7: '#000000',
      8: '#808080',
    };
    return colores[n] ?? '';
  }
}
