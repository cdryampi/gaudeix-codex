# Guía de Variables de Entorno

Esta guía centraliza las variables de entorno utilizadas por los distintos módulos del proyecto y describe cómo deben gestionarse en los diferentes perfiles de despliegue. Sigue estas recomendaciones para garantizar configuraciones consistentes entre entornos locales, de staging y producción.

## Convenciones Generales

- Cada módulo mantiene su propio archivo de configuración:
  - `backend/.env`
  - `frontend/.env.local`
- Los archivos `.env` **no** deben versionarse. Añádelos a los mecanismos de secrets correspondientes (GitHub Actions, Dokploy, etc.) y compártelos de manera segura.
- Cuando una variable sea modificada, sincroniza su valor con los secrets de GitHub Actions (`Settings` → `Secrets and variables` → `Actions`). Define un secret por módulo con nombres explícitos como `BACKEND_ENV` y `FRONTEND_ENV` que contengan el contenido completo del archivo `.env`.

## Backend (Django)

| Variable | Obligatoria | Descripción | Notas |
| --- | --- | --- | --- |
| `DJANGO_SECRET_KEY` | Sí | Clave secreta usada para la firma criptográfica. | Debe ser única por entorno.
| `DATABASE_URL` | Sí | Cadena de conexión compatible con `django-environ` (`sqlite:///...`, `postgres://...`). | Cambia según el perfil (ver más abajo).
| `ALLOWED_HOSTS` | Sí | Lista separada por comas con los dominios permitidos. | Incluir `localhost` en desarrollo.
| `DEBUG` | Sí | Activa el modo debug (`true/false`). | Mantener `false` fuera de desarrollo.
| `DJANGO_ALLOWED_CORS_ORIGINS` | Opcional | Dominios permitidos para CORS. | Útil para separar frontend/backoffice.
| `EMAIL_URL` | Opcional | Configuración SMTP en formato URL. | Requerido si se envían correos.
| `REDIS_URL` | Opcional | Conexión a Redis para caché/colas. | Necesario solo si el despliegue lo utiliza.

## Frontend (React + Vite)

> Todas las variables deben comenzar con el prefijo `VITE_` para estar disponibles en tiempo de compilación.

| Variable | Obligatoria | Descripción | Notas |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Sí | URL base para las peticiones al backend. | Ajustar al host público o local según el perfil.
| `VITE_PUBLIC_MAPS_KEY` | Opcional | Clave pública para proveedores de mapas (Mapbox, Google Maps, etc.). | Añadirla cuando se habiliten mapas.
| `VITE_PUBLIC_SENTRY_DSN` | Opcional | DSN público para capturar errores en frontend. | Útil en staging/producción.
| `VITE_PUBLIC_FEATURE_FLAGS` | Opcional | JSON o lista con flags de funcionalidad. | Permite activar/desactivar features sin redeploy.

## Servicios de Terceros

| Servicio | Variable | Obligatoria | Descripción |
| --- | --- | --- | --- |
| GitHub Actions | `GITHUB_PAT` | Opcional | Token personal con permisos de lectura si se automatiza la creación de issues/releases desde pipelines.
| Dokploy | `DOKPLOY_API_ENDPOINT` | Sí | Endpoint de la API para gestionar despliegues.
| Dokploy | `DOKPLOY_API_KEY` | Sí | Clave de autenticación para la API.
| Dokploy | `DOKPLOY_PROJECT_ID` | Opcional | Identificador del proyecto si se gestiona múltiples despliegues.
| Otros servicios | `SENTRY_DSN`, `MAPS_SECRET_KEY`, etc. | Opcional | Variables sensibles según integraciones adicionales.

## Perfiles de Configuración

### Desarrollo Codex

- **Backend**: utilizar `DATABASE_URL=sqlite:///db.sqlite3`, `DEBUG=true`, `ALLOWED_HOSTS=localhost,127.0.0.1`.
- **Frontend**: `VITE_API_BASE_URL=http://localhost:8000/api` (o el puerto configurado para el backend local).
- **Servicios**: normalmente no se requieren claves reales; usar tokens de desarrollo cuando sea posible.
- **Flujo de trabajo**: crear/actualizar `backend/.env` y `frontend/.env.local` localmente. Sincronizar estos archivos con los secrets de GitHub Actions solo cuando se necesite ejecutar pipelines que dependan de variables específicas.

### Staging / Producción

- **Backend**: usar `DATABASE_URL` apuntando a PostgreSQL gestionado (`postgres://user:pass@host:5432/db`). Establecer `DEBUG=false` y `ALLOWED_HOSTS` con los dominios públicos (ej. `api.staging.gaudeix.cat`). Configurar `DJANGO_ALLOWED_CORS_ORIGINS` con las URLs del frontend/backoffice desplegados.
- **Frontend**: `VITE_API_BASE_URL` debe apuntar al dominio público del backend (`https://api.staging.gaudeix.cat/api`). Añadir claves públicas (`VITE_PUBLIC_MAPS_KEY`, `VITE_PUBLIC_SENTRY_DSN`) según integraciones activas.
- **Servicios**: proporcionar tokens reales (`GITHUB_PAT`, `SENTRY_DSN`, claves de terceros) y almacenarlos como secrets. Mantener rotación periódica.
- **Flujo de trabajo**: mantener los `.env` actualizados en un gestor seguro y reflejarlos en los secrets de GitHub Actions para que los pipelines de build/test/deploy consuman los valores correctos.

### Despliegue en Dokploy

- **Backend/Frontend**: subir los archivos `.env` respectivos a la configuración de Dokploy o utilizar las interfaces de secrets del servicio para declararlos variable por variable.
- **Infraestructura**: configurar `DOKPLOY_API_ENDPOINT`, `DOKPLOY_API_KEY` y `DOKPLOY_PROJECT_ID` en Dokploy y, si la automatización depende de GitHub Actions, duplicarlos también como secrets (`DOKPLOY_API_ENDPOINT`, `DOKPLOY_API_KEY`, `DOKPLOY_PROJECT_ID`).
- **Pipeline**: asegurarse de que los pipelines de GitHub Actions tengan permisos para leer los secrets y desencadenar despliegues mediante la API de Dokploy cuando corresponda.

## Sincronización con GitHub Actions

1. Crea o actualiza los archivos `.env` locales según el perfil.
2. Ve a GitHub → `Settings` → `Secrets and variables` → `Actions`.
3. Define un secret por módulo (`BACKEND_ENV`, `FRONTEND_ENV`) y pega el contenido completo del `.env` correspondiente.
4. Para servicios externos (Dokploy, GitHub PAT, etc.) define secrets individuales (`DOKPLOY_API_KEY`, `GITHUB_PAT`, ...).
5. Actualiza la configuración de los workflows para que exporten los secrets a archivos temporales antes de ejecutar builds/tests.

Mantén esta documentación actualizada cada vez que se añadan o modifiquen variables de entorno.
