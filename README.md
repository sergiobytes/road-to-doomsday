# Road to Avengers: Doomsday

Calendario personal para ver, en orden de estreno, las películas y series de Marvel
relevantes antes de _Avengers: Doomsday_. Registra el progreso en el navegador y
muestra si voy al día, adelantado o atrasado.

- **Inicio del Road:** 28 de septiembre de 2026
- **Última sesión:** 14 de diciembre de 2026 (colchón del 15 al 16)
- **Función objetivo:** medianoche del 16 al 17 de diciembre de 2026 (provisional
  hasta confirmar boletos)

**App:** https://sergiobytes.github.io/road-to-doomsday/

## Contenido

87 títulos repartidos en 128 sesiones, en orden de estreno:

- MCU completo: 38 películas, series live action, especiales y animación
  (_What If...?_ T1–T3, _Eyes of Wakanda_, _Marvel Zombies_).
- Fox: saga X-Men, _Deadpool_ 1 y 2, _Logan_, _Fantastic Four_ (2005, 2007 y 2015),
  _Daredevil_ y _Elektra_.
- Sony: trilogías de Spider-Man de Raimi y Webb, _Ghost Rider_ 1 y 2.

Cada título tiene una relevancia para _Doomsday_: **esencial** (16), **recomendado** (12)
o **extra** (59).

Reglas del calendario:

- Máximo 4 horas por día; si la siguiente sesión no cabe, pasa al día siguiente.
- Máximo 2 películas por día.
- Las series se dividen en bloques de episodios por día.
- Excepción: _VisionQuest_ se ve conforme se estrena (del 14 de octubre al 25 de
  noviembre), fuera del orden de estreno y del límite diario.

## Funciones

- Marcar sesiones como vistas y ver el porcentaje de avance.
- Estado del calendario: al día, adelantado o atrasado.
- Tarjeta con la siguiente sesión pendiente.
- Omitir sesiones: no cuentan como pendientes ni atrasadas, pero tampoco suman al
  porcentaje.
- Semanas colapsables; las ya completas aparecen cerradas al cargar.
- Etiquetas con la plataforma donde está cada título en México (Disney+, Netflix,
  Prime Video, HBO Max, ViX o en cines). Revisadas en JustWatch el 28 de septiembre
  de 2026; la disponibilidad cambia, se actualizan en `src/data/road.ts`.
- Cuenta regresiva a la función.
- Reinicio del progreso con confirmación.

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

## Desarrollo

En modo desarrollo se puede simular la fecha para probar el calendario:

- `?today=2026-10-10` simula el día.
- `?now=2026-12-16T23:59:50-06:00` simula el instante exacto (útil para la cuenta regresiva).

Estos parámetros se ignoran en producción.

El progreso se guarda en Local Storage con versión. Si cambia la forma de los datos,
se agrega una migración en `src/state/migrations.ts`; si los datos guardados son
inválidos, se respaldan antes de reiniciar.

## Aviso

Proyecto personal sin afiliación con Marvel Studios ni Disney. No usa material oficial.
