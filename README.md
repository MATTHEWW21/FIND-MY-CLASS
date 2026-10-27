# UAGPS

Aplicación web para moverse por el campus **UAG Campus CU**: busca edificios y servicios, calcula la ruta a pie por los andadores (con opción de **ruta accesible**), te guía por **voz** y permite compartir recorridos, reportar problemas y pedir ayuda (SOS).

> Proyecto de practicum. Antes llamado *FIND MY CLASS* / *NAVIU* (de ahí los nombres `naviu_backend`, `naviu_postgres` y `findmyclass_db`). Diseño visual: Constanza Orozco.

## Qué incluye

| Área | Qué hace |
|---|---|
| **Mapa y rutas** | Buscador de lugares, ruta más corta sobre la red de andadores, modo *ruta accesible* (evita escaleras), trazo distinto por tipo de camino (liso, puntos para escaleras, rayas largas para rampas) con leyenda. |
| **Guía por voz** | Indicaciones paso a paso con la voz del dispositivo, comandos de voz, seguimiento por GPS y aviso si te sales de la ruta. Modo demo para probar sin caminar. |
| **Accesibilidad del campus** | 63 escaleras, rampas, estacionamientos y pasos accesibles mapeados a mano. Aparecen como pines **solo cuando empiezas una ruta** y la guía los menciona. |
| **Comunidad** | Feed de recorridos, comentarios, me gusta, amigos y mensajes con fotos. |
| **Actividad** | Registro de caminatas, carreras, bici y scooter con GPS, calorías y racha. |
| **Seguridad personal** | Botón SOS con tipo de problema, contacto de emergencia y llamada al teléfono de seguridad del campus. |
| **Reportes** | Incidencias en el mapa (baches, escaleras, iluminación…) y calificación de cada recorrido. |
| **Administración** | Panel de estadísticas agregadas (`/estadisticas.html`, protegido con llave). |

## Tecnología

- **Backend:** Node.js 18 + Express 5, `pg`, `bcrypt`, `jsonwebtoken`, `express-rate-limit`, `cors`, `dotenv`.
- **Base de datos:** PostgreSQL 15.
- **Frontend:** HTML, CSS y JavaScript sin framework, servido como archivos estáticos por el mismo Express. Mapa con Leaflet + OpenStreetMap.
- **Contenedores:** Docker Compose (`naviu_backend` en el puerto 3000 y `naviu_postgres` en `127.0.0.1:5432`).

## Estructura

```
Find-My-Class/
├── docker-compose.yml
├── .env                      # secretos reales (NO va a Git)
├── .env.example              # plantilla sin valores reales
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── uploads/              # fotos de publicaciones y mensajes (NO va a Git)
│   └── src/
│       ├── app.js            # arranque, middlewares, montaje de rutas
│       ├── config/db.js      # conexión a PostgreSQL
│       ├── middleware/       # auth.js (JWT y roles), comunidad.js, seguridad.js (cabeceras, CORS, errores)
│       ├── controllers/      # authController.js
│       ├── routes/           # un archivo por módulo de la API
│       └── database/
│           ├── schema.sql    # tablas base
│           └── migrations/   # 001 … 017, en orden
└── frontend/
    ├── *.html                # una página por pantalla
    ├── css/                  # estilos; contraste.css va al final y corrige colores
    ├── js/                   # un script por pantalla + módulos compartidos
    └── assets/
```

### Módulos del frontend que conviene conocer

| Archivo | Para qué sirve |
|---|---|
| `js/api.js` | `apiFetch()` (agrega el token, maneja sesión vencida), guardar/limpiar sesión. |
| `js/mapa.js` | Mapa Leaflet, buscador, trazado de ruta, panel de ruta, reportes y calificación. Publica eventos `fmc:ruta`, `fmc:empezar`, `fmc:finalizar`, `fmc:limpiar` y el puente `window.FMCMapa`. |
| `js/mapa-rutas.js` | Camino más corto (Dijkstra) sobre la red de puntos y tramos. No depende del DOM. |
| `js/mapa-busqueda.js` | Búsqueda tolerante a acentos y errores en los lugares. |
| `js/voz.js`, `js/voz-guia.js` | Guía por voz: comandos, pasos, GPS, demo. `voz-guia.js` genera las frases y es independiente del DOM. |
| `js/mapa-accesibilidad.js` | Pines de escaleras/rampas/estacionamientos solo durante la ruta. |
| `js/aviso.js` | Avisos y ventanas de confirmación dentro de la app (reemplaza `alert()` y `confirm()`). |
| `js/a11y-comun.js`, `js/accesibilidad.js` | Roles, nombres, foco y teclado para lectores de pantalla. |
| `js/tutorial.js` | Tutorial de primera vez. |

