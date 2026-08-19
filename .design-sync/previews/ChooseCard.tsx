import { ChooseCard } from '@dbi/design-system';

export const Door = () => (
  <ChooseCard
    label="Cathedral Catholic students"
    title="Apply as a student"
    description="Applications for the fall term open in August. No business background required."
    href="#"
  />
);

export const Current = () => (
  <ChooseCard
    label="The Finance Program"
    title="Start smaller, with finance"
    description="A 25-seat offshoot focused on one lane: markets, investing, and corporate finance."
    current
  />
);
