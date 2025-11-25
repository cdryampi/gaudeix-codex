# Gaudeix Backend

Este directorio contiene la configuración base de Django para el proyecto **gaudeix_backend**.

## Requisitos

1. Crear y activar un entorno virtual.
2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

### Entorno virtual usado por Codex

El CLI de Codex ya tiene un entorno preparado en `backend/.venv_win`. Úsalo así:

```bash
# Activar (opcional) en bash:
source backend/.venv_win/Scripts/activate

# O ejecutar comandos directamente:
backend/.venv_win/Scripts/python.exe manage.py migrate
backend/.venv_win/Scripts/python.exe -m pytest
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

## Ejecutar con Codex/VS Code (evitar problemas de entorno)

Si lanzas comandos desde el IDE o la terminal integrada, usa siempre el entorno `backend/.venv_win` para evitar errores y reintentos:

```bash
# Activar entorno (opcional):
source backend/.venv_win/Scripts/activate

# O ejecutar directo sin activar:
backend/.venv_win/Scripts/python.exe manage.py migrate          # migraciones
ENVIRONMENT=test backend/.venv_win/Scripts/python.exe -m pytest  # tests
```

Recomendación: configura en VS Code la opción de terminal por defecto a `backend/.venv_win/Scripts/python.exe` para que cualquier tarea o debug use ese intérprete automáticamente.
