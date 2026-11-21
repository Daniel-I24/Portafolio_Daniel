# Prompt de construcción — Portafolio "Dani · Papel técnico"

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

## 1. Concepto: "Papel técnico"

El portafolio se siente como **un cuaderno de ingeniería bien editado**: papel cálido, tinta, un acento óxido y titulares en serif con carácter. Muestra mi profesión (full stack, futuro especialista en ciberseguridad) y mi vida (vóley, fútbol, motos, billar, música, ejercicio) sin personajes ni ilustraciones: la foto real, tipografía y color hacen el trabajo.

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
| `paper` | `#F2EEE5` | Fondo de la página. | — |
| `card` | `#FBF9F4` | Superficies elevadas; texto sobre `rust`, `pine` e `ink`. | — |
| `line` | `#D9D3C5` | Bordes y reglas. Nunca texto. | — |
| `ink` | `#191B18` | Texto principal. | 14.97:1 sobre `paper` |
| `muted` | `#4A4F49` | Texto secundario. | 7.24:1 sobre `paper` |
| `rust` | `#B23614` | Acento, botón principal, índices. | 5.29:1 sobre `paper`; `card` sobre `rust` 5.82:1 |
| `rust-deep` | `#86270C` | Relleno de botones `rust` al pasar el cursor. | `card` encima 8.64:1 |
| `pine` | `#23604E` | Estados (académica, colaboración). | 6.35:1 sobre `paper` |
| `marigold` | `#F2B640` | Solo fondo (insignia "Destacado", etiqueta de la foto), siempre con texto `ink`. | `ink` sobre `marigold` 9.53:1 |
| `terracotta` | `#D0502F` | Solo luz y decoración (resplandores, bordes, separadores). Nunca texto sobre `paper`. | — |
| `coral` | `#F2775A` | Solo luz y decoración; texto únicamente sobre `ink` (franja LED). | 6.24:1 sobre `ink` |
| `amber` | `#F4A62A` | Solo luz y decoración; texto únicamente sobre `ink` (franja LED). | 8.53:1 sobre `ink` |

- Todo texto cumple 4.5:1. Ningún texto informativo por debajo de 14 px: `text-sm` es el mínimo y `text-xs` no existe.
- Sombras: `shadow-lift`, suave, en hover y en elementos flotantes; `shadow-glow`, brillo cálido de los botones al pasar el cursor.
- Familia de luz (`rust` → `terracotta` → `coral` → `amber`): resplandores con degradados radiales que ya vienen difuminados; nunca se anima `filter: blur`. Los resplandores no tocan texto con menos de 4.5:1.
- Grano de papel: textura de ruido estática y muy tenue en el fondo de `<html>`, nunca encima del texto.

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
  layout.tsx            fonts, metadata, pre-paint script (motion switch + intro), <html lang="es">
  page.tsx              public portfolio: composes sections in order inside MotionProvider
  globals.css           @theme tokens, type scale, intro and entrance keyframes, motion-off rules
  icon.svg              "DI" monogram favicon
  actions.ts            public server action: contact form
  admin/
    layout.tsx          server-side admin guard + noindex
    page.tsx            dashboard (tabs per entity)
    actions.ts          CRUD server actions (Zod + admin check + revalidateTag)
    login/page.tsx      "Entrar con GitHub"
  auth/callback/route.ts  Supabase OAuth callback
components/
  sections/             Intro · Navbar · Hero · Stats · About · Projects · Testimonials · Experience · OffTheClock · Contact · Footer
  ui/                   Section · Button · CvButton · Icon · Reveal · Modal · MotionProvider · MobileMenu · ProjectCard · ContactForm
                        · Glow · TiltPhoto · Marquee · Ambient · SectionCurtain
  admin/                EntityTable · EntityForm · GithubImport
lib/
  domain.ts             abstract classes + models
  patterns.ts           Repository, Factory, Strategy, Observer
  structures.ts         Trie, CircularQueue, TechIndex
  schemas.ts            Zod schemas (single source for forms, DB and validation)
  supabase.ts           server/browser clients + isAdmin()
  github.ts             GitHub REST client (server only)
