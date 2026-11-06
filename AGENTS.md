# Project Architecture Rules

- Render breeding history through the shared `BreedingLineageCard` so project and unassigned records keep identical parent-to-foal behavior and controls.
- Use `isHorseTierEligible` for client-side live race matches and recorded-time candidates before ranking, so history cannot bypass odd/even restrictions.