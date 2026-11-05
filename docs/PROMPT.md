# Prompt de construcción — Portafolio "Dani · Graffo Edition"

> Pega este archivo completo en Claude Code, abierto en la raíz del repositorio.
> El contenido real está en `content/seed.json`. Las reglas permanentes están en `CLAUDE.md`.

---

## 0. Rol y reglas

Actúa como desarrollador full stack senior y director de arte. Construye mi portafolio en este repositorio con:

- **Next.js 15 (App Router)**, **TypeScript estricto** y **Tailwind CSS v4** (requisito principal del curso).
- **Supabase**: Postgres, Auth y Storage.
- **Motion** (`motion/react`) para las animaciones.
- Despliegue en **Vercel**.

Reglas obligatorias (también en `CLAUDE.md`):

1. Código 100 % en **inglés**; interfaz 100 % en **español**.
2. Tailwind es el sistema de estilos: los tokens van con `@theme` en `app/globals.css`. Solo los keyframes, las texturas y las utilidades que Tailwind no cubre van en ese mismo archivo, dentro de `@layer utilities`.
3. **Pocos archivos y carpetas** (estructura del punto 3, sin agregar más). Máximo **150 líneas por archivo**. **Cero código repetido.**
4. **POO** en la capa de dominio (clases abstractas, herencia, polimorfismo), **patrones** y **estructuras de datos** donde aporten (punto 4). Componentes de React funcionales.
5. **Rendimiento**: Lighthouse ≥ 95. Server Components por defecto. `"use client"` solo donde haya interacción. `next/font`, `next/image`, y `dynamic()` para la escena del hero y el cursor.
6. **Seguridad**:
   - cabeceras CSP, HSTS, X-Frame-Options, Referrer-Policy y Permissions-Policy;
   - validación con Zod en el servidor;
   - RLS en todas las tablas;
   - sin secretos en el cliente;
   - `rel="noopener noreferrer"` en los enlaces externos;
   - honeypot y límite de envíos en el formulario.
7. **Accesibilidad AA**:
   - HTML semántico y foco visible;
   - `aria-*` correctos;
   - teclado completo;
   - `prefers-reduced-motion` en **todas** las animaciones.
8. Trabaja **por fases** (punto 10). Al cerrar cada una:
   - `npm run lint` y `npm run build` deben pasar sin errores ni warnings;
   - haz **commits pequeños con Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`);
   - muéstrame un resumen de 5 líneas y espera mi "sigue".

---

## 1. Concepto: "Graffo Edition"

El portafolio es **una pared de la calle donde se pinta mi vida de developer**, al estilo graffiti y cómic urbano:

- personajes graffo con contorno negro grueso y sombreado plano (cel-shading);
- hoodies, sneakers y latas de spray;
- goteos, stickers y cinta adhesiva;
- letras bubble y wildstyle.

Tiene que mostrar mi profesión (full stack, futuro especialista en ciberseguridad) **y** mi vida (vóley, fútbol, motos, billar, rap y hip hop).

**Prohibido**, porque es lo que hace que una web parezca hecha por IA:

- degradados morado-azul;
- fondo negro plano con un solo neón;
- tarjetas iguales con `rounded-xl` y sombra difusa;
- emojis como decoración;
- todo centrado;
- Inter o Roboto;
- iconos genéricos de librería.

### Personajes (originales, SVG inline, sin imágenes de internet)

**"Dani"** es mi avatar. Está basado en mi foto `public/daniel-sin-hora.webp`, pero en estilo cartoon:

- pelo castaño oscuro, abundante y despeinado, con flequillo;
- **gafas rectangulares de marco metálico delgado**;
- **aretes pequeños de aro en ambas orejas**;
- sonrisa leve y confiada;
- hoodie color crema (`paper`) con cordones;
- jean `denim` y sneakers.

Estilo de dibujo: contorno `ink` de 5–6 px con `stroke-linejoin: round`, dos tonos por color y cabeza grande.

Dani tiene estas poses (todas comparten piezas, sin duplicar SVG), en `components/ui/Character.tsx` con la prop `pose`:

- `spraying`: pintando con lata;
- `chill`: mano en el pelo, como en mi foto;
- `laptop`: sentado con el portátil;
- `volley`: rematando;
- `football`: dominando el balón;
- `riding`: en moto;
- `pool`: apuntando con el taco;
- `headphones`: con audífonos, moviendo la cabeza al ritmo.

**"El Encapuchado"** es el personaje secundario: hoodie gris oscuro, gorra y sin cara visible. Pinta el graffiti pequeño.

Animaciones de los personajes, con Motion:

- respiración en reposo (scale 1 → 1.02);
- parpadeo aleatorio cada 3–5 s;
- brazo con la lata que sube y baja, con partículas de spray;
- salto con squash & stretch al pasar el cursor;
- con reduced motion, quedan estáticos.

---

## 2. Paleta, tipografía e iconografía

### Paleta "Concreto & Spray" (tokens `@theme`)

| Token | Hex | Uso |
|---|---|---|
| `asphalt` | `#17181C` | Fondo base de la página. |
| `concrete` | `#2B2D34` | Paredes y bloques de sección, con textura. |
| `cement` | `#B9BBC2` | Bordes y texto secundario sobre `asphalt` y `concrete`. |
| `paper` | `#F7F1E5` | Texto principal sobre fondos oscuros; fondo de stickers y carteles. |
| `ink` | `#0B0B0D` | Contornos, texto sobre colores claros y sombras duras. |
| `hoodie` | `#FF6A1F` | Marca: CTA principal, mi nombre y resaltes. |
| `mustard` | `#FFC62B` | Etiquetas de tecnologías y subrayados de marcador. |
| `spray-pink` | `#FF3D7F` | Poco uso: goteos, el hover del CV, "nuevo". |
| `denim` | `#19B8A6` | Línea de tiempo, estados activos y subrayado de enlaces. |
| `slime` | `#9BD94A` | Solo éxito y el punto "en línea". |

