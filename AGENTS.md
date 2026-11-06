# Project Architecture Rules

- Render breeding history through the shared `BreedingLineageCard` so project and unassigned records keep identical parent-to-foal behavior and controls.
- Use `isHorseTierEligible` for client-side live race matches and recorded-time candidates before ranking, so history cannot bypass odd/even restrictions.
- Group horse-card times and placements by the shared numbering identity (kind, surface, distance, grade restriction) and tier, using each horse's fastest attempt across duplicate race IDs; ties share competition rank and saved result IDs stay unchanged.