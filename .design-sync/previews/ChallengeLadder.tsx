import { ChallengeLadder, Surface } from '@dbi/design-system';

export const OnDark = () => (
  <ChallengeLadder steps={['Understand it.', 'Apply it.', 'Explain it.', 'Teach it.']} />
);

export const OnWhite = () => (
  <Surface ground="white" padded>
    <ChallengeLadder steps={['Understand it.', 'Apply it.', 'Explain it.', 'Teach it.']} />
  </Surface>
);
