import { getCharacter, type Character, type CharacterId } from "./characters";
import {
  ENCOUNTERS,
  getEncounter,
  type Encounter,
  type EncounterId,
  type Intent,
} from "./encounters";
import {
  DEFAULT_LOADOUT,
  DIE_CONFIGS,
  isNatural1,
  isNatural20,
  isValidCombatLoadout,
  rollDie,
  type DieConfig,
  type DieRole,
  type DieType,
} from "./dice";

export type { Character, CharacterId } from "./characters";
export type { Encounter, EncounterId, Intent } from "./encounters";
export type { DieConfig, DieRole, DieType } from "./dice";
export { DEFAULT_LOADOUT, DIE_CONFIGS, rollDie } from "./dice";

/** Pure game rules. No React, no DOM. Randomness is passed in as values. */

export interface Die {
  value: number;
  role: DieRole;
  type: DieType;
}

export type Phase = "roll" | "assign" | "won" | "lost";

export interface GameState {
  characterId: CharacterId;
  encounterId: EncounterId;
  loadout: DieType[];
  phase: Phase;
  round: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  dice: Die[];
  rerollsLeft: number;
  abilityCooldown: number; // 0 = ready
  abilityActive: boolean; // used this turn
  poisonTurns: number;
  intentIndex: number;
  log: string[];
  // Boss-specific status tracks (deterministic, zeroed if not applicable):
  petrification: number; // 0..3 (Gorgon)
  corrodedTurns: number; // rounds of corroded armor (-3 Guard)
  embers: number; // active embers (Cinder-Weaver)
}

export type Action =
  | { type: "roll"; values: readonly ({ value: number; type?: DieType } | number)[] }
  | { type: "reroll"; values: readonly number[] }
  | { type: "toggleDie"; index: number }
  | { type: "useAbility"; extraDie?: number | undefined }
  | { type: "endTurn" }
  | { type: "setLoadout"; loadout: DieType[] };

export const BASE_DICE = 3;
export const BASE_REROLLS = 1;

/** Backward compatibility alias */
export const ENEMY = {
  name: ENCOUNTERS["mire-hound"].name,
  maxHp: ENCOUNTERS["mire-hound"].maxHp,
  pattern: ENCOUNTERS["mire-hound"].pattern,
};

/** Backward-compatible rollValues generating standard values */
export function rollValues(count: number, rng: () => number = Math.random): number[] {
  return Array.from({ length: count }, () => 1 + Math.floor(rng() * 6));
}

/** Roll values for each equipped die according to its specific maximum sides */
export function rollActiveLoadout(
  loadout: readonly DieType[],
  rng: () => number = Math.random,
): { value: number; type: DieType }[] {
  return loadout.map((type) => ({
    value: rollDie(type, rng),
    type,
  }));
}

export function currentIntent(s: GameState): Intent {
  const enc = getEncounter(s.encounterId);
  const intent = enc.pattern[s.intentIndex % enc.pattern.length];
  if (!intent) throw new Error("Enemy intent pattern is missing");
  return intent;
}

export function nextIntent(s: GameState): Intent {
  const enc = getEncounter(s.encounterId);
  const intent = enc.pattern[(s.intentIndex + 1) % enc.pattern.length];
  if (!intent) throw new Error("Next enemy intent pattern is missing");
  return intent;
}

export function createGame(
  characterId: CharacterId,
  encounterId: EncounterId = "mire-hound",
  loadout: readonly DieType[] = DEFAULT_LOADOUT,
): GameState {
  const c = getCharacter(characterId);
  if (!c) throw new Error("Unknown species");
  const enc = getEncounter(encounterId);

  return {
    characterId,
    encounterId: enc.id,
    loadout: [...loadout],
    phase: "roll",
    round: 1,
    playerHp: c.maxHp,
    playerMaxHp: c.maxHp,
    enemyHp: enc.maxHp,
    enemyMaxHp: enc.maxHp,
    dice: [],
    rerollsLeft: BASE_REROLLS,
    abilityCooldown: 0,
    abilityActive: false,
    poisonTurns: 0,
    intentIndex: 0,
    log: [`${c.name} steps into ${enc.location}. ${enc.name} stirs.`],
    petrification: 0,
    corrodedTurns: 0,
    embers: 0,
  };
}

