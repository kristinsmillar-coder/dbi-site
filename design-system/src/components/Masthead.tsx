import { Lockup } from './Lockup';

export interface NavLink {
  label: string;
  href: string;
  /** Gold underline marks the current page. */
  active?: boolean;
}

export interface MastheadProps {
  links: NavLink[];
  /** The red pill action at the far right ("Join Us"). */
  cta?: NavLink;
}

/**
 * The site bar: lockup left, mono uppercase page links, red CTA pill at
 * the right. (Statically positioned here for composition; the live site
 * fixes it to the viewport top.)
 */
export function Masthead({ links, cta }: MastheadProps) {
  return (
    <header className="masthead">
      <a className="mark" href="#" aria-label="Dons Business Institute — home">
        <Lockup width={170} alt="" />
      </a>
      <nav aria-label="Primary">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href}
            className={[i === 0 ? 'push' : '', l.active ? 'active' : ''].join(' ').trim() || undefined}
          >
            {l.label}
          </a>
        ))}
      </nav>
      {cta && (
        <a className="cta" href={cta.href}>
          {cta.label}
        </a>
      )}
    </header>
  );
}
