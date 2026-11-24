# Prompt de construcción — Portafolio "Dani · Noche azul"

> Pega este archivo completo en Claude Code, abierto en la raíz del repositorio.
> El contenido real está en `content/seed.json`. Las reglas permanentes están en `CLAUDE.md`.

---

## 0. Rol y reglas

Actúa como desarrollador full stack senior y diseñador de producto. Construye mi portafolio en este repositorio con:

- **Next.js 15 (App Router)**, **TypeScript estricto** y **Tailwind CSS v4** (requisito principal del curso).
- **Supabase**: Postgres, Auth y Storage.
- **Motion** (`motion/react`) para las animaciones y **Lenis** para el scroll suave.
- Despliegue en **Vercel**.

Reglas obligatorias (también en `CLAUDE.md`):

1. Código 100 % en **inglés**; interfaz 100 % en **español**.
2. Tailwind es el sistema de estilos: los tokens van con `@theme` en `app/globals.css`. Solo los keyframes y las utilidades que Tailwind no cubre van en ese mismo archivo, dentro de `@layer utilities`.
3. **Pocos archivos y carpetas** (estructura del punto 3, sin agregar más). Máximo **150 líneas por archivo**. **Cero código repetido.**
4. **POO** en la capa de dominio (clases abstractas, herencia, polimorfismo), **patrones** y **estructuras de datos** donde aporten (punto 4). Componentes de React funcionales.
5. **Rendimiento**: Lighthouse ≥ 95. Server Components por defecto. `"use client"` solo donde haya interacción. `next/font` y `next/image`.
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
   - `prefers-reduced-motion` y el interruptor "Animaciones" en **todas** las animaciones.
8. Trabaja **por fases** (punto 10). Al cerrar cada una:
   - `npm run lint` y `npm run build` deben pasar sin errores ni warnings;
   - haz **commits pequeños con Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`);
   - muéstrame un resumen de 5 líneas y espera mi "sigue".

---

## 1. Concepto: "Noche azul" (antes "Papel técnico")

Un sitio oscuro en azul marino, iluminado como una habitación de noche: una **lámpara de lava** de fondo que nunca se detiene, la foto en un **marco LED** que proyecta su halo y titulares en serif con carácter. Muestra mi profesión (full stack, futuro especialista en ciberseguridad) y mi vida (vóley, fútbol, motos, billar, música, ejercicio) sin personajes ni ilustraciones: la foto real, tipografía, luz y color hacen el trabajo.

- Composición editorial: índice numerado por sección ("03 — Sobre mí"), mucho aire y alineación a la izquierda.
- Tarjetas con borde fino y sombra suave solo al pasar el cursor.
- Proyectos sin captura: un espacio limpio de color con el tipo, el periodo y el nombre. **Nada de ventanas o pantallas falsas.**

**Prohibido**, porque es lo que hace que una web parezca hecha por IA o por plantilla:

- degradados morado-azul;
- fondo negro plano con un solo neón;
- emojis como decoración;
- Inter o Roboto;
- iconos de librería genéricos (los iconos son trazos propios en `Icon`);
- imágenes de internet.

---

## 2. Paleta, tipografía y escalas

### Paleta (tokens `@theme`; los colores por defecto de Tailwind se eliminan)

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `abyss` | `#021A2A` | Fondo de la página (azul marino profundo, tono intermedio). | — |
| `deep` | `#042A41` | Superficies (tarjetas, cabecera, menú). | `ice` encima 14.33:1 |
| `slate` | `#365C73` | Superficies elevadas y mosaicos. Solo texto `ice` o `mist`. | `ice` 6.9:1 · `mist` 5.55:1 |
| `navy` | `#004671` | Relleno de acento (cortina, mosaicos, relleno del botón secundario). | `ice` encima 9.58:1 |
| `line` | `#1B4560` | Bordes y reglas. Nunca texto. | — |
| `steel` | `#7298AF` | Solo luz, bordes y formas grandes: como texto no llega a 4.5:1 sobre `slate` (2.33) ni `navy` (3.23). | — |
| `sky` | `#9CC9E6` | Acento de texto (índices, enlaces, iconos). Tono intermedio. Nunca sobre `slate`. | 10.06:1 sobre `abyss` |
| `mist` | `#C2E8FF` | Texto secundario; fondo del botón principal y de las insignias (con texto `abyss`). | 13.75:1 sobre `abyss` |
| `ice` | `#EAFFFF` | Texto principal; centro de la luz LED. | 17.1:1 sobre `abyss` |
| `bone` | `#F3EEE4` | Blanco hueso: botón principal, etiqueta del nombre, portada de videojuego y fondo de las secciones crema. | `abyss` encima 15.34:1 |