export function canUseAbility(s: GameState, c: Character): boolean {
  if (s.phase !== "assign" || s.abilityActive || s.abilityCooldown > 0) return false;
  if ((c.id === "bloodhowl" && s.playerHp <= 5) || (c.id === "hollow-star" && s.playerHp <= 6))
    return false;
  return true;
}

export function strikeTotal(s: GameState): number {
  const c = getCharacter(s.characterId);
  let raw = 0;
  for (const d of s.dice) {
    if (d.role !== "strike") continue;
    if (isNatural1(d.value, d.type)) {
      // Natural 1 fumbles: contributes 0
      continue;
    }
    if (isNatural20(d.value, d.type)) {
      // Natural 20 critical resonance: 20 + 5 = 25!
      raw += d.value + 5;
      continue;
    }
    raw += d.value;
  }
  if (c?.id === "bloodhowl" && s.abilityActive) {
    return raw * (s.playerHp <= s.playerMaxHp / 3 ? 3 : 2);
  }
  return raw;
}

export function guardTotal(s: GameState): number {
  const c = getCharacter(s.characterId);
  let raw = 0;
  for (const d of s.dice) {
    if (d.role !== "guard") continue;
    if (isNatural1(d.value, d.type)) {
      // Natural 1 fumbles: contributes 0
      continue;
    }
    if (isNatural20(d.value, d.type)) {
      // Natural 20 critical resonance: 20 + 5 = 25!
      raw += d.value + 5;
      continue;
    }
    // d4 Steadfast Ward trait (+1 bonus Guard)
    const steadfastBonus = d.type === "d4" ? 1 : 0;
    raw += d.value + steadfastBonus;
  }
  const bonus = c?.id === "forge-tank" && s.abilityActive ? 10 : 0;
  const penalty = s.corrodedTurns > 0 ? 3 : 0;
  return Math.max(0, raw + bonus - penalty);
}

const log = (s: GameState, ...lines: string[]) => ({
  ...s,
  log: [...lines.reverse(), ...s.log].slice(0, 40),
});

export function reducer(s: GameState, a: Action): GameState {
  if (s.phase === "won" || s.phase === "lost") return s;
  const c = getCharacter(s.characterId);
  if (!c) return s;

  switch (a.type) {
    case "setLoadout": {
      if (s.phase !== "roll" || !isValidCombatLoadout(a.loadout)) return s;
      return { ...s, loadout: [...a.loadout] };
    }
    case "roll": {
      if (s.phase !== "roll") return s;
      const dice: Die[] = a.values.map((v, i) => {
        if (typeof v === "number") {
          return {
            value: v,
            role: "strike" as DieRole,
            type: s.loadout[i] ?? "d6",
          };
        }
        return {
          value: v.value,
          role: "strike" as DieRole,
          type: v.type ?? s.loadout[i] ?? "d6",
        };
      });
      return log(
        {
          ...s,
          phase: "assign",
          dice,
        },
        `You cast ${dice.map((d) => `${d.value} (${d.type})`).join(", ")}.`,
      );
    }
    case "reroll": {
      if (s.phase !== "assign" || s.rerollsLeft <= 0) return s;
      const dice = s.dice.map((d, i) => ({ ...d, value: a.values[i] ?? d.value }));
      return log(
        { ...s, dice, rerollsLeft: s.rerollsLeft - 1 },
        `Reroll: ${dice.map((d) => `${d.value} (${d.type})`).join(", ")}.`,
      );
    }
    case "toggleDie": {
      if (s.phase !== "assign" || !s.dice[a.index]) return s;
      const dice = s.dice.map((d, i) =>
        i === a.index ? { ...d, role: (d.role === "strike" ? "guard" : "strike") as DieRole } : d,
      );
      return { ...s, dice };
    }
    case "useAbility": {
      if (!canUseAbility(s, c)) return s;
      let next: GameState = { ...s, abilityActive: true, abilityCooldown: c.cooldown };
      switch (c.id) {
        case "plaguewright":
          next.poisonTurns = 4;
          break;
        case "oracle":
          next.rerollsLeft += 2;
          break;
        case "bloodhowl":
          next.playerHp -= 5;
          break;
        case "gear-saint":
          next.dice = [
            ...s.dice,
            { value: a.extraDie ?? 1, role: "strike", type: s.loadout[1] ?? "d6" },
          ];
          break;
        case "hollow-star":
          next.playerHp -= 6;
          next.dice = s.dice.map((d) => ({ ...d, value: 6 }));
          break;
      }
      next = log(next, `${c.ability}! ${c.abilityText}`);
      return next;
    }
    case "endTurn": {
      if (s.phase !== "assign") return s;
      return resolveRound(s, c);
    }
  }
}

