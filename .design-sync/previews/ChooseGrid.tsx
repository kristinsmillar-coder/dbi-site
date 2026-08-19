import { ChooseGrid, ChooseCard } from '@dbi/design-system';

export const Doors = () => (
  <ChooseGrid>
    <ChooseCard
      label="The Flagship Program"
      title="Intro to Business"
      description="The full DBI experience — ~50 seats. Every function of a business and the Case Competition."
      href="#"
    />
    <ChooseCard
      label="The Finance Program"
      title={<>A smaller start:<br />finance only</>}
      description="A 25-seat offshoot. Markets, investing, and corporate finance — ending in a stock pitch."
      href="#"
    />
  </ChooseGrid>
);

export const Rows = () => (
  <ChooseGrid rows>
    <ChooseCard
      label="The Flagship Program"
      title="See the whole year"
      description="The room, the pathway, the Case Competition, and the Startup Summit — session by session."
      href="#"
    />
    <ChooseCard
      label="The Partnership"
      title="DBI × USD"
      description="College business courses at the Knauss School, an MBA mentor on every team."
      href="#"
    />
    <ChooseCard
      label="Join us"
      title="Student or business leader"
      description="Apply for the fall term — or teach a session, mentor a venture, or sponsor the Summit."
      href="#"
    />
  </ChooseGrid>
);