## Puesta en marcha

### Requisitos

- Docker Desktop (con Compose).
- Node.js solo si quieres generar secretos o correr scripts fuera de Docker.
- Un navegador moderno. Para GPS y micrófono desde el celular se necesita **HTTPS** (ver más abajo).

### 1. Variables de entorno

Copia la plantilla y llénala:

```powershell
Copy-Item .env.example .env
```

Genera los secretos (uno distinto para cada variable) con:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| Variable | Qué es |
|---|---|
| `PORT` | Puerto del backend (3000). |
| `NODE_ENV` | `development` o `production`. En producción se cierra CORS y se ignora `DEV_MOSTRAR_CODIGO`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a PostgreSQL. `DB_HOST=postgres_db` dentro de Docker. |
| `JWT_SECRET` | Firma las sesiones. Mínimo 32 caracteres; el servidor no arranca sin él. |
| `JWT_EXPIRES_IN` | Duración de la sesión (por defecto `30d`). |
| `ADMIN_API_KEY` | Llave de administrador (mínimo 16 caracteres) para crear edificios y ver estadísticas. |
| `SEGURIDAD_UAG_TELEFONO` | Teléfono de seguridad del campus para el botón SOS (con lada, solo dígitos y `+`). |
| `DOMINIO_INSTITUCIONAL` | Solo se aceptan registros con este dominio (`edu.uag.mx`). |
| `DEV_MOSTRAR_CODIGO` | **Solo desarrollo:** la API devuelve el código de 6 dígitos porque aún no hay servicio de correo. |
| `TRUST_PROXY` | Ponlo en `1` si hay un túnel o proxy HTTPS delante, para que los límites de intentos cuenten por persona. |
| `CORS_ORIGIN` | Opcional. Orígenes permitidos separados por coma. Sin esto: abierto en desarrollo y cerrado en producción. |

> Nunca subas el `.env` a Git ni lo pegues en chats o capturas. Si se filtra algo, cambia esa clave.

### 2. Levantar los contenedores

```powershell
docker compose up -d --build
docker compose logs -f backend
```

La aplicación queda en <http://localhost:3000>.

### 3. Crear las tablas

PostgreSQL arranca vacío. Aplica primero `schema.sql` y luego cada migración **en orden** (usuario y base son los de tu `.env`):

```powershell
$U = "uag_admin"; $D = "findmyclass_db"
docker cp backend/src/database/schema.sql naviu_postgres:/tmp/
docker exec naviu_postgres psql -U $U -d $D -f /tmp/schema.sql

Get-ChildItem backend/src/database/migrations/*.sql | Sort-Object Name | ForEach-Object {
  docker cp $_.FullName naviu_postgres:/tmp/
  docker exec naviu_postgres psql -U $U -d $D -f "/tmp/$($_.Name)"
}
```

Usa siempre `docker cp` + `psql -f`: redirigir archivos con `<` no funciona en PowerShell.

| Migración | Contenido |
|---|---|
| 001 | Usuarios, códigos de verificación y aulas. |
| 002–003 | Datos de usuarios y preferencias. |
| 004–007 | Carreras, datos de colaboradores y estancias (incluye las carreras reales). |
| 008–011 | Lugares, coordenadas, snacks y bebederos. |
| 012 | Calificaciones e incidencias. |
| 013 | Publicaciones, fotos, likes, comentarios y reportes. |
| 014 | Red de caminos (`puntos` y `rutas`). |
| 015 | Amistades y mensajes. |
| 016 | Actividades y alertas SOS. |
| 017 | Escaleras, rampas, estacionamientos y pasos accesibles (se puede repetir sin duplicar). |

