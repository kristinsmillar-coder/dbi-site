import { Masthead } from '@dbi/design-system';

export const Default = () => (
  <Masthead
    links={[
      { label: 'The Flagship Program', href: '#' },
      { label: 'The Finance Program', href: '#', active: true },
      { label: 'USD', href: '#' },
      { label: 'Donate', href: '#' },
    ]}
    cta={{ label: 'Join Us', href: '#' }}
  />
);
