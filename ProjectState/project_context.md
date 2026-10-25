# DREADVEIL ADVENTURES — TECHNICAL & PRODUCT CONTEXT

## 1. Project Vision & Identity

- **Name:** Dreadveil Adventures (Dreadveil)
- **Genre:** Dark-fantasy, tactical, dice-driven creature combat adventure.
- **Platform:** Modern browser-based web application (responsive mobile & desktop).
- **Aesthetic Direction:**
  - Full-screen antique illustrated dark-fantasy title screen: colossal ruined cathedral (`public/assets/dying-gods-bg.jpg` at `bg-[center_18%]`), dying god silhouette with eclipse corona, luminous cathedral depth with soft radial vignette and localized scrims.
  - Proportional Viewport Coordinate System:
    - Left brand & menu column: `left: 5.5vw`, `width: 34vw` (max 480px).
    - Celestial Astrolabe Star: Naturally aligned horizontally above wordmark with 28px 8-pointed gold compass star.
    - Title: Sculpted `DREADVEIL` (`text-[46px]`–`[50px]` on desktop) with `ADVENTURES` (`tracking-[0.42em]`) and centered 2-line whisper tagline.
    - Three main menu plaques (width ~34vw, height ~64px, tighter gap): New Expedition (8-spoke sunburst), The Descent (winged caduceus/dagger), Continue Run (heraldic crest shield).
    - Bottom-left navigation: `left: 5.5vw`, `bottom: 4.5vh`, with melting altar candlelight cluster and small-caps links (`BESTIARY`, `DICE ARSENAL`, `CHRONICLES`, `SETTINGS`).
    - Bottom-Right Current Adventurer panel: `right: 3.5vw`, `bottom: 4.5vh`, `width: 25.5vw` (max 370px), vertically compact with square character portrait, species/class lore, and a single row of 6 tactile polyhedral dice wireframes with bold etched face numbers (`d4`–`d20`) and enhanced gold luster.
  - The Dying Gods Combat Arena (`src/routes/play.tsx`):
    - Upper-Left: Main enemy artwork container with `src/assets/mire-hound.jpg`, upper edge vitality track, boss title, live HP, and threat medallion (grade 8).
    - Upper-Right: Parchment vellum lore and intent panel (`#D6C7A5`), creature lore, intent icon, attack/guard value, and narrative intent description.
    - Lower-Left: Player character panel with master roster portrait, role, hybrid class, vitality track, and 3 status sigils.
    - Lower-Middle: Polyhedral dice tray displaying 6 physical dice (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`), interactive 3-die active loadout slots, and three wide action plaques (`STRIKE`, `GUARD`, `REROLL (N)`).
    - Lower-Right: Signature ability card with arcane icon, title, description, and interactive Invoke trigger.
  - Antique bestiary, dark iron frame, aged parchment card textures, muted bronze, candlelight, and dark teal atmospheric shadows.
  - Expressive monstrous hybrid creature artwork cropped from a unified 10-species roster sheet.
  - Classic serif and antique headings (`IM Fell English SC`, `Spectral`).
  - Tactile tabletop presentation: polyhedral dice (d4–d20), percentile divination (d%), interactive assignment into Strike (swords) or Guard (shields).

---

## 2. Architecture & Technology Stack

- **Framework:** React 19 SPA running on Vite 8 with TanStack Start (`@tanstack/react-start`) SSR wrapper and TanStack Router (`@tanstack/react-router`).
- **Server Entry:** `src/server.ts` (SSR catastrophic error boundary and normalization wrapper) and `src/start.ts` (Start middleware & CSRF protection).
- **Language:** TypeScript 5.8 (ES2022 target, strict type safety, zero `any` tolerance).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss";`), custom semantic theme variables, and Radix UI primitives.
- **State Management & Game Rules:**
  - Pure deterministic game engine module under `src/game/engine.ts`.
  - Game rules and reductions have zero DOM or React dependencies.
  - Randomness (dice rolls, abilities) is generated in UI event handlers and dispatched as deterministic action payloads.
  - Browser local persistence managed via `src/game/storage.ts` using `localStorage`.
- **Testing:** Vitest 4 with `@testing-library/react` and `jsdom`.

