# Portafolio Daniel Igua — project rules

Personal portfolio of Ivan Daniel Igua Benavides ("Dani"), graffiti / urban-cartoon theme. Full build brief: `docs/PROMPT.md`. Content seed: `content/seed.json`.

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) · Supabase (Postgres, Auth, Storage) · Motion (`motion/react`) · Vercel.

## Non-negotiable rules
- All code, identifiers, comments and commits in **English**. All UI text in **Spanish**.
- Tailwind is the styling system. No per-component CSS files.
- Keep the folder structure in `docs/PROMPT.md` §3. Do not add folders. Max 150 lines per file. No duplicated code.
- OOP in `lib/domain.ts` (abstract classes, inheritance, polymorphism). Patterns in `lib/patterns.ts`. Data structures in `lib/structures.ts`. React components are functional.
- Server Components by default; `"use client"` only where needed.
- Every animation respects `prefers-reduced-motion`.
- Security: Zod validation on the server, `isAdmin()` check in every admin action, RLS on every table, no secrets in client code, security headers in `next.config.ts`.
- Never use images from the internet. Characters are original inline SVG.
- Do not alter `public/daniel*.webp` (no filters, no edits).
- Palette and fonts: only the tokens defined in `docs/PROMPT.md` §2. Avoid generic "AI look" (purple-blue gradients, flat black + single neon, emoji decoration, Inter/Roboto).

## Workflow
- Work in the phases of `docs/PROMPT.md` §10. After each phase: `npm run lint` and `npm run build` must pass, then commit with Conventional Commits and stop for review.
