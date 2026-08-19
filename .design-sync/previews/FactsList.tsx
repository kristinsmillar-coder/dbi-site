import { FactsList } from '@dbi/design-system';

export const ProgramFacts = () => (
  <FactsList
    items={[
      { term: 'Cohort', detail: '25 students — half the Flagship' },
      { term: 'Sessions', detail: 'Sep 29 · Oct 21 · Nov 17 · 2:30–4:15 PM' },
      { term: 'Rehearsal', detail: 'Nov 18 · 2:30–4:30 PM' },
      { term: 'Capstone', detail: 'Financial Literacy Day · Dec 4' },
      { term: 'Finale', detail: 'The Stock Pitch · Spring' },
    ]}
  />
);
