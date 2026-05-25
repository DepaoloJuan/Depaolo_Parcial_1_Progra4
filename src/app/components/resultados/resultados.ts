/**
 * @fileoverview Componente Resultados — muestra los resultados de los 4 juegos.
 * Consulta las tablas de Supabase y los ordena de mejor a peor desempeño.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase';

interface ResultadoAhorcado {
  usuario_email: string;
  palabra: string;
  letras_usadas: number;
  tiempo_segundos: number;
  gano: boolean;
}

interface ResultadoMayorMenor {
  usuario_email: string;
  cartas_acertadas: number;
  total_cartas: number;
  gano: boolean;
}

interface ResultadoPreguntados {
  usuario_email: string;
  preguntas_correctas: number;
  total_preguntas: number;
  gano: boolean;
}

interface ResultadoBuscaminas {
  usuario_email: string;
  dificultad: string;
  tiempo_segundos: number;
  gano: boolean;
}

@Component({
  selector: 'app-resultados',
  imports: [],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  private supabase = inject(SupabaseService);

  // Signals para cada tabla de resultados
  ahorcado = signal<ResultadoAhorcado[]>([]);
  mayorMenor = signal<ResultadoMayorMenor[]>([]);
  preguntados = signal<ResultadoPreguntados[]>([]);
  buscaminas = signal<ResultadoBuscaminas[]>([]);

  // Signal de carga global
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarResultados();
  }

  /**
   * Carga los resultados de los 4 juegos en paralelo.
   */
  private async cargarResultados(): Promise<void> {
    this.cargando.set(true);

    const [ahorcado, mayorMenor, preguntados, buscaminas] = await Promise.all([
      this.supabase.client
        .from('partidas_ahorcado')
        .select('usuario_email, palabra, letras_usadas, tiempo_segundos, gano')
        .order('gano', { ascending: false })
        .order('letras_usadas', { ascending: true })
        .limit(10),

      this.supabase.client
        .from('partidas_mayor_menor')
        .select('usuario_email, cartas_acertadas, total_cartas, gano')
        .order('cartas_acertadas', { ascending: false })
        .limit(10),

      this.supabase.client
        .from('partidas_preguntados')
        .select('usuario_email, preguntas_correctas, total_preguntas, gano')
        .order('preguntas_correctas', { ascending: false })
        .limit(10),

      this.supabase.client
        .from('partidas_buscaminas')
        .select('usuario_email, dificultad, tiempo_segundos, gano')
        .order('gano', { ascending: false })
        .order('tiempo_segundos', { ascending: true })
        .limit(10),
    ]);

    if (ahorcado.data) this.ahorcado.set(ahorcado.data);
    if (mayorMenor.data) this.mayorMenor.set(mayorMenor.data);
    if (preguntados.data) this.preguntados.set(preguntados.data);
    if (buscaminas.data) this.buscaminas.set(buscaminas.data);

    this.cargando.set(false);
  }

  /**
   * Formatea segundos en formato MM:SS.
   * @param segundos - tiempo en segundos
   */
  formatearTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