---

## 3. Directory & Module Structure

```
/
├── ProjectState/                 # Mandatory project continuity files
│   ├── implementation_checkpoint
│   ├── project_context.md
│   └── AI_handoff.md
├── docs/                         # Architecture decision records & system manuals
│   ├── PROJECT_STRUCTURE.md      # Comprehensive repository & file structure guide
│   └── decisions/
│       ├── 0001-ai-studio-migration-and-ssr-hydration.md
│       ├── 0002-roster-artwork-restoration-and-accessibility.md
│       ├── 0003-full-viewport-layout-and-artwork-scaling.md
│       ├── 0004-encounter-variety-and-bestiary-expansion.md
│       ├── 0005-polyhedral-dice-system.md
│       └── 0006-complete-polyhedral-dice-collection.md
├── public/                       # Static public assets (favicon.ico, robots.txt, dreadveil-roster.png)
│   └── assets/                   # Public media assets (dying-gods-bg.jpg)
├── src/
│   ├── assets/                   # Roster artwork and enemy illustrations
│   │   ├── dreadveil-roster.png  # Master 1376x768 RGBA roster artwork
│   │   ├── dreadveil-roster.png.asset.json # Roster asset metadata
│   │   └── mire-hound.jpg        # Mire hound artwork
│   ├── components/               # UI component library (shadcn/radix primitives & bestiary cards)
│   │   ├── DiceLoadoutModal.tsx  # Tabletop dice pouch drawer for configuring active 3-die loadouts, presets & Oracle divination
│   │   ├── EncounterArt.tsx      # Dual raster & SVG beast sigil renderer
│   │   ├── EncounterSelector.tsx # Bestiary adversary selection component
│   │   ├── PolyhedralDie.tsx     # Tactile SVG polyhedral die renderer (d4, d6, d8, d10, d12, d20, d%)
│   │   └── ui/
│   ├── game/                     # Pure game logic (Single Source of Truth)
│   │   ├── boss-mechanics.test.ts # Deep unit tests for Gorgon & Weaver mechanics
│   │   ├── characters.ts         # Ten hybrid species definitions, rosterRect, portraitStyle
│   │   ├── characters.test.ts    # Unit tests for roster crop bounds and data integrity
│   │   ├── combat-rules.test.ts  # Verification of combat invariants and all 10 abilities
│   │   ├── dice.ts               # Tabletop polyhedral definitions, traits (Steadfast Ward, Nat 20/1), and presets
│   │   ├── encounters.ts         # Pure encounter data, lore, intent patterns, and threat ratings
│   │   ├── encounters.test.ts    # Unit tests for encounters metadata and getters
│   │   ├── engine.ts             # Reducer, turn cycle, multi-boss intent patterns, ability rules, loadout state
│   │   ├── engine.test.ts        # Unit tests for game state transitions
│   │   ├── polyhedral-dice.test.ts # Unit tests for polyhedral bounds, balance, traits, and ability synergy
│   │   ├── storage.ts            # Local persistence (species, encounter, dice loadout)
│   │   └── storage.test.ts       # Storage unit tests
│   ├── lib/                      # Utilities and error capturing
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── lovable-error-reporting.ts
│   │   └── utils.ts
│   ├── routes/                   # TanStack Router route definitions
│   │   ├── __root.tsx            # HTML document shell, meta tags, font links, query client
│   │   ├── index.tsx             # Title screen and quick-start entry
│   │   ├── select.tsx            # Ten-species & three-adversary bestiary selection screen
│   │   └── play.tsx              # Tactical combat encounter against selected adversary
│   ├── test/
│   │   ├── app-routing.test.tsx  # Routing and title screen integration test
│   │   ├── encounter-selection.test.tsx # Adversary folios, selection, and restart integration tests
│   │   ├── gameplay-regression.test.tsx # 42 end-to-end player journey regression tests
│   │   └── setup.ts              # Vitest environment setup
│   ├── routeTree.gen.ts          # Auto-generated TanStack router tree
│   ├── router.tsx                # Router instantiation
│   ├── server.ts                 # Production SSR server entry point
│   ├── start.ts                  # TanStack Start middleware setup
│   └── styles.css                # Global Tailwind CSS and custom bestiary utilities
├── CHANGELOG.md                  # Semantic release and change history
├── package.json                  # Dependencies and execution scripts
├── tsconfig.json                 # Strict TypeScript configuration
└── vite.config.ts                # Vite and TanStack Start plugins
```

