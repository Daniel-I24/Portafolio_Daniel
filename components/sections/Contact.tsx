"use client";

import { useReducedMotion } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import { sendMessage, type ContactField, type ContactState } from "@/app/actions";
import { Character } from "@/components/ui/Character";
import { SprayMist } from "@/components/ui/CharacterParts";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { IconName } from "@/lib/domain";
import { contactRules, runRules } from "@/lib/patterns";

const FIELDS: { name: ContactField; label: string; type: string; hint: string; max: number }[] = [
  { name: "name", label: "Nombre", type: "text", hint: "¿Cómo te llamas?", max: 80 },
  { name: "email", label: "Correo", type: "email", hint: "Para poder responderte.", max: 120 },
  { name: "message", label: "Mensaje", type: "textarea", hint: "Cuéntame tu idea, propuesta o pregunta.", max: 2000 },
];
const EMPTY: Record<ContactField, string> = { name: "", email: "", message: "" };
const inputClass = "mt-1 w-full border-[3px] border-ink bg-paper px-3 py-2 text-ink shadow-sticker-sm aria-invalid:border-spray-red";

interface ContactProps {
  email: string;
  socials: { label: string; url: string; icon: IconName }[];
}

export function Contact({ email, socials }: ContactProps) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [copied, setCopied] = useState(false);
  const sent = state.status === "ok";
  const reduced = useReducedMotion();

  useEffect(() => {
    if (state.status !== "ok") return;
    setValues(EMPTY);
    setTouched({});
  }, [state]);

  const errorFor = (field: ContactField) =>
    (touched[field] && runRules(values[field], contactRules[field])) || (!touched[field] && state.errors?.[field]) || null;

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="texture-concrete scroll-mt-16 bg-concrete px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionTitle id="contacto-title" kicker="deja tu mensaje en el buzón" tone="mustard">Contacto</SectionTitle>
          <Reveal delay={0.1} className="mt-10 flex items-end gap-2">
            <Character pose="waving" title="Dani saludando" className="w-32 sm:w-40" />
            <svg aria-hidden viewBox="0 0 120 150" className="w-28 sm:w-32" fill="none" stroke="var(--color-ink)" strokeWidth={5} strokeLinejoin="round">
              <path d="M50 150V80" strokeWidth={10} />
              <path d="M12 82V40a28 28 0 0 1 56 0v42zM40 12h48a28 28 0 0 1 28 28v42H68" fill="var(--color-hoodie)" />
              <path d="M24 52h32" strokeWidth={6} />
              <path d="M98 30v-24h18v12H98" fill="var(--color-spray-red)" />
            </svg>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 bg-paper px-3 py-2 font-mono text-sm text-ink shadow-sticker">
                <Icon name="mail" size={20} />{email}
              </a>
              <button type="button" onClick={copy} className="border-[3px] border-ink bg-mustard px-3 py-1.5 font-marker text-ink shadow-sticker-sm">
                {copied ? "¡Copiado!" : "Copiar correo"}
              </button>
              <span className="sr-only" aria-live="polite">{copied ? "Correo copiado" : ""}</span>
            </div>
            <ul className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <li key={social.url}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 font-extrabold uppercase text-ink shadow-sticker-sm hover:bg-mustard">
                    <Icon name={social.icon} size={20} />{social.label}<span className="sr-only"> (abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <form action={action} className="relative -rotate-1 border-[3px] border-ink bg-asphalt p-6 shadow-sticker-lg sm:p-8" aria-describedby="contact-status">
            <div aria-hidden className="absolute -left-[9999px]">
              <label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            {FIELDS.map((field) => {
              const error = errorFor(field.name);
              const props = {
                id: `contact-${field.name}`, name: field.name, required: true, maxLength: field.max, value: values[field.name],
                "aria-invalid": Boolean(error), "aria-describedby": `contact-${field.name}-help`,
                onChange: (event: { target: { value: string } }) => setValues((v) => ({ ...v, [field.name]: event.target.value })),
                onBlur: () => setTouched((t) => ({ ...t, [field.name]: true })),
              };
              return (
                <div key={field.name} className="mb-5">
                  <label htmlFor={props.id} className="font-marker text-lg text-paper">{field.label}</label>
                  {field.type === "textarea"
                    ? <textarea {...props} rows={5} className={inputClass} />
                    : <input {...props} type={field.type} autoComplete={field.name} className={inputClass} />}
                  <p id={`contact-${field.name}-help`} className={`mt-1 text-sm ${error ? "font-semibold text-mustard" : "text-cement"}`}>{error || field.hint}</p>
                </div>
              );
            })}
            <button type="submit" disabled={pending} className="inline-flex items-center gap-3 border-[3px] border-ink bg-hoodie px-5 py-3 font-extrabold uppercase text-ink shadow-sticker transition-transform duration-150 hover:-translate-y-0.5 active:scale-y-90 disabled:opacity-70">
              <Icon name="spray" size={22} />{pending ? "Pintando…" : "Enviar mensaje"}
            </button>
            <div id="contact-status" role="status" className="relative mt-5 min-h-8">
              {sent && (
                <p className="relative inline-flex items-center gap-2 -rotate-2 bg-slime px-3 py-1 font-marker text-lg text-ink shadow-sticker-sm">
                  {state.message}
                  <svg aria-hidden viewBox="0 0 60 40" className="absolute -right-14 top-0 w-14 overflow-visible"><SprayMist at={[0, 20]} live={!reduced} color="slime" /></svg>
                </p>
              )}
              {state.status === "error" && <p className="font-semibold text-mustard">{state.message}</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