**Secciones crema** (`Section surface="bone"` → clase `.surface-bone`): Sobre mí, Testimonios y Más allá del código alternan con las azules. La clase redefine los mismos tokens invertidos, así los componentes de adentro no cambian: fondo `#F3EEE4`, superficies `#E9E2D4` / `#DFD6C5`, texto principal `#021A2A` (15.34:1), secundario `#2A4D63` (7.76:1), acento `#004671` (8.59:1), bordes `#D3C8B4`; `bone` pasa a ser azul marino (`#042A41`, texto crema 12.86:1). La lava queda oculta detrás de esas secciones.

- Todo texto cumple 4.5:1. Ningún texto informativo por debajo de 14 px: `text-sm` es el mínimo y `text-xs` no existe.
- Sombras: `shadow-lift` (hover y elementos flotantes), `shadow-glow` (brillo azul de los botones) y `shadow-led` (tubo de luz del marco de la foto y del botón flotante).
- Luz (`ice` → `mist` → `steel` → `navy`): halos y lava con degradados radiales que ya vienen difuminados; solo se anima `transform` y `opacity`, nunca `filter: blur`. Los tonos de la lava son lo bastante oscuros para que todo texto mantenga 4.5:1 encima.

### Tipografía (`next/font/google`)

- **Fraunces** (variable, eje óptico `opsz`): nombre del hero, títulos de sección y de tarjeta, cifras y frases cortas destacadas.
- **IBM Plex Sans** (400/500/600): párrafos, botones, etiquetas y datos.

### Escalas

- **Tipografía**, tercera mayor (1.25) sobre 17 px: `sm` 14 · `base` 17 · `lg` 21 · `xl` 27 · `2xl` 33 · `3xl` 42 · `4xl` 52 · `hero` clamp(60–136 px).
- **Espaciado**, base 4 px (escala de Tailwind): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Secciones con 80 px arriba y abajo en móvil y 96 px desde `sm`. Contenedor de 1240 px con márgenes de 16 / 32 / 48 px.

---

## 3. Estructura (no agregues carpetas)

```
app/
  layout.tsx            fonts, metadata, pre-paint script (motion switch + loader), <html lang="es">
  page.tsx              public portfolio: composes sections in order inside MotionProvider
  globals.css           @theme tokens, type scale, lava/loader/LED/entrance keyframes, motion-off rules
  icon.svg · favicon.ico · apple-icon.png   "DI" monogram (rendered with the site fonts)
  opengraph-image.jpg   1200×630 share image: the real hero (+ .alt.txt)
  sitemap.ts · robots.ts · not-found.tsx    SEO files and the 404 page with the site's look
  actions.ts            public server action: contact form
  admin/
    layout.tsx          server-side admin guard + noindex
    page.tsx            dashboard (tabs per entity)
    actions.ts          CRUD server actions (Zod + admin check + revalidateTag)
    login/page.tsx      "Entrar con GitHub"
  auth/callback/route.ts  Supabase OAuth callback
components/
  sections/             Loader · Navbar · Hero · Stats · About · Projects · Testimonials · Experience · OffTheClock · Contact · Footer
  ui/                   Section · Button · CvButton · Icon · Reveal · Modal · MotionProvider · MobileMenu · ProjectCard · ContactForm
                        · Glow · TiltPhoto · PhotoShape · Marquee · Ambient · SectionCurtain · LavaLamp · MenuPanel · Gallery · Carousel
  admin/                EntityTable · EntityForm · fields.ts (Zod → form fields) · GithubImport
lib/
  domain.ts             abstract classes + models
  patterns.ts           Repository, Factory, Strategy, Observer
  structures.ts         Trie, CircularQueue, TechIndex, sort helpers
  schemas.ts            Zod schemas (single source for forms, DB and validation)
  *.test.ts             Vitest unit tests: structures, schemas, domain (next to the module they test)
  supabase.ts           server/browser clients + isAdmin()
  github.ts             GitHub REST client (server only)
  site.ts               public site URL + schema.org Person (JSON-LD)
e2e/                    Playwright end-to-end tests (menus, curtain, projects, modal, contact form, motion switch)
content/seed.json       initial content (already in the repo)
docs/                   PROMPT.md (this brief) · SETUP.md (setup and maintenance guide)
supabase/migrations/    0001_init.sql (tables, RLS, storage) · 0002_project_kinds.sql (kinds "web-mobile", "wearable")
                        · 0003_project_platforms.sql (one kind → list of platforms; adds Nexium)
middleware.ts           refreshes the session and protects /admin
next.config.ts          security headers (vercel.live only on previews), images, no legacy polyfills
playwright.config.ts · vitest.config.ts
.env.example
```

