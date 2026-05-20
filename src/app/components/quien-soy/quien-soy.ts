/**
 * @fileoverview Componente QuienSoy — página de presentación del alumno.
 * Consume la API pública de GitHub para obtener los datos del perfil.
 * Muestra nombre, imagen, bio y datos del alumno.
 * También explica el juego propio elegido: Buscaminas.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Interfaz que representa los datos relevantes del perfil de GitHub */
interface PerfilGithub {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy implements OnInit {
  /** Inyección del cliente HTTP para consumir la API de GitHub */
  private http = inject(HttpClient);

  /** URL de la API de GitHub con el usuario del alumno */
  private readonly apiUrl = 'https://api.github.com/users/DepaoloJuan';

  /** Signal que almacena el perfil obtenido de la API */
  perfil = signal<PerfilGithub | null>(null);

  /** Signal para manejar el estado de carga */
  cargando = signal<boolean>(true);

  /** Signal para manejar errores de la petición */
  error = signal<string | null>(null);

  /**
   * ngOnInit: se ejecuta al inicializar el componente.
   * Es el lugar correcto para hacer la petición HTTP inicial.
   */
  ngOnInit(): void {
    this.cargarPerfil();
  }

  /**
   * Realiza la petición GET a la API de GitHub
   * y actualiza las signals con los datos obtenidos.
   */
  cargarPerfil(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.http.get<PerfilGithub>(this.apiUrl).subscribe({
      next: (datos) => {
        this.perfil.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil de GitHub.');
        this.cargando.set(false);
      },
    });
  }
}
