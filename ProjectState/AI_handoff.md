# DREADVEIL ADVENTURES — AI AGENT HANDOFF DIRECTIVE

**Project:** Dreadveil Adventures
**Current Version:** 0.4.6
**Target Framework:** React 19 + TanStack Start (SSR) + TanStack Router + Tailwind CSS v4 + TypeScript 5.8
**Target Environment:** Node.js 22 (linux-x64), npm, AI Studio Web Sandbox (0.0.0.0:3000)

> **MANDATORY INSTRUCTION FOR ANY INCOMING AGENT OR ENGINEER:**
> Read all three files in `ProjectState/` (`implementation_checkpoint`, `project_context.md`, `AI_handoff.md`), `docs/PROJECT_STRUCTURE.md`, and `docs/decisions/` BEFORE modifying any code or taking actions.

---

## 1. Game Overview

Dreadveil Adventures is an antique, dark-fantasy tactical dice-combat adventure. Players choose one of 10 weird animal-hybrid species (Forge Tank, Raven, Plaguewright, Oathbreaker, Oracle, Bloodhowl, Thornwarden, Gear-Saint, Dirgesinger, Hollow Star) and one of 3 distinct boss adversaries (The Lantern-Jawed Mire Hound, The Iron-Bile Gorgon, The Cinder-Weaver) from an illustrated parchment bestiary. Combat features a genuine tabletop polyhedral dice system (d4, d6, d8, d10, d12, d20), percentile divination mechanics (d%), rerolling, assigning dice to Strike or Guard, invoking distinct signature abilities, and resolving against dynamic boss intents with mechanics like Petrification pressure, Corrosive armor, and Smoldering Embers quenching.

---

## 2. Current Verified State

