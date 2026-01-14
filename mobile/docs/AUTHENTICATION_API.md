# Authentication API Documentation

## Overview

Sistema de autenticación JWT completo para la app Gaudeix Mobile, con almacenamiento seguro de tokens, refresh automático y manejo de errores.

## Architecture

```
┌─────────────────┐
│   Components    │
│  (UI Layer)     │
└────────┬────────┘
         │ useAuthStore()
         ▼
┌─────────────────┐
│  Zustand Store  │
│  (State Mgmt)   │
└────────┬────────┘
         │ authService
         ▼
┌─────────────────┐
│  Auth Service   │
│  (Business Logic)│
└────────┬────────┘
         │ apiClient
         ▼
┌─────────────────┐
│  API Client     │
│  (Axios + JWT)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Auth Storage  │
│ (Secure Store)  │
└─────────────────┘
```

## Files Structure

```
mobile/src/
├── lib/
│   ├── api/
│   │   ├── client.ts         # Axios client con interceptores
│   │   └── auth.ts           # Auth service
│   ├── config/
│   │   └── env.ts            # Environment config
│   └── storage/
│       └── authStorage.ts    # Secure token storage
├── stores/
│   └── authStore.ts          # Zustand auth state
└── types/
    ├── api.ts                # API types
    └── index.ts              # Type exports
```

## API Endpoints

### POST /auth/login/
Login con username y password.

**Request**:
```json
{
  "username": "yampi",
  "password": "thos"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "yampi",
    "email": "yampi@example.com",
    "name": "Yampi User",
    "is_staff": true,
    "is_superuser": true
  }
}
```

### POST /auth/logout/
Logout (invalida tokens en backend, opcional).

**Request**: Headers con Bearer token

**Response**: 204 No Content

### POST /auth/token/refresh/
Refresh access token.

**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### POST /auth/registration/
Registrar nuevo usuario.

**Request**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password1": "securepass123",
  "password2": "securepass123",
  "name": "New User"
}
```

**Response**: Igual que login

### GET /users/me/
Obtener perfil del usuario actual.

**Request**: Headers con Bearer token

**Response**:
```json
{
  "id": 1,
  "username": "yampi",
  "email": "yampi@example.com",
  "name": "Yampi User",
  "is_staff": true,
  "is_superuser": true
}
```

## Usage Examples

### Basic Login
```typescript
import { useAuthStore } from '@/stores/authStore';

function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({
        username: 'yampi',
        password: 'thos',
      });
      // Navigate to home
      navigation.navigate('Home');
    } catch (err) {
      // Error is already in store.error
      console.error('Login failed');
    }
  };

  return (
    <View>
      <Input placeholder="Username" />
      <Input placeholder="Password" secureTextEntry />
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      {error && <Text color="error">{error}</Text>}
    </View>
  );
}
```

### Auto-load User on App Start
```typescript
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

function App() {
  const { loadUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser(); // Load user from stored tokens
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
}
```

### Logout
```typescript
function ProfileScreen() {
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // Navigate to login
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button onPress={handleLogout}>Logout</Button>
    </View>
  );
}
```

### Protected API Calls
```typescript
import apiClient from '@/lib/api/client';

async function getEvents() {
  try {
    const { data } = await apiClient.get('/events/');
    return data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
}
```

## Error Handling

### Network Errors
```typescript
try {
  await login(credentials);
} catch (error) {
  if (error.message === 'Network error. Please check your connection.') {
    // Handle offline
  }
}
```

### Auth Errors
```typescript
const { login, error } = useAuthStore();

await login(credentials);

if (error) {
  // error will be: "Invalid credentials" or similar
}
```

### Token Expiration
Handled automatically by interceptor. No action needed.

## Security Best Practices

1. **Token Storage**: Tokens se guardan en Expo Secure Store (encrypted)
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiration**: Access token ~5min, Refresh token ~7 days
4. **Auto-refresh**: Transparent, no user intervention
5. **Logout**: Always clear tokens on logout

## Configuration

### Environment Variables

```bash
# .env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_ENV=development
```

### Timeouts

Default: 30 seconds

Para modificar:
```typescript
// src/lib/api/client.ts
const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 60000, // 60 seconds
});
```

## Troubleshooting

### "Network error" en desarrollo
- Verificar que backend esté corriendo
- En Android emulator, usar `10.0.2.2` en lugar de `localhost`
- En iOS simulator, `localhost` funciona

### Tokens no persisten
- Verificar que `expo-secure-store` esté instalado
- En web, SecureStore usa localStorage (menos seguro)

### Refresh loop infinito
- Verificar que refresh token sea válido
- Revisar formato de response del backend (`{access: "..."}`

)

## TypeScript Types

All types are exported from `@/types`:

```typescript
import type {
  User,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RefreshResponse,
  ApiError,
} from '@/types';
```
