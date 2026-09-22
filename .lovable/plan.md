# Update trait classifications and styling

## Goal
Match the official Rival Stars trait guide while preserving the existing stacking and 80% breed-based Pro behavior.

## Changes
- Centralize official trait categories so horse cards, Live Events, breeding summaries, and selectors use the same classification.
- Keep stacked trait pairs red with white text, including the current Mid Miracle display context where applicable.
- Give Star Club traits a distinct purple border and label.
- Give every official Exotic trait a gold border and Exotic label.
- Add any official guide traits missing from the app and remove unsupported extras from selectable official categories only after comparison.
- Preserve Pro as the highest-priority gold/yellow treatment, driven by the current breed-percentage rules.

## Validation
- Compare all app trait names against the official guide.
- Verify normal, stacking, Exotic, Star Club, and Pro examples in horse cards and Live Events.
- Confirm the app remains error-free on desktop and mobile widths.

## Technical details
- Use one shared metadata source for trait category and badge treatment.
- Styling priority: stacking → Pro → Star Club → Exotic → normal category.
- Do not modify breeding percentages, Pro breed mappings, or database records.
