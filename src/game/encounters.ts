/** Pure encounter definitions for Dreadveil Adventures. No React, no DOM. */

export type EncounterId = "mire-hound" | "iron-bile-gorgon" | "cinder-weaver";

export type IntentModifier =
  | "standard"
  | "corrosive" // Gorgon: melts armor if unblocked
  | "petrify" // Gorgon: inflicts petrification if guard < 5
  | "braced" // Gorgon / Weaver: heavy defensive posture
  | "ignite" // Weaver: plants embers
  | "flurry" // Weaver: multi-strike talons
  | "detonate"; // Weaver: detonates all active embers

export interface Intent {
  kind: "attack" | "guard";
  amount: number;
  label: string;
  modifier?: IntentModifier;
  description: string;
}

export interface Encounter {
  id: EncounterId;
  name: string;
  title: string;
  subtitle: string;
  location: string;
  lore: string;
  difficulty: "Apprentice" | "Veteran" | "Master";
  difficultyRating: 1 | 2 | 3;
  maxHp: number;
  pattern: Intent[];
  mechanicsSummary: string;
  counterTactics: string[];
  artType: "image" | "sigil";
  sigilTheme: "mire" | "gorgon" | "weaver";
  defeatText: string;
  victoryText: string;
}

export const ENCOUNTERS: Record<EncounterId, Encounter> = {
  "mire-hound": {
    id: "mire-hound",
    name: "The Lantern-Jawed Mire Hound",
    title: "Creature of the mire",
    subtitle: "Predator of the Blackwater",
    location: "The blackwater crossing",
    lore: "It hunts by scent, drawn to the living like a prayer to a forgotten god. The light within its jaws is not a lantern, but something that should never have been born.",
    difficulty: "Apprentice",
    difficultyRating: 1,
    maxHp: 46,
    pattern: [
      {
        kind: "attack",
        amount: 7,
        label: "Gnashing Bite",
        modifier: "standard",
        description:
          "The hound lowers its antlered skull. A sickly glow spills between its jaws as it surges through the blackwater, teeth closing on the space where your throat was a heartbeat ago.",
      },
      {
        kind: "guard",
        amount: 8,
        label: "Sinks into the Mire",
        modifier: "braced",
        description: "Submerges beneath the murky blackwater, absorbing 8 incoming damage.",
      },
      {
        kind: "attack",
        amount: 5,
        label: "Lure-Light Lash",
        modifier: "standard",
        description: "A blinding sweep of its glowing lantern barb.",
      },
      {
        kind: "attack",
        amount: 12,
        label: "Drowning Lunge",
        modifier: "standard",
        description: "A massive, bone-crushing pounce from the mist.",
      },
    ],
    mechanicsSummary: "Predictable rhythm of heavy strikes punctuated by defensive submergence.",
    counterTactics: [
      "Assign Guard dice against the heavy Drowning Lunge (12 damage).",
      "Save high Strike dice for turns when the hound attacks rather than when it sinks into the mire.",
    ],
    artType: "image",
    sigilTheme: "mire",
    defeatText: "Your bones join the mire.",
    victoryText: "The hound collapses into the black water. Victory.",
  },

  "iron-bile-gorgon": {
    id: "iron-bile-gorgon",
    name: "The Iron-Bile Gorgon",
    title: "Monstrosity of petrified bile",
    subtitle: "Serpentine Ruin of the Sepulcher",
    location: "The calcified sepulcher",
    lore: "An ancient serpentine horror encased in calcified iron ribcages. It vomits caustic bile that dissolves shield-bearing plate, while its lidless gaze turns living blood to brittle stone.",
    difficulty: "Veteran",
    difficultyRating: 2,
    maxHp: 52,
    pattern: [
      {
        kind: "attack",
        amount: 6,
        label: "Caustic Bile",
        modifier: "corrosive",
        description:
          "Vomits corrosive bile. If any damage penetrates your guard, your armor corrodes (-3 Guard next round).",
      },
      {
        kind: "guard",
        amount: 10,
        label: "Calcified Shell",
        modifier: "braced",
        description: "Curls behind layered stone ribs to absorb 10 incoming damage.",
      },
      {
        kind: "attack",
        amount: 5,
        label: "Petrifying Gaze",
        modifier: "petrify",
        description:
          "A petrifying glare. If your Guard is under 5, gain 1 Petrification stack (shatters for 8 damage at 3 stacks).",
      },
      {
        kind: "attack",
        amount: 14,
        label: "Iron-Tail Slam",
        modifier: "standard",
        description: "A devastating sweeping strike of heavy, calcified tail-rings.",
      },
    ],
    mechanicsSummary:
      "Accumulating petrification pressure (shatters at 3 stacks) and caustic bile that corrodes guard.",
    counterTactics: [
      "Maintain at least 5 Guard on Petrifying Gaze rounds to reflect the gaze and prevent petrification.",
      "Block all 6 damage from Caustic Bile to prevent armor corrosion (-3 Guard).",
      "Prepare defensive abilities or high Guard for the crushing Iron-Tail Slam (14 damage).",
      "Bypass the 10 Guard Calcified Shell with poison (Plaguewright) or timed bursts.",
    ],
    artType: "sigil",
    sigilTheme: "gorgon",
    defeatText: "Your flesh petrifies into an eternal monument of dread.",
    victoryText: "The calcified gorgon shatters into inert slag. Victory.",
  },

  "cinder-weaver": {
    id: "cinder-weaver",
    name: "The Cinder-Weaver",
    title: "Eight-legged furnace",
    subtitle: "Chitinous Flame of the Crucible",
    location: "The smoking crucible",
    lore: "A skittering arachnid-furnace forged in volcanic bellows. It weaves superheated ash-webs and plants incendiary embers into flesh before triggering a cataclysmic conflagration.",
    difficulty: "Master",
    difficultyRating: 3,
    maxHp: 42,
    pattern: [
      {
        kind: "attack",
        amount: 5,
        label: "Searing Spinneret",
        modifier: "ignite",
        description: "Launches burning ash-silk for 5 damage and plants 2 smoldering embers.",
      },
      {
        kind: "attack",
        amount: 8,
        label: "Ash-Leg Flurry",
        modifier: "flurry",
        description: "A frantic barrage of red-hot talons striking in rapid succession.",
      },
      {
        kind: "guard",
        amount: 7,
        label: "Molten Cocoon",
        modifier: "ignite",
        description:
          "Braces for 7 Guard while venting chimney-smoke, depositing 1 smoldering ember.",
      },
      {
        kind: "attack",
        amount: 9,
        label: "Conflagration",
        modifier: "detonate",
        description:
          "A deafening furnace burst for 9 damage, plus ignites all active embers for 2 extra damage each!",
      },
    ],
    mechanicsSummary:
      "Plants smoldering embers that explode on Conflagration. Guard dice assigned quench embers (1 per die).",
    counterTactics: [
      "Assign dice to Guard to smother embers (each Guard die quenches 1 ember during resolution).",
      "Quench embers before round 4 to prevent catastrophic Conflagration detonation damage.",
      "Capitalize on the Weaver's lower 42 HP pool by timing aggressive strike turns when embers are low.",
    ],
    artType: "sigil",
    sigilTheme: "weaver",
    defeatText: "You are consumed by ash and embers.",
    victoryText: "The cinder-weaver cools into blackened iron and ash. Victory.",
  },
};

export const ENCOUNTER_LIST: Encounter[] = [
  ENCOUNTERS["mire-hound"],
  ENCOUNTERS["iron-bile-gorgon"],
  ENCOUNTERS["cinder-weaver"],
];

export function getEncounter(id: string | null | undefined): Encounter {
  if (id && id in ENCOUNTERS) {
    return ENCOUNTERS[id as EncounterId];
  }
  return ENCOUNTERS["mire-hound"];
}

/** Backward compatibility alias for existing code referencing ENEMY */
export const ENEMY = {
  name: ENCOUNTERS["mire-hound"].name,
  maxHp: ENCOUNTERS["mire-hound"].maxHp,
  pattern: ENCOUNTERS["mire-hound"].pattern,
};
