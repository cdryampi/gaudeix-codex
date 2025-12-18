# Users App

## Purpose

This app manages user authentication and authorization for the Gaudeix Codex platform using JWT tokens.

## Models

### User

Custom user model extending `AbstractUser`:

- `username`: Unique username for login.
- `email`: User email address.
- `name`: Full name of the user.
- `is_staff`: Boolean for admin panel access.
- `is_superuser`: Boolean for superuser privileges.

## API Endpoints

### Authentication

- `POST /api/v1/auth/login/`: Login and receive JWT tokens.
- `POST /api/v1/auth/logout/`: Logout (invalidate tokens).
- `POST /api/v1/auth/token/refresh/`: Refresh access token.
- `POST /api/v1/auth/token/verify/`: Verify token validity.

### Registration

- `POST /api/v1/auth/registration/`: Register a new user.

## Management Commands

### seed_users

Populates the database with users from `users/seed/users.json` and resolves credentials from environment variables.

```bash
python manage.py seed_users
```

**Environment Variables:**

- `ADMIN_USER`: Admin username (default: `admin`)
- `ADMIN_PASSWORD`: Admin password (default: `admin123`)
- `SYSTEM_USER`: System username (default: `system`)
- `SYSTEM_PASSWORD`: System password (default: `system123`)

## Setup

1. Add `users` to `INSTALLED_APPS`.
2. Set `AUTH_USER_MODEL = "users.User"` in settings.
3. Run migrations: `python manage.py migrate`.
4. Seed users: `python manage.py seed_users`.

## Authentication

The app uses `dj-rest-auth` with `simplejwt` for JWT-based authentication. Tokens are stored in HTTP-only cookies (`gaudeix-auth`, `gaudeix-refresh-token`).
