# Changelog

All notable changes to the **Dreadveil Adventures** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-10-21

### Added

- **Complete Standard D&D 7-Dice Collection (`src/game/dice.ts`):** Expanded tabletop collection with all seven physical RPG dice: `d4` (The Bastion Shard), `d6` (The Commoner's Oath), `d8` (The Wayfarer's Edge), `d10` (The Fateweaver), `d12` (The Titan's Testament), `d20` (The Godslayer's Wager), and `d%` (The Oracle's Wheel).
- **The Oracle's Wheel & D&D Percentile (d100) Mechanics:**
  - True tabletop percentile casting pairing the percentile die (tens: `00–90`) and standard d10 (ones: `0–9`).
  - Standard D&D convention: `00` + `0` = 100! Guaranteed uniform $1\text{–}100$ distribution.
  - Interactive Oracle divination tab in the dice tray drawer with live tens/ones breakdown and atmospheric dark fantasy omens across 7 percentile tiers.
- **Epic Fantasy Voice & Lore Rewrite:**
  - Rewrote all dice names, quotes, tactical descriptions, and preset entries in evocative dark-fantasy prose across all collection panels, tray drawers, and specimen inspection sheets.
  - Added new battle preset: _The Titan's Bulwark_ (`["d4", "d10", "d12"]`).
- **Bespoke Vector Facet Geometry (`src/components/PolyhedralDie.tsx`):**
  - Added `d%` percentile trapezohedron with dual-contour borders, astrological dashed rings, and dual-digit numeral typography ("00"–"90").
  - Refined facet ridges for tetrahedron, beveled cube, octahedron, pentagonal trapezohedron, dodecahedron, and icosahedron.
- **Combat Audit & Invariant Enforcement:**
  - Verified and locked deterministic action injection.
  - Verified single application of d4 Steadfast Ward (+1 Guard).
  - Verified Nat 20 Critical Surge (+5) and Nat 1 Fumble (0 value) strictly isolated to d20.
  - Enforced `isValidCombatLoadout` to prevent utility dice (`d%`) from being equipped in active combat slots.
  - Confirmed Cinder-Weaver ember quenching, Iron-Bile Gorgon petrification/corrosion, and Mire Hound attack cycles.
- **Expanded Test Coverage:**
  - Expanded test suite to **153 passing tests** across 10 test suites (100% pass rate).
  - Added unit tests for all 7 dice types, percentile rolling bounds, 00+0=100 convention, divination omens, preset calculations, and combat loadout validation.
- **Architectural Decision Record:** `docs/decisions/0006-complete-polyhedral-dice-collection.md`.

## [0.3.0] - 2026-10-21

### Added

- **Tabletop Polyhedral Dice System (`src/game/dice.ts`):** Complete tabletop RPG dice collection replacing legacy 3d6 with `d4`, `d6`, `d8`, `d10`, `d12`, and `d20`, each featuring true mathematical face counts ($1\text{–}N$) rather than visual skins over d6 arithmetic.
- **Starting Loadout & Statistical Balance:** Starting loadout initialized to the _Balanced Triad_ (`["d4", "d6", "d8"]`), yielding an expected value of $\mathbb{E} = 2.5 + 3.5 + 4.5 = 10.5$ (identical to $3 \times \mathbb{E}[\text{d6}] = 10.5$) with a bounded roll range of $3\text{–}18$, preserving baseline combat pacing while introducing immediate tactical variance.
- **Anti-Power-Creep Tactical Traits:**
  - **d4 Steadfast Ward:** Allocating a d4 to Guard grants **+1 bonus Guard**, establishing low-variance dice as vital defensive anchors.
  - **d20 Gambler's Blade:** Extreme feast-or-famine variance ($1\text{–}20$) with **Natural 20 Critical Surge** (+5 combat value bonus, 25 total) and **Natural 1 Critical Fumble** (0 value). Guarding with a d20 carries a 25% hazard of rolling $\le 5$ against lethal boss attacks.
  - **Encounter Synergies:** The Cinder-Weaver's ember quenching scales per _Guard die allocated_, rewarding players who maintain multi-die defensive postures over single-die gambles.
- **Tabletop Dice Tray & Loadout Pouch (`src/components/DiceLoadoutModal.tsx`):** Drawer dialog allowing players to inspect active loadouts, examine individual die geometries and traits, preview min/max/expected statistical spreads, and switch among curated tabletop presets (_Balanced Triad_, _Classic Bones_, _Vanguard Strike_, _Steadfast Phalanx_, _Gambler's Fate_).
- **SVG Polyhedral Dice Renderer (`src/components/PolyhedralDie.tsx`):** Bespoke vector facet wireframes for tetrahedron (d4), cube (d6), octahedron (d8), pentagonal trapezohedron (d10), dodecahedron (d12), and icosahedron (d20), featuring aged parchment ivory tones, dark iron insets, glowing gold Nat 20 critical frames, rust Nat 1 fumble indicators, and accessible ARIA attributes.
- **Casting Tray Roster Inspection (`src/routes/select.tsx`):** Specimen detail sheet now showcases the active polyhedral loadout alongside character abilities and threat stats.
- **Persistence (`src/game/storage.ts`):** Browser `localStorage` persistence under `dreadveil.selectedLoadout` with schema verification and fallback to `["d4", "d6", "d8"]`.
- **Unit & Regression Test Suites:**
  - `src/game/polyhedral-dice.test.ts` (22 tests covering rolling bounds, balance arithmetic, Steadfast Ward +1, Nat 20/1 modifiers, deterministic roll injection, rerolls, species ability synergies, and persistence).
  - Total test suite expanded to 142 passing tests across 10 test suites.
- **Architectural Decision Record:** `docs/decisions/0005-polyhedral-dice-system.md`.

### Changed

- Updated combat engine (`src/game/engine.ts`) to maintain active `loadout`, calculate polyhedral-aware `strikeTotal` and `guardTotal`, support `setLoadout` transitions during roll phases, and dynamically cast using actual side counts.
- Updated play arena (`src/routes/play.tsx`) to render interactive polyhedral dice, integrate loadout selection, and dynamically roll according to configured die types.

## [0.2.0] - 2026-10-18

### Added

- Encounter expansion module `src/game/encounters.ts` introducing two new distinct boss adversaries:
  - **The Iron-Bile Gorgon** (52 HP · Veteran): Features accumulating Petrification pressure (pierces defenses when Guard < 5; shatters at 3 stacks for 8 damage), Corrosive Bile (-3 Guard on the subsequent turn if damage penetrates), Calcified Shell (10 Guard), and crushing Iron-Tail Slam (14 damage).
  - **The Cinder-Weaver** (42 HP · Master): Features Smoldering Embers (ignited via Searing Spinneret and Molten Cocoon), dynamic Ember Quenching (every Guard die allocated quenches 1 ember during round resolution), Ash-Leg Flurry (8 damage), and Conflagration (+2 damage per active ember).
- Tabletop Bestiary adversary selection interface (`src/components/EncounterSelector.tsx` and `src/routes/select.tsx` Folio II tab) allowing players to inspect all three bosses, compare threat mechanics, and choose their adversary with persistence.
- High-fidelity dark-fantasy bestiary sigil fallback renderer (`src/components/EncounterArt.tsx`) with intricate SVG crests, thematic accents, and archival field sketch badges for newly uncataloged horrors.
- Encounter persistence support in `src/game/storage.ts` under key `dreadveil.selectedEncounter`, defaulting gracefully to `"mire-hound"`.
- Unit and combat test suites:
  - `src/game/encounters.test.ts` (3 tests verifying encounter metadata, difficulty ratings, and fallbacks).
  - `src/game/boss-mechanics.test.ts` (37 tests verifying Gorgon petrification, corrosion, Cinder-Weaver ember quenching, conflagration, all 10 species abilities against both new bosses, and victory/defeat narratives).
  - `src/test/encounter-selection.test.tsx` (6 tests verifying Folio navigation, encounter switching, persistence, combat initialization, and restart flow).
- Architectural Decision Record `docs/decisions/0004-encounter-variety-and-bestiary-expansion.md`.

### Changed

- Expanded `GameState` and `reducer` in `src/game/engine.ts` with typed `encounterId`, `petrification`, `corrodedTurns`, and `embers` tracks while preserving 100% deterministic state transitions and backward compatibility.
- Updated `src/routes/play.tsx` to render dynamic encounter artwork, location headings, boss vitals, live status effect badges (Petrification gauge, Corroded Armor, Smoldering Embers), and customized victory/defeat screens.
- Updated combat restart button ("Fight Again") to repeat the active selected encounter rather than defaulting to the Mire Hound.

## [0.1.2] - 2026-10-16

### Added

- Comprehensive unit test suite `src/game/characters.test.ts` verifying all 10 hybrid species invariants, bounds checks, and crop coordinate calculations.
- Comprehensive end-to-end player journey regression suite `src/test/gameplay-regression.test.tsx` (42 tests) verifying all 10 species, dice mechanics, signature abilities, combat resolution, victory/defeat terminal states, and persistence.
- Architectural decision record `docs/decisions/0003-full-viewport-layout-and-artwork-scaling.md`.

### Fixed

- Fixed desktop combat layout by structuring `.encounter-layout` with CSS Grid areas (`enemy | player` and `journal | player`), ensuring combat actions, dice tray, enemy status, and battle journal are simultaneously visible without vertical scrolling.
- Fixed bestiary specimen inspection panel overflow on compact heights (1366x768, 1024x768) with max-height constraint and independent parchment scrolling, keeping "Enter the Veil" pinned and accessible.
- Fixed species roster grid scaling on intermediate widths (960px to 1199px) using responsive `auto-fill` minmax rules.
- Added `background-repeat: no-repeat` and border framing to `.entry-portrait` to eliminate subpixel crop rendering artifacts.

### Changed

- Tuned shell and header vertical padding across all routes using fluid `clamp()` units, eliminating unnecessary whitespace.
- Nested `.combat-journal` within `.encounter-layout` with responsive source ordering for desktop and mobile.

## [0.1.1] - 2026-10-15

### Added

- Local master roster image `src/assets/dreadveil-roster.png` (1376x768 RGBA PNG) and static mirror `public/dreadveil-roster.png`.
- Comprehensive project structure manual `docs/PROJECT_STRUCTURE.md` detailing architecture, module responsibilities, asset matrix, and extension procedures.
- Architectural decision record `docs/decisions/0002-roster-artwork-restoration-and-accessibility.md`.

### Fixed

- Restored missing character artwork across title background, bestiary selection roster, specimen details panel, and active player combat sheet.
- Fixed keyboard focus indicator on casting bones (`.die-control:focus-visible .die-face`) with clear candle-glow outline.
- Enhanced accessibility with descriptive `aria-label` tags for dice buttons, rerolls, turn resolution, and ability invocations.
- Improved combat journal scrolling performance, touch interaction, latest-event visual prominence, and mobile responsiveness.

### Changed

- Migrated roster asset loading in `src/routes/index.tsx`, `src/routes/select.tsx`, and `src/routes/play.tsx` to direct ESM imports bundled by Vite.

## [0.1.0] - 2026-10-15

### Added

- Project continuity documentation suite under `ProjectState/`:
  - `ProjectState/implementation_checkpoint`
  - `ProjectState/project_context.md`
  - `ProjectState/AI_handoff.md`
- Architectural decision record `docs/decisions/0001-ai-studio-migration-and-ssr-hydration.md`.
- Environment variable template `.env.example`.
- Explicit re-exports of `Character` and `CharacterId` types in `src/game/engine.ts`.

### Fixed

- Resolved React 19 SSR hydration mismatch by adding `suppressHydrationWarning` to root document elements (`<html>`, `<body>`, `<main>`) and dynamic inline background style elements.
- Fixed TypeScript compiler errors in `src/game/combat-rules.test.ts` by permitting `readonly number[]` in `Action` values.
- Fixed 135 Prettier formatting errors across the codebase.
- Corrected non-standard bare `aria-hidden` attributes to `aria-hidden="true"` in `src/routes/index.tsx`.

### Changed

- Standardized package management on npm, removing legacy `bun.lock` and `bunfig.toml`.
- Configured Vite development server script to explicitly bind to `0.0.0.0:3000`.
- Synchronized OpenGraph meta tags in `src/routes/__root.tsx` with project identity.
