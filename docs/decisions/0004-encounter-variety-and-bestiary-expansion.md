# 0004. Encounter Variety and Bestiary Expansion Architecture

- **Status:** Accepted
- **Date:** 2026-10-18
- **Context:** Dreadveil Adventures Phase 5 — Encounter Variety & Bestiary Expansion
- **Deciders:** Lead Systems Designer, Frontend Architect, QA Lead

---

## 1. Context and Problem Statement

Prior to version 0.2.0, Dreadveil Adventures contained only a single adversary: The Lantern-Jawed Mire Hound (46 HP). While combat mechanics, dice allocation (Strike/Guard), and all ten player species abilities were thoroughly verified, gameplay lacked encounter variety, diverse boss mechanics, and adversary selection.

The objective was to introduce two distinct boss encounters—**The Iron-Bile Gorgon** and **The Cinder-Weaver**—each featuring unique, deterministic, counterable mechanics rather than simple stat reskins, alongside a polished encounter-selection interface and visual fallback architecture.

---

## 2. Decision & Architecture

### A. Pure Modular Encounter Architecture (`src/game/encounters.ts`)

Encounters are decoupled from the combat loop into typed, pure data structures:

- `EncounterId`: `"mire-hound" | "iron-bile-gorgon" | "cinder-weaver"`.
- `IntentModifier`: `"standard" | "corrosive" | "petrify" | "braced" | "ignite" | "flurry" | "detonate"`.
- `ENCOUNTERS`: Complete record containing lore, location, difficulty rating, health parameters, intent sequences, mechanics summaries, counter-tactics, and victory/defeat copy.
- Backward compatibility: `ENEMY` is exported as an alias pointing to the Mire Hound, ensuring zero regressions for legacy callers.

### B. Boss Design Specifications

#### 1. The Lantern-Jawed Mire Hound (Apprentice · 46 HP · The Blackwater Crossing)

- **Fantasy:** Lurking swamp predator.
- **Pattern:** Gnashing Bite (Atk 7) → Sinks into the Mire (Guard 8) → Lure-Light Lash (Atk 5) → Drowning Lunge (Atk 12).
- **Artwork:** Dedicated raster asset `src/assets/mire-hound.jpg`.

#### 2. The Iron-Bile Gorgon (Veteran · 52 HP · The Calcified Sepulcher)

- **Fantasy:** Serpentine calcified monstrosity with caustic secretions and petrifying glare.
- **Mechanic 1 — Corrosive Armor:** "Caustic Bile" (Atk 6). If unblocked (`taken > 0`), inflicts `corrodedTurns: 1` (-3 penalty to player Guard next round). Counterable by assigning >= 6 Guard on round 1.
- **Mechanic 2 — Petrifying Gaze:** "Petrifying Gaze" (Atk 5). Pierces defenses if player `Guard < 5`, adding +1 `petrification` stack. At 3 stacks, calcified marrow violently fractures: player takes 8 bonus Shatter damage, and petrification resets to 0. Counterable by maintaining >= 5 Guard to reflect the gaze.
- **Mechanic 3 — Calcified Shell:** Braces for 10 Guard. High threshold counterable by poison (Plaguewright) or strategic burst.
- **Mechanic 4 — Iron-Tail Slam:** Crushing 14-damage physical strike telegraphed for round 4.
- **Artwork:** Intentional dark-fantasy SVG beast sigil with coiled ribcage, caustic green eye, and archival field sketch badge.

#### 3. The Cinder-Weaver (Master · 42 HP · The Smoking Crucible)

- **Fantasy:** Arachnid-furnace construct weaving incendiary ash-threads.
- **Mechanic 1 — Smoldering Embers:** "Searing Spinneret" (Atk 5) plants 2 embers; "Molten Cocoon" (Guard 7) plants 1 ember.
- **Mechanic 2 — Defensive Quenching:** Every die assigned to `Guard` during player resolution extinguishes 1 ember (`quenched = Math.min(embers, guardDice)`). Creates a dynamic strategic choice between racing the boss with Strike dice or quenching embers with Guard dice.
- **Mechanic 3 — Conflagration Detonation:** "Conflagration" (Atk 9) detonates all active embers on the player for +2 bonus damage per ember (`bonus = embers * 2`), then clears ember stacks. Counterable by quenching embers in preceding rounds.
- **Mechanic 4 — Ash-Leg Flurry:** 8-damage rapid multi-strike.
- **Artwork:** Intentional dark-fantasy SVG furnace-spider crest with radiating ash spokes, molten belly core, and archival field sketch badge.

### C. Combat Engine State Expansion (`src/game/engine.ts`)

`GameState` maintains pure deterministic tracks:

- `encounterId`: Identifies active boss.
- `petrification`: Number of petrification stacks (0 to 3).
- `corrodedTurns`: Rounds of armor corrosion remaining (-3 Guard).
- `embers`: Active smoldering embers (0+).

`guardTotal(s)` strictly applies corrosion penalties (`Math.max(0, raw + bonus - penalty)`).
All ten species abilities seamlessly interact with the new mechanics:

- **Forge-Tank (Molten Bastion):** +10 Guard deflects Petrifying Gaze and quenches embers while scorching.
- **The Raven (Eightfold Deception):** Completely avoids Caustic Bile corrosion and Conflagration hits.
- **The Plaguewright (Living Contagion):** Bypasses the Gorgon's 10 Guard Calcified Shell with unblockable poison.
- **The Oathbreaker (Betrayer's Riposte):** Returns full incoming damage, punishing Tail-Slam and Conflagration.
- **The Oracle (Borrowed Tomorrow):** Foresees upcoming Gaze or Conflagration turns.
- **The Bloodhowl (Near-Death Frenzy):** Rapidly executes the Weaver's smaller 42 HP pool.
- **The Thornwarden (Verdant Snare):** Cancels Gorgon Gaze or Weaver Cocoon/Conflagration actions entirely.
- **The Gear-Saint (Overclock):** 4th die provides extra versatility to quench embers or break stone shells.
- **The Dirgesinger (Requiem):** Converts Conflagration burst damage into healing.
- **The Hollow Star (Unmake Fate):** Sets all dice to 6s for critical 18+ Guard or Strike rounds.

### D. Tabletop Selection & Artwork Fallback

1. **Bestiary Folio Tabs (`src/routes/select.tsx`):**
   - Folio I: The Ten Species (roster grid with single master PNG crop).
   - Folio II: The Three Horrors (interactive adversary cards with difficulty ratings, threat analysis, and counter-tactics).
   - Specimen sheet provides an integrated Target Adversary badge with one-click toggling and seamless "Enter the Veil" departure.
2. **Persistence (`src/game/storage.ts`):**
   - Independent `dreadveil.selectedEncounter` key in `localStorage`.
   - Defaults cleanly to `"mire-hound"` if unset or invalid.
3. **Combat Route (`src/routes/play.tsx`):**
   - Dynamic location, title, and artwork loading.
   - Vitals & intent displays with live status indicators (Petrification X/3, Corroded Armor, Smoldering Embers).
   - "Fight Again" cleanly repeats the selected encounter without reverting to the Mire Hound.
   - Tailored victory and defeat narratives for each adversary.

---

## 3. Consequences & Verification

- **Determinism:** 100% deterministic reducer state transitions; zero hidden RNG.
- **Backward Compatibility:** All existing 72 tests and baseline behavior maintained.
- **New Test Coverage:** 46 new tests added across `encounters.test.ts`, `boss-mechanics.test.ts`, `encounter-selection.test.tsx`, and `storage.test.ts` (119 total tests passing).
- **SemVer:** Minor version incremented to 0.2.0.
