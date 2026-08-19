import type { ReactNode } from 'react';

export interface EyebrowProps {
  /** 'red' (default) marks the school; 'gold' marks award/celebration
   *  sections. On light surfaces gold automatically deepens to gold-ink. */
  tone?: 'red' | 'gold';
  children?: ReactNode;
}

/**
 * The small mono uppercase kicker that opens every DBI section
 * ("APPLICATION SEASON · FALL 2026"). One per section, above the heading.
 */
export function Eyebrow({ tone = 'red', children }: EyebrowProps) {
  return <p className={tone === 'gold' ? 'eyebrow eyebrow--gold' : 'eyebrow'}>{children}</p>;
}

export interface SectionHeaderProps {
  /** Kicker text above the title. */
  eyebrow?: ReactNode;
  eyebrowTone?: 'red' | 'gold';
  /** The serif display heading. Use <br/> for deliberate line breaks. */
  title: ReactNode;
  /** Optional larger intro paragraph under the title, capped at the
   *  site's reading measure. */
  lede?: ReactNode;
}

/**
 * The standard DBI section opener: eyebrow, Young Serif display heading,
 * optional lede. This is how every section on the site begins.
 */
export function SectionHeader({ eyebrow, eyebrowTone = 'red', title, lede }: SectionHeaderProps) {
  return (
    <>
      {eyebrow != null && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {lede != null && <p className="lede narrow">{lede}</p>}
    </>
  );
}

export interface PrizeProps {
  children?: ReactNode;
}

/**
 * Gold inline emphasis reserved for the award — prize money, the win.
 * Never use gold text for anything that isn't an award.
 */
export function Prize({ children }: PrizeProps) {
  return <strong className="prize">{children}</strong>;
}
