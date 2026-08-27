<div align="center">

  <img src="frontend/public/logo.png" width="100" alt="TexFlow Logo" />

  # TexFlow

  **Write. Compile. Collaborate. Publish.**

  A free, browser-based collaborative LaTeX writing platform built for researchers, students, and teams who want the power of Overleaf without the cost. TexFlow combines a professional code editor, real-time PDF compilation, project management, version history, and multi-user collaboration into a single seamless experience. From draft to publication, every tool you need lives in one place — no installs, no subscriptions, just start writing.

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)

</div>

---

## Why TexFlow?

Writing LaTeX shouldn't require expensive subscriptions or complex local setups. TexFlow was built to make professional academic writing accessible to everyone — whether you're drafting your first paper or collaborating on a multi-author manuscript.

- **Zero-cost, zero-install** — runs entirely in your browser
- **Full LaTeX compilation** — pdfLaTeX, XeLaTeX, and LuaLaTeX support with instant PDF preview
- **Real-time collaboration** — work with teammates on the same project simultaneously
- **Professional project management** — organize, archive, trash, and restore projects with ease
- **Version history** — track every change and restore previous states at any time

---

## Key Features

### Editor
- CodeMirror 6 with full LaTeX syntax highlighting and autocomplete
- Tabbed file editing with multi-file support
- Inline equation editor, table builder, and bibliography manager
- Image uploader and link dialog
- 20+ built-in themes (Dark, Light, Monokai, Solarized, High Contrast, and more)
- Command palette (Ctrl+K) for instant access to any action
- Global search across all open files (Ctrl+Shift+F)

### Compilation & Preview
- One-click compilation with Ctrl+Enter
- Real-time PDF viewer with zoom, dark mode, and page navigation
- Auto-compile on save with configurable delays
- Clean build to remove auxiliary files
- Stop compilation mid-process
- Download compiled PDF or full project source as ZIP

### Project Management
- Create, rename, duplicate, and organize projects
- Archive projects for long-term storage
- Full trash system with restore, permanent delete, and empty trash
- Undo-delete with 8-second toast notification
- Sort and search across all project views
- Bulk selection and batch operations

### Collaboration
- Invite collaborators with role-based access (owner, editor, viewer)
- Share links for read-only access
- Real-time cursor sync and file updates via WebSockets
- Threaded comments with resolve functionality
- Document version history with restore

### Templates
- 10+ built-in LaTeX templates (articles, theses, CVs, presentations, and more)
- One-click project creation from any template
- Browse and preview templates before starting

### Developer Experience
- Full TypeScript across frontend and backend
- Prisma ORM with SQLite (easily swappable to PostgreSQL)
- JWT authentication with bcrypt password hashing
- Rate limiting on auth and compilation endpoints
- Responsive design from mobile to ultrawide

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- npm (or yarn/pnpm)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/Meetduggar23/TexFlow.git
cd TexFlow

# Install backend dependencies
cd backend
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Create .env file (see Environment Variables below)
cp .env.example .env

# Start the backend (http://localhost:3001)
npm run dev
```

In a second terminal:

```bash
# Install frontend dependencies
cd frontend
npm install

# Start the frontend (http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

> **Note:** `JWT_SECRET` is required in production. A development fallback is used if unset, but you should always set it for any real deployment.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save current file |
| `Ctrl + Enter` | Compile project |
| `Ctrl + K` | Open command palette |
| `Ctrl + Shift + F` | Search across files |
| `Ctrl + N` | New file |
| `Ctrl + B` | Toggle PDF panel |
| `Ctrl + Shift + B` | Toggle file explorer |
| `Ctrl + `` ` | Toggle terminal |
| `Ctrl + W` | Close current tab |
| `F11` | Toggle fullscreen |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

  Built with care for the academic writing community.

</div>
