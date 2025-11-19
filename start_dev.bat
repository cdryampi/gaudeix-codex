@echo off
echo Starting Gaudeix Codex Development Environment...

REM Check for .venv_win
if not exist "backend\.venv_win" (
    echo [ERROR] Virtual environment 'backend\.venv_win' not found.
    echo Please run 'python -m venv .venv_win' inside the backend folder and install requirements.
    pause
    exit /b 1
)

echo Starting Backend (Django)...
start "Backend" cmd /k "cd backend && .\.venv_win\Scripts\activate && python manage.py runserver"

echo Starting Backoffice (Vite)...
start "Backoffice" cmd /k "cd backoffice && npm run dev"

echo Starting Frontend (Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services started!
