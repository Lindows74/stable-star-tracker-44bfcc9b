# Project Architecture Rules

- Render breeding history through the shared `BreedingLineageCard` so project and unassigned records keep identical parent-to-foal behavior and controls.
- Use `isHorseTierEligible` for client-side live race matches and recorded-time candidates before ranking, so history cannot bypass odd/even restrictions.
- Rank horse-card recorded times by persistent race ID and horse tier using the fastest attempt per horse; ties share competition rank so repeats and renamed races cannot distort placements.