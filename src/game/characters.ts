export type CharacterId =
  | "forge-tank"
  | "raven"
  | "plaguewright"
  | "oathbreaker"
  | "oracle"
  | "bloodhowl"
  | "thornwarden"
  | "gear-saint"
  | "dirgesinger"
  | "hollow-star";

export interface Character {
  id: CharacterId;
  index: number; // 0-9, position on roster artwork
  name: string;
  hybrid: string;
  role: string;
  weapon: string;
  ability: string;
  abilityText: string; // describes the real implemented effect
  maxHp: number;
  cooldown: number;
}

export const CHARACTERS: Character[] = [
  {
    id: "forge-tank",
    index: 0,
    name: "Forge Tank",
    hybrid: "Rhinoceros × Badger × Tortoise",
    role: "Tank / Defender",
    weapon: "Anvil Maul",
    ability: "Molten Bastion",
    abilityText: "Gain 10 Guard this turn and scorch attackers for 3 damage when struck.",
    maxHp: 44,
    cooldown: 3,
  },
  {
    id: "raven",
    index: 1,
    name: "The Raven",
    hybrid: "Raven × Octopus",
    role: "Rogue / Assassin",
    weapon: "Twin Crescent Daggers",
    ability: "Eightfold Deception",
    abilityText: "The enemy's action this turn misses you entirely.",
    maxHp: 30,
    cooldown: 3,
  },
  {
    id: "plaguewright",
    index: 2,
    name: "The Plaguewright",
    hybrid: "Hyena × Axolotl × Leech",
    role: "Alchemist / Controller",
    weapon: "Distillation Staff",
    ability: "Living Contagion",
    abilityText: "Infect the enemy: 3 poison damage at the end of each of the next 4 turns.",
    maxHp: 34,
    cooldown: 4,
  },
  {
    id: "oathbreaker",
    index: 3,
    name: "The Oathbreaker",
    hybrid: "Stag × Vulture × Scorpion",
    role: "Duelist / Counterattacker",
    weapon: "Spectral Greatsword",
    ability: "Betrayer's Riposte",
    abilityText: "If the enemy attacks this turn, strike back for its full attack damage.",
    maxHp: 36,
    cooldown: 3,
  },
  {
    id: "oracle",
    index: 4,
    name: "The Oracle",
    hybrid: "Owl × Moth × Anglerfish",
    role: "Mage / Seer",
    weapon: "Rune Staff",
    ability: "Borrowed Tomorrow",
    abilityText: "Gain 2 extra rerolls this turn and foresee the enemy's next intent.",
    maxHp: 30,
    cooldown: 3,
  },
  {
    id: "bloodhowl",
    index: 5,
    name: "The Bloodhowl",
    hybrid: "Boar × Wolf × Bat",
    role: "Berserker / High Risk",
    weapon: "Executioner Cleaver",
    ability: "Near-Death Frenzy",
    abilityText: "Lose 5 HP. Strike dice deal double damage this turn (triple below 1/3 HP).",
    maxHp: 38,
    cooldown: 3,
  },
  {
    id: "thornwarden",
    index: 6,
    name: "The Thornwarden",
    hybrid: "Praying Mantis × Deer × Pangolin",
    role: "Ranger / Trapper",
    weapon: "Thornwood Bow",
    ability: "Verdant Snare",
    abilityText: "Entangle the enemy: it loses its action this turn.",
    maxHp: 32,
    cooldown: 4,
  },
  {
    id: "gear-saint",
    index: 7,
    name: "The Gear-Saint",
    hybrid: "Frog × Armadillo × Beetle",
    role: "Artificer / Chronomancer",
    weapon: "Arcane Chronometer",
    ability: "Overclock",
    abilityText: "Wind the chronometer: roll a 4th die this turn.",
    maxHp: 34,
    cooldown: 3,
  },
  {
    id: "dirgesinger",
    index: 8,
    name: "The Dirgesinger",
    hybrid: "Fox × Peacock × Cicada",
    role: "Bard / Manipulator",
    weapon: "Hexed Lute",
    ability: "Requiem of Reversal",
    abilityText: "If the enemy attacks this turn, its damage heals you instead.",
    maxHp: 32,
    cooldown: 4,
  },
  {
    id: "hollow-star",
    index: 9,
    name: "The Hollow Star",
    hybrid: "Hare × Abyssal Eel × Anglerfish",
    role: "Warlock / Reality Bender",
    weapon: "Void Focus",
    ability: "Unmake Fate",
    abilityText: "Lose 6 HP. Every die you hold becomes a 6 (or its maximum face count).",
    maxHp: 30,
    cooldown: 4,
  },
];

export function getCharacter(id: string | null | undefined): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

/** Hotspot rectangle on the roster artwork, in percent of image size. */
export function rosterRect(index: number) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return {
    left: 5.8 + col * 18.15,
    top: row === 0 ? 15.4 : 53.6,
    width: 17.1,
    height: 28.0, // art area height in % of image
    cardHeight: 36.5, // total card height on original poster
  };
}

/** Background-position values to crop a single portrait (art only, no label).
 * Native crop aspect ratio is (1376 * 17.1) / (768 * 28.0) = 235.3 / 215.0 = 1.0942 (approx 47/43).
 * When container aspect-ratio matches 47/43 (or 235/215), the artwork renders with zero distortion.
 */
export function portraitStyle(index: number, url: string) {
  const r = rosterRect(index);
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${(100 / r.width) * 100}% ${(100 / r.height) * 100}%`,
    backgroundPosition: `${(r.left / (100 - r.width)) * 100}% ${(r.top / (100 - r.height)) * 100}%`,
  };
}
