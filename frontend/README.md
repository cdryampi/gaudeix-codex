# Frontend

This project was bootstrapped with [Vite](https://vitejs.dev/) using the React + SWC template and TypeScript.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) 9 o superior

## Instalación

```bash
npm install
```

## Variables de entorno

El proyecto utiliza variables con el prefijo `VITE_` que se exponen en tiempo de compilación. Copia el archivo `.env.local.example` como base y ajusta los valores para el entorno deseado.

```bash
cp .env.local.example .env.local
```

Variables incluidas:

- `VITE_API_BASE_URL`: URL base del backend.
- `VITE_JULES_PROJECT_ID` y `VITE_JULES_API_TOKEN`: credenciales/identificadores usados en despliegues de Jules.
- `VITE_DOKPLOY_PROJECT_ID` y `VITE_DOKPLOY_ENVIRONMENT`: valores necesarios para despliegues en Dokploy.

> ℹ️ Los archivos `.env` nunca deben versionarse. Asegúrate de personalizarlos localmente en cada entorno.

## Desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173` por defecto.

## Build de producción

```bash
npm run build
```

El resultado se genera en `dist/`. Puedes previsualizarlo con:

```bash
npm run preview
```

## Pruebas

Si utilizas [Vitest](https://vitest.dev/) puedes ejecutar las pruebas con:

```bash
npm run test
```

> ✳️ Agrega pruebas dentro de `src` utilizando el sufijo `.test.ts` o `.test.tsx`.
