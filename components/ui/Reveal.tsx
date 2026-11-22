import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a group: later items travel a little further, so a row arrives staggered. */
  index?: number;
  as?: "div" | "li";
}

/**
 * Scroll-linked entrance and exit, both ways (CSS `animation-timeline: view()`, see `.reveal` in globals.css).
 * No JavaScript: it renders on the server and the browser drives it on the compositor. Browsers without
 * scroll timelines, reduced motion and the animations switch all get the plain, visible element.
 */
export function Reveal({ children, className = "", index = 0, as: Tag = "div" }: RevealProps) {
  return (
    <Tag className={`reveal ${className}`} style={{ "--i": Math.min(index, 6) } as CSSProperties}>
      {children}
    </Tag>
  );
}
