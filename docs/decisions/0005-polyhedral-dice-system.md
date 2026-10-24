# 0005. Tabletop Polyhedral Dice System Architecture

- **Status:** Accepted
- **Date:** 2026-10-21
- **Context:** Dreadveil Adventures — D&D-Inspired Polyhedral Dice Expansion
- **Deciders:** Lead Systems Designer, Frontend Architect, QA Lead

---

## 1. Context and Problem Statement

Prior to version 0.3.0, Dreadveil Adventures utilized three identical six-sided dice (`3d6`) for the player's casting pool. While functional, identical six-sided dice lacked the rich tactical diversity, variance gradients, and tabletop tactile appeal of classical tabletop RPGs (such as Dungeons & Dragons).

The user requested replacing the 3d6 casting bones with a genuine D&D-inspired polyhedral dice system:

1. Standard tabletop polyhedral collection: `d4`, `d6`, `d8`, `d10`, `d12`, and `d20`.
2. True mathematical bounds: Each die rolls up to its actual maximum face value (1–N), not cosmetic skins over d6 arithmetic.
3. Dice tray & loadout selector: A tabletop-style dice tray allowing players to inspect dice, manage their 3-die active loadout, preview statistical spreads, and select balanced presets.
4. Balanced starting loadout: A defined, mathematically justified starting loadout rather than unconstrained access to only the largest dice.
5. Anti-power-creep design: Ensure larger dice are not strictly superior in every tactical scenario, introducing meaningful trade-offs (e.g., d4 defensive consistency vs. d20 feast-or-famine volatility).
6. Tabletop visual presentation: Distinct polyhedral silhouettes, engraved faces, facet geometry, tactile roll animations, and accessible screen reader semantics.
7. Pure deterministic architecture: Complete preservation of deterministic state transitions, 10 species abilities, 3 boss encounters, and local persistence.

---

## 2. Mathematical Balancing & Loadout Rationale

### Starting Loadout: The Balanced Triad (`["d4", "d6", "d8"]`)

The starting loadout is set to `["d4", "d6", "d8"]`:

- **Expected Value (Mean):**
  $$\mathbb{E}[\text{d4}] + \mathbb{E}[\text{d6}] + \mathbb{E}[\text{d8}] = 2.5 + 3.5 + 4.5 = 10.5$$
- **Comparison to Legacy 3d6:**
  $$3 \times \mathbb{E}[\text{d6}] = 3 \times 3.5 = 10.5$$
- **Spread & Range:**
  The min roll is $1+1+1 = 3$; the max roll is $4+6+8 = 18$. The spread perfectly maps to the legacy range $[3, 18]$ with an identical center of mass (10.5), preventing inadvertent early-game boss trivialization while immediately introducing polyhedral tactical asymmetry.

### Anti-Power-Creep Traits & Combat Interactions

To prevent players from trivially equipping `["d20", "d20", "d20"]` without trade-offs:

1. **The d4 "Steadfast Ward" Trait:**
   - Smallest die ($1\text{–}4$), lowest raw total.
   - Passive trait: When assigned to `Guard`, grants **+1 bonus Guard**.
   - Tactical niche: Stable defensive floor ($2\text{–}5$ effective Guard) with minimal roll variance, making it an invaluable defensive anchor against predictable boss strikes.
2. **The d20 "Gambler's Blade" Volatility:**
   - Highest ceiling (20), but widest variance ($1\text{–}20$).
   - Critical Success (Natural 20): Triggers an adrenaline surge granting **+5 bonus combat value** (25 total).
   - Critical Fumble (Natural 1): Shatters concentration, yielding **0 total value**.
   - Tactical risk: 25% chance of rolling $\le 5$. Relying on a d20 for Guard against lethal attacks (e.g., the Mire Hound's 12-damage Drowning Lunge or the Gorgon's 14-damage Iron-Tail Slam) carries a severe risk of catastrophic failure.
