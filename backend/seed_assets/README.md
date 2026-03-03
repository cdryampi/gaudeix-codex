# Seed Assets (convención unificada)

Estructura estándar para archivos usados por comandos de seed:

```text
backend/seed_assets/<dominio>/images/
backend/seed_assets/<dominio>/documents/
backend/seed_assets/<dominio>/videos/
```

Dominios iniciales:

- `media_files`
- `events`
- `places`
- `routes`
- `festes`
- `site_settings`

## Compatibilidad temporal

Mientras se migran entornos antiguos, los comandos mantienen fallback a rutas legacy dentro de
`management/commands/...` (o `media_files/seed_assets`) y muestran warning deprecado.
