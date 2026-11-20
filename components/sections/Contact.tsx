import { ButtonLink } from "@/components/ui/Button";
import { ContactForm, CopyEmail } from "@/components/ui/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { IconName } from "@/lib/domain";

interface ContactProps {
  email: string;
  socials: { label: string; url: string; icon: IconName }[];
}

/** Direct channels (email with copy, GitHub, LinkedIn) next to the validated form. */
export function Contact({ email, socials }: ContactProps) {
  return (
    <Section id="contacto" title="Hablemos" lead="¿Tienes un proyecto, una práctica o una pregunta? Escríbeme y te respondo." surface="card">
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal className="space-y-10">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-muted">Correo</h3>
            <a href={`mailto:${email}`} className="mt-3 inline-flex items-center gap-3 break-all font-display text-lg font-semibold underline decoration-rust/40 decoration-2 underline-offset-[6px] transition-colors duration-150 hover:decoration-rust sm:text-xl">
              <Icon name="mail" size={24} className="shrink-0 text-rust" />
              {email}
            </a>
            <div className="mt-4"><CopyEmail email={email} /></div>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-muted">Redes</h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {socials.map((social) => (
                <li key={social.url}>
                  <ButtonLink href={social.url} variant="outline" size="sm" className="gap-2.5">
                    <span className="inline-flex items-center gap-2"><Icon name={social.icon} size={18} />{social.label}</span>
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal index={1}><ContactForm /></Reveal>
      </div>
    </Section>
  );
}
