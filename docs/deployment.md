# Despliegue local con Docker Compose

Este documento resume cómo levantar el stack completo (backend, frontend, backoffice, base de datos y almacenamiento de objetos) siguiendo el modelo del repositorio de referencia. Todo se ejecuta con `docker-compose` usando los Dockerfiles dedicados de cada módulo.

## Servicios incluidos

- **backend**: API Django expuesta en `http://localhost:8000`.
- **frontend**: SPA pública servida con `vite preview` en `http://localhost:4173`.
- **backoffice**: shell para el panel administrativo en `http://localhost:4174`.
- **db**: PostgreSQL accesible solo desde la red interna del compose (no se publica puerto al host).
- **storage**: MinIO para almacenamiento de objetos con consola en `http://localhost:9001`.

## Preparación de variables de entorno

Cada módulo incluye un archivo de ejemplo con valores seguros para el stack local y es el que consume el `docker-compose` por defecto. Si prefieres mantener los ejemplos intactos, duplica los archivos y actualiza las rutas en el compose:

```bash
cp backend/.env.docker.example backend/.env.docker
cp frontend/.env.local.example frontend/.env.local
cp backoffice/.env.local.example backoffice/.env.local
```

Ajusta los secretos antes de exponer servicios en entornos compartidos. El backend ya referencia `DATABASE_URL=postgres://gaudeix:gaudeix@db:5432/gaudeix` para conectarse al contenedor `db` sin exponerlo al exterior.

## Cómo levantar el stack

```bash
docker-compose up --build
```

El backend espera que la base de datos esté sana antes de arrancar, mientras que frontend y backoffice dependen del backend. El servicio `storage` queda accesible para inicializar buckets o credenciales de prueba.

## Notas de red y dominios

- La base de datos **no** publica puertos; únicamente el backend puede acceder a ella dentro de la red interna.
- Actualiza `DJANGO_ALLOWED_CORS_ORIGINS` en `backend/.env.docker` si cambias los puertos de frontend o backoffice.
- Para despliegues en Dokploy, reutiliza estos Dockerfiles y ajusta los `env_file` a los secretos gestionados por el proveedor.