content/seed.json       initial content (already in the repo)
supabase/migrations/    0001_init.sql (tables, RLS, storage)
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
  - `desktop` → "Ver código";
  - `game` → "Descargar juego".
- `KIND_LABELS` da el nombre visible de cada tipo (filtros, tarjetas y la cifra de plataformas).

**`lib/patterns.ts`**

- **Repository** (interfaz) con dos implementaciones intercambiables (Strategy):
  - `SupabaseRepository`, para producción;
  - `SeedRepository`, que lee `content/seed.json` y se usa como respaldo si faltan las variables de entorno, si Supabase falla o si la tabla `profile` está vacía: así el build nunca se rompe.
- **Factory**: `EntityFactory.from(row)` crea la subclase correcta.
- **Strategy**: `ValidationRule` (`Required`, `Email`, `Url`, `MinLength`), combinada con Zod.
- **Observer**: `SectionObserver` envuelve `IntersectionObserver` para el indicador de sección del menú.

**`lib/structures.ts`**

- `Trie`: buscador de la tabla del admin.
- `CircularQueue<T>`: reservada para el carrusel o marquesina de la fase de animaciones avanzadas.
- `TechIndex`, un `Map<string, Set<T>>` con la función que da las etiquetas de cada elemento: filtro de proyectos por tipo, con contador.
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

Un componente por sección, cada uno con su `id`. `SECTIONS` (en `components/ui/Section.tsx`) define el orden, las anclas, el índice "01 / 08" y los enlaces del footer.

1. **Intro** (solo la primera visita de la sesión): cortina `ink` con el monograma, el nombre y una barra que se llena; luego sube y el hero entra escalonado. Botón "Saltar intro" y enlace "Saltar al contenido". Funciona con CSS aunque no haya JS; se omite con reduced motion o con las animaciones apagadas.
2. **Menú fijo**: monograma "DI", anclas con subrayado `rust` en la sección actual, indicador "01 / 08", interruptor "Pausar animaciones / Activar animaciones" (`aria-pressed`), "Descargar CV" y, por debajo de 1280 px, menú a pantalla completa (foco atrapado, `Esc` para cerrar). Enlace "Saltar al contenido" al inicio del documento.
3. **Hero** (`#inicio`): nombre grande en Fraunces (apellido en cursiva `rust`), rol y meta, frase corta, "Ver proyectos" y "Descargar CV", ubicación y mi foto real (`daniel-sin-hora.webp`, sin filtros) en un marco de papel con mi nombre completo en una etiqueta `marigold`.
4. **Cifras clave** (`#cifras`): proyectos publicados, plataformas (tipos de proyecto distintos) y tecnologías del stack, todo leído de los datos.
5. **Sobre mí** (`#sobre-mi`): `profile.about`, foto, datos rápidos (ubicación, estudio, meta) y el stack agrupado por categoría desde `skills`. Sin niveles, porcentajes ni barras.
6. **Proyectos** (`#proyectos`): filtros por tipo con contador, tarjetas con portada (captura o espacio limpio con tipo, periodo y nombre), insignias "Destacado" y "Colaboración", tecnologías, "Código" + la acción de su tipo y el detalle en un modal (problema, solución, mi rol, aprendizajes, galería y enlaces extra).
7. **Testimonios** (`#testimonios`): 3 tarjetas con avatar (foto o iniciales), nombre, cargo y texto.
8. **Experiencia** (`#experiencia`): pestañas "Académica" y "Laboral" (con contador y flechas del teclado) sobre una línea de tiempo.
9. **Más allá del código** (`#mas-alla-del-codigo`): galería en mosaico con un mosaico por gusto (icono propio, título y nota; enlace a la playlist si existe).
10. **Contacto** (`#contacto`): correo con botón copiar, GitHub, LinkedIn y formulario con validación en vivo (las mismas reglas que el servidor), contador de caracteres por campo, honeypot, límite de envíos y confirmación.
11. **Footer**: nombre, rol y ubicación, enlaces rápidos, redes, "© {año} Ivan Daniel Igua Benavides", "Hecho con Next.js + Tailwind" y "Volver arriba".

