# Dani · Graffo Edition

Portafolio de **Ivan Daniel Igua Benavides**: desarrollador full stack, con identidad visual de graffiti.
Desarrollador full stack, futuro especialista en ciberseguridad.

## Stack

- **Next.js 15** (App Router) + **TypeScript** estricto
- **Tailwind CSS v4** con tokens en `@theme` (`app/globals.css`)
- **Supabase**: Postgres con RLS, Auth (GitHub OAuth) y Storage
- **Motion** (`motion/react`) para las animaciones, siempre con `prefers-reduced-motion`
- Despliegue en **Vercel**

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # opcional: sin variables, la web usa content/seed.json
npm run dev                  # http://localhost:3000
npm run lint && npm run build
```

Sin variables de Supabase la web funciona igual: `SeedRepository` lee `content/seed.json`.
El panel `/admin` y el guardado de mensajes necesitan Supabase.

## Estructura

```
app/                 page.tsx (secciones en orden), layout.tsx, actions.ts (formulario de contacto)
  admin/             panel privado: layout (guarda + noindex), page (pestañas), actions (CRUD), login
  auth/callback/     retorno de GitHub OAuth
components/
  sections/          Navbar · Hero · About · Projects · Testimonials · Experience · Contact · OffTheClock · Footer
  ui/                Character · GraffitiWall · BubbleMenu · SprayButton · Sticker · Modal · Reveal · SectionTitle · Icon
  admin/             EntityTable · EntityForm (generado desde Zod) · GithubImport
lib/
  domain.ts          POO: Entity → Project, Testimonial, Skill, Interest, Experience → Academic/Work
  patterns.ts        Repository (Seed/Supabase), Factory, Strategy (reglas de validación), Observer
  structures.ts      Trie, CircularQueue, TechIndex, ordenamientos
  schemas.ts         Zod: única fuente para formularios, base de datos y validación
  supabase.ts        clientes + isAdmin() + SupabaseRepository
  github.ts          cliente REST de GitHub (solo servidor)
content/seed.json    contenido inicial
supabase/migrations/ tablas, RLS y bucket de Storage
middleware.ts        protege /admin
```

## Configurar el panel de administración

1. **Proyecto en Supabase.** Crea un proyecto en [supabase.com](https://supabase.com). En *Project Settings → API* copia
   la *Project URL* y la *anon public key* en `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Migración.** En *SQL Editor* pega y ejecuta `supabase/migrations/0001_init.sql`.
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
8. **GitHub (opcional).** Un *fine-grained token* de solo lectura en `GITHUB_TOKEN` sube el límite de la API y
   permite listar los repos públicos donde colaboras. Sin token, pega la URL del repo en «Importar desde GitHub».

## Seguridad

- Doble guarda del admin: `middleware.ts` y `app/admin/layout.tsx`; además, **RLS** con `is_admin()` en cada tabla.
- Todas las escrituras son Server Actions que validan con Zod y verifican `isAdmin()`.
- Cabeceras CSP, HSTS, X-Frame-Options, Referrer-Policy y Permissions-Policy en `next.config.ts`.
- Formulario de contacto con honeypot y límite de envíos; los errores nunca exponen detalles internos.
- Ningún secreto en el cliente: solo las variables `NEXT_PUBLIC_*` llegan al navegador.

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. En *Settings → Environment Variables* agrega las variables de `.env.example`.
3. Agrega `https://<tu-dominio>/auth/callback` en las *Redirect URLs* de Supabase.
4. Cada `git push` a `main` publica una versión nueva. Los cambios hechos en `/admin` se ven al instante,
   sin redeploy (`revalidateTag`).

---

Hecho con Next.js + Tailwind CSS · Pasto, Nariño
