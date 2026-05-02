/**
 * @fileoverview Componente QuienSoy — página de presentación.
 * Consume la API pública de GitHub para obtener los datos del perfil.
 * Muestra nombre, imagen, biografía y datos personales.
 * También se explica el juego elegido: Buscaminas.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Interfaz del perfil de GitHub */
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
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.github.com/users/DepaoloJuan';

  perfil = signal<PerfilGithub | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPerfil();
  }

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