---

## 4. Gameplay Rules & Combat Systems

### Combat Loop

1. **Encounter Setup:**
   - Player selects one of 10 hybrid species and one of 3 boss adversaries.
   - Encounter loads selected enemy with its specific vitality pool and intent sequence.
   - Round counter begins at 1.
2. **Phase I: Cast (Roll):**
   - Player rolls active loadout of 3 polyhedral dice (default: _Balanced Triad_ `["d4", "d6", "d8"]`).
   - Each die generates a random integer within its true mathematical face range ($1\text{–}N$).
   - Dice land initially assigned to Strike.
3. **Phase II: Assign & Reroll:**
   - Player can toggle any die between **Strike** (deals damage to enemy) and **Guard** (absorbs incoming damage).
   - Tactical Die Traits:
     - **d4 Steadfast Ward:** Grants +1 bonus Guard when assigned to Guard.
     - **d20 Gambler's Blade:** Natural 20 yields a Critical Surge (+5 bonus value, 25 total); Natural 1 yields a Critical Fumble (0 value). Guarding with a d20 carries a 25% hazard of rolling $\le 5$ against heavy boss strikes.
   - Player receives `BASE_REROLLS` (1 reroll per round), which rerolls all dice according to their specific die type side count while maintaining assigned roles.
   - Loadout Pouch: Players may reconfigure their active 3-die loadout during the Roll phase using the Dice Pouch drawer.
   - Player may invoke their species signature ability if available and conditions are met.