function resolveRound(s: GameState, c: Character): GameState {
  const enc = getEncounter(s.encounterId);
  const lines: string[] = [];
  const intent = currentIntent(s);
  const snared = c.id === "thornwarden" && s.abilityActive;
  let enemyHp = s.enemyHp;
  let playerHp = s.playerHp;
  let petrification = s.petrification;
  let corrodedTurns = s.corrodedTurns;
  let embers = s.embers;

  // 1. Player strikes
  const enemyBlock = !snared && intent.kind === "guard" ? intent.amount : 0;
  const strike = strikeTotal(s);
  const dealt = Math.max(0, strike - enemyBlock);
  enemyHp -= dealt;

  if (enemyBlock > 0) {
    const enemyRef =
      s.encounterId === "mire-hound"
        ? "the hound's guard"
        : s.encounterId === "iron-bile-gorgon"
          ? "the gorgon's shell"
          : "the cocoon";
    lines.push(
      `You strike for ${strike}; ${enemyRef} absorbs ${Math.min(strike, enemyBlock)}. ${dealt} damage.`,
    );
  } else {
    lines.push(`You strike for ${dealt} damage.`);
  }

  // 2. Poison ticks
  let poisonTurns = s.poisonTurns;
  if (poisonTurns > 0 && enemyHp > 0) {
    enemyHp -= 3;
    poisonTurns -= 1;
    lines.push(`Contagion festers: 3 poison damage (${poisonTurns} turns left).`);
  }

  if (enemyHp <= 0) {
    return log(
      {
        ...s,
        enemyHp: 0,
        playerHp,
        poisonTurns,
        petrification,
        corrodedTurns: 0,
        embers: 0,
        phase: "won",
      },
      ...lines,
      enc.victoryText,
    );
  }

  // 3. Quench Embers mechanic (against Cinder-Weaver)
  if (s.encounterId === "cinder-weaver" && embers > 0) {
    const guardDiceCount = s.dice.filter((d) => d.role === "guard").length;
    if (guardDiceCount > 0) {
      const quenched = Math.min(embers, guardDiceCount);
      embers -= quenched;
      lines.push(
        `Defensive vigilance quenches ${quenched} smoldering ember${quenched === 1 ? "" : "s"} (${embers} remaining).`,
      );
    }
  }

  // 4. Enemy acts
  if (snared) {
    const enemyName =
      s.encounterId === "mire-hound"
        ? "the hound"
        : s.encounterId === "iron-bile-gorgon"
          ? "the gorgon"
          : "the cinder-weaver";
    lines.push(`Verdant Snare holds fast — ${enemyName} thrashes and loses its action.`);
  } else if (intent.kind === "guard") {
    const enemyName =
      s.encounterId === "mire-hound"
        ? "the hound"
        : s.encounterId === "iron-bile-gorgon"
          ? "the gorgon"
          : "the cinder-weaver";
    lines.push(`${intent.label}: ${enemyName} braced against ${intent.amount} damage.`);
    if (s.encounterId === "cinder-weaver" && intent.modifier === "ignite") {
      embers += 1;
      lines.push("Molten Cocoon vents choking soot (+1 smoldering ember).");
    }
  } else {
    // Enemy attacks
    if (c.id === "raven" && s.abilityActive) {
      lines.push(`${intent.label} tears through a phantom — Eightfold Deception, it misses.`);
    } else if (c.id === "dirgesinger" && s.abilityActive) {
      let incomingDmg = intent.amount;
      if (s.encounterId === "cinder-weaver" && intent.modifier === "detonate" && embers > 0) {
        incomingDmg += embers * 2;
        embers = 0;
      }
      const heal = Math.min(incomingDmg, s.playerMaxHp - playerHp);
      playerHp += heal;
      lines.push(`The Requiem reverses ${intent.label}: you heal ${heal}.`);
    } else {
      let dmg = intent.amount;
      if (s.encounterId === "cinder-weaver" && intent.modifier === "detonate" && embers > 0) {
        const bonusDmg = embers * 2;
        dmg += bonusDmg;
        lines.push(
          `Conflagration ignites ${embers} smoldering ember${embers === 1 ? "" : "s"} for +${bonusDmg} eruption damage!`,
        );
        embers = 0;
      }

      const guard = guardTotal(s);
      const taken = Math.max(0, dmg - guard);
      playerHp -= taken;
      lines.push(
        `${intent.label} for ${dmg}; your guard stops ${Math.min(dmg, guard)}. You take ${taken}.`,
      );

      // On-hit ability reactions
      if (c.id === "forge-tank" && s.abilityActive) {
        enemyHp -= 3;
        const enemyNoun =
          s.encounterId === "mire-hound"
            ? "the hound"
            : s.encounterId === "iron-bile-gorgon"
              ? "the gorgon"
              : "the cinder-weaver";
        lines.push(`Molten Bastion scorches ${enemyNoun} for 3.`);
      }
      if (c.id === "oathbreaker" && s.abilityActive) {
        enemyHp -= dmg;
        lines.push(`Betrayer's Riposte returns ${dmg} damage.`);
      }

      // Boss-specific offensive mechanics
      if (s.encounterId === "iron-bile-gorgon") {
        if (intent.modifier === "corrosive" && taken > 0) {
          corrodedTurns = 1; // Active for next round
          lines.push("Caustic Bile splashes your armor! Corroded: -3 Guard next round.");
        } else if (intent.modifier === "petrify") {
          if (guard < 5) {
            petrification += 1;
            if (petrification >= 3) {
              playerHp -= 8;
              petrification = 0;
              lines.push(
                "Petrification reaches critical mass! Calcified marrow shatters for 8 damage!",
              );
            } else {
              lines.push(
                `Petrifying Gaze pierces your defenses (+1 Petrification: ${petrification}/3).`,
              );
            }
          } else {
            lines.push("Your raised guard (5+ Guard) reflects the Gorgon's petrifying glare!");
          }
        }
      } else if (s.encounterId === "cinder-weaver") {
        if (intent.modifier === "ignite") {
          embers += 2;
          lines.push("Searing Spinneret embeds 2 smoldering embers!");
        }
      }
    }
  }

  // 5. Decrement status durations
  if (s.corrodedTurns > 0) {
    corrodedTurns = Math.max(0, s.corrodedTurns - 1);
  }

  // 6. Check terminal outcomes
  if (playerHp <= 0) {
    return log(
      {
        ...s,
        playerHp: 0,
        enemyHp: Math.max(0, enemyHp),
        poisonTurns,
        petrification,
        corrodedTurns,
        embers,
        phase: "lost",
      },
      ...lines,
      enc.defeatText,
    );
  }
  if (enemyHp <= 0) {
    return log(
      {
        ...s,
        enemyHp: 0,
        playerHp,
        poisonTurns,
        petrification,
        corrodedTurns: 0,
        embers: 0,
        phase: "won",
      },
      ...lines,
      enc.victoryText,
    );
  }

  // 7. Transition to next round
  return log(
    {
      ...s,
      playerHp,
      enemyHp,
      poisonTurns,
      petrification,
      corrodedTurns,
      embers,
      phase: "roll",
      round: s.round + 1,
      dice: [],
      rerollsLeft: BASE_REROLLS,
      abilityActive: false,
      abilityCooldown: Math.max(0, s.abilityCooldown - 1),
      intentIndex: s.intentIndex + 1,
    },
    ...lines,
    `— Round ${s.round + 1} —`,
  );
}