- Todo texto cumple 4.5:1 con su fondo. Sobre `hoodie`, `mustard`, `denim`, `spray-pink` y `slime`, el texto va en `ink`.
- `hoodie`, `denim` y `spray-pink` no cumplen sobre `paper`: ahí el texto va en `ink` y el color queda en el fondo o el subrayado.
- Ningún texto informativo por debajo de 14 px.
- Los personajes usan tonos propios (`skin`, `hair`, `metal`, `cream`, `hood`, `cap`, `can`…), separados de la interfaz, y sin fondo crema detrás.
- **Sombras duras tipo sticker**: `4px 4px 0 #0B0B0D`. Nada de sombras difusas.
- **Texturas**:
  - ruido de concreto con `feTurbulence` en un data URI;
  - grietas sutiles;
  - manchas de spray con bordes irregulares.

### Tipografía (`next/font/google`)

- `Rubik Spray Paint`: solo el nombre del hero y los títulos de sección.
- `Sedgwick Ave Display`: el tag **"Dani"**, firmas y detalles a mano.
- `Permanent Marker`: solo textos cortos y grandes (18 px o más). Los párrafos y datos largos van en `Archivo`.
- `Archivo` (400/600/800): párrafos y botones.
- `JetBrains Mono`: rutas, fechas y datos técnicos.

### Iconografía

Iconos SVG propios con look de marcador: trazo irregular de 2.5 px, extremos redondeados y sombra dura de 2 px. Un solo componente `Icon` con un mapa de paths:

`spray`, `github`, `linkedin`, `mail`, `download`, `apk`, `arrow`, `volley`, `football`, `moto`, `pool`, `music`, `shield`, `code`, `edit`, `trash`, `plus`, `logout`.

---

## 3. Estructura (no agregues carpetas)

```
app/
  layout.tsx            fonts, metadata/OG, <html lang="es" className="scroll-smooth">
  page.tsx              public portfolio: composes sections in order
  globals.css           @theme tokens, textures, keyframes
  actions.ts            public server action: contact form
  admin/
    layout.tsx          server-side admin guard + noindex
    page.tsx            dashboard (tabs per entity)
    actions.ts          CRUD server actions (Zod + admin check + revalidateTag)
    login/page.tsx      "Entrar con GitHub"
  auth/callback/route.ts  Supabase OAuth callback
components/
  sections/             Hero · About · Projects · Testimonials · Experience · Contact · OffTheClock · Footer
  ui/                   Character · GraffitiWall · BubbleMenu · Sticker · SprayButton · Icon · SectionTitle · Reveal · Modal
  characters/           hand-drawn character layers (art · DaniBust · DaniFace · DaniHair · …), max 150 lines each
  admin/                EntityTable · EntityForm · GithubImport
lib/
  domain.ts             abstract classes + models
  patterns.ts           Repository, Factory, Strategy, Observer
  structures.ts         Trie, CircularQueue, TechIndex
  schemas.ts            Zod schemas (single source for forms, DB and validation)
  supabase.ts           server/browser clients + isAdmin()
  github.ts             GitHub REST client (server only)
content/seed.json       initial content (already in the repo)
supabase/migrations/0001_init.sql   tables, RLS, storage bucket, seed
middleware.ts           refreshes the session and protects /admin
next.config.ts          security headers, images
.env.example
```

