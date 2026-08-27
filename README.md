<p align="center">
  <img src="frontend/react/public/logo.png" width="98" alt="Flow logo" />
</p>

# TexFlow — Collaborative LaTeX Writing Platform

Write. Compile. Collaborate. Publish.

TexFlow is a complete browser-based LaTeX writing, editing, compiling, collaboration, project-management, and publishing platform.

## Features

- **Online LaTeX Editor** — Professional CodeMirror editor with syntax highlighting, autocomplete, and LaTeX commands
- **Real-Time PDF Preview** — Compile and view PDFs instantly
- **Project Management** — Create, upload, organize, and share projects
- **File Explorer** — Manage .tex, .bib, images, and other project files
- **Templates** — Start from pre-built templates for papers, theses, CVs, and more
- **Collaboration** — Share projects, invite collaborators, real-time editing
- **Comments** — Add comments, reply, resolve discussion threads
- **Version History** — Track changes, compare versions, restore previous states
- **Compilation** — pdfLaTeX, XeLaTeX, LuaLaTeX support with error logs
- **Dark Theme** — Beautiful purple/magenta design

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- CodeMirror 6
- Socket.io Client
- React Router
- Lucide Icons

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM + SQLite
- Socket.io
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend runs on http://localhost:3001

### Environment Variables

Backend (.env):
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
STORAGE_PATH="./storage"
MAX_FILE_SIZE=10485760
MAX_PROJECT_SIZE=104857600
COMPILATION_TIMEOUT=120
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Sign up
- `POST /api/auth/login` — Log in
- `POST /api/auth/logout` — Log out
- `GET /api/auth/me` — Get current user

### Projects
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project
- `PATCH /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

### Files
- `GET /api/files/project/:projectId` — List project files
- `POST /api/files` — Create file
- `PATCH /api/files/:id` — Update file
- `DELETE /api/files/:id` — Delete file

### Compilation
- `POST /api/compile/:projectId` — Compile project

### Comments
- `GET /api/comments/project/:projectId` — List comments
- `POST /api/comments` — Add comment
- `POST /api/comments/:id/reply` — Reply to comment
- `PATCH /api/comments/:id/resolve` — Resolve comment

### Sharing
- `POST /api/shares/project/:id/invite` — Invite collaborator
- `POST /api/shares/project/:id/link` — Generate share link

### Templates
- `GET /api/templates` — List templates
- `GET /api/templates/:id` — Get template

## Project Structure

```
flow/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux state management
│   │   ├── hooks/       # Custom React hooks
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/   # Express middleware
│   │   └── utils/       # Utility functions
│   └── prisma/         # Database schema
└── logo.png           # TexFlow logo
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save |
| Ctrl+Enter | Compile |
| Ctrl+K | Command Palette |
| Ctrl+Shift+F | Search |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |

## License

MIT License

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
