export interface ProofStat {
  /** The figure, set in gold Young Serif ("~200", "$20,000+", "USD"). */
  n: string;
  /** The mono label under it ("applications reviewed"). */
  label: string;
}

export interface ProofBarProps {
  /** Gold mono kicker above the stats. */
  label?: string;
  /** Up to five stats; five get equal columns on wide screens. */
  items: ProofStat[];
}

/**
 * The annual-stats ledger ("Every year at DBI"): gold serif figures over
 * dim mono labels. Numbers are the only gold — they read as the award.
 */
export function ProofBar({ label, items }: ProofBarProps) {
  return (
    <div>
      {label != null && <p className="proof-label">{label}</p>}
      <ul className="proof-bar">
        {items.map((it, i) => (
          <li key={i}>
            <span className="n">{it.n}</span>
            <span className="l">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