Las migraciones están pensadas para aplicarse **una vez, en orden, sobre una base nueva**. Antes de repetir una, revisa que no duplique datos. Los archivos `fix_*.sql` y `limpiar_*.sql` de `src/database/` son correcciones puntuales.

### 4. Probar

Abre <http://localhost:3000>, elige un rol y regístrate con un correo `@edu.uag.mx`. Con `DEV_MOSTRAR_CODIGO=true` la app te muestra el código de verificación en una ventana.

## Usarla desde el celular

1. **Misma red Wi-Fi:** abre `http://<IP-de-tu-computadora>:3000`. El mapa funciona, pero **el GPS y el micrófono no** porque el navegador los exige sobre HTTPS.
2. **Con HTTPS (para probar GPS y voz):** usa un túnel, por ejemplo Cloudflare:
   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```
   Pon `TRUST_PROXY=1` en el `.env` y reinicia el backend. La dirección `https://…trycloudflare.com` es **pública mientras el túnel esté abierto**: no la compartas y ciérralo con Ctrl+C al terminar.

## Mapa y datos del campus

- **Red de caminos:** tablas `puntos` (nodos) y `rutas` (tramos con `tipo`: `normal`, `escaleras` o `rampa`). El cálculo corre en el navegador (`mapa-rutas.js`).
- **Herramientas:** `herramienta_rutas.html` muestra la red sobre el mapa para revisarla y `herramienta_coordenadas.html` ayuda a obtener coordenadas (esta última es temporal).
- **Accesibilidad mapeada:** tabla `accesibilidad` (migración 017). Cada fila es un elemento; si es largo, `trazo` guarda todos sus puntos en orden `[[lat,lng], …]`. Para agregar más, inserta filas con `tipo` en `escalera`, `rampa`, `estacionamiento`, `paso_peatonal` o `elevador`; no hay que tocar código.
- **Cómo mapear:** en Google Maps marca cada punto con su coordenada y una etiqueta (“escalera a un lado de Rectoría”). Para una escalera o rampa larga, marca todos sus vértices en orden y rotula el último.
- **Modo demo (sin salir a caminar):** abre `mapa.html?demo=1`; el recorrido se simula. `&vel=6` cambia la velocidad en m/s.

## API

Todas las rutas cuelgan de `/api`. “Sesión” significa encabezado `Authorization: Bearer <token>`.

| Módulo | Ruta | Acceso |
|---|---|---|
| **auth** | `POST /auth/registro`, `/verificar`, `/reenviar-codigo`, `/login`, `/invitado`, `/olvide-password`, `/restablecer-password` | Pública (con límite de intentos) |
| | `GET/PATCH /auth/me`, `POST /auth/me/password`, `PUT /auth/me/preferencias` | Sesión |
| **mapa** | `GET /mapa/lugares`, `/mapa/grafo`, `/mapa/accesibilidad` | Pública |
| **catalogos** | `GET /catalogos/edificios`, `/carreras`, `/estancias` | Pública |
| **edificios**, **categorias**, **servicios** | `GET /edificios`, `/edificios/:id`, `/categorias`, `/servicios` | Pública |
| | `POST /edificios` | Llave de administrador (`x-admin-key`) |
| **publicaciones** | `GET/POST /publicaciones`, `DELETE /:id`, `POST /:id/like`, `GET/POST /:id/comentarios`, `DELETE /:id/comentarios/:cid`, `POST /:id/reportar` | Sesión (estudiante o colaborador) |
| **amigos** | `GET /amigos`, `/amigos/buscar`, `POST /solicitar`, `/:id/aceptar`, `DELETE /:id` | Sesión |
| **mensajes** | `GET /mensajes/conversaciones`, `GET/POST /mensajes/con/:amigoId` | Sesión |
| **actividades** | `POST /actividades`, `GET /actividades/resumen` | Sesión |
| **feedback** | `POST /feedback/calificaciones`, `/feedback/incidencias` | Sesión |
| **sos** | `GET /sos/config`, `POST /sos` | Sesión |
| **estadisticas** | `GET /estadisticas` | Llave de administrador (límite de 30 intentos / 15 min) |
| — | `GET /health` | Pública |

