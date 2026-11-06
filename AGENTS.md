# Project Architecture Rules

- Render breeding history through the shared `BreedingLineageCard` so project and unassigned records keep identical parent-to-foal behavior and controls.
- Use `isHorseTierEligible` for client-side live race matches and recorded-time candidates before ranking, so history cannot bypass odd/even restrictions.
- Group horse-card times and placements by the shared numbering identity (kind, surface, distance, grade restriction) and tier, using each horse's fastest attempt across duplicate race IDs; ties share competition rank and saved result IDs stay unchanged.
- Keep shared dialogs, sheets and dropdowns bounded to available viewport space; nested filter popovers are modal so dialog scroll locking allows their lists to scroll, and mobile filter actions stay outside the scrolling body.
- Store manual horse parents independently on horses and merge them over breeding-record ancestry through useHorseLineage, so correcting one horse never rewrites siblings or archived projects.
- Derive descendant links by reversing the shared merged ancestry map, so the Lineage view uses the same bloodline as breeding and parent editing.