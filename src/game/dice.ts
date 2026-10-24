/**
 * Pure polyhedral dice definitions, lore, and mechanics for Dreadveil Adventures.
 * Standard D&D tabletop dice collection: d4, d6, d8, d10, d12, d20, and d% (percentile).
 * Pure game logic — zero React, zero DOM dependencies.
 */

export type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d%";

export type DieRole = "strike" | "guard";

export type DieCategory = "combat" | "utility";

export interface DieConfig {
  type: DieType;
  sides: number;
  name: string; // Thematic title (e.g. "The Bastion Shard")
  shape: string; // Tabletop geometry (e.g. "Tetrahedron")
  label: string; // Notation (e.g. "d4", "d%")
  facesDisplay: string; // Display range (e.g. "1–4", "00–90")
  roleBias: "guard" | "balanced" | "strike" | "high_risk" | "utility";
  category: DieCategory;
  lore: string; // Evocative dark-fantasy lore
  description: string; // Concise gameplay utility
  specialTrait: string; // Mechanical trait description
  unlockedByDefault: boolean;
}

/** The six standard combat dice available for the 3-die active loadout */
export const COMBAT_DIE_TYPES: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20"];

/** All seven standard physical tabletop D&D dice */
export const ALL_DIE_TYPES: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d%"];

export const DIE_CONFIGS: Record<DieType, DieConfig> = {
  d4: {
    type: "d4",
    sides: 4,
    name: "The Bastion Shard",
    shape: "Tetrahedron",
    label: "d4",
    facesDisplay: "1–4",
    roleBias: "guard",
    category: "combat",
    lore: "Forged in the last furnace of a dying kingdom, this four-faced relic endures where greater powers falter.",
    description:
      "A modest, dependable die. When committed to Guard, its Steadfast Ward grants +1 Guard.",
    specialTrait: "Steadfast Ward: Grants +1 bonus Guard when assigned to Guard.",
    unlockedByDefault: true,
  },
  d6: {
    type: "d6",
    sides: 6,
    name: "The Commoner's Oath",
    shape: "Hexahedron",
    label: "d6",
    facesDisplay: "1–6",
    roleBias: "balanced",
    category: "combat",
    lore: "The first bone cast by fledgling adventurers and forgotten kings alike. Its power is humble, but its promise is true.",
    description:
      "The familiar, balanced casting bone. Perfectly split between offensive reach and defensive certainty.",
    specialTrait: "Equilibrium: Reliable median spread across Strike and Guard.",
    unlockedByDefault: true,
  },
  d8: {
    type: "d8",
    sides: 8,
    name: "The Wayfarer's Edge",
    shape: "Octahedron",
    label: "d8",
    facesDisplay: "1–8",
    roleBias: "strike",
    category: "combat",
    lore: "Eight faces, eight roads through darkness. Every cast chooses a different fate for the blade.",
    description:
      "A versatile middle-ground die suited to adaptable tactics. Expands martial threat without crippling downsides.",
    specialTrait: "Piercing Weight: Solid 1–8 ceiling without crippling downside.",
    unlockedByDefault: true,
  },
  d10: {
    type: "d10",
    sides: 10,
    name: "The Fateweaver",
    shape: "Pentagonal Trapezohedron",
    label: "d10",
    facesDisplay: "1–10",
    roleBias: "strike",
    category: "combat",
    lore: "Ten turns of the wheel. Somewhere among them lies triumph; somewhere, the ruin of everything you swore to protect.",
    description:
      "A higher-ceiling option with more variance than smaller dice. Can pierce thick shells or land on a glancing blow.",
    specialTrait: "Heavy Impact: Potential for double-digit rolls; wider variance floor.",
    unlockedByDefault: true,
  },
  d12: {
    type: "d12",
    sides: 12,
    name: "The Titan's Testament",
    shape: "Dodecahedron",
    label: "d12",
    facesDisplay: "1–12",
    roleBias: "strike",
    category: "combat",
    lore: "Carved from the memory of fallen giants, its weight echoes through the battlefield like a war drum.",
    description:
      "A powerful high-value die that rewards decisive commitment. Delivers devastating strikes or impenetrable ramparts.",
    specialTrait: "Crushing Momentum: Huge power ceiling (up to 12).",
    unlockedByDefault: true,
  },
  d20: {
    type: "d20",
    sides: 20,
    name: "The Godslayer's Wager",
    shape: "Icosahedron",
    label: "d20",
    facesDisplay: "1–20",
    roleBias: "high_risk",
    category: "combat",
    lore: "Twenty faces stare into the abyss. On one, destiny crowns you. On another, it devours your name.",
    description:
      "The greatest potential combat swing. Natural 20 ignites Critical Surge (+5); Natural 1 causes Critical Fumble (0).",
    specialTrait: "Critical Resonance: Nat 20 adds +5 bonus! Nat 1 fumbles to 0.",
    unlockedByDefault: true,
  },
  "d%": {
    type: "d%",
    sides: 10,
    name: "The Oracle's Wheel",
    shape: "Percentile Trapezohedron",
    label: "d%",
    facesDisplay: "00–90",
    roleBias: "utility",
    category: "utility",
    lore: "Turn the wheel, and let the hidden numbers reveal what fate has concealed: a forgotten treasure, a terrible omen, or a door that should never have opened.",
    description:
      "A percentile instrument for events, discoveries, treasure tables, and future adventure systems.",
    specialTrait:
      "Divination Instrument: Numbered in tens (00–90). Paired with a d10 to cast true 1–100 percentile fortunes.",
    unlockedByDefault: true,
  },
};

