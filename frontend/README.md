# Frontend

The frontend is a React + TypeScript application built with Vite.

## Architecture

- `src/main.tsx` composes global providers and the lazy-loading boundary.
- `src/App.tsx` coordinates application-level state and switches between the home view and feature screens.
- `src/components/<Feature>/` groups feature UI, styles, and related tests by domain.
- `src/api/` contains HTTP transport and backend resource clients; keep presentation logic out of this layer.
- `src/hooks/` composes API calls with React state, while `src/types/` and `src/utils/` hold shared contracts and pure helpers.
- `src/tokens.css` and `src/index.css` define shared design tokens and global styles. Font requests are centralized in `index.html`.

Feature screens and authentication dialogs are loaded on demand. Map previews and full-screen maps are separate async modules so Leaflet is not part of the initial page bundle.

## Commands

Run these commands from `frontend/`:

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and create a production build.
- `npm test` — run the Vitest suite.
- `npm run lint` — run Oxlint.
