import { describe, expect, it } from "vitest";
import {
  ALL_DIE_TYPES,
  COMBAT_DIE_TYPES,
  DEFAULT_LOADOUT,
  DIE_CONFIGS,
  DICE_PRESETS,
  isValidCombatLoadout,
  isValidLoadout,
  rollDie,
  rollLoadout,
  rollPercentile,
  getDivinationOmen,
  type DieType,
} from "./dice";
import { canUseAbility, createGame, guardTotal, reducer, strikeTotal } from "./engine";
import { loadSelectedLoadout, saveSelectedLoadout } from "./storage";

describe("Polyhedral Dice Specifications & Rolling Ranges", () => {
  it("defines all seven standard tabletop physical D&D dice with correct metadata", () => {
    expect(ALL_DIE_TYPES).toEqual(["d4", "d6", "d8", "d10", "d12", "d20", "d%"]);
    expect(COMBAT_DIE_TYPES).toEqual(["d4", "d6", "d8", "d10", "d12", "d20"]);

    expect(DIE_CONFIGS.d4.sides).toBe(4);
    expect(DIE_CONFIGS.d4.name).toBe("The Bastion Shard");
    expect(DIE_CONFIGS.d4.shape).toBe("Tetrahedron");
    expect(DIE_CONFIGS.d4.category).toBe("combat");

    expect(DIE_CONFIGS.d6.sides).toBe(6);
    expect(DIE_CONFIGS.d6.name).toBe("The Commoner's Oath");
    expect(DIE_CONFIGS.d6.shape).toBe("Hexahedron");
    expect(DIE_CONFIGS.d6.category).toBe("combat");

    expect(DIE_CONFIGS.d8.sides).toBe(8);
    expect(DIE_CONFIGS.d8.name).toBe("The Wayfarer's Edge");
    expect(DIE_CONFIGS.d8.shape).toBe("Octahedron");
    expect(DIE_CONFIGS.d8.category).toBe("combat");

    expect(DIE_CONFIGS.d10.sides).toBe(10);
    expect(DIE_CONFIGS.d10.name).toBe("The Fateweaver");
    expect(DIE_CONFIGS.d10.shape).toBe("Pentagonal Trapezohedron");
    expect(DIE_CONFIGS.d10.category).toBe("combat");

    expect(DIE_CONFIGS.d12.sides).toBe(12);
    expect(DIE_CONFIGS.d12.name).toBe("The Titan's Testament");
    expect(DIE_CONFIGS.d12.shape).toBe("Dodecahedron");
    expect(DIE_CONFIGS.d12.category).toBe("combat");

    expect(DIE_CONFIGS.d20.sides).toBe(20);
    expect(DIE_CONFIGS.d20.name).toBe("The Godslayer's Wager");
    expect(DIE_CONFIGS.d20.shape).toBe("Icosahedron");
    expect(DIE_CONFIGS.d20.category).toBe("combat");

    expect(DIE_CONFIGS["d%"].sides).toBe(10);
    expect(DIE_CONFIGS["d%"].name).toBe("The Oracle's Wheel");
    expect(DIE_CONFIGS["d%"].shape).toBe("Percentile Trapezohedron");
    expect(DIE_CONFIGS["d%"].category).toBe("utility");
  });

  it.each(COMBAT_DIE_TYPES)("rolls %s strictly within [1, sides] bounds", (type) => {
    const sides = DIE_CONFIGS[type].sides;
    for (let i = 0; i < 50; i++) {
      const roll = rollDie(type);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(sides);
      expect(Number.isInteger(roll)).toBe(true);
    }
  });

  it("rolls d% percentile die strictly within [0, 90] in increments of 10", () => {
    const validTens = new Set([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    for (let i = 0; i < 100; i++) {
      const roll = rollDie("d%");
      expect(validTens.has(roll)).toBe(true);
    }
  });

  it("produces deterministic roll boundaries using controlled RNG", () => {
    // Minimum roll when RNG is 0.0 -> returns 1 for combat dice, 0 for d%
    const minRng = () => 0.0;
    for (const type of COMBAT_DIE_TYPES) {
      expect(rollDie(type, minRng)).toBe(1);
    }
    expect(rollDie("d%", minRng)).toBe(0);

    // Maximum roll when RNG is 0.9999 -> returns exact maximum sides (or 90 for d%)
    const maxRng = () => 0.9999;
    for (const type of COMBAT_DIE_TYPES) {
      expect(rollDie(type, maxRng)).toBe(DIE_CONFIGS[type].sides);
    }
    expect(rollDie("d%", maxRng)).toBe(90);
  });

  it("verifies the starting loadout balance rationale: [d4, d6, d8] equals 10.5 average", () => {
    expect(DEFAULT_LOADOUT).toEqual(["d4", "d6", "d8"]);
    const avgD4 = (1 + 4) / 2; // 2.5
    const avgD6 = (1 + 6) / 2; // 3.5
    const avgD8 = (1 + 8) / 2; // 4.5
    const startingExpectedSum = avgD4 + avgD6 + avgD8;
    const legacy3d6ExpectedSum = 3.5 * 3;

    expect(startingExpectedSum).toBe(10.5);
    expect(legacy3d6ExpectedSum).toBe(10.5);
    expect(startingExpectedSum).toBe(legacy3d6ExpectedSum);
  });

  it("rolls an entire loadout maintaining die types and boundaries", () => {
    const rolled = rollLoadout(["d4", "d10", "d20"]);
    expect(rolled).toHaveLength(3);
    expect(rolled[0]?.type).toBe("d4");
    expect(rolled[0]?.value).toBeLessThanOrEqual(4);
    expect(rolled[1]?.type).toBe("d10");
    expect(rolled[1]?.value).toBeLessThanOrEqual(10);
    expect(rolled[2]?.type).toBe("d20");
    expect(rolled[2]?.value).toBeLessThanOrEqual(20);
  });
});

describe("D&D Percentile (d100) Divination Mechanics", () => {
  it("implements standard D&D percentile convention: 00 + 0 = 100", () => {
    // Inject RNG returning 0.0 for tens and 0.0 for ones
    let call = 0;
    const rng = () => {
      call++;
      return 0.0;
    };
    const res = rollPercentile(rng);
    expect(res.tens).toBe(0);
    expect(res.ones).toBe(0);
    expect(res.total).toBe(100);
    expect(res.tensDisplay).toBe("00");
    expect(res.onesDisplay).toBe("0");
    expect(res.omen).toContain("Celestial Conjunction");
  });

  it("calculates regular percentile rolls correctly: e.g. 70 + 3 = 73", () => {
    let call = 0;
    const rng = () => {
      call++;
      return call === 1 ? 0.75 : 0.35; // tens: 70, ones: 3
    };
    const res = rollPercentile(rng);
    expect(res.tens).toBe(70);
    expect(res.ones).toBe(3);
    expect(res.total).toBe(73);
    expect(res.tensDisplay).toBe("70");
    expect(res.onesDisplay).toBe("3");
  });

  it("calculates 00 + 7 = 7 without treating 00 as 100 when ones > 0", () => {
    let call = 0;
    const rng = () => {
      call++;
      return call === 1 ? 0.05 : 0.75; // tens: 0, ones: 7
    };
    const res = rollPercentile(rng);
    expect(res.tens).toBe(0);
    expect(res.ones).toBe(7);
    expect(res.total).toBe(7);
  });

  it("guarantees all percentile rolls land strictly within [1, 100] across 200 rolls", () => {
    for (let i = 0; i < 200; i++) {
      const res = rollPercentile();
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.total).toBeLessThanOrEqual(100);
      expect(Number.isInteger(res.total)).toBe(true);
      expect(res.omen.length).toBeGreaterThan(10);
    }
  });

  it("provides distinct thematic omens across percentile tiers", () => {
    expect(getDivinationOmen(100)).toContain("Celestial Conjunction");
    expect(getDivinationOmen(95)).toContain("Ascendant Omen");
    expect(getDivinationOmen(80)).toContain("Favorable Current");
    expect(getDivinationOmen(55)).toContain("Equilibrium of Ruin");
    expect(getDivinationOmen(30)).toContain("Murmurs in the Dark Water");
    expect(getDivinationOmen(15)).toContain("Ill-Boding Portent");
    expect(getDivinationOmen(4)).toContain("Abyssal Malice");
  });
});

describe("Strike and Guard Calculations with Polyhedral Traits", () => {
  it("calculates basic strike from mixed dice types", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d6", "d8"]);
    s = reducer(s, { type: "roll", values: [3, 5, 7] });
    expect(strikeTotal(s)).toBe(3 + 5 + 7); // 15
    expect(guardTotal(s)).toBe(0);
  });

  it("applies d4 Steadfast Ward trait: +1 bonus Guard when assigned to Guard", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d6", "d8"]);
    s = reducer(s, { type: "roll", values: [3, 4, 6] });

    // Toggle die 0 (d4) to Guard: rolled value 3 + 1 steadfast bonus = 4 Guard!
    s = reducer(s, { type: "toggleDie", index: 0 });
    expect(guardTotal(s)).toBe(4);
    expect(strikeTotal(s)).toBe(4 + 6); // 10

    // Toggle die 1 (d6) to Guard: 4 (d4 with trait) + 4 (d6 standard) = 8 Guard!
    s = reducer(s, { type: "toggleDie", index: 1 });
    expect(guardTotal(s)).toBe(8);
  });

  it("does not apply Steadfast Ward trait to non-d4 dice", () => {
    let s = createGame("forge-tank", "mire-hound", ["d6", "d8", "d10"]);
    s = reducer(s, { type: "roll", values: [4, 6, 8] });
    // Toggle d6 and d8 to guard
    s = reducer(s, { type: "toggleDie", index: 0 });
    s = reducer(s, { type: "toggleDie", index: 1 });
    expect(guardTotal(s)).toBe(4 + 6); // Exactly 10, no bonus
  });

  it("applies d20 Critical Resonance (+5 bonus) on Natural 20", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d8", "d20"]);
    s = reducer(s, { type: "roll", values: [4, 8, 20] });

    // Strike with Nat 20: 4 + 8 + (20 + 5) = 37!
    expect(strikeTotal(s)).toBe(37);

    // Toggle d20 to Guard: Nat 20 grants 20 + 5 = 25 Guard!
    s = reducer(s, { type: "toggleDie", index: 2 });
    expect(guardTotal(s)).toBe(25);
    expect(strikeTotal(s)).toBe(12);
  });

  it("applies d20 Fumble (0 value) on Natural 1 without corrupting Guard or Strike", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d8", "d20"]);
    s = reducer(s, { type: "roll", values: [4, 8, 1] });

    // Strike: 4 + 8 + 0 = 12
    expect(strikeTotal(s)).toBe(12);

    // Toggle d20 to Guard: Nat 1 fumbles to 0 Guard
    s = reducer(s, { type: "toggleDie", index: 2 });
    expect(guardTotal(s)).toBe(0);
  });

  it("does not trigger Critical Surge or Fumble on non-d20 dice rolling 1 or max sides", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d6", "d8"]);
    // d4=1, d6=1, d8=8 (max)
    s = reducer(s, { type: "roll", values: [1, 1, 8] });

    // Non-d20 rolling 1 does NOT fumble to 0
    expect(strikeTotal(s)).toBe(1 + 1 + 8); // 10

    // Non-d20 rolling max face does NOT grant +5 critical bonus
    expect(strikeTotal(s)).toBe(10);
  });

  it("preserves assigned roles and die types across rerolls within valid bounds", () => {
    let s = createGame("oathbreaker", "mire-hound", ["d4", "d6", "d12"]);
    s = reducer(s, { type: "roll", values: [2, 4, 10] });

    s = reducer(s, { type: "toggleDie", index: 0 });
    s = reducer(s, { type: "toggleDie", index: 2 });
    expect(s.dice[0]?.role).toBe("guard");
    expect(s.dice[1]?.role).toBe("strike");
    expect(s.dice[2]?.role).toBe("guard");

    // Reroll with new values
    s = reducer(s, { type: "reroll", values: [4, 6, 12] });
    expect(s.dice[0]).toMatchObject({ value: 4, role: "guard", type: "d4" });
    expect(s.dice[1]).toMatchObject({ value: 6, role: "strike", type: "d6" });
    expect(s.dice[2]).toMatchObject({ value: 12, role: "guard", type: "d12" });

    // d4 (4 + 1 steadfast) + d12 (12) = 17 Guard!
    expect(guardTotal(s)).toBe(17);
    expect(strikeTotal(s)).toBe(6);
  });

  it("generates rolls strictly within face count bounds via rollDie and rollLoadout", () => {
    for (const type of COMBAT_DIE_TYPES) {
      const maxSides = DIE_CONFIGS[type].sides;
      for (let i = 0; i < 20; i++) {
        const val = rollDie(type);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(maxSides);
      }
    }
  });
});

