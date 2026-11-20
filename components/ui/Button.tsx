import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { IconName } from "@/lib/domain";
import { Icon } from "./Icon";

const VARIANTS = {
  solid: "bg-rust text-card hover:bg-rust-deep hover:shadow-lift",
  outline: "border border-ink text-ink hover:bg-ink hover:text-card",
  quiet: "border border-line bg-card text-ink hover:border-ink",
};

const SIZES = { md: "gap-2.5 px-6 py-3.5 text-base", sm: "gap-2 px-4 py-2.5 text-sm" };

export type ButtonVariant = keyof typeof VARIANTS;

/** Pill button styles shared by links, form buttons and the CV button. */
export const buttonClass = (variant: ButtonVariant = "solid", size: keyof typeof SIZES = "md") =>
  `group inline-flex items-center justify-center rounded-full font-semibold transition-[background-color,color,border-color,box-shadow,translate,scale] duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 ${VARIANTS[variant]} ${SIZES[size]}`;

/** Icon that nudges in its direction on hover. */
export const ButtonIcon = ({ name }: { name: IconName }) => (
  <Icon name={name} size={18} className={`shrink-0 transition-transform duration-150 ${name === "download" ? "group-hover:translate-y-0.5" : "group-hover:translate-x-0.5"}`} />
);

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

/** Link styled as a button. External URLs open in a new tab with noopener and a hidden notice. */
export function ButtonLink({ href, icon, variant, size, children, className = "", ...rest }: ButtonLinkProps) {
  const external = /^https?:/.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest} className={`${buttonClass(variant, size)} ${className}`}>
      <span>{children}</span>
      {icon && <ButtonIcon name={icon} />}
      {external && <span className="sr-only"> (abre en una pestaña nueva)</span>}
    </a>
  );
}
