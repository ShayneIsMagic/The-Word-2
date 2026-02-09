# ⚙️ Backend (BE) Guidelines - The Word 2

## Architecture Overview

### Next.js Backend Capabilities

This Next.js app uses:
- **API Routes** - Server-side endpoints (`app/api/`)
- **Server Components** - Server-side rendering
- **Server Actions** - Form handling and mutations (Next.js 14)
- **Client-Side Storage** - IndexedDB via localForage (no backend needed currently)

---

## Current Backend State

### ✅ What Exists:

1. **Client-Side Storage** (`src/lib/storage.ts`)
   - Uses `localForage` (IndexedDB)
   - Stores: bookmarks, notes, settings
   - **No server required** - works offline

2. **Data Layer** (`src/lib/data.ts`)
   - Static data access
   - In-memory data structures
   - **No database** - uses static JSON/TypeScript data

3. **Python Scripts** (for data processing)
   - PDF extraction scripts
   - Data scraping scripts
   - **Separate from Next.js** - run independently

### ❌ What Doesn't Exist (Yet):

- No API routes (`app/api/`)
- No database (SQL/NoSQL)
- No authentication
- No server-side data persistence
- No external API integrations

---

## Backend Structure (When Needed)

### API Routes Structure

```
src/app/api/
├── bookmarks/
│   └── route.ts          # GET, POST, DELETE bookmarks
├── notes/
│   └── route.ts          # GET, POST, PUT, DELETE notes
├── verses/
│   └── route.ts          # GET verse data
└── search/
    └── route.ts          # POST search queries
```

---

## API Route Guidelines

### Creating API Routes

**File:** `src/app/api/[route]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// GET handler
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await processData(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### HTTP Methods

**Supported methods:**
- `GET` - Fetch data
- `POST` - Create data
- `PUT` - Update data
- `PATCH` - Partial update
- `DELETE` - Remove data

### Response Format

**Always return JSON:**

```typescript
// Success
return NextResponse.json({ data: result }, { status: 200 });

// Error
return NextResponse.json(
  { error: 'Error message' },
  { status: 400 }
);
```

---

## Server Components

### When to Use Server Components

**Use for:**
- ✅ Data fetching (can use async/await)
- ✅ Accessing backend resources
- ✅ Keeping sensitive data on server
- ✅ Reducing client bundle size

**Example:**

```typescript
// Server Component (no 'use client')
import { getBooks } from '@/lib/data';

export default async function BooksPage() {
  const books = await getBooks(); // Can be async
  
  return (
    <div>
      {books.map(book => (
        <div key={book.id}>{book.name}</div>
      ))}
    </div>
  );
}
```

---

## Server Actions (Next.js 14)

### Creating Server Actions

**File:** `src/app/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createBookmark(verseId: string) {
  try {
    // Server-side logic
    await saveBookmark(verseId);
    revalidatePath('/bookmarks');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Usage in Client Component:**

```typescript
'use client';

import { createBookmark } from '@/app/actions';

export default function Component() {
  const handleBookmark = async () => {
    const result = await createBookmark(verseId);
    if (result.success) {
      // Handle success
    }
  };
  
  return <button onClick={handleBookmark}>Bookmark</button>;
}
```

---

## Data Access Patterns

### Current: Client-Side Only

**No backend needed:**
- Data stored in IndexedDB (localForage)
- Static data in TypeScript/JSON files
- Works offline

### Future: Backend Integration

**When adding backend:**

1. **Database Access:**
   ```typescript
   // Using Prisma (example)
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   
   export async function GET() {
     const bookmarks = await prisma.bookmark.findMany();
     return NextResponse.json(bookmarks);
   }
   ```

2. **External APIs:**
   ```typescript
   export async function GET() {
     const response = await fetch('https://api.example.com/data');
     const data = await response.json();
     return NextResponse.json(data);
   }
   ```

---

## Error Handling

### API Route Error Handling

**Always handle errors:**

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Validation

**Validate input:**

```typescript
import { z } from 'zod';

const schema = z.object({
  verseId: z.string().min(1),
  note: z.string().max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

---

## Security Best Practices

### Input Validation

**Always validate and sanitize:**

```typescript
import { z } from 'zod';

const inputSchema = z.object({
  query: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = inputSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
  
  // Use validated data
  const { query } = result.data;
}
```

### Rate Limiting

**Implement rate limiting for public APIs:**

```typescript
// Example with simple in-memory store
const rateLimit = new Map();

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const count = rateLimit.get(ip) || 0;
  
  if (count > 10) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  rateLimit.set(ip, count + 1);
  // Process request
}
```

### CORS (If Needed)

**Configure CORS for external access:**

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
  
  return response;
}
```

---

## Database Integration (Future)

### When to Add Database

**Add when you need:**
- ✅ User accounts and authentication
- ✅ Multi-device data sync
- ✅ Server-side data persistence
- ✅ Analytics and tracking
- ✅ Shared/collaborative features

### Recommended Stack

**For Next.js:**
- **Database:** PostgreSQL (recommended) or MySQL
- **ORM:** Prisma (TypeScript-first)
- **Alternative:** Drizzle ORM (lighter weight)

**Example with Prisma:**

```typescript
// prisma/schema.prisma
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  verseId   String
  createdAt DateTime @default(now())
}

// API Route
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const bookmarks = await prisma.bookmark.findMany();
  return NextResponse.json(bookmarks);
}
```

---

## Environment Variables

### Using Environment Variables

**Create `.env.local`:**

```bash
DATABASE_URL="postgresql://..."
API_KEY="your-api-key"
NEXT_PUBLIC_API_URL="https://api.example.com"
```

**Access in API routes:**

```typescript
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;
```

**Access in client (must prefix with NEXT_PUBLIC_):**

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Testing API Routes

### Testing Structure

```typescript
// __tests__/api/bookmarks.test.ts
import { GET, POST } from '@/app/api/bookmarks/route';
import { NextRequest } from 'next/server';

describe('/api/bookmarks', () => {
  it('should return bookmarks', async () => {
    const request = new NextRequest('http://localhost/api/bookmarks');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
```

---

## DO's and DON'Ts

### ✅ DO:

- Use TypeScript for all API routes
- Validate all input with Zod
- Handle errors gracefully
- Return proper HTTP status codes
- Use async/await for async operations
- Keep API routes focused (single responsibility)
- Use environment variables for secrets
- Document API endpoints

### ❌ DON'T:

- Don't expose sensitive data to client
- Don't trust client input (always validate)
- Don't forget error handling
- Don't use `any` types
- Don't mix server and client code
- Don't hardcode API keys
- Don't ignore security best practices

---

## Current Status

### ✅ Working:

- Client-side storage (IndexedDB)
- Static data access
- Server Components for rendering

### 🔮 Future:

- API routes for backend operations
- Database integration (when needed)
- Authentication (when needed)
- External API integrations

---

## Version Requirements

- **Next.js:** 14.2.5 (supports Server Actions)
- **Node.js:** 18.20.8+
- **TypeScript:** 5.x

---

**Last Updated:** Based on current architecture
**Status:** ✅ Guidelines ready for when backend is needed



