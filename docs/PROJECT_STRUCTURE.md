# DREADVEIL ADVENTURES — PROJECT STRUCTURE & REPOSITORY ARCHITECTURE

**Project:** Dreadveil Adventures
**Version:** 0.4.0
**Last Verified:** 2026-10-21
**Runtime:** Node.js 22, Vite 8, React 19, TanStack Start (SSR), TypeScript 5.8, Tailwind CSS v4

---

## A. Directory Tree

```
/
├── .lovable/
│   └── project.json                  # Lovable template metadata
├── docs/
│   ├── PROJECT_STRUCTURE.md          # Comprehensive architectural and file structure reference (this document)
│   └── decisions/
│       ├── 0001-ai-studio-migration-and-ssr-hydration.md # ADR 0001
│       ├── 0002-roster-artwork-restoration-and-accessibility.md # ADR 0002
│       ├── 0003-full-viewport-layout-and-artwork-scaling.md # ADR 0003
│       ├── 0004-encounter-variety-and-bestiary-expansion.md # ADR 0004
│       ├── 0005-polyhedral-dice-system.md # ADR 0005
│       └── 0006-complete-polyhedral-dice-collection.md # ADR 0006 (The Arsenal of Fates)
├── ProjectState/
│   ├── implementation_checkpoint     # High-priority operational state & immediate tasks
│   ├── project_context.md            # Canonical technical, game mechanics & design manual
│   └── AI_handoff.md                 # Complete AI-to-AI / developer onboarding guide
├── public/
│   ├── dreadveil-roster.png          # Full 10-species illustrated roster image (static mirror)
│   ├── favicon.ico                   # Game favicon icon
│   └── robots.txt                    # Search crawler directive
├── src/
│   ├── assets/
│   │   ├── dreadveil-roster.png      # High-resolution (1376x768) 10-species roster sheet
│   │   ├── dreadveil-roster.png.asset.json # Roster asset metadata reference
│   │   └── mire-hound.jpg            # Boss creature illustration (Lantern-Jawed Mire Hound)
│   ├── components/
│   │   ├── DiceLoadoutModal.tsx      # Tabletop dice pouch drawer for configuring active 3-die loadouts and presets
│   │   ├── EncounterArt.tsx          # Dual raster & SVG beast sigil renderer with archival field sketch badges
│   │   ├── EncounterSelector.tsx     # Responsive bestiary adversary card selection component
│   │   ├── PolyhedralDie.tsx         # Tactile SVG polyhedral die renderer (d4, d6, d8, d10, d12, d20) with facet wireframes
│   │   └── ui/                       # Radix UI and shadcn-style design system primitives
│   │       ├── accordion.tsx, alert-dialog.tsx, alert.tsx, aspect-ratio.tsx, avatar.tsx
│   │       ├── badge.tsx, breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx, carousel.tsx
│   │       ├── chart.tsx, checkbox.tsx, collapsible.tsx, command.tsx, context-menu.tsx
│   │       ├── dialog.tsx, drawer.tsx, dropdown-menu.tsx, form.tsx, hover-card.tsx
│   │       ├── input-otp.tsx, input.tsx, label.tsx, menubar.tsx, navigation-menu.tsx
│   │       ├── pagination.tsx, popover.tsx, progress.tsx, radio-group.tsx, resizable.tsx
│   │       ├── scroll-area.tsx, select.tsx, separator.tsx, sheet.tsx, sidebar.tsx
│   │       ├── skeleton.tsx, slider.tsx, sonner.tsx, switch.tsx, table.tsx, tabs.tsx
│   │       ├── textarea.tsx, toggle-group.tsx, toggle.tsx, tooltip.tsx
│   ├── game/                         # Authoritative Pure Game Engine (Single Source of Truth)
│   │   ├── boss-mechanics.test.ts    # Unit tests for Gorgon & Weaver mechanics, status effects, and abilities
│   │   ├── characters.ts             # 10 species statistics, abilities, rosterRect crop coordinates
│   │   ├── characters.test.ts        # Unit tests for roster crop bounds and data integrity
│   │   ├── combat-rules.test.ts      # Exhaustive verification of combat rules and all 10 abilities
│   │   ├── dice.ts                   # Tabletop polyhedral definitions, traits (Steadfast Ward, Nat 20/1), and presets
│   │   ├── encounters.ts             # Pure encounter data, lore, intent patterns, and threat ratings
│   │   ├── encounters.test.ts        # Unit tests for encounters metadata, patterns, and fallbacks
│   │   ├── engine.test.ts            # Unit tests for turn flow, dice toggles, reroll mechanics
│   │   ├── engine.ts                 # Pure deterministic reducer, dice rolls, multi-boss intent cycle, loadout state
│   │   ├── polyhedral-dice.test.ts   # Unit tests for polyhedral roll bounds, loadout math, traits, and ability synergy
│   │   ├── storage.test.ts           # Unit tests for browser localStorage persistence (character + encounter + loadout)
│   │   └── storage.ts                # Browser persistence wrapper for species, encounter, and active dice loadout
│   ├── hooks/
│   │   └── use-mobile.tsx            # Viewport breakpoint detection hook
│   ├── lib/
│   │   ├── error-capture.ts          # Server-side unhandled exception tracking
│   │   ├── error-page.ts             # Server error HTML renderer
│   │   ├── lovable-error-reporting.ts# Runtime error boundary reporting
│   │   └── utils.ts                  # Class merger utility (`cn`)
│   ├── routes/                       # TanStack Router file-based application routes
│   │   ├── README.md                 # Routing conventions guide
│   │   ├── __root.tsx                # HTML shell, OpenGraph tags, font links, hydration guards
│   │   ├── index.tsx                 # Title screen and quick-start entry
│   │   ├── select.tsx                # Bestiary selection screen with Folio tabs (Species & Horrors)
│   │   └── play.tsx                  # Tactical turn-based combat duel against chosen adversary
│   ├── test/
│   │   ├── app-routing.test.tsx      # Routing and title screen integration test
│   │   ├── encounter-selection.test.tsx # Integration tests for adversary folios, persistence, and restart
│   │   ├── gameplay-regression.test.tsx # 42 end-to-end player journey regression tests
│   │   └── setup.ts                  # Vitest environment setup (@testing-library/jest-dom)
│   ├── routeTree.gen.ts              # Generated TanStack router manifest
│   ├── router.tsx                    # Router and QueryClient factory
│   ├── server.ts                     # TanStack Start SSR entry and HTTP error normalizer
│   ├── start.ts                      # TanStack Start middleware and CSRF protection
│   └── styles.css                    # Global Tailwind CSS v4 and bespoke bestiary tabletop utilities
├── .env.example                      # Template for environment configuration
├── .gitignore                        # Git exclusion rules
├── .prettierignore                   # Prettier exclusions
├── .prettierrc                       # Prettier configuration
├── AGENTS.md                         # Architectural directives for coding agents
├── CHANGELOG.md                      # Semantic version change log
├── components.json                   # shadcn-ui configuration
├── eslint.config.js                  # ESLint flat configuration
├── metadata.json                     # AI Studio applet capabilities and metadata
├── package.json                      # Project dependencies, engines, and run scripts
├── README.md                         # Product vision and local setup instructions
├── roadmap.md                        # High-level product milestones
├── tsconfig.json                     # Strict TypeScript compiler options
├── vite.config.ts                    # Vite and TanStack Start bundler configuration
└── vitest.config.ts                  # Vitest configuration
```