/**
 * Standard starting loadout: The Balanced Triad (d4 + d6 + d8).
 * Expected sum: 2.5 + 3.5 + 4.5 = 10.5.
 * Exactly matches the legacy 3d6 baseline while introducing tactical asymmetry.
 */
export const DEFAULT_LOADOUT: readonly DieType[] = ["d4", "d6", "d8"];

export interface DicePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  dice: DieType[];
  faceAvg: number;
  critAdjustedAvg: number;
  minSum: number;
  maxSum: number;
  traitBonus: string;
}

export const DICE_PRESETS: DicePreset[] = [
  {
    id: "balanced-triad",
    name: "Balanced Triad (Default)",
    subtitle: "The Bastion Shard + Commoner's Oath + Wayfarer's Edge",
    description:
      "d4 (defense) + d6 (balanced) + d8 (strike). Theoretical average of 10.5 matches legacy 3d6 with defensive stability.",
    dice: ["d4", "d6", "d8"],
    faceAvg: 10.5,
    critAdjustedAvg: 10.5,
    minSum: 3,
    maxSum: 18,
    traitBonus: "+1 Guard when d4 is committed to Guard.",
  },
  {
    id: "classic-bones",
    name: "Classic Bones",
    subtitle: "Three Commoner's Oaths",
    description:
      "Three traditional six-sided casting bones (3× d6). The purest equilibrium of the Veil with zero swing.",
    dice: ["d6", "d6", "d6"],
    faceAvg: 10.5,
    critAdjustedAvg: 10.5,
    minSum: 3,
    maxSum: 18,
    traitBonus: "Standard baseline. No additional traits.",
  },
  {
    id: "vanguard-strike",
    name: "Vanguard Strike",
    subtitle: "Wayfarer's Edge + Fateweaver + Titan's Testament",
    description:
      "d8 + d10 + d12. High-momentum martial pressure (Avg 16.5) aimed at breaking enemy postures with heavy power.",
    dice: ["d8", "d10", "d12"],
    faceAvg: 16.5,
    critAdjustedAvg: 16.5,
    minSum: 3,
    maxSum: 30,
    traitBonus: "Heavy high-damage ceiling (up to 30); wider offensive spread.",
  },
  {
    id: "steadfast-phalanx",
    name: "Steadfast Phalanx",
    subtitle: "Dual Bastion Shards + Commoner's Oath",
    description:
      "d4 + d4 + d6. Steadfast defensive phalanx (Avg 8.5 before bonuses) generating up to +2 bonus Guard.",
    dice: ["d4", "d4", "d6"],
    faceAvg: 8.5,
    critAdjustedAvg: 8.5,
    minSum: 3,
    maxSum: 14,
    traitBonus: "Up to +2 Guard when both d4s are assigned to Guard (effective average 10.5).",
  },
  {
    id: "gamblers-fate",
    name: "Gambler's Fate",
    subtitle: "The Bastion Shard + Wayfarer's Edge + Godslayer's Wager",
    description:
      "d4 + d8 + d20. Extreme volatility. Nat 20 Critical Surge (+5) can reach 37; Nat 1 Fumble (0) risks catastrophe.",
    dice: ["d4", "d8", "d20"],
    faceAvg: 17.5,
    critAdjustedAvg: 17.7, // 2.5 + 4.5 + 10.7 = 17.7
    minSum: 3, // With Nat 1 fumble, sum can be 2
    maxSum: 32, // With Nat 20 critical surge, sum can reach 37
    traitBonus:
      "Nat 20 grants +5 bonus value (max 37); Nat 1 fumbles to 0 value; d4 gives +1 Guard.",
  },
  {
    id: "titans-bulwark",
    name: "The Titan's Bulwark",
    subtitle: "The Bastion Shard + Fateweaver + Titan's Testament",
    description:
      "d4 + d10 + d12. Heavy vanguard armament anchored by a steadfast defensive caltrop.",
    dice: ["d4", "d10", "d12"],
    faceAvg: 14.5,
    critAdjustedAvg: 14.5,
    minSum: 3,
    maxSum: 26,
    traitBonus: "+1 Guard when d4 is committed to Guard; heavy power ceiling up to 26.",
  },
];