---

## 4. Arquitectura: POO, patrones y estructuras de datos

**`lib/domain.ts`**

- `abstract class Entity`, con `id`, `order`, `published` y el método abstracto `toCard()`. Subclases:
  - `Project`: agrega `stack`, `platforms`, `repoUrl`, `liveUrl`, `apkUrl` y `relevance` (orden de la galería: destacados, luego los más completos, luego los más recientes);
  - `Testimonial`;
  - `Skill`;
  - `Interest`.
- `abstract class Experience extends Entity`, con `AcademicExperience` y `WorkExperience`. Cada una sobrescribe `badge()`, `accent()` e `icon()`. Es polimorfismo: la línea de tiempo nunca pregunta el tipo.
- Un proyecto tiene **una o varias plataformas** (`Platform`: web, mobile, wearable, desktop, game, api). Cada una aporta su enlace junto a "Código", sin repetir direcciones y con la más específica primero:
  - `wearable` → "APK del reloj"; `mobile` → "Descargar APK";
  - `web` → "Demo en vivo"; `game` → "Descargar juego"; `desktop` → "Descargar"; `api` → "Documentación";
  - después, los demás enlaces que tenga y los `extraLinks` (por ejemplo, "APK del teléfono" de FLUX).
- `PLATFORM_LABELS` da el nombre visible de cada plataforma (filtros, tarjetas y la cifra de plataformas).

**`lib/patterns.ts`**

- **Repository** (interfaz) con dos implementaciones intercambiables (Strategy):
  - `SupabaseRepository`, para producción;
  - `SeedRepository`, que lee `content/seed.json` y se usa como respaldo si faltan las variables de entorno, si Supabase falla o si la tabla `profile` está vacía: así el build nunca se rompe.
- **Factory**: `EntityFactory.from(row)` crea la subclase correcta.
- **Strategy**: `ValidationRule` (`Required`, `Email`, `Url`, `MinLength`), combinada con Zod en el servidor. Las reglas de formato usan expresiones regulares para que el navegador no cargue Zod.
- **Observer**: `SectionObserver` envuelve `IntersectionObserver` para el indicador de sección del menú.

**`lib/structures.ts`**

- `Trie`: buscador de la tabla del admin.
- `CircularQueue<T>`: reservada para el carrusel o marquesina de la fase de animaciones avanzadas.
- `TechIndex`, un `Map<string, Set<T>>` con la función que da las etiquetas de cada elemento: filtro de proyectos por plataforma, con contador (un proyecto cuenta en cada una de sus plataformas).
- Ordenamiento estable por `order`, por fecha (lo más reciente primero) y por varias claves (`byKeys`, para la relevancia).

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
- **Guía de configuración** en `docs/SETUP.md`, con pasos cortos: crear el proyecto en Supabase, correr la migración, activar GitHub OAuth, copiar mi `user.id` a `ADMIN_USER_ID` y configurar las variables en Vercel.

---

## 6. Web pública: secciones en orden (requisito del curso)

Un componente por sección, cada uno con su `id`. `SECTIONS` (en `components/ui/Section.tsx`) define el orden, las anclas, el índice "01 / 08" y los enlaces del footer.

