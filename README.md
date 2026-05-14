# Sala de Juegos — TP1 Programación IV

**Alumno:** Depaolo Juan Manuel  
**Materia:** Programación IV — UTN Avellaneda  
**Deploy:** [depaolo-parcial-1-progra4.vercel.app](https://depaolo-parcial-1-progra4.vercel.app)

---

## Tecnologías utilizadas

- **Angular 21** — Standalone Components, Signals API, SSR, Lazy Loading
- **Supabase** — Autenticación, base de datos PostgreSQL, Realtime
- **Bootstrap 5** — Diseño responsivo vía CDN
- **TypeScript 5.6+** — Tipado estricto
- **Vercel** — Deploy del frontend
- **GitHub** — Control de versiones con ramas por sprint

---

## Descripción de sprints

### Sprint 1

Estructura base del proyecto. Creación de componentes principales: Login, Registro, Home y Quién Soy. Navegación entre componentes con Angular Router. Integración con la API pública de GitHub para mostrar datos del perfil del alumno. Deploy inicial en Vercel. Implementación de favicon.

### Sprint 2

Autenticación completa con Supabase. Login con Reactive Forms, validaciones y 3 botones de acceso rápido. Registro de usuarios con datos adicionales (nombre, apellido, edad) guardados en la tabla `usuarios`. Home reactivo que muestra contenido según el estado de sesión del usuario.

### Sprint 3

Implementación del juego Ahorcado con SVG, botones de letras, temporizador y guardado de resultados en Supabase. Implementación del juego Mayor o Menor con baraja española y guardado de resultados. Sala de chat en tiempo real con Supabase Realtime. Guards de ruta para proteger el acceso a usuarios no logueados.

### Sprint 4

Implementación del juego Preguntados consumiendo una API externa de preguntas. Implementación del juego propio: Buscaminas con tres niveles de dificultad (Fácil, Medio, Difícil). Página de Resultados con 4 tablas ordenadas por mejor desempeño para cada juego.

---

## Usuarios de prueba

| Email               | Contraseña |
| ------------------- | ---------- |
| probando@test.com   | 123456     |
| usuario2@prueba.com | 123456     |
| usuario3@prueba.com | 123456     |