/**
 * Roll a single die according to its sides.
 * For standard dice (d4, d6, d8, d10, d12, d20): returns integer within [1, sides].
 * For d% (percentile die): returns tens value from [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].
 */
export function rollDie(type: DieType, rng: () => number = Math.random): number {
  if (type === "d%") {
    const tensIndex = Math.floor(rng() * 10);
    return Math.min(9, Math.max(0, tensIndex)) * 10;
  }
  const sides = DIE_CONFIGS[type]?.sides ?? 6;
  return 1 + Math.floor(rng() * sides);
}

/** Roll an entire loadout of dice */
export function rollLoadout(
  loadout: readonly DieType[],
  rng: () => number = Math.random,
): { value: number; type: DieType }[] {
  return loadout.map((type) => ({
    value: rollDie(type, rng),
    type,
  }));
}

/** Check if a die roll is a Natural 20 */
export function isNatural20(value: number, type: DieType): boolean {
  return type === "d20" && value === 20;
}

/** Check if a die roll is a Natural 1 */
export function isNatural1(value: number, type: DieType): boolean {
  return type === "d20" && value === 1;
}

/**
 * Standard D&D Percentile Roll Result (1–100).
 * Pairs the percentile die (00, 10, ..., 90) with a single-digit die (0, 1, ..., 9).
 * Convention: "00" on tens and "0" on ones = 100! All other combinations equal tens + ones.
 * Guaranteed 1–100 range with a uniform 1% probability distribution.
 */
export interface PercentileRollResult {
  tens: number; // 0, 10, 20, ..., 90
  ones: number; // 0, 1, 2, ..., 9
  total: number; // 1 to 100
  tensDisplay: string; // "00", "10", ..., "90"
  onesDisplay: string; // "0", "1", ..., "9"
  omen: string; // Atmospheric divination reading
}

export function rollPercentile(rng: () => number = Math.random): PercentileRollResult {
  const tens = Math.floor(rng() * 10) * 10;
  const ones = Math.floor(rng() * 10);
  const total = tens === 0 && ones === 0 ? 100 : tens + ones;
  const tensDisplay = String(tens).padStart(2, "0");
  const onesDisplay = String(ones);
  const omen = getDivinationOmen(total);

  return {
    tens,
    ones,
    total,
    tensDisplay,
    onesDisplay,
    omen,
  };
}

/** Evocative dark-fantasy divination omens based on 1–100 percentile roll thresholds */
export function getDivinationOmen(percentile: number): string {
  if (percentile === 100) {
    return "Celestial Conjunction: The Veil parts completely. Destiny bestows absolute favor upon your blade.";
  }
  if (percentile >= 90) {
    return "Ascendant Omen: Ancient warding runes ignite in the mist. Triumph looms on the immediate horizon.";
  }
  if (percentile >= 75) {
    return "Favorable Current: A rare clearing in the gloom reveals the enemy's unarmored flank.";
  }
  if (percentile >= 50) {
    return "Equilibrium of Ruin: The scales hang balanced. Neither fortune nor curse claims the hour.";
  }
  if (percentile >= 25) {
    return "Murmurs in the Dark Water: The mire thickens underfoot, testing your resolve and footing.";
  }
  if (percentile >= 10) {
    return "Ill-Boding Portent: A cold shroud settles over the battlefield. The adversary's eyes gleam with malice.";
  }
  return "Abyssal Malice: Shadows coalesce into crushing weight. An omen of severe reckoning.";
}

/** Validate whether a list of die types forms a valid 3-die combat loadout */
export function isValidCombatLoadout(dice: unknown): dice is DieType[] {
  if (!Array.isArray(dice) || dice.length !== 3) return false;
  return dice.every(
    (d) =>
      typeof d === "string" && d in DIE_CONFIGS && DIE_CONFIGS[d as DieType]?.category === "combat",
  );
}

/** Legacy validator alias for backwards compatibility */
export function isValidLoadout(dice: unknown): dice is DieType[] {
  return isValidCombatLoadout(dice);
}
