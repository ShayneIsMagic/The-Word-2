# 📋 FE & BE Guidelines Summary

## Overview

This project now has **three guideline documents**:

1. **`AGENT_GUIDELINES.md`** - General project guidelines (versions, structure, etc.)
2. **`FE_GUIDELINES.md`** - Frontend-specific guidelines (React, components, styling)
3. **`BE_GUIDELINES.md`** - Backend-specific guidelines (API routes, server components, data)

---

## Quick Reference

### Frontend (FE_GUIDELINES.md)

**Focus Areas:**
- React components (Client vs Server)
- Tailwind CSS styling
- State management (useState, useEffect, useMemo)
- Component patterns
- Accessibility
- Performance optimization

**Key Technologies:**
- Next.js 14.2.5 App Router
- React 18.2.0
- TypeScript 5.x
- Tailwind CSS 3.4.0

**When to Reference:**
- Creating new components
- Styling components
- Managing client-side state
- Building UI interactions

---

### Backend (BE_GUIDELINES.md)

**Focus Areas:**
- API routes (`app/api/`)
- Server Components
- Server Actions (Next.js 14)
- Data access patterns
- Error handling
- Security best practices

**Key Technologies:**
- Next.js API Routes
- Server Components
- Server Actions
- (Future) Database integration

**When to Reference:**
- Creating API endpoints
- Server-side data fetching
- Form handling with Server Actions
- Database integration (when needed)

---

## Current Architecture

### Frontend ✅
- React components in `src/components/`
- Pages in `src/app/`
- Client-side storage (IndexedDB via localForage)
- Static data access (`src/lib/data.ts`)

### Backend ⚠️
- **No API routes yet** (not needed currently)
- **No database** (using client-side storage)
- **Server Components** used for rendering
- **Python scripts** for data processing (separate)

---

## When to Use Which Guidelines

### Use FE_GUIDELINES.md when:
- ✅ Creating React components
- ✅ Styling with Tailwind
- ✅ Managing client-side state
- ✅ Building user interfaces
- ✅ Handling user interactions
- ✅ Working with client-side storage

### Use BE_GUIDELINES.md when:
- ✅ Creating API routes
- ✅ Building server-side functionality
- ✅ Integrating databases
- ✅ Handling server-side data
- ✅ Creating Server Actions
- ✅ Working with external APIs

### Use AGENT_GUIDELINES.md when:
- ✅ Checking version requirements
- ✅ Understanding project structure
- ✅ Setting up development environment
- ✅ General project conventions

---

## Version Alignment

All three documents specify the same versions:

| Component | Version | Document |
|-----------|---------|----------|
| Next.js | 14.2.5 | All three |
| React | 18.2.0 | FE + Agent |
| TypeScript | 5.x | All three |
| Node.js | 18.20.8+ | Agent + BE |

---

## Integration Points

### Frontend → Backend

**Current:**
- Frontend uses client-side storage (no backend needed)
- Static data from `src/lib/data.ts`

**Future:**
- Frontend will call API routes (`/api/bookmarks`, `/api/notes`)
- Server Actions for form submissions
- Server Components for data fetching

### Backend → Frontend

**Current:**
- Server Components render data
- No API routes yet

**Future:**
- API routes return JSON
- Server Actions update data
- Real-time updates via API

---

## Development Workflow

### Frontend Development

1. **Reference:** `FE_GUIDELINES.md`
2. **Create:** Component in `src/components/`
3. **Style:** Use Tailwind CSS
4. **State:** Use React hooks
5. **Test:** Component in isolation

### Backend Development

1. **Reference:** `BE_GUIDELINES.md`
2. **Create:** API route in `src/app/api/`
3. **Validate:** Use Zod for input validation
4. **Handle:** Errors gracefully
5. **Test:** API endpoint

---

## Best Practices Summary

### Frontend ✅
- Use TypeScript
- Use Tailwind CSS
- Support dark mode
- Handle loading/error states
- Make accessible
- Optimize performance

### Backend ✅
- Validate all input
- Handle errors
- Use proper HTTP status codes
- Keep routes focused
- Secure sensitive data
- Document APIs

---

## Next Steps

### For Frontend:
1. ✅ Guidelines created
2. ✅ Follow component patterns
3. ✅ Use Tailwind for styling
4. ✅ Implement accessibility

### For Backend:
1. ✅ Guidelines created
2. ⏳ Create API routes when needed
3. ⏳ Add database when needed
4. ⏳ Implement authentication when needed

---

## Summary

**Three complementary guideline documents:**

1. **AGENT_GUIDELINES.md** - Project-wide (versions, structure)
2. **FE_GUIDELINES.md** - Frontend-specific (React, components, UI)
3. **BE_GUIDELINES.md** - Backend-specific (API, server, data)

**All aligned with:**
- Next.js 14.2.5
- React 18.2.0
- TypeScript 5.x
- Current working configuration

---

**Use the appropriate guideline document based on what you're building!**



