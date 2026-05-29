---
name: modern-web-guidance
description: Modern web development best practices for performance, accessibility, and user experience. Use this skill when building or optimizing React components, forms, dialogs, animations, or any UI work.
---

# Modern Web Guidance

This skill provides curated guides for modern web platform features (CSS, JS APIs, HTML) to ensure code uses current best practices rather than outdated patterns.

## Project Baseline

This project targets **Baseline 2024** - features that are widely available across modern browsers.

## Quick Reference by Category

### Performance

| Use Case                             | Key Feature          | When to Use                        |
| ------------------------------------ | -------------------- | ---------------------------------- |
| `optimize-image-priority`            | `fetch-priority`     | Hero images, LCP candidates        |
| `break-up-long-tasks`                | `scheduler.yield()`  | Heavy computation, DOM updates     |
| `defer-rendering-heavy-content`      | `content-visibility` | Long lists, feeds, complex layouts |
| `batch-analytics-events`             | `fetchLater()`       | Analytics, tracking                |
| `improve-next-page-load-performance` | Speculation Rules    | SPA navigation                     |

### Accessibility

| Use Case                        | Key Feature     | When to Use             |
| ------------------------------- | --------------- | ----------------------- |
| `accessible-error-announcement` | `:user-invalid` | Form validation         |
| `required-field-feedback`       | `:user-invalid` | Required field messages |

### Forms

| Use Case                                 | Key Feature             | When to Use          |
| ---------------------------------------- | ----------------------- | -------------------- |
| `validate-input-after-interaction`       | `:user-invalid`         | Form validation UX   |
| `form-fields-automatically-fit-contents` | `field-sizing: content` | Dynamic input sizing |
| `brand-consistent-forms`                 | `accent-color`          | Custom form styling  |

### User Experience

| Use Case                             | Key Feature                  | When to Use           |
| ------------------------------------ | ---------------------------- | --------------------- |
| `light-dismiss-a-dialog`             | `<dialog closedby>`          | Modal dialogs         |
| `animate-element-entry-exit`         | `@starting-style`            | Enter/exit animations |
| `improve-text-layout-and-legibility` | `text-wrap: balance`         | Headings, short text  |
| `dark-mode`                          | `color-scheme`, `light-dark` | Theme support         |

## Implementation Patterns

### 1. Image Priority (LCP Optimization)

```html
<!-- DO: Prioritize LCP images -->
<img src="hero.webp" fetchpriority="high" alt="Hero image" />

<!-- DO NOT: Load all images with same priority -->
<img src="hero.webp" alt="Hero image" />
<img src="secondary.webp" alt="Secondary" />
```

### 2. Break Up Long Tasks

```javascript
// DO: Yield to main thread during heavy work
async function processLargeDataset(data) {
  for (const item of data) {
    await scheduler.yield();
    processItem(item);
  }
}

// DO NOT: Block main thread
function processLargeDataset(data) {
  for (const item of data) {
    processItem(item); // Blocks UI
  }
}
```

### 3. Defer Offscreen Content

```css
/* DO: Defer rendering of offscreen sections */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 4. Modern Form Validation

```css
/* DO: Show errors only after interaction */
input:invalid:not(:user-invalid) {
  /* Hide errors initially */
}

input:user-invalid {
  border-color: red;
  /* Show errors after user interaction */
}
```

### 5. Dialog Light Dismiss

```html
<!-- DO: Use native dialog with closedby attribute -->
<dialog closedby="any">
  <p>Content</p>
  <button>Close</button>
</dialog>

<!-- DO NOT: Build custom modal with JavaScript -->
```

### 6. Text Wrap Balance

```css
/* DO: Balance text wrapping for headings */
h1,
h2,
h3 {
  text-wrap: balance;
}

/* DO NOT: Leave headings with orphaned words */
```

### 7. Accent Color for Forms

```css
/* DO: Brand-consistent form controls */
:root {
  accent-color: #1a73e8;
}

/* DO NOT: Replace native controls with custom JS */
```

## Fallback Strategies

For features not in Baseline Widely Available:

```css
/* Progressive enhancement example */
.container {
  /* Fallback */
  height: 200px;

  /* Modern browsers */
  height: calc-size(auto);
}

@supports (height: calc-size(auto)) {
  .container {
    height: auto;
  }
}
```

## React-Specific Patterns

### Prioritize Images in React

```tsx
// DO: Set fetchPriority on LCP candidates
<img
  src={heroImage}
  fetchPriority="high"
  alt="Hero"
  loading="eager"
/>

// Secondary images
<img
  src={secondaryImage}
  loading="lazy"
  alt="Secondary"
/>
```

### Debounced Validation

```tsx
// DO: Validate after user stops typing
const [hasInteracted, setHasInteracted] = useState(false);

<input
  onBlur={() => setHasInteracted(true)}
  className={hasInteracted && isInvalid ? "user-invalid" : ""}
/>;
```

### Content Visibility for Lists

```tsx
// DO: Defer offscreen list items
<div style={{ contentVisibility: "auto", containIntrinsicSize: "0 200px" }}>
  {items.map((item) => (
    <ListItem key={item.id} {...item} />
  ))}
</div>
```

## Resources

- [Baseline 2024](https://web.dev/baseline)
- [Chrome for Developers](https://developer.chrome.com)
- [Modern Web Guidance GitHub](https://github.com/GoogleChrome/modern-web-guidance-src)
