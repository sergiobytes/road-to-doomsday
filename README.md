# Road to Avengers: Doomsday

Calendario personal para ver, en orden de estreno, las películas y series de Marvel
relevantes antes de _Avengers: Doomsday_. Registra el progreso en el navegador y
muestra si voy al día, adelantado o atrasado.

- **Inicio del Road:** 28 de septiembre de 2026
- **Última sesión:** 9 de diciembre de 2026 (colchón del 10 al 16)
- **Función objetivo:** medianoche del 16 al 17 de diciembre de 2026 (provisional
  hasta confirmar boletos)

**App:** https://sergiobytes.github.io/road-to-doomsday/

## Stack

- Vite + TypeScript (sin framework)
- Tailwind CSS 4
- Vitest para la lógica de negocio
- ESLint + Prettier
- Local Storage para el progreso (sin backend)

## Requisitos

- Node.js 24

## Scripts

| Comando           | Qué hace                                                     |
| ----------------- | ------------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo                                       |
| `npm run build`   | Revisa tipos y genera la versión de producción en `dist/`    |
| `npm run preview` | Sirve localmente el build de producción                      |
| `npm test`        | Pruebas en modo observación                                  |
| `npm run check`   | Verificación completa: tipos, lint, formato, pruebas y build |

Antes de cada commit: `npm run check`.

## Arquitectura

Cuatro capas con dependencias en una sola dirección:

```
src/
├── data/     Datos estáticos: títulos, sesiones, fechas y constantes
├── domain/   Lógica de negocio pura (fechas, progreso, estado del calendario)
├── state/    Progreso del usuario: Local Storage versionado y store en memoria
└── ui/       Componentes y renderizado
```

- `domain/` no conoce el DOM ni Local Storage, por eso se prueba con Vitest.
- Local Storage guarda solo el progreso y las preferencias, nunca datos estáticos.
- Las fechas se manejan como `YYYY-MM-DD` en hora local; nunca con `new Date("YYYY-MM-DD")`.

## Pósters (opcional, solo local)

Coloca imágenes en `src/assets/posters/` con el id del título como nombre de archivo
(por ejemplo, `x-men.jpg` o `loki-s1.webp`). Formatos: jpg, jpeg, png y webp.
Los ids están en `src/data/road.ts`.

- Los títulos sin póster muestran una portada generada.
- La carpeta está en `.gitignore`: los pósters nunca se suben al repositorio ni se publican.
- Recomendado: unos 300 px de ancho y formato webp para que la app cargue rápido.

## Despliegue

Cada push a `main` ejecuta `npm run check` en GitHub Actions y, si todo pasa, publica
`dist/` en GitHub Pages. Si alguna verificación falla, la versión publicada no cambia.

## Convenciones

- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat`, `fix`, `test`, `docs`, `chore`, `build`, `refactor`, `style`.
- Las pruebas corren con la zona horaria fija `America/Mexico_City`.

## Aviso

Proyecto personal sin afiliación con Marvel Studios ni Disney. No usa material oficial.
