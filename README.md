# Dani · Noche azul

Portafolio de **Ivan Daniel Igua Benavides**: desarrollador full stack, futuro especialista en ciberseguridad.
Dirección visual "Noche azul": azul marino profundo con secciones en blanco hueso, una lámpara de lava de fondo, la foto en un marco de luz LED con su propio contorno y titulares en serif.

## Stack

- **Next.js 15** (App Router) + **TypeScript** estricto
- **Tailwind CSS v4** con tokens en `@theme` (`app/globals.css`)
- **Supabase**: Postgres con RLS, Auth (GitHub OAuth) y Storage
- Movimiento ligero: CSS (scroll timelines, keyframes) y Web Animations en el arranque; **Motion** (`motion/react`) solo en el panel del menú móvil (carga diferida) y el admin; **Lenis** cargado en tiempo ocioso. Todo respeta `prefers-reduced-motion` y el interruptor "Pausar animaciones".
- **Vitest** para las pruebas unitarias de `lib/` y **Playwright** para las pruebas end-to-end
- Despliegue en **Vercel**

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # opcional: sin variables, la web usa content/seed.json
npm run dev                  # http://localhost:3000
npm run lint && npm run build
npm test                     # Vitest: lib/structures, lib/schemas y lib/domain
npm run build && npm run test:e2e   # Playwright: menús, cortina, proyectos, modal, formulario e interruptor
```

La primera vez, `npx playwright install chromium` descarga el navegador de las pruebas. Si ya tienes un Chromium,
`PLAYWRIGHT_CHROMIUM=<ruta al ejecutable>` lo usa en su lugar.

Sin variables de Supabase la web funciona igual: `SeedRepository` lee `content/seed.json`.
El panel `/admin` y el guardado de mensajes necesitan Supabase.

## Estructura

```
app/                 page.tsx (secciones en orden), layout.tsx (metadatos), actions.ts (formulario de contacto)
                     not-found.tsx, sitemap.ts, robots.ts, icon.svg, favicon.ico, apple-icon.png, opengraph-image.jpg
  admin/             panel privado: layout (guarda + noindex), page (pestañas), actions (CRUD), login
  auth/callback/     retorno de GitHub OAuth
components/
  sections/          Loader · Navbar · Hero · Stats · About · Projects · Testimonials · Experience · OffTheClock · Contact · Footer
  ui/                Section · Button · CvButton · Icon · Reveal (CSS, sin JS) · Modal · MotionProvider (interruptor, Lenis diferido)
                     MobileMenu + MenuPanel (botón flotante y panel diferido) · ProjectCard · Gallery · Carousel · ContactForm
                     LavaLamp · Glow + TiltPhoto + PhotoShape (foto LED con su contorno) · Marquee · Ambient · SectionCurtain
  admin/             EntityTable · EntityForm + fields.ts (generado desde Zod) · GithubImport
lib/
  domain.ts          POO: Entity → Project, Testimonial, Skill, Interest, Experience → Academic/Work
  patterns.ts        Repository (Seed/Supabase), Factory, Strategy (reglas de validación), Observer
  structures.ts      Trie, CircularQueue, TechIndex, ordenamientos
  *.test.ts          pruebas unitarias (Vitest) de structures, schemas y domain
  schemas.ts         Zod: única fuente para formularios, base de datos y validación
  supabase.ts        clientes + isAdmin() + SupabaseRepository
  github.ts          cliente REST de GitHub (solo servidor)
  site.ts            URL pública y datos estructurados (JSON-LD Person)
e2e/                 pruebas end-to-end (Playwright)
content/seed.json    contenido inicial
supabase/migrations/ 0001 tablas, RLS y Storage · 0002 tipos "web-mobile" y "wearable" · 0003 varias plataformas por proyecto (+ Nexium)
middleware.ts        protege /admin
```

## Configurar el panel de administración

1. **Proyecto en Supabase.** Crea un proyecto en [supabase.com](https://supabase.com). En *Project Settings → API* copia
   la *Project URL* y la *anon public key* en `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Migración.** En *SQL Editor* pega y ejecuta, en orden, `supabase/migrations/0001_init.sql`, `0002_project_kinds.sql`
   y `0003_project_platforms.sql` (cada proyecto pasa de un tipo a una lista de plataformas; agrega Nexium).
3. **GitHub OAuth App.** En GitHub → *Settings → Developer settings → OAuth Apps → New OAuth App*:
   - *Homepage URL*: la URL del sitio (o `http://localhost:3000`).
   - *Authorization callback URL*: `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
   Copia el *Client ID* y genera un *Client secret*.
4. **Activar GitHub en Supabase.** *Authentication → Sign In / Providers → GitHub*: pega el Client ID y el secret.
   En *Authentication → URL Configuration* pon la *Site URL* y agrega a *Redirect URLs*
   `http://localhost:3000/auth/callback` y `https://<tu-dominio>/auth/callback`.
5. **Tu `user.id`.** Corre el sitio, entra a `/admin/login` y pulsa «Entrar con GitHub». Mientras `ADMIN_USER_ID`
   esté vacío, la página te muestra tu id. Cópialo en `ADMIN_USER_ID` y regístralo en la base:
   ```sql
   insert into public.admins (user_id) values ('<tu-user-id>');
   ```
   Reinicia el servidor y vuelve a entrar. Cualquier otra cuenta ve «Acceso denegado» y su sesión se cierra.
6. **Contenido inicial.** En `/admin` pulsa «Importar seed.json» (solo aparece con la base vacía).
7. **Correo del formulario.** Crea una API key en [resend.com](https://resend.com) y ponla en `RESEND_API_KEY`.
   Sin dominio verificado, Resend solo entrega al correo de tu cuenta: regístrate con el mismo correo del perfil.
   Los mensajes se guardan siempre en la tabla `messages` y los ves en la pestaña «Mensajes».
   Opcional: `CONTACT_TO` es el correo que recibe los mensajes del formulario (solo servidor). Si falta, llegan al
   correo del perfil. El correo público que muestra la web no cambia.
8. **GitHub (opcional).** Un *fine-grained token* de solo lectura en `GITHUB_TOKEN` sube el límite de la API y
   permite listar los repos públicos donde colaboras. Sin token, pega la URL del repo en «Importar desde GitHub».

## Seguridad

- Doble guarda del admin: `middleware.ts` y `app/admin/layout.tsx`; además, **RLS** con `is_admin()` en cada tabla.
- Todas las escrituras son Server Actions que validan con Zod y verifican `isAdmin()`.
- Cabeceras CSP, HSTS, X-Frame-Options, Referrer-Policy y Permissions-Policy en `next.config.ts`. La CSP solo
  permite `vercel.live` (barra de comentarios de Vercel) en los despliegues de preview; en producción es estricta.
- Formulario de contacto con honeypot y límite de envíos; los errores nunca exponen detalles internos.
- Ningún secreto en el cliente: solo las variables `NEXT_PUBLIC_*` llegan al navegador.

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. En *Settings → Environment Variables* agrega las variables de `.env.example`.
3. Agrega `https://<tu-dominio>/auth/callback` en las *Redirect URLs* de Supabase.
   Opcional: `NEXT_PUBLIC_SITE_URL` con el dominio definitivo; si falta, los metadatos, el sitemap y el
   robots usan el dominio de producción que da Vercel.
4. Cada `git push` a `main` publica una versión nueva. Los cambios hechos en `/admin` se ven al instante,
   sin redeploy (`revalidateTag`).

---

Hecho con Next.js + Tailwind CSS · Pasto, Nariño