4. **Phase III: Turn Resolution (End Turn):**
   - Strike damage is applied against enemy (reduced by enemy Guard). Nat 20/1 modifiers applied.
   - Any active poison damage ticks (e.g. Plaguewright's Living Contagion).
   - If enemy dies, combat immediately resolves as **Victory**.
   - Embers Quenching: Against the Cinder-Weaver, each die assigned to Guard extinguishes 1 active smoldering ember.
   - If enemy is stunned/snared (e.g. Thornwarden's Verdant Snare), enemy action is skipped.
   - Otherwise, enemy executes its predetermined intent from its pattern.
   - Enemy attack is applied against player (reduced by player Guard, factoring in d4 Steadfast Ward +1 bonuses, d20 Nat 20/1 modifiers, and active armor corrosion).
   - Boss on-hit effects trigger:
     - Gorgon: Caustic Bile applies Corroded (-3 Guard next round) if damage penetrates; Petrifying Gaze adds 1 Petrification if Guard < 5 (shatters for 8 damage at 3 stacks).
     - Weaver: Searing Spinneret embeds 2 embers; Conflagration ignites all embers for +2 damage each.
   - If player HP reaches 0, combat ends in **Defeat**. (Simultaneous death favors enemy / defeat).

### The Three Adversary Horrors

1. **The Lantern-Jawed Mire Hound (Apprentice · 46 HP · The Blackwater Crossing):**
   - Gnashing Bite (Atk 7) → Sinks into the Mire (Guard 8) → Lure-Light Lash (Atk 5) → Drowning Lunge (Atk 12).
2. **The Iron-Bile Gorgon (Veteran · 52 HP · The Calcified Sepulcher):**
   - Caustic Bile (Atk 6, Corrosive) → Calcified Shell (Guard 10) → Petrifying Gaze (Atk 5, Petrify if Guard < 5) → Iron-Tail Slam (Atk 14).
3. **The Cinder-Weaver (Master · 42 HP · The Smoking Crucible):**
   - Searing Spinneret (Atk 5, +2 Embers) → Ash-Leg Flurry (Atk 8) → Molten Cocoon (Guard 7, +1 Ember) → Conflagration (Atk 9, +2 damage per Ember). Guard dice extinguish 1 ember each.
   - If both survive, round increments, rerolls reset, and ability cooldowns tick down by 1.

---

## 5. Ten Hybrid Species & Signature Abilities

1. **Forge Tank** (Rhinoceros × Badger × Tortoise)
   - _Role:_ Tank / Defender | _HP:_ 44 | _Weapon:_ Anvil Maul | _Cooldown:_ 3 rounds
   - _Ability: Molten Bastion_ — Gain 10 Guard this round and inflict 3 counter-damage when attacked.
2. **The Raven** (Raven × Octopus)
   - _Role:_ Rogue / Assassin | _HP:_ 30 | _Weapon:_ Twin Crescent Daggers | _Cooldown:_ 3 rounds
   - _Ability: Eightfold Deception_ — Completely evades the enemy's attack this round.
3. **The Plaguewright** (Hyena × Axolotl × Leech)
   - _Role:_ Alchemist / Controller | _HP:_ 34 | _Weapon:_ Distillation Staff | _Cooldown:_ 4 rounds
   - _Ability: Living Contagion_ — Inflicts 3 poison damage at the start of resolution for the next 4 rounds.
4. **The Oathbreaker** (Stag × Vulture × Scorpion)
   - _Role:_ Duelist / Counterattacker | _HP:_ 36 | _Weapon:_ Spectral Greatsword | _Cooldown:_ 3 rounds
   - _Ability: Betrayer's Riposte_ — Reflects half of unblocked incoming attack damage back to the attacker.
5. **The Oracle** (Owl × Moth × Anglerfish)
   - _Role:_ Mage / Seer | _HP:_ 28 | _Weapon:_ Rune Staff | _Cooldown:_ 3 rounds
   - _Ability: Borrowed Tomorrow_ — Grants +2 rerolls immediately and previews the enemy's next intent.
6. **The Bloodhowl** (Boar × Wolf × Bat)
   - _Role:_ Berserker / High Risk | _HP:_ 38 | _Weapon:_ Executioner Cleaver | _Cooldown:_ 2 rounds
   - _Ability: Near-Death Frenzy_ — Costs 5 HP to activate. Doubles Strike damage (triples if HP ≤ 33%).
7. **The Thornwarden** (Praying Mantis × Deer × Pangolin)
   - _Role:_ Ranger / Trapper | _HP:_ 32 | _Weapon:_ Thornwood Bow | _Cooldown:_ 4 rounds
   - _Ability: Verdant Snare_ — Fully entangles the Mire Hound, disabling its action for the round.
8. **The Gear-Saint** (Frog × Armadillo × Beetle)
   - _Role:_ Artificer / Chronomancer | _HP:_ 36 | _Weapon:_ Arcane Chronometer | _Cooldown:_ 3 rounds
   - _Ability: Overclock_ — Casts a permanent 4th die into the tray for the remainder of combat.
9. **The Dirgesinger** (Fox × Peacock × Cicada)
   - _Role:_ Bard / Manipulator | _HP:_ 32 | _Weapon:_ Hexed Lute | _Cooldown:_ 4 rounds
   - _Ability: Requiem of Reversal_ — Inverts enemy attack damage into direct healing (capped at Max HP).
10. **The Hollow Star** (Hare × Abyssal Eel × Anglerfish)
    - _Role:_ Warlock / Reality Bender | _HP:_ 30 | _Weapon:_ Void Focus | _Cooldown:_ 4 rounds
    - _Ability: Unmake Fate_ — Costs 6 HP to activate. Alters all held dice into maximum values (6s).

---

## 6. Runtime & AI Studio Environment Constraints

- **Port & Host:** Port 3000 on `0.0.0.0` is the only external port.
- **Package Manager:** Strict `npm` standard. Bun, yarn, and pnpm lockfiles are disallowed.
- **Node.js Target:** Node.js 22 (linux-x64).
- **Server Execution:** `vite dev --host 0.0.0.0 --port 3000` via npm dev script.
- **Hydration Guards:** TanStack Start SSR requires `suppressHydrationWarning` on root document elements (`html`, `body`, `main`) and dynamic background coordinate styles.

---

## 7. Developer & Verification Commands

```sh
# Install dependencies
npm install

# Run dev server on port 3000
npm run dev

# Run full unit & combat test suite
npm run test

# Type-check entire project without emitting
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Format code with Prettier
npm run format

# Production build
npm run build
```
