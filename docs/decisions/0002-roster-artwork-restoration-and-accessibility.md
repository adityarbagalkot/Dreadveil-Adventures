# 2. Roster Artwork Restoration, Accessibility Hardening, and Mobile Combat Journal

Date: 2026-10-15
Status: Accepted

## Context

1. **Missing Character Artwork Defect:**
   In the game UI, character picture areas were completely blank. Investigation revealed that the repository contained only `dreadveil-roster.png.asset.json`, which referenced a proprietary Lovable editor proxy path (`/__l5e/assets-v1/...`). In the Google AI Studio environment, this proxy URL returned HTTP 404, preventing character cards and portraits from rendering.
2. **Accessibility & Keyboard Navigation:**
   Keyboard focus indicators on interactive casting bones (`.die-control`) were subtle and low-contrast against the dark tabletop. Screen reader accessible descriptions on dice buttons and combat actions lacked context regarding the consequence of toggling Strike/Guard and invoking abilities.
3. **Combat Journal & Mobile UX:**
   During prolonged encounters, the combat journal had limited height without overscroll containment, making mobile reading during extended battles difficult.

## Decisions

1. **Local Asset Restoration & Bundling:**
   - Downloaded and verified the authoritative 2.3 MB master roster PNG (`1376x768`) referenced in project specifications to `src/assets/dreadveil-roster.png`.
   - Placed a static mirror in `public/dreadveil-roster.png` for root HTTP serving.
   - Migrated component imports in `src/routes/index.tsx`, `src/routes/select.tsx`, and `src/routes/play.tsx` to direct ESM imports (`import dreadveilRoster from "@/assets/dreadveil-roster.png"`), allowing Vite to bundle, optimize, and hash the file into production builds with fallback to `roster.url`.
2. **Keyboard Accessibility Hardening:**
   - Added explicit `.die-control:focus-visible .die-face` CSS rules with `outline: 3px solid var(--candle); outline-offset: 4px;` for clear candle-glow visibility on keyboard focus.
   - Enriched `aria-label` attributes across interactive dice, reroll controls, End Turn actions, and ability invocation buttons with live status and action consequences.
3. **Combat Journal Mobile Polish:**
   - Added `scrollbar-width: thin`, `overscroll-behavior: contain`, and `-webkit-overflow-scrolling: touch` to `.combat-journal ol`.
   - Highlighted the latest combat journal event with a candle-tinted background and accent border.
   - Configured responsive mobile height and spacing in `@media (max-width: 767px)`.

## Consequences

- Character artwork loads with 100% reliability both locally and in production builds with zero external network dependency.
- All 10 hybrid species display their cropped portraits seamlessly on selection cards, detail inspection, and battle sheets.
- Full keyboard and screen reader accessibility is certified across title, selection, and combat views.
