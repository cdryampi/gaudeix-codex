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

## Footer modular

El footer publico dispone ahora de un subdominio propio dentro de `site_settings`:

- `FooterSettings` como configuracion singleton vinculada a `SiteSettings`
- `FooterLink` para enlaces editables por seccion
- `FooterBadge` para sellos/badges ordenables

Seeds disponibles:

```bash
python manage.py seed_footer_settings
python manage.py seed_footer_links
python manage.py seed_footer_badges
```

Los assets de sellos del footer viven en `backend/site_settings/seed/badges/`.
`seed_footer_badges` enlaza automaticamente los PNG referenciados por `image_file`
en `footer_badges.json` y elimina ficheros sobrantes de esa carpeta que no esten
declarados en el seed.
