# 3. Full-Viewport Layout and Responsive Tabletop Scaling

Date: 2026-10-16
Status: Accepted

## Context

Prior to this phase, Dreadveil Adventures exhibited two layout challenges across desktop resolutions:

1. **Bestiary (Selection Screen):** On 1366x768 and 1024x768 screens, oversized vertical padding and static panel heights pushed the specimen action button (`Enter the Veil`) out of view, requiring vertical scrolling. On intermediate widths (~1000px), card widths were excessively constrained by fixed 5-column definitions.
2. **Combat Encounter:** The battle log (`.combat-journal`) was positioned beneath the entire 2-column duel (below the enemy and player cards). As a consequence, on standard laptop screens (1366x768, 1440x900) combat actions and the battle journal were forced below the fold, separating turn controls from round resolution history.

## Decisions

1. **CSS Grid Tabletop Battlefield (`.encounter-layout`):**
   - On desktop (`@media (min-width: 1024px)`), redefined `.encounter-layout` with explicit grid areas:
     ```css
     grid-template-areas:
       "enemy player"
       "journal player";
     ```
   - Nested `.combat-journal` inside `.encounter-layout`. On desktop, it renders in the left column below `.enemy-sheet`, balancing the vertical height of `.player-table` (portrait, dice tray, resolution totals, and ability strip).
   - Constrained `.enemy-art` with `max-height: min(220px, 24vh)` and `.combat-journal ol` with `max-height: clamp(130px, 18vh, 190px)` with independent scrolling (`overscroll-behavior: contain`).
   - On screens < 1024px, the layout smoothly stacks in intuitive natural order: Enemy (top) -> Player dice & controls (middle) -> Combat Journal (bottom).

2. **Bestiary Viewport Scaling & Constrained Specimen Panel:**
   - Reduced outer shell and header padding using fluid `clamp()` units (`clamp(10px, 1.8vh, 22px)`).
   - Constrained `.bestiary-entry` with `max-height: calc(100dvh - clamp(110px, 14vh, 150px))` and enabled independent smooth scrolling on `.entry-paper` (`overflow-y: auto; scrollbar-width: thin`).
   - Ensured `.entry-departure` with the primary "Enter the Veil" button is always pinned and immediately visible on screen.
   - Introduced fluid breakpoint scaling: 5 columns on >= 1200px, responsive auto-fill (`minmax(130px, 1fr)`) between 960px and 1199px, auto-fit on tablets (768px-959px), and 2 columns on mobile.

3. **Master Artwork Aspect Ratio & Crop Coordinates:**
   - Validated that the 1376x768 master artwork native crop coordinates (`rosterRect`) precisely isolate all 10 hybrid illustrations without clipping heads or baked-in poster typography.
   - Added `background-repeat: no-repeat` and subtle borders to `.entry-portrait` to prevent edge artifacts.
   - Implemented a dedicated unit test suite (`src/game/characters.test.ts`) covering all 10 species invariants, rect bounds, and CSSOM style generation.

## Consequences

- All primary screens (Title, Selection, and Combat) comfortably occupy standard desktop resolutions (1920x1080, 1440x900, 1366x768, 1024x768) without unnecessary outer margins or forced full-page vertical scrolling.
- Essential combat controls, health tracks, casting bones, and the battle journal are simultaneously visible and accessible.
- The test suite expanded to 5 test files and 30 tests, all passing with zero warnings or regressions.