1. **Carga** (`Loader`, solo la primera visita de la sesión, ≤ 1.6 s): formas de lava que se unen en el monograma "DI" con un contador de 0 a 100 y luego se disuelven sobre el hero, que ya está pintado debajo (no parte de opacidad 0, para no castigar el LCP). Se salta con clic, el botón "Saltar intro" o `Esc`. Funciona con CSS aunque no haya JS; se omite con reduced motion o con las animaciones apagadas.
2. **Menú**: en escritorio, barra fija con monograma "DI", anclas con subrayado `sky` en la sección actual, indicador "01 / 08", interruptor "Pausar animaciones / Activar animaciones" (`aria-pressed`) y "Descargar CV". Por debajo de 1280 px la cabecera es solo el monograma y el menú vive en un botón circular flotante (abajo a la derecha) con halo LED y el número de la sección actual; abre un panel que crece en círculo desde el botón (`aria-expanded`, foco atrapado, `Esc` para cerrar). Enlace "Saltar al contenido" al inicio del documento.
3. **Hero** (`#inicio`): nombre grande en Fraunces (apellido en cursiva `sky`), rol y meta, frase corta, "Ver proyectos" y "Descargar CV", ubicación y mi foto real (`daniel-sin-hora.webp`, sin filtros ni ampliación, calidad 90 y `srcset` hasta 2x) recortada con su propio contorno redondeado (`PhotoShape`, trazado del archivo) en un marco con tubo de luz LED y halo azul que siguen esa misma forma, con mi nombre completo en una etiqueta `bone`.
4. **Cifras clave** (`#cifras`): proyectos publicados, plataformas distintas y tecnologías del stack, todo leído de los datos.
5. **Sobre mí** (`#sobre-mi`): `profile.about`, foto, datos rápidos (ubicación, estudio, meta) y el stack agrupado por categoría desde `skills`. Sin niveles, porcentajes ni barras.
6. **Proyectos** (`#proyectos`), ordenados por relevancia: filtros por plataforma con contador (Web, Móvil, Wearable, Escritorio, Videojuego, API) y una **galería horizontal** con scroll-snap, flechas, arrastre con mouse, swipe, teclado (flechas, Inicio, Fin), contador "03 / 10" y barra de desplazamiento propia. Tarjetas con portada (captura o espacio limpio con plataformas, periodo y nombre), insignias, tecnologías, "Código" + las acciones de sus plataformas; se inclinan en 3D y se iluminan al pasar el cursor. Los filtros reacomodan la galería y el detalle se abre en un modal que crece desde la tarjeta (View Transitions del navegador).
7. **Testimonios** (`#testimonios`): carrusel suave sobre `CircularQueue` (avance cada 7 s, pausa al pasar el cursor, al enfocar o con su botón; flechas y puntos; sin avance automático con las animaciones apagadas).
8. **Experiencia** (`#experiencia`): pestañas "Académica" y "Laboral" (con contador y flechas del teclado) sobre una línea de tiempo que se dibuja con el scroll; cada punto se enciende al llegar.
9. **Más allá del código** (`#mas-alla-del-codigo`): mosaicos del mismo tamaño, uno por gusto (icono propio, título y nota; enlace a la playlist si existe), que se elevan en 3D con resplandor interno e icono animado al pasar el cursor.
10. **Contacto** (`#contacto`): correo con botón copiar, GitHub, LinkedIn y formulario con validación en vivo (las mismas reglas que el servidor), contador de caracteres por campo, honeypot, límite de envíos y confirmación.
11. **Footer**: nombre, rol y ubicación, enlaces rápidos, redes, "© {año} Ivan Daniel Igua Benavides", "Hecho con Next.js + Tailwind" y "Volver arriba".

---

## 7. Movimiento

**Base:**

- `Reveal` (componente de servidor, sin JS): entrada y salida ligadas al scroll con `animation-timeline: view()`, en ambos sentidos; ver Fase 4 · Parte 2.
- Scroll suave con **Lenis** en equipos con ratón, cargado en tiempo ocioso (las anclas descuentan la altura del menú).
- Hover cuidado: botones que se rellenan desde el lado del cursor y mueven su icono, tarjetas que se elevan, subrayados que crecen.
- Transición carga → página: la carga se disuelve y el hero entra escalonado (solo con `transform`).
- Interruptor "Pausar / Activar animaciones" (guardado en `localStorage`): activadas por defecto salvo con `prefers-reduced-motion`; apagado detiene Lenis, las animaciones CSS (incluidas las ligadas al scroll) y las de JS (`useCalm()`).
- `prefers-reduced-motion`: mismo efecto que el interruptor apagado.
- Tiempos: 150 ms en hover, 300 ms en menús y 600 ms en entradas. Easing `cubic-bezier(0.16, 1, 0.3, 1)`.

**Fase 4 · Parte 1 (noche azul, lava, foto LED, carga y menú móvil):**