---

## 4. Arquitectura: POO, patrones y estructuras de datos

**`lib/domain.ts`**

- `abstract class Entity`, con `id`, `order`, `published` y el método abstracto `toCard()`. Subclases:
  - `Project`: agrega `stack`, `kind`, `repoUrl`, `liveUrl` y `apkUrl`;
  - `Testimonial`;
  - `Skill`;
  - `Interest`.
- `abstract class Experience extends Entity`, con `AcademicExperience` y `WorkExperience`. Cada una sobrescribe `badge()`, `accent()` e `icon()`. Es polimorfismo: la línea de tiempo nunca pregunta el tipo.
- `ProjectKind` define la acción secundaria de la tarjeta:
  - `web` → "Demo en vivo";
  - `mobile` → "Descargar APK";
  - `api` → "Documentación";
  - `desktop` → "Ver código".

**`lib/patterns.ts`**

- **Repository** (interfaz) con dos implementaciones intercambiables (Strategy):
  - `SupabaseRepository`, para producción;
  - `SeedRepository`, que lee `content/seed.json` y se usa como fallback si faltan las variables de entorno, así el build nunca se rompe.
- **Factory**: `EntityFactory.from(row)` crea la subclase correcta.
- **Strategy**: `ValidationRule` (`Required`, `Email`, `Url`, `MinLength`), combinada con Zod.
- **Observer**: `SectionObserver` envuelve `IntersectionObserver` para el scroll spy y las revelaciones.

**`lib/structures.ts`**

- `Trie`: buscador del menú burbuja y de la tabla del admin.
- `CircularQueue<T>`: carrusel de testimonios.
- `TechIndex`, un `Map<string, Set<Project>>`: filtro de proyectos por tecnología.
- Ordenamiento estable por `order` y por fecha, de lo más reciente a lo más antiguo.

**Datos**

- La web pública lee con `unstable_cache` y etiquetas (`projects`, `testimonials`…).
- Cada guardado del admin llama a `revalidateTag()`, así la web se actualiza al instante sin redeploy.

---

## 5. Panel de administración (solo yo)

**Objetivo**: administrar todo mi portafolio como una app, sin tocar código. El público solo ve e interactúa (descargar el CV y los APK, abrir enlaces, filtrar, enviar el formulario), nunca modifica datos.

- **Acceso**: `/admin`, sin enlace en la web pública, con `noindex`.
  - Login con **GitHub OAuth vía Supabase Auth**.
  - **Solo mi cuenta entra**: `isAdmin()` compara el `user.id` con `ADMIN_USER_ID` (variable de entorno) en el servidor. Cualquier otra cuenta ve "Acceso denegado" y se cierra su sesión.
  - `middleware.ts` protege `/admin/*`. `admin/layout.tsx` vuelve a verificar en el servidor (doble capa).
- **Base de datos (RLS)**:
  - `SELECT` público solo para filas con `published = true`;
  - `INSERT`, `UPDATE` y `DELETE` solo si `auth.uid() = admin_id`;
  - tablas: `profile`, `projects`, `testimonials`, `experience`, `skills`, `interests` y `messages`;
  - `messages` es solo `INSERT` público, con rate limit en la server action, y solo yo la leo.
- **Storage**: bucket `public-assets` (lectura pública, escritura solo admin) para el CV, las capturas de proyectos, los APK y las fotos de testimonios.
- **Dashboard** con pestañas: Perfil · Proyectos · Testimonios · Experiencia · Habilidades · Gustos · Mensajes.
  - `EntityTable` es genérica: busca con el Trie, ordena con drag & drop (guarda `order`), tiene un switch de publicado/borrador y botones editar y eliminar (con confirmación dentro de la página).
  - `EntityForm` es genérica: **se genera desde el schema Zod** de cada entidad, sin un formulario por entidad. Muestra errores por campo y sube archivos a Storage.
  - **Perfil**: textos de "Sobre mí", rol, foto, subir un CV nuevo y redes.
  - **Mensajes**: los mensajes del formulario de contacto, con marcar como leído y eliminar.