---

## B. File Responsibility Table

| Path                            | Purpose / Domain           | Main Responsibilities                                                                                                                                         | Key Dependencies                                  |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/game/engine.ts`            | **Game Rules (Authority)** | Pure game state reducer, turn progression, enemy intent cycle, damage/guard calculations, and ability activations. Zero DOM or React dependencies.            | `characters.ts`                                   |
| `src/game/characters.ts`        | **Game Rules (Data)**      | Definitions for all 10 hybrid species (HP, weapon, ability name & mechanics text), `rosterRect` coordinate mapping, and `portraitStyle` CSS builder.          | None                                              |
| `src/game/storage.ts`           | **Persistence**            | Reads/writes active character selection to `localStorage` under key `dreadveil.selectedCharacter`. Fails gracefully when storage is unavailable.              | `characters.ts`                                   |
| `src/routes/index.tsx`          | **Presentation (View)**    | Title screen, atmospheric background image, "New Game" button, and conditional "Quick start as [Species]" action.                                             | `characters.ts`, `storage.ts`, `button.tsx`       |
| `src/routes/select.tsx`         | **Presentation (View)**    | Interactive 10-card species selection grid using Radix RadioGroup, sticky inspection panel, and "Enter the Veil" action.                                      | `characters.ts`, `storage.ts`, Radix UI           |
| `src/routes/play.tsx`           | **Presentation (View)**    | Full tactical battle screen: enemy intent banner, player vitals, interactive casting bones tray (Strike/Guard assignment), ability strip, and combat journal. | `engine.ts`, `characters.ts`, `storage.ts`        |
| `src/routes/__root.tsx`         | **Application Shell**      | Top-level HTML template, OpenGraph tags, web fonts, SSR hydration guards, and TanStack Router Outlet.                                                         | `@tanstack/react-router`, `@tanstack/react-query` |
| `src/server.ts`                 | **SSR Server Entry**       | Catches unhandled throws during server-side rendering, normalizes h3 500 error responses, and renders fallback error page.                                    | `@tanstack/react-start`, `error-capture.ts`       |
| `src/start.ts`                  | **SSR Middleware**         | Registers request middleware and CSRF validation for TanStack Start server functions.                                                                         | `@tanstack/react-start`, `error-page.ts`          |
| `src/styles.css`                | **Styling**                | Tailwind CSS v4 layer, dark-fantasy theme variables, parchment textures, dice pip grids, iron frames, and responsive breakpoints.                             | Tailwind CSS v4, tw-animate-css                   |
| `src/game/combat-rules.test.ts` | **Verification (Tests)**   | 11 rigorous automated tests verifying combat invariants, cooldowns, and the exact mechanics of all 10 species abilities.                                      | `vitest`, `engine.ts`, `characters.ts`            |
| `src/game/engine.test.ts`       | **Verification (Tests)**   | Unit tests for dice rolling, rerolls, die toggling, and turn transitions.                                                                                     | `vitest`, `engine.ts`                             |
| `src/game/storage.test.ts`      | **Verification (Tests)**   | Tests for localStorage read/write and unknown ID handling.                                                                                                    | `vitest`, `storage.ts`                            |
| `src/test/app-routing.test.tsx` | **Verification (Tests)**   | Component routing tests verifying route navigation.                                                                                                           | `vitest`, `@testing-library/react`                |

---

## C. Architecture & Dependency Flow

```
                                  [ User Input / Events ]
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │   UI Route Components    │
                               │ (index, select, play.tsx)│
                               └─────────────┬────────────┘
                                             │
               ┌─────────────────────────────┼────────────────────────────┐
               │ Dispatches Actions          │ Reads Data                 │ Reads/Saves ID
               ▼                             ▼                            ▼
     ┌───────────────────┐         ┌───────────────────┐        ┌───────────────────┐
     │ src/game/engine.ts│◄────────┤src/game/characters│        │src/game/storage.ts│
     │  (Pure Reducer)   │         │   (Species Data)  │        │  (localStorage)   │
     └─────────┬─────────┘         └─────────┬─────────┘        └───────────────────┘
               │                             │
               │ Emits Next GameState        │ Crops Portrait Hotspots
               ▼                             ▼
     ┌─────────────────────────────────────────────────┐
     │           Rendered Tabletop Interface           │
     │  (Parchment cards, Casting bones, Combat log)   │
     └─────────────────────────────────────────────────┘
