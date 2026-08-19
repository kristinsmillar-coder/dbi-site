import { Lockup } from './Lockup';
import type { NavLink } from './Masthead';

export interface FooterProps {
  /** Gold mono line under the lockup ("Student-led · Industry-taught · …"). */
  charter?: string;
  links?: NavLink[];
  /** Small print lines (copyright, school attribution). */
  fine?: string[];
}

/**
 * The site footer: lockup on lifted black, gold charter line, mono nav,
 * fine print.
 */
export function Footer({ charter, links = [], fine = [] }: FooterProps) {
  return (
    <footer className="dbi-footer">
      <Lockup width={280} alt="Dons Business Institute" />
      {charter != null && <p className="charter">{charter}</p>}
      {links.length > 0 && (
        <nav className="footer-nav" aria-label="Footer">
          {links.map((l, i) => (
            <a key={i} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      )}
      {fine.map((f, i) => (
        <p className="fine" key={i}>
          {f}
        </p>
      ))}
    </footer>
  );
}