describe("Combat Progression & Species Ability Synergy", () => {
  it("resolves a full round against The Lantern-Jawed Mire Hound with polyhedral dice", () => {
    let s = createGame("forge-tank", "mire-hound", ["d4", "d6", "d8"]);
    s = reducer(s, { type: "roll", values: [4, 5, 8] }); // 17 Strike initially
    s = reducer(s, { type: "toggleDie", index: 0 }); // d4 to Guard (4 + 1 = 5 Guard)

    // Strike: 5 + 8 = 13. Guard: 5.
    // Mire hound intent 1: Gnashing Bite (7 attack).
    // Dealt: 13 damage to hound (46 - 13 = 33).
    // Taken: 7 - 5 = 2 damage to player (44 - 2 = 42).
    s = reducer(s, { type: "endTurn" });

    expect(s.round).toBe(2);
    expect(s.enemyHp).toBe(33);
    expect(s.playerHp).toBe(42);
    expect(s.phase).toBe("roll");
  });

  it("interacts correctly with Bloodhowl Near-Death Frenzy and high polyhedrals", () => {
    let s = createGame("bloodhowl", "mire-hound", ["d8", "d10", "d12"]);
    s = reducer(s, { type: "roll", values: [8, 10, 12] }); // 30 base strike
    expect(strikeTotal(s)).toBe(30);

    // Invoke frenzy (costs 5 HP, doubles strike)
    s = reducer(s, { type: "useAbility" });
    expect(s.playerHp).toBe(s.playerMaxHp - 5);
    expect(strikeTotal(s)).toBe(60); // 30 * 2 = 60!
  });

  it("interacts correctly with Hollow Star Unmake Fate converting all held dice to 6s", () => {
    let s = createGame("hollow-star", "mire-hound", ["d4", "d8", "d20"]);
    s = reducer(s, { type: "roll", values: [1, 2, 3] });

    s = reducer(s, { type: "useAbility" });
    expect(s.playerHp).toBe(s.playerMaxHp - 6);
    expect(s.dice.map((d) => d.value)).toEqual([6, 6, 6]);
    expect(s.dice.map((d) => d.type)).toEqual(["d4", "d8", "d20"]);
  });

  it("interacts correctly with Gear-Saint Overclock granting a 4th die", () => {
    let s = createGame("gear-saint", "mire-hound", ["d4", "d6", "d8"]);
    s = reducer(s, { type: "roll", values: [3, 4, 5] });
    expect(s.dice).toHaveLength(3);

    s = reducer(s, { type: "useAbility", extraDie: 6 });
    expect(s.dice).toHaveLength(4);
    expect(s.dice[3]?.value).toBe(6);
    expect(s.dice[3]?.role).toBe("strike");
  });
});

