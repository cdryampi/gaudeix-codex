# Site Settings App

Gestión de configuración global del sitio (branding, contacto, SEO, alertas y media principal).

## Seed assets (convención unificada)

El comando `seed_site_settings` prioriza estas rutas:

- `backend/seed_assets/site_settings/images/` (logo, favicon, etc.)
- `backend/seed_assets/site_settings/videos/` (background videos)

Fallback temporal (deprecated):

- `backend/site_settings/management/commands/static/`

Si se usa fallback legacy, el comando imprime warning deprecado para facilitar la migración progresiva de entornos.

## Comando

```bash
python manage.py seed_site_settings
```
