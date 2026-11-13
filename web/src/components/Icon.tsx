import type { ReactNode } from 'react';

/** Iconos propios (SVG en línea, sin dependencias). Siempre decorativos: el texto va al lado. */
const PATHS: Record<string, ReactNode> = {
  learn: (
    <>
      <path d="M2.5 5h6a3.5 3.5 0 0 1 3.5 3.5V20a2.5 2.5 0 0 0-2.5-2.5h-7z" />
      <path d="M21.5 5h-6A3.5 3.5 0 0 0 12 8.5V20a2.5 2.5 0 0 1 2.5-2.5h7z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  play: <path d="M8.5 5.5v13l10-6.5z" fill="currentColor" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  star: <path d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.9z" />,
  flame: <path d="M12 2.5c.6 3.4 5.5 5.6 5.5 10.6a5.5 5.5 0 0 1-11 0c0-2.2 1-3.6 2.2-4.8.1 1.9.9 2.9 1.9 3.2C10.3 8.3 10.5 5 12 2.5z" />,
  medal: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 10.2L6.5 3h4l1.5 4.2M15.5 10.2L17.5 3h-4" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 3.5h9v6a4.5 4.5 0 0 1-9 0z" />
      <path d="M7.5 5.5H4.5v1.5a3 3 0 0 0 3 3M16.5 5.5h3v1.5a3 3 0 0 1-3 3M12 14v4M8.5 20.5h7" />
    </>
  ),
  repeat: (
    <>
      <path d="M20 11a8 8 0 0 0-14-4M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14 4M20 20v-4h-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1 1.3 1 2.2h5.2c0-.9.3-1.6 1-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5h-19z" />
      <path d="M12 10v4.5M12 17.4v.1" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
      <path d="M2.5 9h19M12 9v11.5M12 9C9.5 9 8 7.8 8 6.4S9 4.5 10.2 4.5C11.5 4.5 12 6.5 12 9zm0 0c2.5 0 4-1.2 4-2.6S15 4.5 13.8 4.5C12.5 4.5 12 6.5 12 9z" />
    </>
  ),
  sparkle: <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  shop: (
    <>
      <path d="M5 8.5h14l-1 11.5H6z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 2.7v6c0 4.6-3.1 7.9-7.5 9.3-4.4-1.4-7.5-4.7-7.5-9.3v-6z" />
      <path d="M12 9c.3 1.6 2.4 2.5 2.4 4.6a2.4 2.4 0 0 1-4.8 0c0-1 .5-1.6 1-2.1.1.8.4 1.2.8 1.3.1-1.1.1-2.6.6-3.8z" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, filled = false, className }: { name: IconName; size?: number; filled?: boolean; className?: string }) {
  return (
    <svg
      className={`icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** Estado de carga: texto accesible + esqueleto discreto. */
export function Loading({ label }: { label: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
      <div className="skeleton-stack" aria-hidden="true">
        <span className="skeleton" style={{ width: '70%' }} />
        <span className="skeleton" style={{ width: '90%' }} />
        <span className="skeleton" style={{ width: '55%' }} />
      </div>
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div className="form-error error-box" role="alert">
      <Icon name="alert" size={20} />
      <span>{children}</span>
    </div>
  );
}
