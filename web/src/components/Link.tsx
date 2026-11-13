import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { isPlainClick, navigate } from '../router';

/** Enlace interno: href limpio ("/aprender") y navegación sin recarga; ctrl/cmd/shift/clic medio/target abren como siempre. */
export function Link({ href, onClick, target, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (!isPlainClick(e, target)) return;
    e.preventDefault();
    navigate(href);
  }
  return <a href={href} target={target} onClick={handle} {...rest} />;
}