describe("Dice Tray Loadout Management & Presets", () => {
  it("validates 3-die combat loadouts correctly and rejects utility dice like d%", () => {
    expect(isValidCombatLoadout(["d4", "d6", "d8"])).toBe(true);
    expect(isValidCombatLoadout(["d20", "d20", "d20"])).toBe(true);
    expect(isValidCombatLoadout(["d4", "d6", "d%"])).toBe(false); // d% is utility only
    expect(isValidCombatLoadout(["d4", "d6"])).toBe(false);
    expect(isValidCombatLoadout(["d4", "d6", "d8", "d10"])).toBe(false);
    expect(isValidCombatLoadout(["d4", "invalid", "d8"])).toBe(false);
    expect(isValidCombatLoadout(null)).toBe(false);
  });

  it("verifies mathematical consistency for all presets", () => {
    for (const preset of DICE_PRESETS) {
      expect(preset.dice).toHaveLength(3);
      expect(isValidCombatLoadout(preset.dice)).toBe(true);

      const calculatedFaceAvg = preset.dice.reduce(
        (acc, d) => acc + (1 + (DIE_CONFIGS[d]?.sides ?? 6)) / 2,
        0,
      );
      expect(preset.faceAvg).toBeCloseTo(calculatedFaceAvg, 1);
      expect(preset.minSum).toBe(3);
      expect(preset.maxSum).toBeGreaterThanOrEqual(14);
      expect(preset.traitBonus.length).toBeGreaterThan(5);
    }

    // Verify exact required preset values
    const balanced = DICE_PRESETS.find((p) => p.id === "balanced-triad");
    expect(balanced?.dice).toEqual(["d4", "d6", "d8"]);
    expect(balanced?.faceAvg).toBe(10.5);

    const classic = DICE_PRESETS.find((p) => p.id === "classic-bones");
    expect(classic?.dice).toEqual(["d6", "d6", "d6"]);
    expect(classic?.faceAvg).toBe(10.5);

    const vanguard = DICE_PRESETS.find((p) => p.id === "vanguard-strike");
    expect(vanguard?.dice).toEqual(["d8", "d10", "d12"]);
    expect(vanguard?.faceAvg).toBe(16.5);

    const phalanx = DICE_PRESETS.find((p) => p.id === "steadfast-phalanx");
    expect(phalanx?.dice).toEqual(["d4", "d4", "d6"]);
    expect(phalanx?.faceAvg).toBe(8.5);

    const gambler = DICE_PRESETS.find((p) => p.id === "gamblers-fate");
    expect(gambler?.dice).toEqual(["d4", "d8", "d20"]);
    expect(gambler?.faceAvg).toBe(17.5);
  });

  it("updates loadout in the game state via setLoadout action during roll phase", () => {
    let s = createGame("raven", "mire-hound", ["d4", "d6", "d8"]);
    expect(s.loadout).toEqual(["d4", "d6", "d8"]);

    s = reducer(s, { type: "setLoadout", loadout: ["d8", "d10", "d12"] });
    expect(s.loadout).toEqual(["d8", "d10", "d12"]);

    // Rolling after setLoadout applies the new dice types
    s = reducer(s, { type: "roll", values: [8, 10, 12] });
    expect(s.dice.map((d) => d.type)).toEqual(["d8", "d10", "d12"]);
  });

  it("rejects invalid setLoadout actions such as attempting to equip d%", () => {
    let s = createGame("raven", "mire-hound", ["d4", "d6", "d8"]);
    s = reducer(s, { type: "setLoadout", loadout: ["d4", "d6", "d%"] });
    expect(s.loadout).toEqual(["d4", "d6", "d8"]); // unchanged
  });

  it("persists and restores custom loadout in localStorage", () => {
    localStorage.clear();
    expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);

    saveSelectedLoadout(["d6", "d8", "d20"]);
    expect(loadSelectedLoadout()).toEqual(["d6", "d8", "d20"]);

    // Stale/corrupt localStorage defaults back to default loadout
    localStorage.setItem("dreadveil.selectedLoadout", JSON.stringify(["invalid"]));
    expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);

    // Attempting to persist utility die d% safely falls back to default
    localStorage.setItem("dreadveil.selectedLoadout", JSON.stringify(["d4", "d6", "d%"]));
    expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);
  });
});
