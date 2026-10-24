# 0006. Complete Standard D&D Polyhedral Dice Collection & Oracle's Wheel Architecture

- **Status:** Accepted
- **Date:** 2026-10-21
- **Context:** Dreadveil Adventures Phase 7 — The Arsenal of Fates
- **Deciders:** Lead Systems Designer, Frontend Architect, QA Lead

---

## 1. Context and Problem Statement

Following the introduction of the polyhedral dice system in v0.3.0 (featuring d4, d6, d8, d10, d12, and d20), players had access to six tabletop dice. However, the standard physical tabletop RPG dice collection includes seven distinct dice:

- `d4` — four-sided tetrahedron
- `d6` — six-sided cube
- `d8` — eight-sided octahedron
- `d10` — ten-sided pentagonal trapezohedron (1–10)
- `d12` — twelve-sided dodecahedron (1–12)
- `d20` — twenty-sided icosahedron (1–20)
- `d%` — ten-sided percentile trapezohedron, numbered in tens from 00 to 90

Furthermore, user requirements called for:

1. Auditing existing combat mechanics to ensure mathematical consistency, correct face boundaries, robust critical handling (Nat 20 Critical Surge +5, Nat 1 Critical Fumble 0 value), single application of the d4 Steadfast Ward bonus, and isolation of legacy test invariants.
2. Introducing the complete 7-die physical collection and formalizing true D&D percentile rolls (1–100) using the classical convention where "00" + "0" = 100.
3. Decoupling utility percentile dice (`d%`) from 3-die combat loadouts while making the die discoverable and interactive via the Oracle's Wheel divination table.
4. Rewriting dice descriptions and presets in an epic, lore-rich fantasy voice (The Bastion Shard, The Commoner's Oath, The Wayfarer's Edge, The Fateweaver, The Titan's Testament, The Godslayer's Wager, The Oracle's Wheel).
5. Upgrading the tabletop dice tray modal (`DiceLoadoutModal.tsx`) and specimen sheet (`select.tsx`) with comprehensive statistics, preset previews, and accessible labels.

---

## 2. Tabletop Percentile Mechanics & D&D 00 Convention

### A. The Percentile Formula

Standard physical tabletop D&D generates an integer from $1$ to $100$ by casting two ten-sided dice:

- **Tens Die (`d%`):** Faces marked `00, 10, 20, 30, 40, 50, 60, 70, 80, 90` ($0, 10, \dots, 90$).
- **Ones Die (`d10`):** Faces marked `0, 1, 2, 3, 4, 5, 6, 7, 8, 9`.

### B. The "00 + 0 = 100" Tabletop Rule

- If the tens die lands on `00` ($0$) and the ones die lands on `0`:
  $$\text{Total} = 100$$
- In all other cases:
  $$\text{Total} = \text{tens} + \text{ones}$$
  - Min roll: `00` + `1` $= 1$.
  - Intermediate: `70` + `3` $= 73$.
  - Intermediate: `00` + `7` $= 7$.
  - High roll: `90` + `9` $= 99$.
  - Max roll: `00` + `0` $= 100$.

This yields exactly $100$ distinct outcomes with uniform probability ($1\%$ each), strictly bounded within $[1, 100]$.

### C. The Oracle's Wheel Divination System

In `src/game/dice.ts`, `rollPercentile()` evaluates this exact rule and pairs each result with atmospheric divination omens across 7 distinct percentile tiers:

- $100$: _Celestial Conjunction_
- $90\text{–}99$: _Ascendant Omen_
- $75\text{–}89$: _Favorable Current_
- $50\text{–}74$: _Equilibrium of Ruin_
- $25\text{–}49$: _Murmurs in the Dark Water_
- $10\text{–}24$: _Ill-Boding Portent_
- $1\text{–}9$: _Abyssal Malice_

---

## 3. Combat Audit & Anti-Power-Creep Architecture

1. **Strict Loadout Typing & Separation of Concerns:**
   - `COMBAT_DIE_TYPES: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20"]`.
   - `ALL_DIE_TYPES: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d%"]`.
   - `isValidCombatLoadout`: Validates that exactly 3 combat-category dice are equipped. Prevents utility dice (`d%`) from entering active combat slots.
2. **Critical Surge and Fumble Invariants:**
   - Natural 20 (+5 bonus) and Natural 1 (0 value) are scoped strictly to `type === "d20"`.
   - Guard and Strike calculations apply critical surge and fumble consistently without negative totals (`Math.max(0, ...)`).
   - d4 Steadfast Ward (+1 Guard) applies strictly once per d4 assigned to Guard.
3. **Deterministic Test Isolation:**
   - In accordance with the project constitution (`AGENTS.md`), random roll generation occurs in UI event handlers (`rollActiveLoadout`, `rollDie`), passing deterministic values into pure reducer actions.
   - Hollow Star's _Unmake Fate_ ("Every die you hold becomes a 6") cleanly sets all held dice to 6 through reality-bending void magic as required by existing regression test contracts.
4. **Boss Status Effect Invariants:**
   - Cinder-Weaver: Embers are quenched per _Guard die allocated_, not combined Guard total.
   - Iron-Bile Gorgon: Caustic Bile applies -3 Guard corrosion on hit; Petrifying Gaze adds petrification when Guard < 5 (shatters at 3 stacks for 8 damage).
   - Mire Hound: 4-step intent sequence and restart isolation verified.

---

## 4. Visual Presentation & Tabletop Artwork

1. **Vector Facet Geometries (`PolyhedralDie.tsx`):**
   - `d4`: Sharp equilateral tetrahedron with facet ridges meeting at the central apex.
   - `d6`: Isometric beveled cube with perspective edges.
   - `d8`: Diamond-cut octahedron with equator and meridian lines.
   - `d10`: Pentagonal trapezohedron with kite-shaped facets and spoke ridges.
   - `d12`: Dodecahedron with centered regular pentagon and radial facet trapezoids.
   - `d20`: Icosahedron with centered equilateral triangle and facet lattice.
   - `d%`: Dual-contour trapezohedron with astrological dashed ring and dual-digit numeral typography ("00"–"90").
2. **Tabletop Dice Tray Drawer (`DiceLoadoutModal.tsx`):**
   - Active combat tray with 3 interactive slots, face previews, and live statistics (min, max, theoretical average, critical surge/fumble impacts).
   - Curated presets: _Balanced Triad_, _Classic Bones_, _Vanguard Strike_, _Steadfast Phalanx_, _Gambler's Fate_, and _The Titan's Bulwark_.
   - Interactive Oracle's Wheel divination table for rolling percentile fortunes (1–100) with visual tens and ones die readouts and thematic omens.
   - Accessible ARIA labels and keyboard focus.

---

## 5. Verification Results

- **Automated Tests:** 153/153 tests passing across 10 test files (100% pass rate).
- **TypeScript:** 0 compiler errors (`npx tsc --noEmit`).
- **ESLint:** 0 errors (`npm run lint`).
- **Prettier:** 100% code style compliance (`npx prettier --check .`).
- **Build:** Production Nitro SSR and client bundles built cleanly (`npm run build`).