- `LavaLamp`: capa fija detrás de todo el sitio con seis formas azules ya difuminadas que suben, se estiran, se aplanan, se cruzan (parecen unirse) y se separan en ciclos de 22 a 38 s, sobre una niebla en degradado. Solo CSS con `transform` y `opacity`, sin filtro "goo" ni canvas. Se pausa con la pestaña oculta (`html[data-tab="hidden"]`) y queda quieta sin animaciones.
- `TiltPhoto` + `Glow`: la foto se inclina en 3D hacia el cursor, con brillo y sombra que se desplaza; dentro del marco corre un tubo de luz `ice` y fuera un halo `mist` → `steel`, más intenso por debajo, que pulsa despacio (6 s, solo opacidad). En pantallas táctiles, una oscilación suave.
- `Ambient`: luz suave que sigue al cursor en escritorio, origen del relleno de los botones y atracción magnética.
- `Marquee`: franja tipo anuncio LED bajo el hero ("DESARROLLADOR FULL STACK"), en Web Animations sobre el compositor; frena al pasar el cursor y se detiene con el interruptor.
- Botones: el fondo se rellena desde el lado por donde entra el cursor, el icono se desplaza, cruza un destello, los principales son magnéticos, los secundarios tienen borde con brillo y el foco de teclado es grueso y visible.
- Hero: el nombre entra letra por letra con máscara, "Igua" se dibuja con un trazo y un subrayado, y el rol pasa de borroso a nítido (un halo con `text-shadow` que se desvanece). En móvil la foto va arriba, más pequeña.
- `SectionCurtain`: al navegar desde el menú (barra de escritorio o botón flotante), una cortina `navy` con "04 — Proyectos" sube, se queda lo suficiente para leerse, la página salta detrás y se desvanece: una sola aparición de unos 900 ms (una sola animación de Web Animations; una guarda impide que un segundo clic, un doble montaje o el scroll la disparen otra vez). Se salta con clic o `Esc` y mueve el foco a la sección.
- Sin animaciones (interruptor o `prefers-reduced-motion`), todo queda visible y quieto: cada ciclo empieza y termina en reposo.

**Fase 4 · Parte 2 (rendimiento, proyectos y scroll):**

- Rendimiento: Motion ya no está en el arranque (solo en el panel del menú móvil, que se descarga al primer toque); `TiltPhoto` y `SectionCurtain` usan variables CSS y Web Animations; Lenis se carga en tiempo ocioso y solo con ratón; los bucles infinitos arrancan cuando la página quedó lista (`html[data-ready]`); fuentes con preload, `swap` y fallback con métricas ajustadas.
- Entradas y salidas: `.reveal` (sube y aparece en los primeros 160 px al entrar; sale hacia arriba con profundidad solo cuando su borde superior ya dejó la pantalla, en los últimos 300 px), `.reveal-mask` para los títulos (máscara) y `.leave` para el hero y la franja LED. Sin soporte, quietas y visibles.
- `.scroll-fx` (CSS, sin JS): cifras que ruedan hasta su valor (contador CSS), línea de tiempo que se dibuja y puntos que se encienden, barra de progreso de lectura (`scroll(root)`).
- Cursor de anillo en escritorio que crece sobre enlaces y botones (el cursor del sistema se mantiene); botón de enviar magnético y campos con subrayado iluminado al enfocar.

---

## 8. Calidad

- **TypeScript `strict`**; `lint`, `test` (Vitest), `test:e2e` (Playwright) y `build` limpios.
- **SEO**: metadata completa (canónica, Open Graph, Twitter), imagen Open Graph propia de 1200×630, favicon, apple-touch-icon, `sitemap.xml`, `robots.txt` (sin `/admin`), datos estructurados `Person` y página 404 con el diseño del sitio.
- **Rendimiento**: `browserslist` moderno sin polyfills heredados; Zod y `next/cache` fuera del bundle del navegador (126 kB de JS inicial).
- **Responsive**: revisa 390, 768, 1440 y 1920 px, sin solapamientos, recortes ni scroll horizontal y con distancias equilibradas.
- **README.md**: presentación del portafolio (sitio publicado, secciones, características, tecnologías, arquitectura y contacto), sin instrucciones técnicas.
- **docs/SETUP.md**: guía técnica: stack, cómo correrlo, estructura, configuración del admin, seguridad y despliegue.

---

## 9. Lo que falta (déjalo editable desde el admin)

- El proyecto web del restaurante de Diana Jojoa (Gamer Food Freeze): stack, URL definitiva y año; se agrega desde el admin cuando esté listo.
- Nexium: el enlace de descarga, cuando publique su primera release.
- `public/cv.pdf`: lo subo yo desde el admin.

---

## 10. Fases

1. **Estructura** (hecha): tokens y fuentes, menú, todas las secciones, movimiento base y panel `/admin`.
2. **Fase 4 · Noche azul y movimiento** (hecha): paleta azul, lava, foto LED, carga, menú flotante, galería de proyectos, entradas y salidas ligadas al scroll, rendimiento.
3. **Fase 4 · Limpieza** (hecha): código sin uso eliminado, duplicados unificados, pruebas con Vitest y documentación al día.
4. **Pulido y publicación** (hecha): cortina corregida, CSP de previews, JS moderno y más liviano, foto completa con su contorno, tono crema, plataformas múltiples, Nexium, SEO, 404 y pruebas E2E. Pendiente: el CV.
