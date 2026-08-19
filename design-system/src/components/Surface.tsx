import type { ReactNode } from 'react';

export interface SurfaceProps {
  /** The ground the content sits on: 'dark' is the theater (page black),
   *  'paper' is the classroom, 'white' hosts borderless imagery. */
  ground?: 'dark' | 'paper' | 'white';
  /** Add the standard section padding inside the surface. */
  padded?: boolean;
  children?: ReactNode;
}

/**
 * The DBI page ground. Every DBI design wraps its content in a Surface —
 * it carries the background, text color, body typography, and the token
 * context every other component assumes. Alternate dark and paper/white
 * surfaces to build a page, exactly like the site does.
 */
export function Surface({ ground = 'dark', padded = false, children }: SurfaceProps) {
  return (
    <div className={`dbi-surface dbi-surface--${ground}${padded ? ' dbi-surface--padded' : ''}`}>
      {children}
    </div>
  );
}