3. **Boss Interaction Synergies:**
   - _The Cinder-Weaver:_ Quenches embers based on the _number of Guard dice_ allocated rather than raw Guard value. Distributing multiple stable dice (d4, d6) into Guard neutralizes deadly Conflagration stacks far more reliably than gambling on high-variance single dice.
   - _The Iron-Bile Gorgon:_ Requires $\ge 5$ Guard to prevent Petrification buildup. The d4 with Steadfast Ward paired with a mid-tier die reliably achieves this threshold.

---

## 3. Architecture & Implementation

### A. Pure Modular Dice Rules (`src/game/dice.ts`)

Decoupled completely from React components:

- `DieType`: Union `"d4" | "d6" | "d8" | "d10" | "d12" | "d20"`.
- `DIE_CONFIGS`: Metadata dictionary defining name, geometric shape, side count, average value, and tactical traits for each die.
- `DICE_PRESETS`: Curated tabletop presets:
  - _Balanced Triad:_ `["d4", "d6", "d8"]` (Avg 10.5)
  - _Classic Bones:_ `["d6", "d6", "d6"]` (Avg 10.5)
  - _Vanguard Strike:_ `["d8", "d10", "d12"]` (Avg 16.5)
  - _Steadfast Phalanx:_ `["d4", "d4", "d6"]` (Avg 8.5, +2 Guard from traits)
  - _Gambler's Fate:_ `["d4", "d8", "d20"]` (Avg 17.5, extreme variance)
- Pure helpers: `rollDie`, `rollLoadout`, `isNatural20`, `isNatural1`, `isValidLoadout`.

### B. Combat Engine Integration (`src/game/engine.ts`)

- `Die` type updated to `{ type: DieType; value: number; role: DieRole }`.
- `GameState.loadout` tracks the active 3-die loadout (`[DieType, DieType, DieType]`), initialized via `createGame(characterId, encounterId, initialLoadout)`.
- `strikeTotal`: Pure calculation summing Strike dice values with d20 Nat 20 (+5) and Nat 1 (0) modifiers.
- `guardTotal`: Pure calculation summing Guard dice values, adding d4 Steadfast Ward (+1 per d4 on Guard), and handling d20 Nat 20/1.
- Pure action `setLoadout`: Validates and swaps loadout during the `"roll"` phase.

### C. Visual Presentation (`src/components/PolyhedralDie.tsx` & `DiceLoadoutModal.tsx`)

- SVG facet wireframes crafted specifically for each geometric solid:
  - `d4`: Tetrahedron with centered triangular inset.
  - `d6`: Cube with beveled perspective chamfers.
  - `d8`: Octahedron with diamond facets.
  - `d10`: Pentagonal trapezohedron with kite-shaped facets.
  - `d12`: Dodecahedron with regular pentagonal center and ring facets.
  - `d20`: Icosahedron with central equilateral triangle and radiating facet grid.
- Tables and badges show role assignments (Swords for Strike, Shield for Guard), Nat 20 gold critical glowing borders, and Nat 1 rust fumble indicators.
- Accessibility: ARIA roles, descriptive `aria-label`s announcing die type, facet count, roll result, and current assignment role. Minimum touch targets $\ge 44\text{px}$.

### D. Persistence (`src/game/storage.ts`)

- Stored under `localStorage` key `dreadveil.selectedLoadout`.
- Schema validated on load via `isValidLoadout`; corrupted or unparseable entries safely fallback to the balanced starting loadout `["d4", "d6", "d8"]`.

---

## 4. Test Verification & Invariant Isolation

- **Unit Tests:** `src/game/polyhedral-dice.test.ts` (22 tests) verifies mathematical bounds ($1\text{–}N$), starting loadout balance, Steadfast Ward +1 bonus, Nat 20 (+5) and Nat 1 (0) modifiers, deterministic roll injection, reroll constraints, all 10 species abilities with polyhedrals, and persistence fallback.
- **Legacy Invariant Isolation:** Existing regression suites (`combat-rules.test.ts`, `boss-mechanics.test.ts`) were provided with explicit `["d6", "d6", "d6"]` loadout fixtures where 3d6-specific arithmetic assumptions applied, preserving 100% test passing rates across all 142 project tests.
