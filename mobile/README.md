# Gaudeix Mobile App

Aplicación móvil multiplataforma (iOS/Android) para la plataforma municipal Gaudeix, desarrollada con React Native y Expo.

## 📱 Tecnologías

- **Framework**: React Native 0.81 + Expo SDK 54
- **Lenguaje**: TypeScript 5.9
- **Navegación**: React Navigation v7
- **Styling**: NativeWind (Tailwind CSS para React Native)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query (React Query v5)
- **HTTP Client**: Axios
- **Storage**: Expo Secure Store + AsyncStorage

## 🚀 Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) 9 o superior
- [Expo Go](https://expo.dev/go) (app en tu dispositivo móvil)
- **Opcional**: [Android Studio](https://developer.android.com/studio) o [Xcode](https://developer.apple.com/xcode/) para emuladores

### Instalación

```bash
# Navegar al directorio mobile
cd mobile

# Las dependencias ya están instaladas, pero si necesitas reinstalar:
npm install
```

### Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con la configuración adecuada:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Environment
EXPO_PUBLIC_ENV=development
```

**Nota**: En Expo, todas las variables de entorno deben tener el prefijo `EXPO_PUBLIC_` para ser accesibles en el código.

### Ejecutar la Aplicación

```bash
# Iniciar el servidor de desarrollo
npm start

# O directamente en plataforma específica:
npm run android  # Android Emulator o dispositivo
npm run ios      # iOS Simulator (solo macOS)
npm run web      # Navegador web
```

Escanea el código QR con:
- **iOS**: Cámara nativa
- **Android**: App Expo Go

## 📁 Estructura del Proyecto

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   └── .gitkeep
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── features/           # Features organizados por dominio
│   │   ├── auth/          # Autenticación (login, registro)
│   │   ├── events/        # Eventos y calendario
│   │   ├── profile/       # Perfil de usuario
│   │   └── ...
│   ├── lib/                # Utilidades y configuración
│   │   ├── api/           # Cliente API y configuración
│   │   └── utils/         # Helpers generales
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types globales
├── assets/                 # Imágenes, fuentes, etc.
├── .env.example            # Ejemplo de variables de entorno
├── .eslintrc.js            # Configuración ESLint
├── .prettierrc.js          # Configuración Prettier
├── app.json                # Configuración de Expo
├── tailwind.config.js      # Configuración de Tailwind/NativeWind
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias y scripts
```

## 🎨 Sistema de Diseño

Los colores y estilos están basados en los diseños en `/UX/mobile/`:

### Colores

```typescript
primary: '#3E9124'      // Verde (naturaleza)
secondary: '#E97B1C'    // Naranja (principal)
accent: '#F6B324'       // Amarillo (sol/castillo)
info: '#7AC1E9'         // Azul claro (agua)
success: '#43A047'
warning: '#FFA726'
error: '#EF5350'
```

### Tipografía

- **Font Family**: Plus Jakarta Sans (display)
- Configurado en `tailwind.config.js`

### Border Radius

- `sm`: 8px
- `DEFAULT`: 12px
- `lg`: 16px
- `xl`: 24px
- `full`: 9999px

## 🛠️ Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS (solo macOS)
npm run web        # Ejecutar en navegador
npm run lint       # Ejecutar ESLint
npm run format     # Formatear código con Prettier
npm run type-check # Verificar tipos de TypeScript
```

## 🔗 Integración con Backend

La app consume la API REST del backend Django en `http://localhost:8000/api/v1/`.

### Endpoints Utilizados

```
POST   /auth/login/               # Login JWT
POST   /auth/registration/        # Registro de usuario
GET    /events/                   # Lista de eventos
GET    /events/{id}/              # Detalle de evento
POST   /events/{id}/checkin/      # Check-in (gamificación)
GET    /users/me/                 # Perfil del usuario
GET    /users/me/points/          # Puntos del usuario (nuevo)
...
```

Ver issue #17 para detalles de la configuración del API client.

## 📚 Convenciones de Código

### Importaciones

Usar alias `@/` para imports desde `src/`:

```typescript
// ❌ No hacer
import { Button } from '../../../components/Button';

// ✅ Hacer
import { Button } from '@/components/Button';
```

### Componentes

- Componentes funcionales con TypeScript
- Props interfaces con sufijo `Props`
- Exports nombrados para componentes

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return <Pressable onPress={onPress}>...</Pressable>;
}
```

### Estilos

Usar NativeWind (Tailwind classes) para styling:

```tsx
<View className="flex-1 bg-background-light p-4">
  <Text className="text-2xl font-bold text-primary">
    Hola Gaudeix
  </Text>
</View>
```

## 🐛 Troubleshooting

### Error: "Unable to resolve module"

```bash
# Limpiar caché de Expo
npm start -- --clear
```

### Problemas con peer dependencies

```bash
# Reinstalar con legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### TypeScript errors en iOS/Android

```bash
# Verificar tipos
npm run type-check
```

## 📝 Próximos Pasos

Ver las issues del proyecto para el roadmap completo:
- [Epic Principal #14](https://github.com/cdryampi/gaudeix-codex/issues/14)
- [Phase 1 - Setup](https://github.com/cdryampi/gaudeix-codex/issues?q=label%3Aphase%3A1-setup)
- [Phase 2 - Core Features](https://github.com/cdryampi/gaudeix-codex/issues?q=label%3Aphase%3A2-core)

## 🤝 Contribuir

1. Sigue las convenciones de código establecidas
2. Ejecuta `npm run lint` y `npm run type-check` antes de commit
3. Usa commits descriptivos
4. Crea PRs con descripción clara

## 📄 Licencia

Ver LICENSE en la raíz del proyecto.
