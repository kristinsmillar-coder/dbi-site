import type { ReactNode } from 'react';

export interface QuoteFigureProps {
  /** The quote body, big serif. Wrap the key phrase in <mark> to set it
   *  gold (red on light surfaces via the light prop). */
  children?: ReactNode;
  /** Mono uppercase attribution ("A DBI student, on session one"). */
  caption: ReactNode;
  /** Set on paper/white surfaces: the mark turns red, caption dims. */
  light?: boolean;
}

/**
 * A pull quote over a red top rule: large Young Serif with one gold-marked
 * phrase, mono attribution beneath. DBI quotes real students by role,
 * never by invented name.
 */
export function QuoteFigure({ children, caption, light = false }: QuoteFigureProps) {
  return (
    <figure className={light ? 'quote-figure light' : 'quote-figure'}>
      <blockquote>
        <p>{children}</p>
      </blockquote>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
