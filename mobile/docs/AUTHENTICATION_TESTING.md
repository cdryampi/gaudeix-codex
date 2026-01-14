# Authentication System - Testing Guide

## Manual Testing Checklist

### ✅ Setup
- [ ] Backend running on `http://localhost:8000`
- [ ] Usuarios seed creados (`python manage.py seed_users`)
- [ ] Variable `EXPO_PUBLIC_API_BASE_URL` configurada en `.env`

### ✅ Login Flow
1. Abrir app en Expo Go
2. Intentar login con credenciales inválidas
   - **Esperado**: Error message visible
3. Login con credenciales válidas (yampi/thos)
   - **Esperado**: User guardado en state, tokens en SecureStore
4. Cerrar app completamente
5. Reabrir app
   - **Esperado**: Usuario sigue autenticado (tokens persisten)

### ✅ Token Refresh
1. Login exitoso
2. Esperar que access token expire (~5 min)
3. Hacer cualquier request API
   - **Esperado**: Refresh automático transparente

### ✅ Logout
1. Usuario autenticado
2. Llamar `logout()`
   - **Esperado**: Tokens eliminados, state limpio
3. Reabrir app
   - **Esperado**: Usuario NO autenticado

### ✅ Registration
1. Ir a pantalla de registro
2. Registrar nuevo usuario
   - **Esperado**: Auto-login después de registro

### ✅ Error Handling
1. Sin conexión a internet
   - **Esperado**: Error "Network error. Please check your connection."
2. Backend caído
   - **Esperado**: Timeout después de 30s
3. Credenciales inválidas
   - **Esperado**: Error específico del backend

## Automated Tests (Future)

Para implementar tests automatizados, usar:

```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo

# Ejecutar tests
npm test
```

## Integration Test Example

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/authStore';

describe('Auth Flow', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        username: 'yampi',
        password: 'thos',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuthStore());

    // First login
    await act(async () => {
      await result.current.login({
        username: 'yampi',
        password: 'thos',
      });
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
```

## API Client Test Example

```typescript
import apiClient from '@/lib/api/client';
import { authStorage } from '@/lib/storage/authStorage';

describe('API Client', () => {
  it('should add auth token to requests', async () => {
    // Mock token
    await authStorage.setTokens('test-access-token', 'test-refresh-token');

    // Mock successful response
    const mockResponse = { data: { id: 1, name: 'Test' } };
    jest.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);

    const response = await apiClient.get('/users/me/');

    expect(response.data).toEqual(mockResponse.data);
    expect(apiClient.get).toHaveBeenCalledWith('/users/me/');
  });
});
```

## Manual Verification Steps

### 1. AuthStorage
```typescript
import { authStorage } from '@/lib/storage/authStorage';

// Guardar tokens
await authStorage.setTokens('access123', 'refresh456');

// Verificar
const access = await authStorage.getAccessToken();
const refresh = await authStorage.getRefreshToken();
console.log({ access, refresh }); // Debe mostrar los tokens

// Limpiar
await authStorage.clearTokens();
const hasTokens = await authStorage.hasTokens();
console.log(hasTokens); // false
```

### 2. Auth Service
```typescript
import { authService } from '@/lib/api/auth';

// Login
try {
  const response = await authService.login({
    username: 'yampi',
    password: 'thos',
  });
  console.log('User:', response.user);
  console.log('Tokens saved:', await authStorage.hasTokens());
} catch (error) {
  console.error('Login failed:', error);
}
```

### 3. Zustand Store
```typescript
import { useAuthStore } from '@/stores/authStore';

function TestComponent() {
  const { login, user, isLoading, error } = useAuthStore();

  useEffect(() => {
    console.log('Auth state:', { user, isLoading, error });
  }, [user, isLoading, error]);

  // Test login
  const handleTest = async () => {
    await login({ username: 'yampi', password: 'thos' });
  };

  return <Button onPress={handleTest}>Test Login</Button>;
}
```

## Known Issues & Limitations

1. **Network Detection**: App no detecta automáticamente cuando vuelve la conexión
   - **Workaround**: El usuario debe reintentar manualmente

2. **Token Expiration**: Access token expira en 5 minutos (backend default)
   - El refresh es automático pero puede causar un delay en la primera request después de expiración

3. **Concurrent Requests**: Múltiples requests simultáneos durante token refresh pueden causar race conditions
   - **Mitigación**: Sistema de queue implementado en interceptor

## Production Checklist

Antes de producción:
- [ ] Cambiar timeouts según necesidades
- [ ] Implementar logging de errores (Sentry, etc.)
- [ ] Agregar analytics de auth events
- [ ] Revisar políticas de retry
- [ ] Implementar biometric auth (opcional)
- [ ] Tests E2E completos
