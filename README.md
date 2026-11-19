# ¿Qué sale? — Frontend de Desarrollo Web Integrado

> Adaptación parcial del frontend del Curso Integrador I. Las pantallas de perfiles, descubrimiento, creación de meetups, chat y llamadas del código heredado **aún no están integradas**. Las pruebas usan respuestas simuladas: no confirman el funcionamiento de extremo a extremo.

> La API se consulta mediante `/api/v1` en el mismo origen. El servidor de despliegue debe redirigir esa ruta al backend y devolver `index.html` para las rutas de Angular. Se requiere el backend JWT, un catálogo de universidades configurado y SMTP real para verificar correos.

Interfaz web del **Sistema de Conexión y Organización de Meetups Académicos y Sociales para Estudiantes Universitarios**, adaptada para Desarrollo Web Integrado (UTP, 2026-2).

## Stack

Angular 21 · TypeScript · Tailwind CSS 4 · RxJS · Vitest. Consume la API del backend con autenticación JWT.

## Pantallas

Construidas a partir del diseño del Figma. Solo muestran datos que el backend entrega.

| Pantalla | Ruta | Qué hace |
|---|---|---|
| Acceso | `/acceso` | Iniciar sesión y crear cuenta con correo institucional |
| Inicio | `/inicio` | Consultar meetups y solicitudes recibidas; solicitar participación y responder solicitudes |
| Conexiones | `/conexiones` | Consultar solicitudes recibidas y enviadas y conexiones aceptadas; aceptar, rechazar o cancelar solicitudes |

## Estructura

```
src/app/
  core/      modelos de la API, autenticación, interceptor del token, guardas y servicios de datos
  layout/    barra de navegación y contenedor de las pantallas protegidas
  shared/    tarjeta de meetup, modal de meetup y utilidades de formato
  pages/     una carpeta por pantalla
```

- El interceptor adjunta el token solo a las peticiones de la API y cierra la sesión ante un 401 en rutas protegidas.
- Las rutas privadas usan `authGuard`; `/acceso` usa `invitadoGuard`.
- El token se guarda en `sessionStorage`, así que se pierde al cerrar la pestaña.

## Cómo ejecutarlo

Requisitos: una versión de Node compatible con Angular 21 y un proxy que envíe `/api` al backend.

```bash
npm install
npm start
```

La aplicación queda en <http://localhost:4200>. La URL de la API se configura en `src/environments/environment.ts`.

## Pruebas y compilación

```bash
npm test -- --watch=false
npm run build
```

Las pruebas cubren los servicios, el interceptor, las guardas y cada pantalla contra una API simulada.

## Repositorios

- Frontend: este repositorio.
- Backend: `Proyecto-Desarrollo-Web-Integrado-Universidad`.
