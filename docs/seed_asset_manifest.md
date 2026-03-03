# Seed Asset Manifest (v1)

Este documento define el esquema versionado para declarar assets de seeds por dominio.

## Objetivo

Evitar lookup implícito de archivos y validar al inicio de cada comando de seed que todos los assets requeridos existen.

## Esquema (v1)

Cada dominio usa un archivo `*_assets.yaml` con esta estructura:

```yaml
version: 1
assets:
  - path: images/example.png
    type: image
    slug_or_key: example-key
    order: 10
    attach_to: featured_media
    language: null
```

### Campos

- `path` (string, requerido): ruta relativa al directorio `management/commands/` del dominio.
- `type` (string, requerido): tipo de asset (`image`, `document`, `video`, según dominio).
- `slug_or_key` (string, requerido): identificador de negocio para resolver asociación.
- `order` (int, requerido): orden estable de carga y dry-run.
- `attach_to` (string, requerido): destino de asociación (ej. `featured_media`, `gallery`, `program_pdf`, etc.).
- `language` (string|null, opcional): idioma cuando aplique.

## Archivos por dominio

- `backend/events/seed/events_assets.yaml`
- `backend/places/seed/places_assets.yaml`
- `backend/routes/seed/routes_assets.yaml`
- `backend/festes/seed/festes_assets.yaml`
- `backend/site_settings/seed/site_settings_assets.yaml`

## Validación

Todos los comandos de seed de estos dominios:

1. Cargan el manifiesto al inicio.
2. Validan esquema y existencia física de `path`.
3. Abortarán con `CommandError` detallado si hay errores.

## Dry run

Los comandos soportan:

```bash
python manage.py seed_<dominio> --dry-run
```

Esto imprime:

- orden de carga (`order`),
- clave (`slug_or_key`),
- destino (`attach_to`),
- tipo y ruta del asset,
- idioma si está definido.