- **Importar desde GitHub** (`GithubImport`), para "gestionar la info de mi repositorio":
  - lista mis repos públicos de `Daniel-I24`, en el servidor y con `GITHUB_TOKEN`;
  - al elegir uno, **prellena el proyecto** con nombre, descripción, lenguajes, topics, homepage, estrellas y fecha;
  - si tiene un release con `.apk`, completa `apkUrl` con el asset del último release;
  - un botón "Sincronizar" refresca estrellas, descripción y release de los proyectos ya importados.
- **Seguridad del admin**: todas las acciones son Server Actions que validan con Zod y verifican `isAdmin()` antes de tocar la base. Sin endpoints abiertos. Los errores no exponen detalles internos.
- **`.env.example`** con: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor), `ADMIN_USER_ID`, `GITHUB_TOKEN` y `RESEND_API_KEY` o `FORMSPREE_ID`.
- **Guía de configuración** en el `README.md`, con pasos cortos: crear el proyecto en Supabase, correr la migración, activar GitHub OAuth, copiar mi `user.id` a `ADMIN_USER_ID` y configurar las variables en Vercel.

---

## 6. Web pública: secciones en orden (requisito del curso)

Orden: Menú → Hero con CV → Sobre mí → Proyectos → Testimonios → Experiencia → Contacto → **sección adicional** → Pie de página. Un componente por sección, cada uno con su `id`.

### 6.1 Menú: barra mínima + `BubbleMenu`

- **Barra fija y delgada**:
  - a la izquierda, el tag **"Dani"** en `Sedgwick Ave Display` y color `hoodie`;
  - a la derecha, el botón "Descargar CV".
- **Lata de spray flotante** (abajo a la derecha). Al hacer clic:
  - suelta una mancha;
  - despliega **burbujas en abanico** con letras bubble, una por sección, con spring y escalonadas cada 40 ms.
- La burbuja de la sección activa gotea pintura.
- Incluye un buscador con el Trie.
- Se cierra con `Esc`, con clic afuera o al elegir una sección.
- En móvil cumple la función del menú hamburguesa: `role="menu"`, foco atrapado y navegación con flechas.

### 6.2 Hero (`#inicio`): un graffiti que pinta otro graffiti

**Escena**:

1. Dani (`spraying`), sobre una escalera, pinta **"DANIEL IGUA"** en letras wildstyle sobre una pared de concreto. Primero se dibuja el contorno con `stroke-dashoffset`, luego se rellena en `hoodie` y `mustard` y caen goteos.
2. Al mismo tiempo, el Encapuchado pinta en la pared un **mini-Dani**. Al terminar, el mini-Dani cobra vida: parpadea y saluda.

**Debajo de la escena**:

- el rol "Desarrollador Full Stack";
- un sticker rotado que dice "futuro especialista en ciberseguridad";
- una frase corta.

**Botones** (`SprayButton`):

- "Descargar CV": al pasar el cursor suelta spray; al hacer clic, la lata se agita y aparece ✓;
- "Ver mis proyectos".

**Además**:

- **Mi foto real** (`daniel-sin-hora.webp`) como **sticker pegado con cinta**, troquelado blanco y rotado 3°. **No apliques filtros ni la modifiques.**
- **Parallax suave** con el mouse en 3 capas.
- Con reduced motion, la escena aparece ya terminada.

### 6.3 Sobre mí (`#sobre-mi`)

- **Póster pegado** con el texto `profile.about` de la base de datos.
- Dani en pose `chill`.
- **Datos rápidos**: stickers arrastrables (drag con Motion; vuelven a su sitio) con Pasto, Nariño · Ingeniería de Software UCC · meta: ciberseguridad.
- **Stack**: etiquetas tipo cinta adhesiva, desde la tabla `skills`.

### 6.4 Proyectos (`#proyectos`)

- Cada proyecto es un **cartel pegado** con:
  - borde de papel rasgado (`clip-path`);
  - captura o, si no tiene, una ilustración SVG del dominio;
  - título;
  - resumen;
  - tecnologías;
  - "Código" + la acción de su tipo.
- **Hover**: el cartel se despega (rota −2° y aparece la sombra dura).
- **Filtro por tecnología** con chips; los carteles se reordenan con `layout`.
- **Modal** con el detalle: problema, solución, mi rol, aprendizajes y galería.
- **Grid**: 1, 2 o 3 columnas según el ancho.
- Los APK se descargan desde `apkUrl`.

### 6.5 Testimonios (`#testimonios`)

