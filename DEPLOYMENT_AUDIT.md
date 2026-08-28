# TexFlow deployment audit

Date: 2026-08-28

## Implemented fixes

- Added a production frontend image: Vite build served by Nginx with SPA fallback, API proxy and Socket.IO upgrade support.
- Added `docker-compose.prod.yml` with persistent storage, restart policies, production backend start-up and required JWT secret validation.
- Added LaTeX engines to the backend image (`pdflatex`, `xelatex`, `lualatex` and common packages).
- Fixed compiler PATH construction for Windows and Linux, project compiler selection, `main.tex` discovery, `.latex` PDF naming and PDF filename traversal.
- Permanent project deletion now removes folders as well as files, versions and generated storage.
- Added cookie-based Socket.IO authentication and cookie-session fallback in the editor route guard.
- Kept existing bearer-token compatibility so current sessions and API clients are not broken.
- Fixed CodeMirror lifecycle so switching files does not recreate the editor/gutter DOM; line numbers remain UI-only and Ctrl+A cannot select them.
- Fixed terminal Clear Logs action to clear the Redux compile result.
- Fixed PDF preview zoom, page navigation fragment, page-count detection and authenticated PDF download.
- Updated backend `uuid` to the compatible patched major and frontend React Router to the patched release; both production dependency audits now report zero vulnerabilities.
- Existing ZIP import, binary upload/download, duplicate content copying, restore endpoint, compile PDF rate-limit exemption and theme/editor fixes were retained.

## Verification completed

- `backend`: `npm run build` — passed.
- `frontend`: `npm run build` — passed.
- `git diff --check` — passed (only normal CRLF conversion warnings on Windows).
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- Source scan found no browser `prompt`, `alert` or native `confirm`; confirmation calls use the app modal service.

## Known limitations / deployment operator actions

- Docker is not installed on the development machine, so `docker compose -f docker-compose.prod.yml build` could not be run locally. Run it on the deployment host.
- Set a strong, private `JWT_SECRET` before starting production. Do not use the development compose file in production.
- The frontend bundle is currently about 1.18 MB minified. This is a performance warning, not a build failure; route-level code splitting can be added later.
- Browser PDF plug-ins differ slightly in fragment support. The viewer now sends standard `#page`/`#zoom` fragments and calculates page count independently.
- LocalStorage still retains a bearer token as a backward-compatibility fallback for older API paths. The httpOnly cookie is now the primary session and all auth responses set it; a future breaking cleanup can remove the fallback after existing clients migrate.

## Files changed in this deployment pass

- `backend/Dockerfile`
- `backend/src/index.ts`
- `backend/src/routes/compile.ts`
- `backend/src/routes/projects.ts`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/src/components/CodeEditor.tsx`
- `frontend/src/components/PDFViewer.tsx`
- `frontend/src/components/RequireAuth.tsx`
- `frontend/src/components/TerminalPanel.tsx`
- `frontend/src/hooks/useSocket.ts`
- `frontend/src/store/editorSlice.ts`
- `docker-compose.prod.yml`

No database schema or public API contract was changed.