- **Complete Tabletop Polyhedral Arsenal (Version 0.4.0):**
  - Tabletop collection of all seven physical RPG dice: `d4` (The Bastion Shard), `d6` (The Commoner's Oath), `d8` (The Wayfarer's Edge), `d10` (The Fateweaver), `d12` (The Titan's Testament), `d20` (The Godslayer's Wager), and `d%` (The Oracle's Wheel).
  - True D&D Percentile (d100) convention pairing `d%` (00–90) and `d10` (0–9) where 00 + 0 = 100 (range 1–100 with uniform 1% distribution).
  - Starting loadout: _Balanced Triad_ (`["d4", "d6", "d8"]`) with expected sum $\mathbb{E} = 10.5$ (matching legacy 3d6) and spread $3\text{–}18$.
  - Combat Loadout Isolation: Active combat loadout strictly limited to 3 combat-category dice (`isValidCombatLoadout`). Utility dice (`d%`) cannot be equipped into combat slots.
  - Tactical traits:
    - **d4 Steadfast Ward:** +1 Guard when assigned to Guard. Applied exactly once per d4.
    - **d20 Gambler's Blade:** Nat 20 Critical Surge (+5 bonus value), Nat 1 Critical Fumble (0 value). Guarding with a d20 carries a 25% hazard of rolling $\le 5$ against lethal boss strikes.
  - Tabletop dice tray drawer (`src/components/DiceLoadoutModal.tsx`) with slot pickers, stat previews, 5 curated presets, and interactive Oracle's Wheel divination table.
  - SVG polyhedral dice renderer (`src/components/PolyhedralDie.tsx`) with geometric facet wireframes, gold Nat 20 and rust Nat 1 banners, and accessible ARIA attributes.
  - Active loadout persisted in `localStorage` under `dreadveil.selectedLoadout` with safe fallback to `["d4", "d6", "d8"]`.
- **Encounter Bestiary Expansion (3 Bosses):**
  - **The Lantern-Jawed Mire Hound** (46 HP · Apprentice): Peat bog predator with submerged guard and heavy bite.
  - **The Iron-Bile Gorgon** (52 HP · Veteran): Corrosive bile (-3 Guard next round on hit), Petrifying Gaze (shatters for 8 damage at 3 stacks; reflected by 5+ Guard), Calcified Shell (10 Guard), Iron-Tail Slam (14 damage).
  - **The Cinder-Weaver** (42 HP · Master): Smoldering embers (Searing Spinneret & Molten Cocoon), defensive ember quenching via Guard dice (1 ember per Guard die), Ash-Leg Flurry (8 damage), Conflagration (+2 damage per ember).
- **Tabletop Selection UI:** Dual bestiary folios (Folio I: Species; Folio II: Adversaries) with persistent adversary choices, mechanical threat summaries, counter-tactics, active dice loadout preview, and responsive layouts.
- **Visual Presentation & Fallbacks:** High-fidelity raster artwork for Mire Hound and bespoke dark-fantasy SVG beast sigils with archival field sketch badges for Gorgon and Cinder-Weaver.
- **Test Suite Total:** 10 test files, **153/153 tests passing** with 0 failures:
  - `src/test/gameplay-regression.test.tsx` (42 tests)
  - `src/game/boss-mechanics.test.ts` (37 tests)
  - `src/game/polyhedral-dice.test.ts` (33 tests)
  - `src/game/combat-rules.test.ts` (17 tests)
  - `src/game/characters.test.ts` (6 tests)
  - `src/test/encounter-selection.test.tsx` (6 tests)
  - `src/game/encounters.test.ts` (3 tests)
  - `src/test/app-routing.test.tsx` (3 tests)
  - `src/game/engine.test.ts` (3 tests)
  - `src/game/storage.test.ts` (3 tests)
- **Type Check:** `npx tsc --noEmit` passes with 0 errors.
- **Linter & Formatting:** `npm run lint` passes with 0 errors (6 benign React Refresh warnings on UI primitive helpers); `npx prettier --check .` passes cleanly on all matched files.
- **Build:** `npm run build` succeeds cleanly.
- **Dev Server:** Operational on `0.0.0.0:3000` (HTTP 200 on `/`, `/select`, `/play`).

---

## 3. What Was Completed in Phase 7 (The Arsenal of Fates)

1. **Combat Engine Audit & Invariant Enforcement (`src/game/engine.ts`):**
   - Verified that action injection remains purely deterministic for tests.
   - Enforced single application of d4 Steadfast Ward (+1 Guard).
   - Scoped Nat 20 (+5) and Nat 1 (0 value) strictly to d20.
   - Guarded `setLoadout` with `isValidCombatLoadout` to prevent invalid loadouts.
   - Verified Cinder-Weaver ember quenching, Gorgon petrification/corrosion, and Mire Hound cycles.
2. **Standard D&D 7-Dice Collection (`src/game/dice.ts`):**
   - Added `d%` (00–90) and defined `COMBAT_DIE_TYPES` vs `ALL_DIE_TYPES`.
   - Built `rollPercentile()` with standard D&D `00 + 0 = 100` convention and divination omens.
   - Rewrote all dice, traits, and presets in epic dark-fantasy voice.
   - Verified the 5 required presets: Balanced Triad (10.5), Classic Bones (10.5), Vanguard Strike (16.5), Steadfast Phalanx (8.5), and Gambler's Fate (17.5).
3. **Tabletop Presentation & SVG Facet Geometry (`src/components/PolyhedralDie.tsx`, `DiceLoadoutModal.tsx`):**
   - Built bespoke SVG wireframe facet geometry for all 7 standard physical dice including `d%`.
   - Upgraded dice tray modal with tabs for Active Combat Tray and The Oracle's Wheel (Percentile Divination).
   - Enhanced specimen sheet in `src/routes/select.tsx` with epic dice titles.
4. **Architectural Decision Record (`docs/decisions/0006-complete-polyhedral-dice-collection.md`):**
   - Documented percentile mathematics, D&D conventions, anti-power-creep traits, and combat invariants.

---

## 3.1. What Was Completed in Homepage Final Polish (v0.4.5)

- **Title Block & Astrolabe Refinement (`src/routes/index.tsx`):**
  - Reduced wordmark to `text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px]` with naturally scaled proportions.
  - Sized celestial astrolabe star to 28×28px with extended horizontal/vertical rays (`strokeWidth="1.2"`), aligning naturally right above `DREADVEIL`.
  - Tightened vertical margins for `ADVENTURES` kicker and 2-line whisper tagline.
- **Menu Plaque Height & Gap Reductions:**
  - Reduced plaque internal vertical padding to `py-2.5 sm:py-3` (approx ~64px total height), while preserving exact width (~34vw, max 480px).
  - Reduced vertical gaps between plaques to `gap-2.5 sm:gap-3` and container top-margin to `mt-5 sm:mt-5.5 lg:mt-6`.
  - Preserved all typography, gold hairline double-borders, corner filigree notches, and bespoke runic icons (sunburst, caduceus, crest).
- **Current Adventurer Panel Compactness & Tactile Dice Prominence:**
  - Compacted panel vertically (`p-2.5 sm:p-3`, header `mb-2`, portrait `size-11 sm:size-12`, top margin `mt-2 pt-2`).
  - Sized polyhedral dice up to 35×35px with radiant gold facet gradient (`#FFF7D9` to `#543711`), dark etched facet lines (`#2A1605`), bold numbers (`fontSize="14" font-black`), and drop-shadows.
  - Kept panel width strictly at `25.5vw` (max 370px).
- **Independent Background Framing:**
  - Preserved full-screen background positioning (`bg-cover bg-[center_18%]`), dark-fantasy palette, navigation, character data, dice data, and saved state.
- **Safety & Functionality Preservation:**
  - Preserved 100% of existing routing, quick-start, persistence, all 10 hybrid species abilities, and all 3 boss encounters.
  - 153/153 Vitest tests passing; 0 ESLint errors; 0 TypeScript errors; clean production build.

---

## 3.2. What Was Completed in Visual Update 2: The Dying Gods Combat Arena (v0.4.6)

- **Combat Arena Precision Match (`src/routes/play.tsx`):**
  - Modeled after visual source of truth (`image_bc51219c.png`).
  - **Upper-Left:** Dominant framed artwork of the Lantern-Jawed Mire Hound (`src/assets/mire-hound.jpg`), top title & vitality track (`Enemy vitality`), and bottom-left antique bronze medallion badge (`8`).
  - **Upper-Right:** Parchment `#D6C7A5` information panel with dark charcoal ink typography, classification (`PREDATOR OF THE BLACKWATER`), atmospheric lore, `ENEMY INTENT` heading, icon, numerical value, and narrative intent description verbatim from reference.
  - **Lower-Left:** Player character panel with master roster crop, character role, species, vitality track (`Your vitality`), and 3 circular metallic status sigils (emerald ward, crimson strike, sapphire arcana).
  - **Lower-Middle:** Six-die polyhedral tray (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`), with interactive 3-die active loadout buttons matching `/Die \d/i` and toggling `aria-pressed`, and three wide action plaques:
    1. `STRIKE` (blood-wine/muted crimson: `bg-[#762F32]`, triggering End Turn/Strike).
    2. `GUARD` (dark slate iron: `bg-[#18202A]`, instant defensive stance setter).
    3. `REROLL (N)` (muted forest green: `bg-[#3D4D38]`, decrements rerolls and disables when exhausted).
  - **Lower-Right:** Signature Ability card with ornate filigree frame, arcane sigil icon, ability name, text, and interactive Invoke button.
  - **Combat Chronicle:** Compact antique battle log strip preserving all test query contracts (`screen.getByText(/You strike for/i)`).
  - **Engine Isolation Honesty:** Maintained the pure 3-die loadout combat engine (`engine.ts`), isolating the visual 6-dice row without breaking tests or engine contracts.
  - **Verification:** All 153/153 tests passing, 0 TypeScript errors, 0 ESLint errors, clean build.

---

## 4. Invariants & Rules for Subsequent Engineers

1. **Pure Modules under `src/game/`:** Keep game rules, dice arithmetic, and boss mechanics in pure TypeScript modules (`engine.ts`, `dice.ts`, `encounters.ts`, `characters.ts`, `storage.ts`). Never put game rules inside React components.
2. **Deterministic Engine Reducer:** Randomness must always be passed into actions from the UI or tests rather than generated inside the reducer.
3. **Single Source of Truth Artwork:** The 10 hybrid characters use cropped coordinates from `src/assets/dreadveil-roster.png` via `rosterRect`. Bosses use raster artwork where available (`mire-hound.jpg`) and high-fidelity SVG sigils with archival field badges (`EncounterArt.tsx`) for uncataloged horrors.
4. **Accessible Tabletop Controls:** All interactive dice and combat buttons must have descriptive `aria-label`s, role badges, keyboard activation, and minimum touch target size ($\ge 44\text{px}$).
5. **Desktop Viewport Containment:** Maintain zero unintended vertical scrolling on desktop viewports by keeping the fixed header/menu heights contained within standard desktop screen boundaries (`lg:h-dvh lg:overflow-hidden`).
6. **Verification Pipeline:** Before concluding any turn, run `npx tsc --noEmit`, `npm test`, `npm run lint`, `npx prettier --check .`, and `npm run build`.