- **Bocadillos de cómic** que salen de personajes pequeños.
- **Carrusel** con `CircularQueue`: flechas, swipe, rotación cada 6 s y pausa al pasar el cursor.
- Datos en `content/seed.json`: Catalina Botina, Diana Jojoa y Karol Igua.

### 6.6 Experiencia (`#experiencia`)

- **Pestañas** "Proyectos / laboral" y "Académica".
- **Línea de tiempo pintada con spray**, que se dibuja con el scroll (`useScroll` + `pathLength`).
- Cada hito es un **tag** con su fecha.

### 6.7 Contacto (`#contacto`)

- **Buzón pintado** con Dani saludando.
- **Formulario**: nombre, correo y mensaje, con validación en vivo y mensajes que explican cómo corregir. Se guarda en `messages` y me llega por correo (Resend o Formspree).
- **Al enviar**: rocío de spray + "¡Mensaje enviado!" en `slime`.
- **Contacto directo**: el correo con botón de copiar, LinkedIn y GitHub.

### 6.8 Sección adicional: "Fuera del código" (`#fuera-del-codigo`)

Muro de stickers con Dani en cada pose y una micro-animación:

- **Voleibol**: remata y el balón rebota.
- **Fútbol**: hace dominadas.
- **Motos**: recorre un mini-mapa de Nariño con la ruta animada.
- **Billar**: la bola 8 entra en la buchaca al pasar el cursor.
- **Música**: un boombox con ecualizador animado y la nota "rap y hip hop, pero escucho de todo". Campo opcional `playlistUrl` con un enlace a Spotify, editable desde el admin.

Debajo, el **panel de habilidades como latas de spray**:

- el nivel de pintura de cada lata indica Avanzado, Intermedio o Aprendiendo;
- siempre se muestra la palabra del nivel.

### 6.9 Pie de página (`#footer`)

- Franja de pared con el tag grande, enlaces rápidos y redes.
- "© {año automático} Ivan Daniel Igua Benavides · Pasto, Nariño" · "Hecho con Next.js + Tailwind CSS".
- "Volver arriba" como una lata que sale disparada.
- Un mini-Dani sentado en el borde balancea los pies.

---

## 7. Movimiento y efectos

- `Reveal` reutilizable: entra con fade, translate y una leve rotación, con `whileInView` y `once: true`.
- **Transición de spray**: un brochazo que barre la pantalla al navegar desde el menú (500 ms).
- **Cursor de boquilla de spray** en escritorio, con un rastro corto de pintura. Desactivado en pantallas táctiles y con reduced motion.
- **Microinteracciones**:
  - squash al presionar los botones;
  - stickers que se despegan;
  - goteos en los títulos al entrar.
- **Tiempos**: 150 ms en hover, 300 ms en menús y 600 ms en entradas. Easing `[0.16, 1, 0.3, 1]`; springs en las burbujas y los personajes.

---

## 8. Calidad

- **TypeScript `strict`**; `lint` y `build` limpios.
- **SEO**: metadata completa, imagen OG con `next/og` y favicon con el tag "Dani".
- **Responsive**: revisa 360, 768, 1280 y 1920 px, sin scroll horizontal.
- **README.md**: stack, cómo correrlo, estructura, configuración del admin y despliegue.

---

## 9. Lo que falta (déjalo editable desde el admin)

- Demo de Luma (`liveUrl`).
- El proyecto web del restaurante de Diana Jojoa: nombre, URL y año. Ya está como borrador en `content/seed.json`.
- `public/cv.pdf`: lo subo yo desde el admin.

---

## 10. Fases

1. **Base**:
   - scaffold de Next.js, Tailwind v4 con `@theme`, fuentes y texturas;
   - `lib/` completo con `SeedRepository`;
   - `Icon` y las cabeceras de seguridad.
2. **Personajes y hero**: `Character` (todas las poses), `GraffitiWall`, `SprayButton` y `BubbleMenu`.
3. **Secciones públicas**, leyendo del repositorio: Sobre mí, Proyectos (filtro y modal), Testimonios, Experiencia, Contacto, Fuera del código y Footer.
4. **Supabase + Admin**:
   - migración con RLS y Storage;
   - Auth con GitHub;
   - dashboard, `EntityTable`, `EntityForm` e importación desde GitHub;
   - `SupabaseRepository` y `revalidateTag`.
5. **Pulido**:
   - transiciones y cursor;
   - accesibilidad y reduced motion;
   - Lighthouse ≥ 95;
   - README;
   - guía para desplegar en Vercel.

Empieza por la **Fase 1**.
