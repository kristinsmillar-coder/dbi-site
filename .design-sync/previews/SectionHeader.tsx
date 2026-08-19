import { SectionHeader } from '@dbi/design-system';

export const WithLede = () => (
  <SectionHeader
    eyebrow="Semester one"
    title="Build your financial foundation."
    lede="Three sessions and a rehearsal — that's the whole fall. Small on purpose."
  />
);

export const GoldEyebrow = () => (
  <SectionHeader
    eyebrow="Application season · Fall 2026"
    eyebrowTone="gold"
    title={<>Applications<br />are open.</>}
  />
);
