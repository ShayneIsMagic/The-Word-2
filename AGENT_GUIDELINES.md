# 🤖 Agent Guidelines for The Word 2

## Version Requirements

### Current Working Versions (Verified)

- **Node.js:** 18.20.8 or higher (18+)
- **Next.js:** 14.2.5
- **React:** 18.2.0
- **React DOM:** 18.2.0
- **TypeScript:** 5.x
- **Tailwind CSS:** 3.4.0
- **ESLint:** 9.x
- **Prettier:** 3.2.5

### Why These Versions?

- **Next.js 14** works with Node.js 18 (no upgrade needed)
- **React 18** is required by Next.js 14
- **Stable and tested** - these versions work together

---

## Development Server

### Always Use Development Mode

- **Command:** `npm run dev:3002`
- **Port:** 3002 (or 3001, 3000)
- **Never run:** `npm run build` during development
- **Hot reload:** Enabled automatically

### Custom Ports

```bash
npm run dev:3001  # Port 3001
npm run dev:3002  # Port 3002 (recommended)
npm run dev       # Port 3000 (default)
```

---

## Project Structure

### Next.js App Router

- **Pages:** `src/app/`
- **Components:** `src/components/`
- **Lib/Utils:** `src/lib/`
- **Styles:** `src/app/globals.css`
- **Public:** `public/`

### Key Files

- `src/app/page.tsx` - Root page
- `src/app/test-lds/page.tsx` - LDS test page
- `src/components/LDSVerseComparison.tsx` - Verse comparison component
- `src/lib/data.ts` - Data utilities
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind configuration

---

## Code Standards

### TypeScript

- Use TypeScript for all new files
- Strict mode enabled
- Path aliases: `@/` → `src/`

### React

- Use functional components
- Hooks for state management
- Client components: `'use client'` directive when needed
- Server components by default (App Router)

### Styling

- **Tailwind CSS** for all styling
- Custom colors: `zb-red`, `zb-green` (defined in tailwind.config.js)
- Dark mode: `dark:` prefix
- Responsive: Mobile-first approach

---

## Important Notes

### DO NOT:

- ❌ Use `--turbopack` flag (not supported in Next.js 14.2.5)
- ❌ Upgrade to Next.js 15 without upgrading Node.js first
- ❌ Use React 19 with Next.js 14
- ❌ Run `npm run build` during development

### DO:

- ✅ Use `npm run dev:3002` for development
- ✅ Keep versions as specified above
- ✅ Use TypeScript for type safety
- ✅ Follow Next.js App Router conventions
- ✅ Use Tailwind CSS for styling

---

## Dependencies

### Core Dependencies

```json
{
  "next": "^14.2.5",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5"
}
```

### Key Libraries

- `@heroicons/react` - Icons
- `tailwindcss` - Styling
- `puppeteer` - Web scraping (dev only)
- `prettier` - Code formatting
- `eslint` - Linting

---

## Testing

### Test Page

- **URL:** `http://localhost:3002/test-lds`
- **Purpose:** Test LDS structure integration
- **Features:** Book/Chapter/Verse selectors, side-by-side comparison

### Running Tests

```bash
# Start dev server
npm run dev:3002

# Open test page
# http://localhost:3002/test-lds
```

---

## Troubleshooting

### Common Issues

1. **500 Error:** Clear `.next` cache: `rm -rf .next`
2. **Port in use:** Use different port: `npm run dev:3001`
3. **Module not found:** Run `npm install --legacy-peer-deps`
4. **Version conflicts:** Ensure versions match this document

---

## Future Upgrades

When ready to upgrade:

1. **Upgrade Node.js to 20+**
2. **Upgrade Next.js to 15**
3. **Upgrade React to 19**
4. **Update code for breaking changes**
5. **Update this document**

---

**Last Updated:** Based on working configuration as of current date
**Status:** ✅ All versions verified and working



