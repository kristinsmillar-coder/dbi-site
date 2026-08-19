import { Surface, SectionHeader } from '@dbi/design-system';

export const Dark = () => (
  <Surface ground="dark" padded>
    <SectionHeader eyebrow="What DBI is" title="Catholic business leaders." />
    <p className="lede narrow">The theater ground — page black with paper text.</p>
  </Surface>
);

export const Paper = () => (
  <Surface ground="paper" padded>
    <SectionHeader eyebrow="The classroom" title="Smaller by design." />
    <p className="lede narrow">The classroom ground — warm paper with ink text.</p>
  </Surface>
);

export const White = () => (
  <Surface ground="white" padded>
    <SectionHeader eyebrow="Imagery" eyebrowTone="gold" title="Borderless photography." />
    <p className="lede narrow">The white ground hosts photographs without frames.</p>
  </Surface>
);