Roles: `estudiante`, `colaborador` (con vista completa o simplificada) y `visitante` (entra como invitado, solo mapa y rutas).

## Accesibilidad

La app se diseñó pensando en personas con discapacidad visual, motriz y daltonismo:

- **Rutas accesibles** que evitan escaleras, con rampas y estacionamientos señalados.
- **Guía por voz** con avisos de escaleras y rampas cercanas.
- **Trazos distintos por forma**, no solo por color (paleta Okabe-Ito para daltonismo), con leyenda.
- **Contraste** de al menos 4.5:1 en texto y 3:1 en elementos gráficos; símbolos (✓, ⚠) además del color en los estados.
- **Lector de pantalla y teclado:** botones reales con nombre, estados (`aria-pressed`, `aria-current`), ventanas con foco atrapado y Escape, avisos que se anuncian solos y aviso de mensajes nuevos.
- **Tamaño táctil** cómodo (revisado con la regla de objetivos de WCAG 2.2) y contenido que se reacomoda sin scroll horizontal hasta 320 px de ancho.
- **Avisos dentro de la app**, no `alert()` del navegador.

Cómo se revisa: `axe-core` (WCAG 2.2 AA) sobre cada pantalla y cada ventana abierta, más pruebas de teclado. **Falta** la prueba con TalkBack en un dispositivo real y con personas usuarias.

## Seguridad

- Contraseñas con `bcrypt` (costo 12) y reglas de fortaleza; códigos de verificación guardados con hash, con vencimiento de 15 min, máximo 5 intentos y espera de 60 s entre envíos.
- El login tarda lo mismo exista o no el correo y las respuestas de recuperación no revelan quién tiene cuenta.
- Límites de intentos por IP en login, registro y recuperación.
- Cabeceras de seguridad, CORS cerrado en producción y errores sin detalles internos.
- Fotos validadas por su contenido real (no solo por extensión) y guardadas con nombres aleatorios.
- Todo el texto de usuarios se inserta con `textContent`; no hay `innerHTML` con datos de personas.
- La base de datos solo escucha en `127.0.0.1`.

**Antes de abrirla a más gente:** el `Dockerfile` actual arranca con `npm run dev` (nodemon); para producción usa `npm start`. Además: conectar un servicio de correo real y poner `NODE_ENV=production` con `DEV_MOSTRAR_CODIGO=false`; cambiar la contraseña de la base de datos y los secretos de ejemplo; usar HTTPS permanente; programar respaldos de la base (`pg_dump`) y probar restaurarlos; publicar aviso de privacidad (la app usa ubicación y datos de seguridad personal).

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| `El operador '<' está reservado` en PowerShell | No uses `<archivo`; usa `docker cp` + `psql -f`. Y reemplaza `<usuario>`/`<base>` por los valores reales de tu `.env`. |
| El backend no arranca y dice que falta `JWT_SECRET` | Falta en el `.env` o tiene menos de 32 caracteres. |
| Cambié `DB_PASSWORD` y ya no conecta | La clave vive también dentro de PostgreSQL. Cámbiala ahí: `docker exec -it naviu_postgres psql -U <usuario> -d <base>` y `\password <usuario>`. |
| Los pines de accesibilidad no salen | Falta la migración 017 o reiniciar el backend. Solo aparecen al **empezar** una ruta. |
| `/estadisticas.html` responde 403 | Llave incorrecta o `ADMIN_API_KEY` sin definir o de menos de 16 caracteres. |
| El GPS o el micrófono no funcionan en el celular | Hace falta HTTPS (túnel). Revisa los permisos del navegador. |
| Todos los visitantes se bloquean entre sí | Con túnel, pon `TRUST_PROXY=1`. |

## Pendientes

- Servicio de correo y teléfono de seguridad real (en trámite con la universidad).
- Ruta y paradas del Teco Bus / camión.
- Aulas y estancias reales.
- Prueba con TalkBack y con usuarios; ajustes de señalética para daltonismo (modo práctica, incidencias cercanas por voz).
- Logo definitivo.
- HTTPS permanente, respaldos y aviso de privacidad.

## Créditos

Desarrollo: Erick Mathew García Sánchez · Diseño: Constanza Orozco · Universidad Autónoma de Guadalajara, Campus CU.