import { AtAGlance } from "../components/AtAGlance";
import { EventCard } from "../components/EventCard";
import { Hero } from "../components/Hero";
import { Program } from "../components/Program";
import { Sponsors } from "../components/Sponsors";

export const FestaMajorPage = () => {
  return (
    <main data-testid="festa-major-page">
      <Hero />
      <AtAGlance />
      <Program />
      <EventCard />
      <Sponsors />
    </main>
  );
};
