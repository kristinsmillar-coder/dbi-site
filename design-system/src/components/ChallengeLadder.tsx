export interface ChallengeLadderProps {
  /** The rungs, in order ("Understand it.", …). The last renders gold. */
  steps: string[];
}

/**
 * The numbered ledger ladder: big serif lines with small mono counters
 * (01, 02, …) between hairline rules, the final step in gold. Used where
 * a short sequence of verbs IS the artwork (Financial Literacy Day's
 * "Understand it / Apply it / Explain it / Teach it").
 */
export function ChallengeLadder({ steps }: ChallengeLadderProps) {
  return (
    <ol className="challenge ladder">
      {steps.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );
}
