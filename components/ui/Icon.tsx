import type { IconName } from "@/lib/domain";

/** Own line icons on a 24×24 grid, one stroke weight, round caps. Circles are drawn as two arcs. */
const ring = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0 ${r} ${r} 0 1 0 ${-r * 2} 0`;

const PATHS: Record<IconName, string> = {
  github:
    "M9 19.5c-4.2 1.4-4.2-2-6-2.5M15 21.5V18c0-1 .1-1.6-.6-2.3 2.9-.3 5.8-1.4 5.8-6.3a4.9 4.9 0 0 0-1.4-3.4 4.5 4.5 0 0 0-.1-3.4s-1.1-.3-3.6 1.3a12.4 12.4 0 0 0-6.4 0C6.3 2.3 5.2 2.6 5.2 2.6a4.5 4.5 0 0 0-.1 3.4 4.9 4.9 0 0 0-1.4 3.4c0 4.9 2.9 6 5.8 6.3-.6.6-.7 1.3-.6 2.2v3.6",
  linkedin: `M4.5 9.5h3v10h-3zM10.5 19.5v-10h3v1.6c.7-1.1 1.8-1.8 3.3-1.8 2.4 0 3.7 1.6 3.7 4.5v5.7h-3v-5.3c0-1.4-.6-2.1-1.7-2.1s-2.3.8-2.3 2.4v5z${ring(6, 5.5, 1.6)}`,
  mail: "M3.5 6h17v12h-17zM3.5 7l8.5 6.5L20.5 7",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  apk: "M7 3h10v18H7zM11 18h2M12 6.5v6.5M9.5 10.5 12 13l2.5-2.5",
  arrow: "M4 12h16M14 6l6 6-6 6",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  copy: "M8 8h12v12H8zM4 16V4h12",
  check: "M5 12.5l4.5 4.5L19 7",
  pin: `M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z${ring(12, 9.5, 2.5)}`,
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  pause: "M8 5v14M16 5v14",
  play: "M7 5l12 7-12 7z",
  volley: `${ring(12, 12, 9)}M12 3c-1.5 3.5-1.2 6.4 0 9M12 12c3.3-.4 6.2.6 8.5 2.6M12 12c-2.3 2.4-5.3 3.6-8.6 3.6`,
  football: `${ring(12, 12, 9)}M12 8l3.4 2.5-1.3 4h-4.2l-1.3-4zM12 3v5M15.4 10.5l4.7-1.5M14.1 14.5l2.8 4.1M9.9 14.5l-2.8 4.1M8.6 10.5 3.9 9`,
  moto: `${ring(6, 17, 3)}${ring(18, 17, 3)}M6 17l3.5-5.5H15l3 5.5M9 17h6l1-3.5M10 11.5V9h4.5M15 11.5l-1.5-4.5H17`,
  pool: `${ring(12, 12, 8)}${ring(12, 10.5, 2)}${ring(12, 15, 2.3)}`,
  music: `M9 18V5l11-2v13M9 9l11-2${ring(6, 18, 3)}${ring(17, 16, 3)}`,
  dumbbell: "M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11",
  shield: "M12 3l8 3v5.5c0 4.6-3.4 8.3-8 9.5-4.6-1.2-8-4.9-8-9.5V6zM8.5 12l2.5 2.5 4.5-5",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  edit: "M4 20l1-4L16 5l3 3L8 19zM14 7l3 3",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  plus: "M12 5v14M5 12h14",
  logout: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Accessible name; when omitted the icon is decorative and hidden from assistive tech. */
  label?: string;
}

export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
