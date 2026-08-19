export interface Session {
  /** One-line gold mono meta ("Session 01 · Tue, Sep 29 · 2:30–4:15 PM"). */
  when: string;
  /** Serif session title ("Markets & Investing"). */
  title: string;
  /** One- or two-sentence description. */
  description: string;
}

export interface SessionListProps {
  sessions: Session[];
}

/**
 * The session schedule: uniform ruled blocks in a responsive two-column
 * grid — gold mono dateline, serif title, small body. Keep datelines to
 * one consistent shape (abbreviated weekday and month).
 */
export function SessionList({ sessions }: SessionListProps) {
  return (
    <div className="fin-sessions">
      {sessions.map((s, i) => (
        <div className="fin-session" key={i}>
          <p className="when">{s.when}</p>
          <h3>{s.title}</h3>
          <p>{s.description}</p>
        </div>
      ))}
    </div>
  );
}
