import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { IconName } from "@/lib/domain";
import { Icon } from "./Icon";

/** Each variant sets its own surface and the `--fill` color that floods in from the cursor side. */
const VARIANTS = {
  solid: "bg-rust text-card [--fill:var(--color-rust-deep)] hover:shadow-glow",
  outline:
    "border-[1.5px] border-transparent text-ink [--fill:var(--color-ink)] [background:linear-gradient(var(--color-card),var(--color-card))_padding-box,linear-gradient(115deg,var(--color-rust),var(--color-coral),var(--color-amber),var(--color-terracotta))_border-box] hover:text-card hover:shadow-glow",
  quiet: "border border-line bg-card text-ink [--fill:var(--color-paper)] hover:border-ink",
};

const SIZES = { md: "gap-2.5 px-6 py-3.5 text-base", sm: "gap-2 px-4 py-2.5 text-sm" };

export type ButtonVariant = keyof typeof VARIANTS;

/**
 * One button language for the whole site (pointer effects wired in Ambient.tsx):
 * - `::before` is the fill: a circle that grows from --x/--y, the point where the cursor came in;
 * - `::after` is a sheen that crosses once on hover;
 * - --mx/--my move `[data-magnetic]` buttons slightly toward the cursor;
 * - keyboard focus gets a thick offset outline.
 */
export const buttonClass = (variant: ButtonVariant = "solid", size: keyof typeof SIZES = "md") =>
  [
    "btn group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
    "[transform:translate3d(var(--mx,0px),var(--my,0px),0)] transition-[color,box-shadow,border-color,transform,scale] duration-300 ease-(--ease-soft)",
    "before:pointer-events-none before:absolute before:top-(--y,50%) before:left-(--x,50%) before:-z-10 before:aspect-square before:w-[280%] before:-translate-1/2 before:scale-0 before:rounded-full before:bg-(--fill) before:transition-transform before:duration-500 before:ease-(--ease-soft) hover:before:scale-100",
    "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1/4 after:bg-linear-to-r after:from-transparent after:via-card/45 after:to-transparent after:opacity-0 hover:after:animate-sheen",
    "active:scale-[0.97] focus-visible:outline-[3px] focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-70",
    VARIANTS[variant],
    SIZES[size],
  ].join(" ");

/** Icon that slides in its direction on hover. */
export const ButtonIcon = ({ name }: { name: IconName }) => (
  <Icon name={name} size={18} className={`shrink-0 transition-transform duration-300 ease-(--ease-soft) ${name === "download" ? "group-hover:translate-y-1" : "group-hover:translate-x-1.5"}`} />
);

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

/** Link styled as a button. Large solid ones are magnetic. External URLs open in a new tab with a hidden notice. */
export function ButtonLink({ href, icon, variant = "solid", size = "md", children, className = "", ...rest }: ButtonLinkProps) {
  const external = /^https?:/.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}
      data-magnetic={variant === "solid" && size === "md" ? "" : undefined} className={`${buttonClass(variant, size)} ${className}`}>
      <span>{children}</span>
      {icon && <ButtonIcon name={icon} />}
      {external && <span className="sr-only"> (abre en una pestaña nueva)</span>}
    </a>
  );
}
