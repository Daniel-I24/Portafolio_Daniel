import { revalidatePath } from "next/cache";
import Link from "next/link";
import { EntityForm } from "@/components/admin/EntityForm";
import { EntityTable } from "@/components/admin/EntityTable";
import { GithubImport } from "@/components/admin/GithubImport";
import { Icon } from "@/components/ui/Icon";
import type { EntityTable as Table, MessageData } from "@/lib/schemas";
import { toCamel } from "@/lib/structures";
import { serverClient } from "@/lib/supabase";
import { deleteMessage, importSeed, markMessage, signOut } from "./actions";

const TABS = [
  { id: "profile", label: "Perfil" }, { id: "projects", label: "Proyectos" }, { id: "testimonials", label: "Testimonios" },
  { id: "experience", label: "Experiencia" }, { id: "skills", label: "Habilidades" }, { id: "interests", label: "Gustos" },
  { id: "messages", label: "Mensajes" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const smallButton = "border-2 border-ink bg-paper px-2 py-1 font-mono text-xs text-ink hover:bg-mustard";

// Form-friendly wrappers: <form action> needs void-returning server actions.
async function seedAction() { "use server"; await importSeed(); revalidatePath("/admin"); }
async function toggleRead(id: string, read: boolean) { "use server"; await markMessage(id, read); revalidatePath("/admin"); }
async function removeMessage(id: string) { "use server"; await deleteMessage(id); revalidatePath("/admin"); }

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const requested = (await searchParams).tab;
  const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : "projects";
  const db = await serverClient();
  // The admin session passes RLS, so drafts and messages are included.
  const query = tab === "profile" ? db.from("profile").select("*").limit(1)
    : tab === "messages" ? db.from("messages").select("*").order("created_at", { ascending: false })
    : db.from(tab).select("*").order("order");
  const { data, error } = await query;
  const rows = (data ?? []).map(toCamel);
  const { count } = await db.from("projects").select("id", { count: "exact", head: true });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-spray text-4xl text-hoodie">Panel de Dani</h1>
        <div className="flex gap-3">
          <Link href="/" className={smallButton}>Ver sitio</Link>
          <form action={signOut}><button type="submit" className={`${smallButton} inline-flex items-center gap-1`}><Icon name="logout" size={14} /> Salir</button></form>
        </div>
      </header>

      <nav aria-label="Secciones del panel" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.id} href={`/admin?tab=${t.id}`} aria-current={t.id === tab ? "page" : undefined}
            className={`border-[3px] border-ink px-3 py-1.5 font-marker ${t.id === tab ? "bg-denim text-paper" : "bg-paper text-ink hover:bg-mustard"}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {!count && (
        <form action={seedAction} className="mt-6 border-l-4 border-mustard bg-ink p-4">
          <p>La base está vacía. ¿Importo el contenido inicial de <code className="font-mono text-mustard">content/seed.json</code>?</p>
          <button type="submit" className={`${smallButton} mt-3`}>Importar seed.json</button>
        </form>
      )}
      {error && <p role="alert" className="mt-6 border-l-4 border-spray-red pl-3">No se pudieron leer los datos. ¿Corriste la migración?</p>}

      <section className="mt-8 space-y-6">
        {tab === "profile" && (
          <div className="bg-paper p-6 text-ink"><EntityForm table="profile" initial={rows[0] ?? {}} /></div>
        )}
        {tab === "projects" && <GithubImport imported={rows.map((row) => String(row.githubRepo ?? "")).filter(Boolean)} />}
        {tab !== "profile" && tab !== "messages" && (
          <EntityTable table={tab as Table} rows={rows as Parameters<typeof EntityTable>[0]["rows"]} />
        )}
        {tab === "messages" && <Messages messages={rows as MessageData[]} />}
      </section>
    </main>
  );
}

function Messages({ messages }: { messages: MessageData[] }) {
  if (messages.length === 0) return <p className="font-marker">Todavía no hay mensajes.</p>;
  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li key={message.id} className={`border-[3px] border-ink p-4 text-ink ${message.read ? "bg-cement" : "bg-paper"}`}>
          <p className="font-semibold">
            {message.name} · <a href={`mailto:${message.email}`} className="underline">{message.email}</a>
            {!message.read && <span className="ml-2 border-2 border-spray-red bg-ink px-1.5 font-mono text-xs text-paper">nuevo</span>}
          </p>
          <p className="font-mono text-xs">{new Date(message.createdAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
          <p className="mt-2 whitespace-pre-line">{message.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <form action={toggleRead.bind(null, message.id, !message.read)}>
              <button type="submit" className={smallButton}>{message.read ? "Marcar como no leído" : "Marcar como leído"}</button>
            </form>
            <details className="text-sm">
              <summary className={`${smallButton} cursor-pointer list-none`}>Eliminar</summary>
              <form action={removeMessage.bind(null, message.id)} className="mt-2 flex items-center gap-2">
                ¿Seguro? <button type="submit" className="border-2 border-spray-red bg-ink px-2 py-1 text-paper">Sí, eliminar</button>
              </form>
            </details>
          </div>
        </li>
      ))}
    </ul>
  );
}
