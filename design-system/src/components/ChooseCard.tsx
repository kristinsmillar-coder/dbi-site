import type { ReactNode } from 'react';

export interface ChooseCardProps {
  /** Small mono label naming the destination ("The Flagship Program"). */
  label: string;
  /** Serif card title ("See the whole year"). */
  title: ReactNode;
  /** One-sentence description. */
  description: ReactNode;
  href?: string;
  /** Marks the card for the page you're already on: gold border,
   *  "YOU'RE HERE" instead of the arrow, not a link. */
  current?: boolean;
}

/**
 * A door: DBI's navigation card (label · serif title · description · red
 * arrow). Bordered, square, dark; hover turns the border red. Compose
 * inside a ChooseGrid.
 */
export function ChooseCard({ label, title, description, href, current }: ChooseCardProps) {
  const inner = (
    <>
      <p className="when">{label}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {current ? (
        <span className="choose-go here">You&rsquo;re here</span>
      ) : (
        <span className="choose-go" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  if (current) {
    return (
      <div className="choose-card current" aria-current="page">
        {inner}
      </div>
    );
  }
  return (
    <a className="choose-card" href={href ?? '#'}>
      {inner}
    </a>
  );
}

export interface ChooseGridProps {
  /** false (default): side-by-side door cards. true: full-width rows with
   *  shared hairline borders (the "where to next" list form). */
  rows?: boolean;
  children?: ReactNode;
}

/** Layout for ChooseCards — a card grid, or compact full-width rows. */
export function ChooseGrid({ rows = false, children }: ChooseGridProps) {
  return <div className={rows ? 'choose-grid next-grid' : 'choose-grid'}>{children}</div>;
}
