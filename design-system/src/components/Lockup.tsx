import { LOCKUP_DATA_URI } from '../lockup-data';

export interface LockupProps {
  /** Rendered width in px (height follows the 858x280 intrinsic ratio). */
  width?: number;
  /** Accessible name; empty string for decorative use. */
  alt?: string;
}

/**
 * The official Dons Business Institute lockup — CC mark, shield, and
 * wordmark — inlined so it renders anywhere with no asset dependency.
 * Use on dark grounds; never recolor, restyle, or separate its parts.
 */
export function Lockup({ width = 280, alt = 'Dons Business Institute' }: LockupProps) {
  return (
    <img
      className="dbi-lockup"
      src={LOCKUP_DATA_URI}
      width={width}
      height={Math.round(width * (280 / 858))}
      alt={alt}
    />
  );
}
