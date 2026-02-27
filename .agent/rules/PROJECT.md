---
trigger: always_on
priority: P1
---

# PROJECT.md - Gaudeix Codex

> Project-specific rules for gaudeix-codex (React Native App + Django Backend)

---

## 📋 PROJECT OVERVIEW

**Gaudeix Codex** is a monorepo containing:

- **Backend**: Django REST Framework + PostgreSQL
- **Frontend**: React + Vite SPA
- **Backoffice**: React Admin panel
- **Mobile**: React Native application (iOS/Android)
- **Infrastructure**: Docker + Docker Compose

---

## 🏗️ ARCHITECTURE RULES

### Monorepo Structure

```
gaudeix-codex/
├── backend/          # Django REST API
├── frontend/         # React public site
├── backoffice/       # React Admin panel
├── mobile/           # React Native app
├── docs/             # Project documentation
├── agents/           # Subagent definitions (legacy)
├── chatGPT/          # Workflow guides (legacy)
├── .agent/           # Antigravity Kit (active)
└── docker-compose.yml
```

### Module Isolation

🔴 **CRITICAL**: Each module (backend, frontend, backoffice, mobile) is **independent**.

- **DO NOT** mix dependencies between modules
- **DO NOT** share `node_modules` or `.venv` between modules
- **ALWAYS** work within the appropriate module directory
- **AVOID** cross-module imports or shared code unless explicitly designed

---

## 🎯 PROJECT TYPE ROUTING

This is a **MOBILE-FIRST** project with supporting web interfaces.

| Component               | Type         | Primary Agent         | Stack                      |
| ----------------------- | ------------ | --------------------- | -------------------------- |
| **Mobile** (Priority 1) | React Native | `mobile-developer`    | RN + Expo                  |
| **Backend**             | Django REST  | `backend-specialist`  | Django + PostgreSQL        |
| **Frontend**            | React SPA    | `frontend-specialist` | React + Vite + Tailwind v4 |
| **Backoffice**          | React Admin  | `frontend-specialist` | React Admin                |

🔴 **Mobile work = mobile-developer ONLY. Never use frontend-specialist for mobile.**

---

## 🌐 LANGUAGE RULES (ESPAÑOL)

This project is **Spanish-first**.

### Communication

- **User interface**: Spanish (UI labels, messages, content)
- **User-facing docs**: Spanish (README.md visible to clients)
- **Code & Comments**: English (variables, functions, technical comments)
- **Internal docs**: English or Spanish based on audience

### Responses to User

- **User speaks Spanish** → Respond in Spanish
- **Code/logs** → Always English
- **UI strings** → Always Spanish

---

## 📱 MOBILE-SPECIFIC RULES

### Technology Stack

- **Core**: React Native (Expo managed workflow recommended)
- **Navigation**: React Navigation v6+
- **State**: React Context + Hooks (or Redux if complex)
- **API**: Fetch/Axios to Django REST backend
- **Styling**: StyleSheet or styled-components (NO Tailwind in Mobile)

### Design Principles

- **Follow `@[skills/mobile-design]`** for all UI decisions
- **Platform awareness**: Respect iOS/Android differences
- **Performance**: Lazy loading, FlatList for lists
- **Offline-first**: Handle connectivity issues gracefully

### Testing

- **Unit**: Jest + React Native Testing Library
- **E2E**: Detox (if configured)

---

## 🖥️ BACKEND-SPECIFIC RULES

### Technology Stack

- **Framework**: Django 4+ with Django REST Framework
- **Database**: PostgreSQL 15+
- **Auth**: JWT (django-rest-framework-simplejwt)
- **Environment**: `.venv` in project root (all platforms)

### Django Conventions

- **API Versioning**: `/api/v1/` namespace
- **Serializers**: Always use ModelSerializers
- **Permissions**: Class-based permissions (IsAuthenticated, etc.)
- **Testing**: pytest + pytest-django
- **Migrations**: ALWAYS run `makemigrations` + `migrate`

### Critical Commands

```bash
# Activate from project root
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate      # Linux/Mac

# Then navigate to backend
cd backend
python manage.py runserver
```

---

## 🌐 FRONTEND-SPECIFIC RULES

### Technology Stack (Public Site)

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + Flowbite React
- **Routing**: React Router v6
- **API**: Axios to Django backend
- **Port**: `http://localhost:5173`

### Backoffice Stack

- **Framework**: React Admin
- **Auth**: JWT against Django API
- **Port**: `http://localhost:5174`

### Design Rules

- **Follow `@[skills/frontend-design]`** for web UI
- **NO purple/violet colors** (global ban)
- **NO template layouts** (custom designs only)
- **Responsive**: Mobile-first approach
- **SEO**: Follow `@[skills/seo-fundamentals]`

### Vite & TypeScript Rules

🔴 **CRITICAL**: Never generate or leave `.js` compiled files alongside `.tsx` files in the `src/` directory.

- If you run `tsc`, **always** use `--noEmit` or ensure `outDir` is set to `dist/`.
- **Why?** Vite resolves `.js` files before `.tsx`. If a compiled `.js` file is left in `src/`, Vite will serve the outdated `.js` file instead of the new `.tsx` file, burying your updates and causing silent caching bugs. If Vite refuses to load your updates, run `rm **/*.js` in your `src/` and clear the `node_modules/.vite` cache.

