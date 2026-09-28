# fmp · web de MV Padel Cercedilla A (liga FMP)

Frontend en Angular 20 + PrimeNG (tema Aura) + Chart.js para consultar las estadísticas del equipo y de
cada jugador, ver rivales y preparar las alineaciones de cada jornada. Consume la API del repositorio
`fmp-api` y requiere iniciar sesión.

## Desarrollo

```bash
npm install
npm start            # http://localhost:4200, con proxy de /api hacia http://127.0.0.1:8000 (fmp-api en marcha)
```

## Producción

```bash
npm run build        # genera dist/frontend/browser
```

La API de `fmp-api` sirve esa carpeta directamente (variable `FMP_DIST`, por defecto `../fmp/dist/frontend/browser`),
así que basta con desplegar los dos repositorios uno junto al otro y arrancar la API detrás de nginx con TLS.
Si prefieres servir la web desde nginx, apunta `root` a `dist/frontend/browser`, añade `try_files $uri /index.html`
y haz `proxy_pass` de `/api` a la API.

## Páginas

- **Panel**: posición, balance, forma, la temporada encuentro a encuentro, clasificación, plantilla con puntos y forma,
  victorias acumuladas por jornada, historial del club.
- **Equipo**: todas las estadísticas del equipo con gráficos (situaciones, posiciones, meses, marcadores, nivel de los
  rivales, sets, juegos, evolución de puntos de los jugadores, participación, rivales, encuentros 3-2, parejas).
- **Jugadores**: tabla comparativa ordenable, puntos frente a rendimiento, rating Elo, parejas.
- **Jugador**: evolución de puntos y Elo, situaciones, posiciones, meses, compañeros, temporadas, historial y ajustes.
- **Temporadas**: clasificación, calendario del grupo y plantilla; **Acta** de cada encuentro.
- **Rivales**: fuerza por puntos y Elo, plantillas, historial contra nosotros, mejores jugadores del grupo.
- **Alineación**: disponibilidad por jornada, propuesta (por fuerza, equilibrada o con química) y edición con
  validación de la regla FMP (parejas de mayor a menor suma de puntos dentro de cada turno).

## Estructura

```
src/app/core       autenticación (token en localStorage), interceptor, guard, cliente API
src/app/shared     shell con barra lateral, gráficos (p-chart), KPI, selector, tira de temporada, forma
src/app/pages      login, dashboard, equipo, jugadores, jugador, temporada, encuentro, rivales, alineacion, cuenta
src/styles.scss    tokens de diseño y estilos globales
```