```

1. **Deterministic Reducer:**
   - `src/game/engine.ts` is the single authoritative source of truth for combat rules.
   - It maintains strict determinism: randomness (e.g. dice roll values) is generated exclusively in UI event handlers (`rollValues(count)`) or test fixtures and passed into action payloads.
   - Components never compute damage, guard totals, or enemy intents manually.
2. **Character & Roster Authority:**
   - `src/game/characters.ts` defines the canonical 10 species.
   - Any UI displaying character stats or cropping portraits references `CHARACTERS`, `getCharacter()`, `rosterRect()`, or `portraitStyle()`.
3. **Asset Resolution:**
   - Components import `dreadveilRoster` directly from `src/assets/dreadveil-roster.png` via ESM. Vite bundles and hashes the file into production output.
   - A static mirror is also maintained at `public/dreadveil-roster.png` for root path access.
   - `dreadveil-roster.png.asset.json` provides metadata continuity.

---

## D. Asset Catalogue & Roster Mapping

### Source Artwork

- **File:** `src/assets/dreadveil-roster.png` (and mirror `public/dreadveil-roster.png`)
- **Dimensions:** 1376 × 768 pixels (RGBA PNG, 2.3 MB)
- **Layout:** 2 rows × 5 columns of illustrated monster portraits on parchment cards.

### Species Crop Matrix (`rosterRect` in `src/game/characters.ts`)

| Index | Species ID     | Display Name     | Grid Position | Left (%) | Top (%) | Width (%) | Height (%) |
| ----- | -------------- | ---------------- | ------------- | -------- | ------- | --------- | ---------- |
| 0     | `forge-tank`   | Forge Tank       | Row 0, Col 0  | 5.80%    | 15.40%  | 17.10%    | 36.50%     |
| 1     | `raven`        | The Raven        | Row 0, Col 1  | 23.95%   | 15.40%  | 17.10%    | 36.50%     |
| 2     | `plaguewright` | The Plaguewright | Row 0, Col 2  | 42.10%   | 15.40%  | 17.10%    | 36.50%     |
| 3     | `oathbreaker`  | The Oathbreaker  | Row 0, Col 3  | 60.25%   | 15.40%  | 17.10%    | 36.50%     |
| 4     | `oracle`       | The Oracle       | Row 0, Col 4  | 78.40%   | 15.40%  | 17.10%    | 36.50%     |
| 5     | `bloodhowl`    | The Bloodhowl    | Row 1, Col 0  | 5.80%    | 53.60%  | 17.10%    | 36.50%     |
| 6     | `thornwarden`  | The Thornwarden  | Row 1, Col 1  | 23.95%   | 53.60%  | 17.10%    | 36.50%     |
| 7     | `gear-saint`   | The Gear-Saint   | Row 1, Col 2  | 42.10%   | 53.60%  | 17.10%    | 36.50%     |
| 8     | `dirgesinger`  | The Dirgesinger  | Row 1, Col 3  | 60.25%   | 53.60%  | 17.10%    | 36.50%     |
| 9     | `hollow-star`  | The Hollow Star  | Row 1, Col 4  | 78.40%   | 53.60%  | 17.10%    | 36.50%     |

### Enemy Boss Artwork

- **File:** `src/assets/mire-hound.jpg`
- **Subject:** The Lantern-Jawed Mire Hound (moss-covered beast with glowing lantern jaw).
- **Dimensions:** 1280 × 768 pixels.

---

## E. Maintenance & Extension Rules

### 1. Adding or Modifying a Species

1. Update `CharacterId` union and `CHARACTERS` array in `src/game/characters.ts`.
2. Define `maxHp`, `cooldown`, `weapon`, and `abilityText`.
3. If modifying grid positions, update `rosterRect()` in `src/game/characters.ts`.
4. Update `src/game/combat-rules.test.ts` to add test assertions for the ability.

### 2. Modifying Combat Rules

1. Implement logic inside `reducer()` in `src/game/engine.ts`.
2. Never call `Math.random()` or impure APIs inside the reducer. All randomness must be passed in `Action` payloads.
3. Add unit test coverage in `src/game/combat-rules.test.ts` or `src/game/engine.test.ts`.
4. Run `npm run test` to verify zero regressions.

### 3. Adding an Asset

1. Place binary image assets directly in `src/assets/`.
2. If the asset needs public URL access without module bundler resolution, copy to `public/`.
3. In components, import directly: `import myAsset from "@/assets/my-asset.png"`.

### 4. Code Standards & Verification Gate

Before declaring any task done:

```sh
npm run test          # Must pass all tests
npx tsc --noEmit      # Must output 0 type errors
npm run lint          # Must pass with 0 errors
npm run format        # Ensure clean Prettier formatting
npm run build         # Must produce production bundle cleanly
```
