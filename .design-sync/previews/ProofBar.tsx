import { ProofBar } from '@dbi/design-system';

export const EveryYear = () => (
  <ProofBar
    label="Every year at DBI"
    items={[
      { n: '~200', label: 'applications reviewed' },
      { n: '8', label: 'teams compete in the Case Competition' },
      { n: '10', label: 'student businesses built & pitched' },
      { n: '$20,000+', label: 'awarded in prizes' },
      { n: 'USD', label: 'students nominated for college business courses' },
    ]}
  />
);