---

## 🔧 ENVIRONMENT VARIABLES

### Centralized `.env` Files (Root)

- `.env_backend` → Backend configuration
- `.env_backoffice` → Backoffice Vite config
- `.env_frontend` → Frontend Vite config

### Module-Specific `.env`

Each module has its own `.env` in its root:

- `backend/.env`
- `backoffice/.env.local`
- `frontend/.env.local`

🔴 **NEVER commit `.env` files to Git**

---

## 🚀 DEVELOPMENT WORKFLOW

### Starting Development (All Services)

**Windows**:

```bash
.\start_dev.bat
```

**Manual**:

```bash
# Terminal 1: Backend
cd backend
.\.venv\Scripts\activate
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Backoffice
cd backoffice
npm run dev
```

### Running Tests

**Backend**:

```bash
cd backend
pytest
```

**Frontend/Backoffice**:

```bash
cd frontend  # or backoffice
npm test
```

**Mobile**:

```bash
cd mobile
npm test
```

---

## 🛑 CRITICAL WORKFLOWS

### Before ANY Code Change

1. **Read `docs/` for context** (architectural decisions)
2. **Check `ARCHITECTURE.md`** to understand agent/skill structure
3. **Activate appropriate agent** based on module type
4. **Load relevant skills** from `.agent/skills/`

### Before Commit

```bash
# Run checklist
python .agent/scripts/checklist.py .

# Fix any failures (Security/Lint priority)
```

### Before Deploy

```bash
# Full verification
python .agent/scripts/verify_all.py . --url http://localhost:8000
```

---

## 🎭 AGENT ACTIVATION RULES

| Task            | Agent                 | Skills                                               |
| --------------- | --------------------- | ---------------------------------------------------- |
| Mobile UI/UX    | `mobile-developer`    | mobile-design                                        |
| Django API      | `backend-specialist`  | api-patterns, database-design, nodejs-best-practices |
| Database Schema | `database-architect`  | database-design, prisma-expert                       |
| React Web UI    | `frontend-specialist` | frontend-design, react-patterns, tailwind-patterns   |
| Security Audit  | `security-auditor`    | vulnerability-scanner, red-team-tactics              |
| Debugging       | `debugger`            | systematic-debugging                                 |
| Planning        | `project-planner`     | brainstorming, plan-writing, architecture            |

---

## 📚 DOCUMENTATION HIERARCHY

**Priority Order (P0 → P2)**:

1. **P0**: `.agent/rules/GEMINI.md` (Global Antigravity rules)
2. **P1**: `.agent/rules/PROJECT.md` (This file - Project-specific)
3. **P2**: Agent files (`.agent/agents/{agent}.md`)
4. **P3**: Skill files (`.agent/skills/{skill}/SKILL.md`)
5. **P4**: Project docs (`docs/*.md`)

**Resolution**: P0 > P1 > P2 > P3 > P4

---

## 🔗 INTEGRATION WITH OPENCODE

### OpenCode Conventions Applied

1. **Task Files**: Use `{task-slug}.md` for complex features
2. **Artifacts**: Generate task.md, walkthrough.md, implementation_plan.md
3. **Complexity Rating**: Rate all changes 1-10
4. **Description**: Brief, user-facing explanations
5. **Sequential Work**: Use `waitForPreviousTools` when needed

### OpenCode + Antigravity Synergy

- **Antigravity**: Provides agent personas, skills, workflows
- **OpenCode**: Provides task structure, artifact generation, complexity rating
- **Together**: Structured, persona-driven development with clear documentation

---

## 🚨 PROHIBITED ACTIONS

❌ **NEVER**:

- Mix mobile and frontend agents
- Skip GEMINI.md reading on session start
- Commit `.env` files
- Use purple/violet colors in design
- Use generic template layouts
- Skip tests before commit
- Deploy without `verify_all.py`
- Work on multiple modules in parallel without proper isolation

---

## ✅ MANDATORY ACTIONS

✅ **ALWAYS**:

- Read agent files before implementation
- Activate virtual environment before backend work
- Use correct module directory for commands
- Write tests for new features
- Document architecture decisions in `docs/`
- Follow language rules (Spanish UI, English code)
- Run `checklist.py` before commit
- Use appropriate agent for module type

---

## 🎯 QUICK START CHECKLIST

For new AI session:

1. ☐ Read `ARCHITECTURE.md` to understand structure
2. ☐ Read `GEMINI.md` for global rules
3. ☐ Read `PROJECT.md` (this file) for project specifics
4. ☐ Identify module: backend / frontend / backoffice / mobile
5. ☐ Activate appropriate agent
6. ☐ Load relevant skills
7. ☐ Check `docs/` for architectural context
8. ☐ Proceed with task

---

## 📞 LEGACY REFERENCES

For historical context, legacy documents exist:

- `agents/` - Old subagent definitions (replaced by `.agent/agents/`)
- `chatGPT/` - Old workflow guides
- `AGENTS.md` - Old agent overview

🔴 **Use `.agent/` structure, not legacy folders.**

---
