# Gaudeix Backend

Este directorio contiene la configuración base de Django para el proyecto **gaudeix_backend**.

## Requisitos

1. Crear y activar un entorno virtual.
2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

## Variables de entorno

Copie el archivo `.env.example` a `.env` y complete los valores necesarios:

```bash
cp .env.example .env
```

Para desarrollo local puede dejar `ENVIRONMENT=local`. Esto utilizará SQLite como base de datos por defecto.

## Migraciones

Ejecute las migraciones con el perfil local (SQLite):

```bash
ENVIRONMENT=local python manage.py migrate
```

## Pruebas

Puede ejecutar las pruebas integradas de Django con la base de datos SQLite en memoria:

```bash
ENVIRONMENT=test python manage.py test
```

Si prefiere utilizar `pytest`, asegúrese de exportar `ENVIRONMENT=test` antes de ejecutarlo para que la configuración cargue la base de datos temporal.
