# CLAUDE.md — Portafolio "Dani · Graffo Edition"

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 (`@theme`) · Supabase (Postgres, Auth, Storage) · Motion (`motion/react`) · Vercel.

## Rules
1. Code 100 % in English; UI 100 % in Spanish.
2. Tailwind is the styling system. Tokens live in `@theme` (`app/globals.css`); only keyframes, textures and utilities Tailwind lacks go in `@layer utilities` of that file.
3. Keep the folder structure from the build prompt. Max 150 lines per file. No duplicated code.
4. OOP in the domain layer (`lib/domain.ts`), patterns in `lib/patterns.ts`, data structures in `lib/structures.ts`. React components are functional.
5. Server Components by default; `"use client"` only for interaction. `next/font`, `next/image`, `dynamic()` for the hero scene and cursor. Lighthouse ≥ 95.
6. Security: CSP/HSTS/XFO/Referrer/Permissions headers, Zod on the server, RLS on every table, no secrets on the client, `rel="noopener noreferrer"` on external links, honeypot + rate limit on the contact form.
7. Accessibility AA: semantic HTML, visible focus, correct `aria-*`, full keyboard, `prefers-reduced-motion` on every animation.
8. Forbidden look: purple-blue gradients, flat black + single neon, identical `rounded-xl` cards with soft shadows, emoji decoration, everything centered, Inter/Roboto, generic icon libraries. Shadows are hard: `4px 4px 0 #0E0E0E`.
9. Each phase ends with `npm run lint` and `npm run build` clean, small Conventional Commits, and a 5-line summary.

## Data
`lib/schemas.ts` (Zod) is the single source of truth for forms, DB rows and validation. Seed content lives in `content/seed.json`; `SeedRepository` is the fallback when Supabase env vars are missing.
