# UI Guidelines

## Icons

This project uses **[Lucide React](https://lucide.dev/guide/packages/lucide-react)** for all icons.
**Do not install other icon libraries** (like FontAwesome, Heroicons, etc.).

### Usage

```tsx
import { Home, Settings } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Home className="w-6 h-6" />
      <Settings className="w-4 h-4 text-gray-500" />
    </div>
  );
}
```

## Animations

This project uses two libraries for animations, depending on the complexity:

### 1. Simple / Utility Animations

Use **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** for simple, class-based animations (fade-in, slide-in, zoom-in, etc.).

**Usage:**
Directly apply utility classes to your elements.

```tsx
<div className="animate-in fade-in zoom-in duration-300">
  Content appearing with fade and zoom.
</div>
```

### 2. Complex / Interactive Animations

Use **[Framer Motion](https://www.framer.com/motion/)** for complex animations, layout transitions, gestures, or when fine-grained control is needed.

**Usage:**

```tsx
import { motion } from "framer-motion";

function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Animated content
    </motion.div>
  );
}
```

## Summary

- **Icons**: `lucide-react` ONLY.
- **Simple Animations**: `tailwindcss-animate` classes.
- **Complex Animations**: `framer-motion`.
