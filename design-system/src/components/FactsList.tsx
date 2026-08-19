export interface Fact {
  /** Mono uppercase term ("Cohort", "Sessions"). */
  term: string;
  /** The value ("25 students — half the Flagship"). */
  detail: string;
}

export interface FactsListProps {
  items: Fact[];
}

/**
 * The quick-facts sidebar: a gold-ruled definition list of term/value rows
 * (cohort size, session dates, capstone, finale). Sits beside prose in a
 * two-column layout.
 */
export function FactsList({ items }: FactsListProps) {
  return (
    <dl className="cap-facts">
      {items.map((f, i) => (
        <div key={i}>
          <dt>{f.term}</dt>
          <dd>{f.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
