# Mobile Components Documentation

Sistema de componentes UI para la app Gaudeix Mobile basado en Atomic Design.

## Design System

### Colores

```typescript
// Brand Colors
primary: '#3E9124'      // Verde (naturaleza)
secondary: '#E97B1C'    // Naranja (principal)
accent: '#F6B324'       // Amarillo (sol/castillo)
info: '#7AC1E9'         // Azul claro (agua)

// Semantic
success: '#43A047'
warning: '#FFA726'
error: '#EF5350'

// Text
text-primary: '#1F2937'
text-secondary: '#6B7280'
text-tertiary: '#9CA3AF'
text-inverse: '#FFFFFF'
```

### Tipografía

- **Font Family**: Plus Jakarta Sans (400, 500, 600, 700)
- **Escalas**: xs(10px), sm(12px), base(14px), lg(16px), xl(18px), 2xl(24px), 3xl(30px)

### Border Radius

- `sm`: 8px
- `DEFAULT`: 12px
- `lg`: 16px
- `xl`: 24px
- `full`: 9999px

## Componentes Atoms

### Button

```tsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="md" onPress={handlePress}>
  Iniciar Sesión
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `onPress`: () => void
- `disabled?: boolean`

### Text

```tsx
import { Text } from '@/components/atoms';

<Text variant="heading" weight="bold" color="primary">
  Título Principal
</Text>
```

**Props**:
- `variant`: 'heading' | 'title' | 'body' | 'caption' | 'label'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `color`: 'primary' | 'secondary' | 'tertiary' | 'inverse'

### Input

```tsx
import { Input } from '@/components/atoms';

<Input
  variant="text"
  placeholder="Nombre de usuario"
  value={username}
  onChangeText={setUsername}
/>
```

**Props**:
- `variant`: 'text' | 'password' | 'search'
- `error?: boolean`
- `disabled?: boolean`

### Badge

```tsx
import { Badge } from '@/components/atoms';

<Badge variant="points" value="250" />
<Badge variant="notification" value="5" />
```

**Props**:
- `variant`: 'status' | 'points' | 'notification'
- `value`: string | number
- `status?`: 'success' | 'warning' | 'error' | 'info'

### Icon

```tsx
import { Icon } from '@/components/atoms';

<Icon icon="🏠" size="md" />
```

**Props**:
- `icon`: string (emoji o unicode)
- `size`: 'sm' | 'md' | 'lg' | 'xl'

### Avatar

```tsx
import { Avatar } from '@/components/atoms';

<Avatar
  size="md"
  initials="JD"
  status="online"
/>
```

**Props**:
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `initials?: string`
- `source?: ImageSourcePropType`
- `status?`: 'online' | 'offline' | 'busy' | 'away'

### Chip

```tsx
import { Chip } from '@/components/atoms';

<Chip
  label="Deportes"
  selected={true}
  onPress={() => handleFilter('sports')}
  removable
  onRemove={() => handleRemove()}
/>
```

**Props**:
- `label`: string
- `selected?: boolean`
- `removable?: boolean`
- `onPress?: () => void`
- `onRemove?: () => void`

## Componentes Molecules

### Card

```tsx
import { Card } from '@/components/molecules';

<Card variant="elevated">
  <Text>Contenido de la tarjeta</Text>
</Card>
```

**Props**:
- `variant`: 'elevated' | 'outlined' | 'filled'
- `children`: ReactNode

### EventCard

```tsx
import { EventCard } from '@/components/molecules';

<EventCard
  title="Fiesta Mayor"
  time="19:00 - 23:00"
  points={50}
  location="Plaça Major"
/>
```

**Props**:
- `title`: string
- `time`: string
- `points?: number`
- `location?: string`

### ListItem

```tsx
import { ListItem } from '@/components/molecules';

<ListItem
  title="Configuración"
  subtitle="Ajustes de la app"
  leftIcon={<Icon icon="⚙️" />}
  rightIcon={<Icon icon="›" />}
/>
```

### SearchBar

```tsx
import { SearchBar } from '@/components/molecules';

<SearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Buscar eventos..."
/>
```

## Componentes Organisms

### Header

```tsx
import { Header } from '@/components/organisms';

<Header
  title="Gaudeix"
  showNotifications={true}
/>
```

### BottomNav

```tsx
import { BottomNav } from '@/components/organisms';

<BottomNav
  activeTab="home"
  onTabChange={(tab) => console.log(tab)}
/>
```

**Props**:
- `activeTab`: 'home' | 'events' | 'notifications' | 'profile'
- `onTabChange`: (tab: string) => void

## Convenciones

### Imports

```tsx
// ✅ Usar alias @/
import { Button, Text } from '@/components/atoms';

// ❌ No usar rutas relativas
import { Button } from '../../../components/atoms/Button';
```

### Estilos

```tsx
// ✅ Usar NativeWind (className)
<View className="flex-1 bg-background-light p-4">
  <Text className="text-2xl font-bold">Hola</Text>
</View>

// ❌ No usar StyleSheet
const styles = StyleSheet.create({ ... });
```

### Props Interfaces

```tsx
// ✅ Exportar interfaces con sufijo Props
export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  ...
}
```

## Testing

```bash
npm run type-check  # Verificar tipos TypeScript
npm run lint        # ESLint
npm run format      # Prettier
```

## Demo

Para ver todos los componentes en acción, ejecuta:

```bash
cd mobile
npm start
```

La app `App.tsx` muestra un demo completo de todos los componentes atoms con sus variantes.
