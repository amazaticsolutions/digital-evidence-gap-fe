# Digital Evidence Gap Frontend - AI Agent Instructions

## Project Overview

React + TypeScript + Vite frontend for a digital evidence search system using RAG (Retrieval-Augmented Generation). Built for hackathon to analyze surveillance video/image evidence with AI-powered chat interface.

## Architecture Pattern: Mock-First Development

**Critical**: All services (`src/services/*.service.ts`) use **localStorage-based mock data** currently. Real API integration is planned but not implemented.

### Service Layer Contract

- Each service function logs the endpoint it would call: `console.debug('[ServiceName]', method, endpoint)`
- Functions marked with `// TODO: replace with →` comments show the intended fetch implementation
- Return type signatures (`ApiResponse<T>`) are production-ready; components already consume these types
- **When adding API integration**: Replace function body with real `fetch` calls, preserve return types, zero component changes needed

Example pattern from `src/services/cases.service.ts`:

```typescript
export async function getCases(): Promise<ApiResponse<Case[]>> {
  // TODO: replace with → const res = await fetch(`${BASE_URL}${API_ENDPOINTS.CASES.GET_ALL}`);
  console.debug(
    "[CasesService] GET",
    `${BASE_URL}${API_ENDPOINTS.CASES.GET_ALL}`,
  );

  const storedCases: Case[] = JSON.parse(localStorage.getItem("cases") || "[]");
  // ... mock logic
  return { data: allCases, success: true };
}
```

## File Structure Conventions

### Component Organization

- **UI primitives**: `src/app/components/ui/` - Radix UI-based shadcn/ui components (accordion, button, dialog, etc.)
- **Feature components**: `src/app/components/` - Domain-specific (EvidenceList, VideoPlayer, MediaUploadCard)
- **Pages**: `src/app/pages/` - Route components (NewCase, PastCases, ChatWorkspace)
- **Layouts**: `src/app/layouts/` - MainLayout with Sidebar + Outlet pattern

### Constants Pattern

One constants file per major page: `src/constants/{pageName}.constants.ts`

- Contains demo data, type definitions, and configuration values
- API endpoints centralized in `src/constants/api.constants.ts` using path builder functions

### Styling

- **Tailwind CSS 4.x** with `@tailwindcss/vite` plugin
- Import approach: `@import 'tailwindcss' source(none);` in `src/styles/tailwind.css`
- Uses `tw-animate-css` for animations
- Utility helper: `cn()` from `src/app/components/ui/utils.ts` for conditional class merging
- Custom fonts loaded via `src/styles/fonts.css`
- **Dark Mode**: Context-based theme system with `useTheme()` hook
  - Toggle in Sidebar footer, persists to localStorage
  - Use `dark:` prefix for all color/background classes: `bg-white dark:bg-gray-900`
  - Detects OS dark mode preference on first load

## Key Technical Decisions

### Routing

- **React Router v7** with `createBrowserRouter` data API
- Route structure in `src/app/routes.tsx`:
  - `/` → redirects to `/new-case`
  - `/new-case` - Create new investigation case
  - `/past-cases` - List/search existing cases
  - `/case/:id` - Chat workspace with AI assistant
  - Wildcard `*` → redirects to `/new-case`

### State Management

- **No global state library** - component-level state with React hooks
- Persistent state: localStorage (demo data)
- Async data: Service layer returns `Promise<ApiResponse<T>>`

### TypeScript Configuration

- Project references: `tsconfig.app.json` (app), `tsconfig.node.json` (build config)
- Path alias: `@/` → `./src/` (configured in `vite.config.ts`)
- Strict mode enabled

## Developer Workflows

### Development Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + production build
npm run lint     # ESLint with React hooks + refresh plugins
npm run preview  # Preview production build
```

### Build Notes

- **React Compiler** enabled (impacts build performance, see README)
- ESLint: Flat config format (`eslint.config.js`) with `@typescript-eslint` v8
- Vite plugins: `@vitejs/plugin-react`, `@tailwindcss/vite` (both required for Make platform)

### Testing

- Cypress installed (`cypress` in devDependencies) but test suite not visible in structure
- Run tests: `npx cypress open` (assuming default setup)

## Component Patterns

### Media Upload Flow (NewCase page)

1. User uploads files → `handleFileUpload` creates `MediaFile` objects with `uploading` status
2. `simulateUpload` intervals update progress (demo: 500ms ticks, max 30% increment per tick)
3. Status transitions: `uploading` → `completed` | `error`
4. On submit: `createCase` saves to localStorage, navigates to `/past-cases`

### Chat Interface Pattern (ChatWorkspace page)

- Uses `useParams()` to get case ID from route
- Three parallel data loads on mount:
  - `getMessages(id)` - Conversation history
  - `getEvidenceFiles(id)` - Attached media
  - `getCaseMeta(id)` - Case title/evidence count
- Message types: `'user' | 'ai'` with optional `sources[]` (video timestamps) and `table` (tabular results)
- Auto-scroll to bottom when messages update (via `useRef` on messages container)

### Modal/Viewer Components

- `VideoPlayer` - Full-screen video with controls
- `ImageViewer` - Image preview modal
- `EvidenceList` - Sidebar drawer showing all case evidence files
- All use controlled visibility state pattern: `show{ComponentName}` boolean + setter

## Environment Variables

- `VITE_BASE_URL` - Backend API origin (currently unused, see mock pattern above)
- No `.env` file in repo; create locally as needed

## Dependencies of Note

- **UI Framework**: Material-UI (`@mui/material`) alongside Radix UI primitives
- **Icons**: Lucide React (`lucide-react`)
- **Date handling**: `date-fns`
- **Forms**: `react-hook-form` (installed but usage not observed in reviewed files)
- **DnD**: `react-dnd` + `react-dnd-html5-backend` (likely for evidence organization)

## Common Pitfalls

1. **Don't add real API calls to services yet** - The mock pattern is intentional for demo/testing
2. **shadcn/ui components are pre-configured** - Don't re-install; they're in `src/app/components/ui/`
3. **Route params**: Always validate `id` from `useParams()` (can be `undefined`)
4. **File type detection**: Use `getFileType()` helper in NewCase.tsx for consistent MIME type → app type mapping

## Next Implementation Steps (from code comments)

1. Connect services to real backend (replace mock implementations)
2. Implement actual file upload to server (currently simulated)
3. Replace mock video/image URLs with real S3/CDN paths
4. Add authentication/authorization layer
