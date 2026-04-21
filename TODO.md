# FlowSync AI TODO

## Previous UI Enhancement Steps (Completed)
### 1. [x] Install Dependencies
- `npm i next-themes`

### 2. [x] Update Tailwind Config
- Edit tailwind.config.ts: Added glowPulse, slideInFromBottom, gentleFloat, rotateSubtle

### 3. [x] Update Global CSS
- Added light theme vars, enhanced panel-shell (backdrop-blur-2xl, animate-slide-in-from-bottom, dark:support), new utilities (.glow-hover, .card-gentle), @keyframes for new anims

### 4. [x] Update App.tsx
- Added ThemeProvider wrapper, created src/lib/theme.tsx

### 5. [x] Fix Navbar Theme Toggle
- Used useTheme hook, removed local state, added anims (glow-hover, gentle-float, rotate-subtle)

### 6. [x] Enhance Dashboard Components
- Enhanced OverviewHero with backdrop-blur-xl, card-gentle glow-hover, animate-glow-pulse rotate-subtle, theme-aware colors/gradients

### 7. [x] Additional UI Refinements
- Added anims/classes to Navbar, Panel (via CSS), HeroCards for consistency

### 8. [x] Test & Demo
- `npm run dev`
- Verify theme toggle, animations, responsiveness

## GitHub Description Task (Completed)
### [x] Create GitHub repo description
- Short description: "Intelligent AI traffic management system: real-time monitoring, AI predictions, automated traffic signals. React + FastAPI + PostgreSQL."
- README.md reviewed and optimized for GitHub

## Backport Commit 53b1f1d1 (In Progress)
### 1. [ ] Install GitHub CLI
### 2. [ ] Add upstream remote
### 3. [ ] Fetch upstream
### 4. [ ] Cherry-pick or manual changes
### 5. [ ] Create branch & PR

## Run Full Project Steps
### 1. [x] Create backend/.env from .env.example

### 2. [x] Install backend deps in venv (fixed SQLAlchemy for Python 3.13)

### 3. [x] Run backend server (http://localhost:8000)

### 4. [x] Install frontend deps (npm ci)

### 5. [x] Run frontend dev server (http://localhost:8080)

### 6. [ ] Seed mock data

### 7. [ ] Verify full stack (login, dashboard, websockets)
**Progress: Backporting upstream commit 53b1f1d1...**