---

## 7. Movimiento

**Fase actual (base):**

- `Reveal`: entrada con opacidad y desplazamiento de 24 px al entrar en pantalla, escalonada 70 ms por elemento.
- Scroll suave con **Lenis** (las anclas descuentan la altura del menú).
- Hover cuidado: botones que suben 2 px y mueven su icono, tarjetas que se elevan con `shadow-lift`, subrayados que crecen.
- Transición intro → página: la cortina sube y el hero entra escalonado detrás.
- Interruptor "Pausar / Activar animaciones" (guardado en `localStorage`): activadas por defecto salvo con `prefers-reduced-motion`; apagado detiene Motion (`MotionConfig`), Lenis y las animaciones CSS.
- `prefers-reduced-motion`: mismo efecto que el interruptor apagado.
- Tiempos: 150 ms en hover, 300 ms en menús y 600 ms en entradas. Easing `cubic-bezier(0.16, 1, 0.3, 1)`.

**Fase 4 · Parte 1 (luz, color, botones y hero):**

- `Glow`: luz de neón detrás de la foto del hero (capas radiales `rust`, `terracotta`, `coral` y `amber` que se desplazan y se mezclan en ciclos de 13 a 19 s, solo con `transform` y `opacity`). Proyectos y "Más allá del código" llevan una versión tenue.
- `TiltPhoto`: la foto se inclina en 3D hacia el cursor, con un brillo que lo sigue y una sombra que se desplaza al lado contrario. En pantallas táctiles, una oscilación suave.
- `Ambient`: luz cálida que sigue al cursor en escritorio, origen del relleno de los botones y atracción magnética.
- `Marquee`: franja tipo anuncio LED bajo el hero ("DESARROLLADOR FULL STACK"), sin saltos, que frena al pasar el cursor y se detiene con el interruptor.
- Botones: el fondo se rellena desde el lado por donde entra el cursor, el icono se desplaza, cruza un destello, los principales son magnéticos, los secundarios tienen borde con brillo y el foco de teclado es grueso y visible.
- Hero: el nombre entra letra por letra con máscara, "Igua" se dibuja con un trazo y un subrayado, y el rol pasa de borroso a nítido (una copia difuminada con `text-shadow` que se desvanece). En móvil la foto va arriba, más pequeña.
- `SectionCurtain`: al navegar desde el menú, una cortina `rust` con "04 — Proyectos" cubre la pantalla, salta a la sección y se levanta (≈ 800 ms, máximo 900). Se salta con clic o `Esc` y mueve el foco a la sección.
- Sin animaciones (interruptor o `prefers-reduced-motion`), todo queda visible y quieto: cada ciclo de luz empieza y termina en reposo.

**Fase 4 · Parte 2:** cifras, títulos, stack, proyectos, testimonios, experiencia, contacto, barra de progreso y cursor.

---

## 8. Calidad

- **TypeScript `strict`**; `lint` y `build` limpios.
- **SEO**: metadata completa e `app/icon.svg` con el monograma "DI". Imagen OG con `next/og`: pendiente.
- **Responsive**: revisa 390, 768, 1440 y 1920 px, sin solapamientos, recortes ni scroll horizontal y con distancias equilibradas.
- **README.md**: stack, cómo correrlo, estructura, configuración del admin y despliegue.

---

## 9. Lo que falta (déjalo editable desde el admin)

- Demo de Luma (`liveUrl`).
- El proyecto web del restaurante de Diana Jojoa: nombre, URL y año. Ya está como borrador en `content/seed.json`.
- `public/cv.pdf`: lo subo yo desde el admin.

---

## 10. Fases

1. **Estructura nueva "Papel técnico"** (esta fase): tokens y fuentes, intro, menú, todas las secciones, movimiento base, panel `/admin` con la nueva paleta, revisión en 390 / 768 / 1440 / 1920 px.
2. **Animaciones avanzadas**: efectos 3D, transiciones entre secciones y microinteracciones de mayor nivel, siempre con reduced motion y el interruptor.
3. **Pulido**: imagen OG, Lighthouse ≥ 95, README y guía de despliegue en Vercel.
