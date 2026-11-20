# ¿Qué sale? — Frontend

Aplicación web de **¿Qué sale?**, la red social de estudiantes universitarios (Desarrollo Web Integrado, UTP, 2026-2). Consume la API del backend (`/api/v1`) con autenticación JWT.

**Stack:** Angular 21 · TypeScript · Tailwind CSS 4 · RxJS · STOMP (WebSocket) · Vitest.

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | Landing: propuesta, cómo funciona, universidades de la red |
| `/acceso` | Iniciar sesión y crear cuenta (elige universidad, valida el dominio del correo) |
| `/olvide` · `/restablecer?token=` | Olvidé mi contraseña y elegir una nueva |
| `/verificar?token=` | Confirma el correo institucional |
| `/bienvenida` | Asistente de 4 pasos: foto, género, fecha de nacimiento, carrera, ciclo, sede, intereses y privacidad |
| `/descubrir` | Sugerencias con porcentaje de afinidad y su explicación; «Pasar», «Me interesa», «Ver perfil» |
| `/personas/:id` | Perfil de otra persona; conectar, bloquear y reportar |
| `/conexiones` | Recibidas, enviadas y conectados; aceptar abre el pop-up de match |
| `/mensajes` | Chat en tiempo real con rompehielos |
| `/planes` | Planes para dos y grupales: crear, solicitar, invitar, confirmar |
| `/comunidades` | Comunidades por interés con publicaciones |
| `/perfil` | Editar foto y datos, cambiar contraseña, bloqueados, cerrar sesión |

## Cómo funciona

- **Afinidad no es match.** El porcentaje solo ordena las sugerencias; un match es una solicitud de conexión aceptada. Al aceptarse, los dos reciben el aviso por WebSocket (`/user/queue/matches`) y ven el pop-up «¡Hay química!».
- **Sin foto**, se dibuja un monigote según el género elegido.
- La foto se **recorta en cuadrado y se reduce a 512 px** en el navegador antes de subirla (máximo 1 MB en el servidor).
- La sesión vive en `sessionStorage`. Un 401 fuera de `/auth` cierra la sesión.
- Un estudiante sin perfil es enviado a `/bienvenida` por `perfilGuard`.
- Diseño **responsive**: en móvil hay menú hamburguesa, barra inferior y el chat pasa a lista/conversación.

## Estructura

```
src/app/
  core/     API tipada, sesión, guardas, personas en caché, tiempo real, avisos y reglas puras (afinidad, edad, universidades)
  ui/       Avatar, insignia de universidad, modal, selector de foto y campos del perfil
  layout/   Shell con cabecera, menú lateral móvil y barra inferior
  pages/    Una carpeta por pantalla
```

## Desarrollo local

Requiere el backend en `http://localhost:8080` (ver el repo de la API; con `SEED_UNIVERSITIES=true` crea las universidades y los catálogos).

```bash
npm ci
npm start        # ng serve con proxy de /api y /ws hacia localhost:8080
npm test -- --watch=false
npm run build
```

`proxy.conf.json` reenvía `/api` y `/ws` al backend, así el navegador usa siempre el mismo origen.

## Despliegue

Al fusionar a `main`, `.github/workflows/deploy.yml` prueba, compila y publica los archivos por `rsync` en la VPS. Nginx sirve la app y reenvía `/api`, `/ws` y Swagger al backend.

> Los logos de las universidades son insignias de color con sus siglas, no los logos oficiales. El proyecto es académico y no está afiliado a ninguna universidad.
