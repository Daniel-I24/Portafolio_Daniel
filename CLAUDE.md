# Portafolio Daniel Igua — project rules

Personal portfolio of Ivan Daniel Igua Benavides ("Dani"). Visual direction: **"Noche azul"** (deep navy with bone-cream sections, lava-lamp backdrop, LED light, editorial serif). Full build brief: `docs/PROMPT.md`. Setup and maintenance guide: `docs/SETUP.md` (README.md is the public presentation, no technical steps). Content seed: `content/seed.json`.

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) · Supabase (Postgres, Auth, Storage) · Motion (`motion/react`, only in lazily loaded parts: mobile menu panel, admin) · Lenis (smooth scroll, loaded when idle) · Vitest (unit tests for `lib/`) · Playwright (end-to-end tests in `e2e/`) · Vercel.

## Non-negotiable rules
- All code, identifiers, comments and commits in **English**. All UI text in **Spanish**.
- Tailwind is the styling system. No per-component CSS files. Keyframes and the few utilities Tailwind lacks live in `app/globals.css`.
- Keep the folder structure in `docs/PROMPT.md` §3. Do not add folders. Max 150 lines per file. No duplicated code.
- OOP in `lib/domain.ts` (abstract classes, inheritance, polymorphism). Patterns in `lib/patterns.ts`. Data structures in `lib/structures.ts`. Zod schemas in `lib/schemas.ts`. React components are functional.
- Server Components by default; `"use client"` only where needed.
- Every animation respects `prefers-reduced-motion` **and** the in-page "Pausar animaciones" switch (`useCalm()` in JS, `html[data-motion="off"]` in CSS).
- Performance: modern browserslist (no legacy polyfills); client components never import Zod or `next/cache` (keep `lib/patterns.ts` tree-shakable); keep animation libraries out of start-up (prefer CSS scroll timelines, keyframes and Web Animations); animate only `transform` and `opacity`; endless loops wait for `html[data-ready]`. Section reveals use `Reveal`/`.reveal` (server, no JS).
- Security: Zod validation on the server, `isAdmin()` check in every admin action, RLS on every table, no secrets in client code, security headers in `next.config.ts`.
- Never use images from the internet. Icons are our own paths in `components/ui/Icon.tsx`.
- Do not alter `public/daniel-sin-hora.webp` (no filters, no edits).
- Palette and fonts: only the tokens in `docs/PROMPT.md` §2 (Tailwind defaults are reset). Avoid the generic "AI look" (purple-blue gradients, flat black + single neon, emoji decoration, Inter/Roboto, template layouts).
- Legibility: 4.5:1 minimum contrast and no informative text under 14 px (`text-sm` is the floor). Text colors are `ice`, `mist` and `sky` (never `steel` or `sky` on `slate`); on `mist`/`ice`/`bone` fills the text is `abyss`. Cream sections use `Section surface="bone"`, which inverts the tokens (`.surface-bone`), so components inside need no extra classes. Fraunces for titles and short display text; IBM Plex Sans for everything else.

## Workflow
- Work in the phases of `docs/PROMPT.md` §10. After each phase: `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` must pass, check 390 / 768 / 1440 / 1920 px, then commit with Conventional Commits and stop for review. Nothing reaches `main` without approval.
