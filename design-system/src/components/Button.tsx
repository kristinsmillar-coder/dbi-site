import type { MouseEventHandler, ReactNode } from 'react';

export interface ButtonProps {
  /** 'primary' is Dons red — exactly one per screen. 'gold' is reserved for
   *  the award/secondary program. 'outline' is the quiet default. */
  variant?: 'primary' | 'gold' | 'outline';
  /** Renders an <a> when set, otherwise a <button>. */
  href?: string;
  /** Open the link in a new tab (external forms). */
  external?: boolean;
  onClick?: MouseEventHandler;
  children?: ReactNode;
}

/**
 * The DBI call-to-action. Mono uppercase, square corners, no radius, no
 * shadow. The red primary marks the single most important action on a
 * screen; everything else takes the outline.
 */
export function Button({ variant = 'outline', href, external, onClick, children }: ButtonProps) {
  const cls =
    variant === 'primary' ? 'btn primary' : variant === 'gold' ? 'btn primary gold' : 'btn';
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export interface ActionsProps {
  children?: ReactNode;
}

/** Horizontal row of Buttons with the site's standard gap and top margin. */
export function Actions({ children }: ActionsProps) {
  return <div className="actions">{children}</div>;
}
