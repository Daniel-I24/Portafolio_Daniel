"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { contactSchema, getPortfolio, hasSupabase, type ContactInput } from "@/lib/patterns";

export type ContactField = "name" | "email" | "message";
export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
};

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;
// Per-instance memory: enough to stop bursts from one visitor. Supabase RLS still guards the table.
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  const limited = recent.length >= MAX_PER_WINDOW;
  hits.set(key, limited ? recent : [...recent, now]);
  return limited;
}

async function store({ name, email, message }: ContactInput): Promise<boolean> {
  if (!hasSupabase()) return false;
  const { publicClient } = await import("@/lib/supabase");
  const { error } = await publicClient().from("messages").insert({ name, email, body: message });
  return !error;
}

async function notify({ name, email, message }: ContactInput): Promise<boolean> {
  const subject = `Portafolio: mensaje de ${name}`;
  if (process.env.RESEND_API_KEY) {
    const { profile } = await getPortfolio();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM || "Portafolio <onboarding@resend.dev>", to: profile.email, reply_to: email, subject, text: message }),
    });
    return response.ok;
  }
  if (process.env.FORMSPREE_ID) {
    const response = await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, _subject: subject }),
    });
    return response.ok;
  }
  return false;
}

/** Public contact form action: honeypot, Zod validation, rate limit, then store + email. */
export async function sendMessage(_previous: ContactState, form: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(form);
  // Bots fill the hidden field: pretend success so they do not retry.
  if (raw.website) return { status: "ok", message: "¡Mensaje enviado!" };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    const errors = Object.fromEntries(Object.entries(fields).map(([key, list]) => [key, list?.[0]]));
    return { status: "error", message: "Revisa los campos marcados.", errors };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return { status: "error", message: "Enviaste varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo." };
  }

  try {
    const results = await Promise.all([store(parsed.data), notify(parsed.data)]);
    if (results.some(Boolean)) return { status: "ok", message: "¡Mensaje enviado!" };
  } catch {
    // Fall through: never expose provider errors to the visitor.
  }
  return { status: "error", message: "No pude enviar el mensaje ahora mismo. Escríbeme directo al correo de abajo." };
}
