Documento Maestro del Proyecto – Para uso exclusivo de ChatGPT (Director Técnico)

1. Propósito de este Documento

Este archivo define, de manera completa y centralizada, qué proyecto estamos construyendo, cuál es su arquitectura, qué reglas lo gobiernan, y cómo debe trabajar el modelo ChatGPT para dirigir su desarrollo junto con Codex Cloud.

Este documento NO debe ser leído, interpretado ni usado como contexto por Codex.
Es exclusivo para ChatGPT (el Director Técnico).

Toda la documentación técnica funcional se encuentra en /docs.
Todas las definiciones de subagentes de Codex se encuentran (o se encontrarán) en /agents.

2. Objetivo General del Proyecto

El objetivo es reconstruir desde cero un sistema moderno, modular y escalable, que sustituya completamente un proyecto Django monolítico legacy.

La solución final sigue una arquitectura actualizada basada en:

Backend (API REST)

Django + Django REST Framework

JWT Authentication

Endpoints limpios, versionados y documentados

Tests unitarios e integración

Base de datos PostgreSQL

Gestión de media con almacenamiento persistente

Migración de datos desde el proyecto antiguo

Frontend Público

React + Vite

Aplicación SPA desacoplada del backend

Routing avanzado

Integración directa con la API REST

Multilenguaje

Posible posterior port a Next.js si se requiere SSR/SEO avanzado

Backoffice (Panel de Administración)

React Admin o React a medida

Gestión CRUD completa

Gestión de usuarios, roles, media y contenido

Autenticación vía JWT

Integración estricta con la API REST

Infraestructura

Docker + Docker Compose (dev y prod)

Despliegues automatizados en Dokploy (VPS)

GitHub Actions como CI/CD (lint, tests, build, deploy)

Logs, métricas y observabilidad básicos

3. Filosofía de Desarrollo

El proyecto se desarrolla siguiendo estos principios:

A) Backend y Frontend totalmente desacoplados

No existe renderizado de plantillas en Django.
Todo se consume vía REST.

B) Arquitectura escalable

Cada módulo es una unidad aislada en backend, frontend y backoffice.

C) Codex Cloud como “equipo de programadores”

Codex genera código.
ChatGPT dirige el proyecto, define los tasks y los prompts.

D) ChatGPT como Director Técnico

NO genera código.

NO toca archivos directamente.

SÍ diseña arquitectura, estructura, planificación y prompts.

SÍ orquesta pipelines de subagentes de Codex.

E) Documentación viva

Toda la información técnica funcional está en /docs.

4. Composición del Proyecto
4.1. Módulos principales en Backend

Users & Auth

Blog

Agenda / Eventos

Places / Puntos de interés

Media Manager

Configuración general del sitio

Traducciones y soporte multiidioma

4.2. Módulos principales en Frontend

Home

Noticias

Detalle de noticia

Agenda

Detalle de evento

Mapa / Lugares

About / Información institucional

Selector de idioma

Header / Footer / Layout

4.3. Módulos principales en Backoffice

Autenticación Admin

Posts

Eventos

Lugares

Usuarios

Configuración

Media

Auditoría básica (opcional)