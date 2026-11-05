"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { githubPrefill, githubRepos, syncGithub } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { RepoSummary } from "@/lib/github";
import type { ProjectData } from "@/lib/schemas";
import { EntityForm } from "./EntityForm";

const buttonClass = "inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 font-extrabold uppercase text-ink shadow-sticker-sm hover:bg-mustard disabled:opacity-60";

/** Lists own repos (and, with a token, shared ones) or takes any pasted repo URL, then prefills a project. */
export function GithubImport({ imported }: { imported: string[] }) {
  const router = useRouter();
  const [repos, setRepos] = useState<RepoSummary[] | null>(null);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<Partial<ProjectData> | null>(null);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const known = new Set(imported.map((name) => name.toLowerCase()));

  const load = () => startTransition(async () => {
    const list = await githubRepos();
    setRepos(list);
    setStatus(list.length ? "" : "No pude leer los repos. Revisa GITHUB_TOKEN o intenta de nuevo.");
  });
  const prefill = (value: string) => startTransition(async () => {
    const result = await githubPrefill(value);
    setStatus(result.message);
    if (result.ok && result.data) setDraft(result.data);
  });
  const sync = () => startTransition(async () => {
    const result = await syncGithub();
    setStatus(result.message);
    if (result.ok) router.refresh();
  });

  return (
    <section aria-labelledby="github-title" className="border-[3px] border-dashed border-cement p-4">
      <h2 id="github-title" className="flex items-center gap-2 font-marker text-xl"><Icon name="github" size={22} /> Importar desde GitHub</h2>
      <form action={() => prefill(input)} className="mt-3 flex flex-wrap gap-3">
        <label className="grow">
          <span className="sr-only">URL del repositorio</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} required placeholder="https://github.com/usuario/repo (también de colaboraciones)"
            className="w-full border-[3px] border-ink bg-paper px-3 py-2 text-ink" />
        </label>
        <button type="submit" disabled={pending} className={buttonClass}><Icon name="download" size={18} /> Importar</button>
        <button type="button" onClick={load} disabled={pending} className={buttonClass}>Mis repos</button>
        <button type="button" onClick={sync} disabled={pending} className={buttonClass}>Sincronizar</button>
      </form>
      <p role="status" className="mt-2 min-h-6 font-mono text-sm text-mustard">{pending ? "Consultando GitHub…" : status}</p>

      {repos && repos.length > 0 && (
        <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto">
          {repos.map((repo) => (
            <li key={repo.fullName} className="flex flex-wrap items-center gap-3 border-b border-concrete py-2">
              <span className="grow">
                <span className="font-semibold">{repo.fullName}</span>
                {repo.collaboration && <span className="ml-2 bg-denim px-1.5 font-mono text-sm text-paper">colaboración</span>}
                <span className="block text-sm text-cement">{repo.description || "Sin descripción"} · ★ {repo.stars}</span>
              </span>
              {known.has(repo.fullName.toLowerCase())
                ? <span className="font-mono text-sm text-cement">ya importado</span>
                : <button type="button" onClick={() => prefill(repo.fullName)} disabled={pending} className={buttonClass}>Usar</button>}
            </li>
          ))}
        </ul>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={`Importar: ${draft?.title ?? ""}`}>
        {draft && (
          <EntityForm key={draft.githubRepo} table="projects" initial={{ ...draft, published: false }}
            onDone={() => { setDraft(null); setInput(""); router.refresh(); }} />
        )}
      </Modal>
    </section>
  );
}
