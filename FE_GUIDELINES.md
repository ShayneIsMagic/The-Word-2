# 🎨 Frontend (FE) Guidelines - The Word 2

## Framework & Architecture

### Next.js App Router (Frontend)

- **Framework:** Next.js 14.2.5 with App Router
- **UI Library:** React 18.2.0
- **Styling:** Tailwind CSS 3.4.0
- **Type Safety:** TypeScript 5.x
- **State Management:** React Hooks (useState, useEffect, useMemo)

---

## Frontend Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Root page (home)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── test-lds/          # Test page route
│       └── page.tsx
├── components/            # React components
│   ├── LDSVerseComparison.tsx
│   ├── ScriptureStudy.tsx
│   ├── SearchBar.tsx
│   ├── VerseCard.tsx
│   ├── BookGrid.tsx
│   ├── ChapterNavigator.tsx
│   ├── ThemeProvider.tsx
│   └── PerformanceMonitor.tsx
└── lib/                   # Utilities & helpers
    ├── data.ts            # Data access layer
    ├── storage.ts         # Client-side storage (localForage)
    ├── lds-structure-matcher.ts
    └── sampleVerseData.ts
```

---

## Component Guidelines

### Component Types

#### 1. Client Components
**Use when:** Component needs interactivity, state, or browser APIs

```typescript
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState('');
  // ... component logic
}
```

**When to use:**
- ✅ User interactions (clicks, forms, inputs)
- ✅ State management (useState, useEffect)
- ✅ Browser APIs (localStorage, fetch)
- ✅ Event handlers
- ✅ Third-party libraries that need client-side

#### 2. Server Components (Default)
**Use when:** Component is static or data-fetching only

```typescript
// No 'use client' directive
import { getBooks } from '@/lib/data';

export default function StaticComponent() {
  const books = getBooks(); // Can call server-side functions
  return <div>{/* render */}</div>;
}
```

**When to use:**
- ✅ Static content
- ✅ Data fetching (can use async/await)
- ✅ No interactivity needed
- ✅ Better performance (no JS bundle)

---

## Styling Guidelines

### Tailwind CSS

**Always use Tailwind utility classes:**

```typescript
// ✅ Good
<div className="flex items-center space-x-4 bg-white dark:bg-gray-800">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>

// ❌ Bad - Inline styles
<div style={{ display: 'flex', backgroundColor: 'white' }}>
```

### Custom Colors

**Use defined custom colors:**
- `zb-red-{shade}` (50-900)
- `zb-green-{shade}` (50-900)

```typescript
className="bg-zb-red-600 hover:bg-zb-red-700 text-white"
```

### Dark Mode

**Always support dark mode:**

```typescript
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### Responsive Design

**Mobile-first approach:**

```typescript
className="text-sm sm:text-base md:text-lg lg:text-xl"
```

---

## State Management

### Local State (useState)

**For component-specific state:**

```typescript
const [selectedBook, setSelectedBook] = useState<Book | null>(null);
const [searchQuery, setSearchQuery] = useState('');
```

### Derived State (useMemo)

**For computed values:**

```typescript
const filteredBooks = useMemo(() => {
  return books.filter(book => book.name.includes(searchQuery));
}, [books, searchQuery]);
```

### Side Effects (useEffect)

**For data fetching, subscriptions, DOM manipulation:**

```typescript
useEffect(() => {
  // Fetch data
  fetch('/api/data')
    .then(res => res.json())
    .then(setData);
}, []);
```

---

## Data Access

### Client-Side Data

**Use data utilities from `@/lib/data`:**

```typescript
import { getBooks, getVerses, searchScripture } from '@/lib/data';

const books = getBooks();
const verses = getVerses();
const results = searchScripture('query');
```

### Client-Side Storage

**Use storage utilities from `@/lib/storage`:**

```typescript
import { addBookmark, getBookmarks, saveNote } from '@/lib/storage';

// Bookmarks
await addBookmark(verseId);
const bookmarks = await getBookmarks();

// Notes
await saveNote(verseId, noteText);
```

---

## Component Patterns

### Props Interface

**Always define TypeScript interfaces:**

```typescript
interface ComponentProps {
  book: Book;
  onSelect: (book: Book) => void;
  className?: string;
}

export default function Component({ book, onSelect, className }: ComponentProps) {
  // ...
}
```

### Event Handlers

**Use proper typing:**

```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  onSelect(book);
};
```

### Conditional Rendering

**Use early returns for clarity:**

```typescript
if (!book) return null;
if (loading) return <LoadingSpinner />;

return <div>{/* main content */}</div>;
```

---

## Performance Best Practices

### Code Splitting

**Next.js handles this automatically with App Router**

### Image Optimization

**Use Next.js Image component:**

```typescript
import Image from 'next/image';

<Image
  src="/icon.png"
  alt="Icon"
  width={192}
  height={192}
  priority // For above-the-fold images
/>
```

### Memoization

**Memo expensive computations:**

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

---

## Accessibility

### Semantic HTML

**Use proper HTML elements:**

```typescript
// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav aria-label="Main navigation">...</nav>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

### ARIA Labels

**Add labels for screen readers:**

```typescript
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon />
</button>
```

### Keyboard Navigation

**Ensure keyboard accessibility:**

```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

---

## Error Handling

### Error Boundaries

**Use React error boundaries for component errors:**

```typescript
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return <div>Something went wrong: {error.message}</div>;
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Try-Catch for Async

**Handle async errors:**

```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch:', error);
  setError(error.message);
}
```

---

## Testing

### Component Testing

**Test user interactions:**

```typescript
// Example test structure
describe('Component', () => {
  it('should handle user input', () => {
    // Test implementation
  });
});
```

---

## DO's and DON'Ts

### ✅ DO:

- Use TypeScript for all components
- Use Tailwind CSS for styling
- Support dark mode
- Use semantic HTML
- Handle loading and error states
- Optimize images with Next.js Image
- Use proper TypeScript types
- Follow Next.js App Router conventions

### ❌ DON'T:

- Don't use inline styles
- Don't forget 'use client' for interactive components
- Don't use class components (use functional)
- Don't ignore accessibility
- Don't forget error handling
- Don't use any types (use proper types)
- Don't mix server and client code incorrectly

---

## Version Requirements

- **Next.js:** 14.2.5
- **React:** 18.2.0
- **TypeScript:** 5.x
- **Tailwind CSS:** 3.4.0

---

**Last Updated:** Based on current working configuration
**Status:** ✅ All guidelines verified and working



