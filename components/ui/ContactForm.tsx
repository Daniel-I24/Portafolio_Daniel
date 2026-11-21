"use client";

import { useActionState, useEffect, useState } from "react";
import { sendMessage, type ContactField, type ContactState } from "@/app/actions";
import { contactRules, runRules } from "@/lib/patterns";
import { buttonClass, ButtonIcon } from "./Button";
import { Icon } from "./Icon";

const FIELDS: { name: ContactField; label: string; type: string; hint: string; max: number }[] = [
  { name: "name", label: "Nombre", type: "text", hint: "¿Cómo te llamas?", max: 80 },
  { name: "email", label: "Correo", type: "email", hint: "Para poder responderte.", max: 120 },
  { name: "message", label: "Mensaje", type: "textarea", hint: "Cuéntame tu idea, propuesta o pregunta.", max: 2000 },
];
const EMPTY: Record<ContactField, string> = { name: "", email: "", message: "" };
const inputClass = "mt-2 w-full rounded-xl border border-line bg-abyss px-4 py-3 text-ice transition-colors duration-150 placeholder:text-mist hover:border-steel focus:border-steel focus:outline-none focus-visible:outline-2 focus-visible:outline-sky aria-invalid:border-sky";

/** Copies the email and confirms in place (and to screen readers). */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={copy} className={buttonClass("quiet", "sm")}>
      <Icon name={copied ? "check" : "copy"} size={18} className={copied ? "text-sky" : ""} />
      {copied ? "¡Copiado!" : "Copiar correo"}
      <span className="sr-only" aria-live="polite">{copied ? "Correo copiado al portapapeles" : ""}</span>
    </button>
  );
}

/** Live validation with the same Strategy rules the server action applies, character counters and a confirmation. */
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});

  useEffect(() => {
    if (state.status !== "ok") return;
    setValues(EMPTY);
    setTouched({});
  }, [state]);

  const errorFor = (field: ContactField) =>
    (touched[field] && runRules(values[field], contactRules[field])) || (!touched[field] && state.errors?.[field]) || null;

  return (
    <form action={action} noValidate aria-describedby="contact-status" className="rounded-3xl border border-line bg-deep p-6 sm:p-10">
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {FIELDS.map((field) => {
        const error = errorFor(field.name);
        const id = `contact-${field.name}`;
        const props = {
          id, name: field.name, required: true, maxLength: field.max, value: values[field.name],
          "aria-invalid": Boolean(error), "aria-describedby": `${id}-help ${id}-count`,
          onChange: (event: { target: { value: string } }) => setValues((v) => ({ ...v, [field.name]: event.target.value })),
          onBlur: () => setTouched((t) => ({ ...t, [field.name]: true })),
        };
        const used = values[field.name].length;
        return (
          <div key={field.name} className="mb-6">
            <label htmlFor={id} className="font-semibold">{field.label}</label>
            {field.type === "textarea"
              ? <textarea {...props} rows={6} className={`${inputClass} resize-y`} />
              : <input {...props} type={field.type} autoComplete={field.name} className={inputClass} />}
            <div className="mt-2 flex items-start justify-between gap-4 text-sm">
              <p id={`${id}-help`} className={error ? "font-semibold text-sky" : "text-mist"}>{error || field.hint}</p>
              <p id={`${id}-count`} className={`shrink-0 tabular-nums ${used > field.max * 0.9 ? "font-semibold text-sky" : "text-mist"}`}>
                {used} / {field.max}<span className="sr-only"> caracteres</span>
              </p>
            </div>
          </div>
        );
      })}

      <button type="submit" disabled={pending} data-magnetic className={buttonClass("solid")}>
        <span>{pending ? "Enviando…" : "Enviar mensaje"}</span>
        <ButtonIcon name="arrow" />
      </button>

      <div id="contact-status" role="status" className="mt-6 empty:hidden">
        {state.status === "ok" && (
          <p className="flex items-start gap-3 rounded-xl border border-sky bg-abyss p-4 text-sky animate-rise">
            <Icon name="check" size={22} className="mt-0.5 shrink-0" />
            <span><strong className="block">{state.message}</strong>Gracias por escribir: te responderé pronto a tu correo.</span>
          </p>
        )}
        {state.status === "error" && <p className="rounded-xl border border-sky bg-abyss p-4 font-semibold text-sky">{state.message}</p>}
      </div>
    </form>
  );
}
