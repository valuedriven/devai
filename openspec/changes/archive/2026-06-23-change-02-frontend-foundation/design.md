## Context

The frontend at `apps/frontend/` is an existing Next.js 16 application with preliminary e-commerce features (product grid, cart, orders, admin panel) styled with an indigo/violet theme. The project docs (`docs/architecture.md`, `docs/spec.md`, `docs/design.md`) define a different design language — a photography-first, monochrome athletic brand (Nike-inspired) — and a strict separation between presentation (frontend) and business logic (backend).

This change establishes the **foundation** that the frontend must rest on before any further feature work: correct project structure, design system tokens, service layer, environment configuration, and base layout. Subsequent changes (03–11) will build on this foundation.

## Goals / Non-Goals

**Goals:**
- Define the canonical directory structure (app/, components/, features/, services/, hooks/, types/)
- Replace the indigo/violet CSS tokens with the design system from docs/design.md (monochrome, black/white, athletic typography)
- Create a typed HTTP service layer for backend API consumption
- Configure environment variable loading from root `.env`
- Build a base layout (header, footer, navigation shell)
- Add ErrorBoundary and Loading components
- Add unit tests for the service layer and layout component

**Non-Goals:**
- Authentication UI (covered by Change 03)
- Business logic of any kind
- Actual API integration (scaffold only)
- Feature-specific components (product cards, forms, tables — covered by later changes)
- Backend changes

## Decisions

### 1. Project Structure → Canonical layout per architecture.md

The structure mirrors the app router convention + feature folders:

```
apps/frontend/src/
├── app/                 # App Router pages and layouts
│   ├── (admin)/         # Admin route group
│   ├── (store)/         # Public store route group
│   ├── layout.tsx       # Root layout
│   ├── globals.css      # Design tokens + utility classes
│   └── page.tsx         # Home page
├── components/          # Shared UI components
│   ├── layout/          # Header, Footer, Sidebar, Navigation
│   ├── ui/              # Primitives: Button, Badge, Card, Input
│   └── auth/            # Auth forms (linked from Change 03)
├── features/            # Feature-specific logic
│   ├── products/        # Product-related hooks/services
│   ├── cart/            # Cart context and hooks
│   └── orders/          # Order-related hooks/services
├── services/            # Backend API client layer
│   ├── api.ts           # HTTP client wrapper (fetch-based)
│   ├── products.ts      # Product API calls
│   ├── orders.ts        # Order API calls
│   └── categories.ts    # Category API calls
├── hooks/               # Shared React hooks
│   └── useApi.ts        # Generic data-fetching hook
└── types/               # Shared TypeScript types
    ├── api.ts           # API response/error types
    └── models.ts        # Domain models (Product, Order, etc.)
```

**Why:** Matches the architecture.md specification exactly. Feature folders keep related code co-located and easy to navigate.

### 2. CSS Architecture → Replace theme tokens with docs/design.md tokens

The current globals.css uses an indigo/violet HSL palette. This will be replaced with the monochrome design tokens from docs/design.md:

```css
:root {
  --color-primary: #111111;
  --color-on-primary: #ffffff;
  --color-canvas: #ffffff;
  --color-soft-cloud: #f5f5f5;
  --color-ink: #111111;
  --color-charcoal: #39393b;
  --color-ash: #4b4b4d;
  --color-mute: #707072;
  --color-stone: #9e9ea0;
  --color-hairline: #cacacb;
  --color-hairline-soft: #e5e5e5;
  --color-sale: #d30005;
  --color-sale-deep: #780700;
  --color-success: #007d48;
}
```

Typography tokens: Inter for body, Futura (or system fallback) for display headlines with extreme contrast (thin 200 / bold 900 weight range).

**Why:** The design doc defines a specific visual language. Fonts, colors, and spacing must be consistent from the foundation up. CSS custom properties make them referenceable everywhere without hardcoded values.

### 3. Service Layer → Typed fetch wrapper without external HTTP libraries

The service layer uses a lightweight fetch-based client:

- `services/api.ts` — base client with base URL, auth token injection, error normalization, retry logic
- Feature-specific files call the base client for typed requests

Avoids adding axios or similar dependencies. The backend proxy (already at `src/proxy.ts`) handles CORS concerns.

**Why:** Native `fetch` is sufficient. The proxy layer routes /api/* requests to the NestJS backend. We avoid coupling to a specific HTTP library.

### 4. State Management → React Context (no external state library)

Cart, auth session, and UI state use React Context. No Redux, Zustand, or similar.

**Why:** The app's state complexity is low enough that React Context + hooks suffice. Avoiding unnecessary dependencies keeps bundles small and the codebase approachable.

### 5. Environment Variables → Load from root `.env`

Next.js config reads `../.env` via `process.loadEnvFile` in `next.config.ts`. No `.env.local` or symlinks in subdirectories.

**Why:** AGENTS.md mandates that all modules read environment from the single root `.env`. The NestJS ConfigModule will do the same.

### 6. Error Handling → ErrorBoundary + service error normalization

- **ErrorBoundary** (React class component in `components/`) catches render errors and shows a fallback UI
- **Service layer** normalizes API errors into `ServiceError` type with `status`, `message`, `code` fields
- **Generic loading** state component exported for use across pages

**Why:** Consistent error UX across the app. The ErrorBoundary prevents full-page crashes; the service error type enables predictable error handling in pages.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token replacement breaks existing components | Rename old tokens progressively; keep both old and new in CSS until later changes migrate consumers |
| Service layer abstraction too thin to be useful | Start minimal — base URL + auth + error normalization. Extend with interceptors as needs arise |
| Design system mismatch (Nike vs existing UI) | This change replaces the tokens; existing component styles will be adjusted in later changes (03–11) |
| React 19 concurrent features hidden by simple patterns | Revisit state management if performance issues emerge |

## Migration Plan

1. Replace CSS tokens in globals.css with design.md tokens
2. Create directory structure (features/, services/, hooks/, types/)
3. Implement base API client (services/api.ts)
4. Add typed API modules for each domain
5. Create useApi hook for data fetching
6. Add ErrorBoundary and Loading components
7. Rebuild layout.tsx with header/footer/navigation shell using new tokens
8. Add unit tests for service layer and layout component
9. Run lint and verify build

## Open Questions

- Should the old CSS utility classes (`.btn`, `.badge`, `.card`, etc.) be renamed to match the design system naming conventions, or kept as-is with new tokens? → **Decision**: Keep utility class names, update their token references. Renaming can happen in a dedicated cleanup change.
