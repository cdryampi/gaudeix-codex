# Guía de Migración de shadcn/ui a Flowbite React

Este documento proporciona una guía para completar la migración de componentes de shadcn/ui a Flowbite React.

## Estado de la Migración

### ✅ Completado

- Desinstalación de dependencias shadcn/ui
- Instalación de Flowbite y Flowbite React
- Configuración de Tailwind CSS con plugin de Flowbite
- Eliminación de componentes UI de shadcn
- Actualización de CSS (eliminación de variables shadcn)
- **Componentes de autenticación**: LoginForm, AuthCard, AuthLayout
- **Layouts del Dashboard**: Header, Sidebar
- Documentación (README.md)

### 🔄 Pendiente

Los siguientes componentes necesitan ser migrados:

1. **Tablas** (UsersTable, EventsTable, PlacesTable, MediaTable)
2. **Diálogos/Modales** (UserDialog, EventDialog, PlaceDialog, SocialLinkDialog, etc.)
3. **Formularios** (Varios componentes de formulario)
4. **Componentes comunes** (StatCard, PageHeader, DataCard, etc.)

## Mapeo de Componentes

### shadcn/ui → Flowbite React

| shadcn/ui Component | Flowbite React Component | Notas |
|---------------------|--------------------------|-------|
| `Button` | `Button` from `flowbite-react` | API similar |
| `Card` | `Card` from `flowbite-react` | Estructura ligeramente diferente |
| `Input` | `TextInput` from `flowbite-react` | Cambio de nombre |
| `Label` | `Label` from `flowbite-react` | API diferente (sin prop `value`) |
| `Table` | `Table` from `flowbite-react` | Estructura diferente |
| `Dialog`/`Modal` | `Modal` from `flowbite-react` | API completamente diferente |
| `Alert` | `Alert` from `flowbite-react` | API similar |
| `Badge` | `Badge` from `flowbite-react` | API similar |
| `Select` | `Select` from `flowbite-react` | API diferente |
| `Checkbox` | `Checkbox` from `flowbite-react` | API similar |
| `Switch` | `ToggleSwitch` from `flowbite-react` | Cambio de nombre |
| `Dropdown Menu` | `Dropdown` from `flowbite-react` | Estructura diferente |

## Patrones de Migración

### 1. Formularios con react-hook-form

**Antes (shadcn/ui)**:
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Usuario</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Después (Flowbite)**:
```tsx
import { Label, TextInput } from "flowbite-react";

<form onSubmit={handleSubmit(onSubmit)}>
  <div>
    <div className="mb-2 block">
      <Label htmlFor="username">Usuario</Label>
    </div>
    <TextInput
      id="username"
      {...register("username")}
      color={errors.username ? "failure" : "gray"}
    />
    {errors.username && (
      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
    )}
  </div>
</form>
```

### 2. Tablas

**Antes (shadcn/ui)**:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Después (Flowbite)**:
```tsx
import { Table } from "flowbite-react";

<Table>
  <Table.Head>
    <Table.HeadCell>Name</Table.HeadCell>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

### 3. Modales/Diálogos

**Antes (shadcn/ui)**:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {children}
  </DialogContent>
</Dialog>
```

**Después (Flowbite)**:
```tsx
import { Modal } from "flowbite-react";

<Modal show={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>
    {children}
  </Modal.Body>
</Modal>
```

### 4. Utilidad `cn()` de shadcn

Flowbite no usa el helper `cn()` de shadcn. Hay dos opciones:

**Opción 1: Clases condicionales estándar**
```tsx
// Antes
className={cn("base-class", condition && "conditional-class")}

// Después  
className={`base-class ${condition ? "conditional-class" : ""}`}
```

**Opción 2: Mantener utilidad cn() personalizada**
```tsx
// En lib/utils.ts - la función cn() puede mantenerse
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Checklist de Migración por Componente

Para cada componente a migrar:

1. [ ] Leer componente actual y entender su funcionalidad
2. [ ] Identificar componentes de shadcn/ui utilizados
3. [ ] Buscar equivalentes en [Flowbite React docs](https://flowbite-react.com/)
4. [ ] Reescribir con componentes Flowbite
5. [ ] Ajustar props y eventos según API de Flowbite
6. [ ] Reemplazar `cn()` con clases estándar o mantener utilidad
7. [ ] Probar visualmente el componente
8. [ ] Verificar con `npm run build`

## Componentes Prioritarios

Migrar en este orden:

1. **StatCard** - Usado en dashboard
2. **UsersTable** y **UserDialog** - Gestión de usuarios
3. **EventsTable** y **EventDialog** - Gestión de eventos  
4. **PlacesTable** y **PlaceDialog** - Gestión de lugares
5. **MediaTable** - Gestión de media
6. Resto de componentes según necesidad

## Referencias

- **Flowbite React Docs**: https://flowbite-react.com/
- **Flowbite Components**: https://flowbite-react.com/docs/components/accordion
- **Tailwind CSS**: https://tailwindcss.com/docs

## Notas Importantes

- Flowbite React usa API de componentes **más explícita** que shadcn
- No usa variantes con `cva` (class-variance-authority)
- Colores se pasan como props: `color="primary"`, `color="failure"`, etc.
- Tamaños se pasan como props: `size="sm"`, `size="lg"`, etc.
- Muchos componentes usan **dot notation** (ej: `Table.Head`, `Modal.Body`)
