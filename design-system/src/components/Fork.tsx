import type { ReactNode } from 'react';

export interface ForkProps {
  /** Border accent: 'gold' on program pages, 'red' on the Flagship. */
  tone?: 'gold' | 'red';
  children?: ReactNode;
}

/**
 * The bordered aside that hands a reader the other path ("Rather start
 * smaller? …"). Dim small text against a 3px accent rule; links inside
 * read in the surface's text color, gold <strong> carries the payoff line.
 */
export function Fork({ tone = 'gold', children }: ForkProps) {
  return (
    <div className={tone === 'red' ? 'fork fork--red' : 'fork'}>
      <p>{children}</p>
    </div>
  );
}
