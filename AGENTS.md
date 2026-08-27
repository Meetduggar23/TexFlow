# TexFlow — Implementation Plan

## Goal
Build a free Overleaf-style collaborative LaTeX writing platform. After loading screen → Dashboard (table view like Overleaf). Login/signup only via modal popup when user tries to save/create/open project. No pricing, completely free.

## Theme Colors
- `#030637` (darkest — sidebar bg)
- `#3C0753` (dark purple — borders, hover)
- `#720455` (medium magenta — primary actions)
- `#910A67` (lighter magenta — gradients, accents)

## App Flow
Loading Screen → Dashboard (no login required) → Modal popup for login/signup when saving/creating/opening

---

## Phase 1: Fix Critical Bugs

### Bug 1 — Socket Event Mismatch
- **Files**: `frontend/src/hooks/useSocket.ts`, `frontend/src/pages/Editor.tsx`
- `useSocket.ts`: Emit `join-project` with projectId on connect
- `Editor.tsx`: Change `file:edit` → `file-update`, listen for `file-updated`
- Backend already uses `file-update` / `file-updated` / `join-project`

### Bug 2 — Flat File Tree
- **File**: `frontend/src/store/projectSlice.ts` (lines 199-211)
- `fetchFiles.fulfilled` stores flat array but FileTree expects hierarchical
- **Fix**: Build tree from flat array — group by `folderId`, nest children

### Bug 3 — Missing Auth Headers (3 files)
- `frontend/src/pages/TrashPage.tsx:12` — fetch missing auth
- `frontend/src/pages/AllProjects.tsx:33` — handleToggleFavorite missing auth
- `frontend/src/pages/Editor.tsx:115` — handleDownloadProject missing auth
- **Fix**: Add `Authorization: Bearer ${token}` to all fetch calls

### Bug 4 — No Auth Guard
- **File**: `frontend/src/App.tsx`
- **Fix**: Add `RequireAuth` component — check token, redirect to `/login?returnTo=...`
- Only wrap `/project/:projectId` route (editor needs auth)

### Bug 5 — handleNewFile broken
- **File**: `frontend/src/pages/Editor.tsx:136-140`
- Calls `updateFileContent({ fileId: '', content: '' })` — wrong
- **Fix**: Call `createFile` dispatch with proper params

### Bug 6 — handleNewFolder no-op
- **File**: `frontend/src/pages/Editor.tsx:142-145`
- **Fix**: Call `createFile` dispatch with `type: 'folder'`

### Bug 7 — Favorites filter broken
- **File**: `frontend/src/pages/Dashboard.tsx:36`
- **Fix**: Remove broken favorites filter

### Bug 8 — Backend routes too aggressive
- **File**: `backend/src/index.ts:28-35`
- All routes require auth — dashboard can't load projects without login
- **Fix**: Make GET `/api/projects` and GET `/api/projects/:id` public (no auth required for browsing)

---

## Phase 2: UX Redesign

### Step 1 — Update App.tsx Routes
- Loading → Dashboard directly (skip Landing)
- Add `RequireAuth` wrapper for editor route
- Keep Landing page accessible at `/` but not default

### Step 2 — Remove Pricing from Landing
- **File**: `frontend/src/pages/Landing.tsx`
- Delete entire `#pricing` section (lines 213-265)
- Remove pricing from nav and footer
- Change CTAs to point to `/dashboard`

### Step 3 — Redesign DashboardSidebar (match Overleaf)
- **File**: `frontend/src/components/DashboardSidebar.tsx`
- Structure matching reference image:
  - Top: TexFlow logo + branding
  - Nav items: Projects, Your projects, Shared with you, Archived projects
  - ORGANIZE TAGS section (placeholder)
  - Bottom: Library, Trash, Help, Account
  - User info with logout

### Step 4 — Redesign AllProjects to Table View
- **File**: `frontend/src/pages/AllProjects.tsx`
- Match Overleaf table layout:
  - Header: "All projects" + "New project" button
  - Search bar
  - Table columns: checkbox, Title, Owner, Last modified, Actions
  - Table rows with project data
  - "Showing X out of X projects" footer
- Dark theme with our colors

### Step 5 — Create AuthModal Component
- **New file**: `frontend/src/components/AuthModal.tsx`
- Modal popup for login/signup
- Shows when user tries to: create project, open project, save, compile
- Two tabs: Login / Sign Up
- Redirect back to original action after auth

### Step 6 — Update CreateProjectModal
- **File**: `frontend/src/components/CreateProjectModal.tsx`
- Check if logged in before creating
- If not logged in, show AuthModal instead

### Step 7 — Update Editor Auth
- **File**: `frontend/src/pages/Editor.tsx`
- Check auth on mount, redirect to login if no token
- Show auth modal for save/compile actions if not logged in

---

## Phase 3: Polish + Push

### Step 8 — Fix Remaining Features
- Wire up Recent/Shared/Trash filter views
- Test compilation flow
- Fix all edge cases

### Step 9 — Push to GitHub
```
git add .
git commit -m "Redesign dashboard to Overleaf-style table view, fix critical bugs, make free-to-use"
git push origin main
```

---

## Files to Modify (14)
1. `frontend/src/App.tsx` — Routes + RequireAuth
2. `frontend/src/pages/Landing.tsx` — Remove pricing
3. `frontend/src/components/DashboardSidebar.tsx` — Overleaf layout
4. `frontend/src/pages/AllProjects.tsx` — Table view
5. `frontend/src/pages/Editor.tsx` — Fix bugs + auth
6. `frontend/src/pages/TrashPage.tsx` — Add auth headers
7. `frontend/src/components/CreateProjectModal.tsx` — Auth check
8. `frontend/src/hooks/useSocket.ts` — Fix events
9. `frontend/src/store/projectSlice.ts` — Fix file tree
10. `backend/src/index.ts` — Public GET routes
11. `backend/src/routes/projects.ts` — Adjust auth
12. `frontend/src/components/EditorHeader.tsx` — Download button
13. `frontend/src/index.css` — Table styles
14. `frontend/tailwind.config.js` — Any new utility classes

## New Files (2)
1. `frontend/src/components/AuthModal.tsx` — Login/signup modal
2. `frontend/src/components/RequireAuth.tsx` — Auth guard
