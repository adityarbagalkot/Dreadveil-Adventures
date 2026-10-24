import { describe, expect, it } from "vitest";
import { CHARACTERS } from "./characters";
import {
  canUseAbility,
  createGame as baseCreateGame,
  currentIntent,
  guardTotal,
  nextIntent,
  reducer,
  strikeTotal,
  type CharacterId,
  type EncounterId,
} from "./engine";

const createGame = (c: CharacterId, e?: EncounterId) =>
  baseCreateGame(c, e ?? "mire-hound", ["d6", "d6", "d6"]);

describe("Iron-Bile Gorgon boss mechanics", () => {
  it("initializes with 52 HP and correct location", () => {
    const s = createGame("forge-tank", "iron-bile-gorgon");
    expect(s.encounterId).toBe("iron-bile-gorgon");
    expect(s.enemyHp).toBe(52);
    expect(s.enemyMaxHp).toBe(52);
    expect(s.petrification).toBe(0);
    expect(s.corrodedTurns).toBe(0);
    expect(currentIntent(s)).toMatchObject({
      kind: "attack",
      amount: 6,
      label: "Caustic Bile",
      modifier: "corrosive",
    });
  });

  it("applies corroded armor (-3 Guard) when Caustic Bile penetrates player guard", () => {
    let s = createGame("raven", "iron-bile-gorgon");
    // Cast bones, allocate all to Strike (0 Guard)
    s = reducer(s, { type: "roll", values: [3, 4, 5] });
    s = reducer(s, { type: "endTurn" });

    // Gorgon attacked for 6, player took 6
    expect(s.playerHp).toBe(s.playerMaxHp - 6);
    expect(s.corrodedTurns).toBe(1); // 1 active round remaining
    expect(s.log.some((l) => l.includes("Corroded: -3 Guard"))).toBe(true);

    // In Round 2: verify guard total has -3 penalty
    s = reducer(s, { type: "roll", values: [5, 5, 5] });
    s = reducer(s, { type: "toggleDie", index: 0 }); // 5 Guard
    expect(guardTotal(s)).toBe(2); // 5 - 3 = 2!

    // End turn 2: corroded expires
    s = reducer(s, { type: "endTurn" });
    expect(s.corrodedTurns).toBe(0);

    // In Round 3: penalty gone
    s = reducer(s, { type: "roll", values: [5, 5, 5] });
    s = reducer(s, { type: "toggleDie", index: 0 });
    expect(guardTotal(s)).toBe(5);
  });

  it("does not corrode armor if player fully guards Caustic Bile", () => {
    let s = createGame("forge-tank", "iron-bile-gorgon");
    // 3 dice with values [3, 4, 1] = 8 guard
    s = reducer(s, { type: "roll", values: [3, 4, 1] });
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "toggleDie", index: i });
    expect(guardTotal(s)).toBe(8);

    s = reducer(s, { type: "endTurn" });
    // Guard of 8 stopped all 6 damage -> taken 0
    expect(s.playerHp).toBe(s.playerMaxHp);
    expect(s.corrodedTurns).toBe(0);
  });

  it("accumulates petrification on Petrifying Gaze if guard < 5, and shatters at 3 stacks", () => {
    let s = createGame("forge-tank", "iron-bile-gorgon");
    // Fast forward to round 3 (intent 3 = Petrifying Gaze)
    s = { ...s, intentIndex: 2, round: 3 };
    expect(currentIntent(s).label).toBe("Petrifying Gaze");

    // Attempt 1: Guard with 3 (less than 5)
    s = reducer(s, { type: "roll", values: [3, 3, 3] });
    s = reducer(s, { type: "toggleDie", index: 0 }); // 3 Guard
    expect(guardTotal(s)).toBe(3);
    s = reducer(s, { type: "endTurn" });

    expect(s.petrification).toBe(1);
    expect(s.log.some((l) => l.includes("+1 Petrification: 1/3"))).toBe(true);

    // Attempt 2: Set intent back to Petrifying Gaze and Guard with 2
    s = { ...s, intentIndex: 2 };
    s = reducer(s, { type: "roll", values: [2, 2, 2] });
    s = reducer(s, { type: "toggleDie", index: 0 });
    s = reducer(s, { type: "endTurn" });
    expect(s.petrification).toBe(2);

    // Attempt 3: Petrifying Gaze triggers 3rd stack -> Shatters for 8 damage!
    s = { ...s, intentIndex: 2 };
    const hpBefore = s.playerHp;
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    s = reducer(s, { type: "endTurn" }); // 0 guard

    // Gaze deals 5 damage + 8 shatter damage = 13 total damage taken
    expect(s.playerHp).toBe(hpBefore - 13);
    expect(s.petrification).toBe(0); // Resets after shattering
    expect(s.log.some((l) => l.includes("shatters for 8 damage"))).toBe(true);
  });

  it("reflects Petrifying Gaze without gaining petrification when Guard is >= 5", () => {
    let s = createGame("forge-tank", "iron-bile-gorgon");
    s = { ...s, intentIndex: 2, round: 3 };
    expect(currentIntent(s).label).toBe("Petrifying Gaze");

    // Guard with 6
    s = reducer(s, { type: "roll", values: [6, 2, 2] });
    s = reducer(s, { type: "toggleDie", index: 0 });
    expect(guardTotal(s)).toBe(6);

    s = reducer(s, { type: "endTurn" });
    expect(s.petrification).toBe(0);
    expect(s.log.some((l) => l.includes("reflects the Gorgon's petrifying glare"))).toBe(true);
  });

  it("absorbs 10 damage during Calcified Shell intent", () => {
    let s = createGame("forge-tank", "iron-bile-gorgon");
    s = { ...s, intentIndex: 1, round: 2 }; // Calcified Shell (Guard 10)
    expect(currentIntent(s)).toMatchObject({ kind: "guard", amount: 10 });

    // Strike with 12
    s = reducer(s, { type: "roll", values: [4, 4, 4] });
    s = reducer(s, { type: "endTurn" });

    // 12 strike - 10 guard = 2 damage dealt
    expect(s.enemyHp).toBe(52 - 2);
  });
});

describe("Cinder-Weaver boss mechanics", () => {
  it("initializes with 42 HP and correct starting intent", () => {
    const s = createGame("bloodhowl", "cinder-weaver");
    expect(s.encounterId).toBe("cinder-weaver");
    expect(s.enemyHp).toBe(42);
    expect(s.enemyMaxHp).toBe(42);
    expect(s.embers).toBe(0);
    expect(currentIntent(s)).toMatchObject({
      kind: "attack",
      amount: 5,
      label: "Searing Spinneret",
      modifier: "ignite",
    });
  });

  it("plants 2 embers on Searing Spinneret", () => {
    let s = createGame("bloodhowl", "cinder-weaver");
    s = reducer(s, { type: "roll", values: [2, 2, 2] });
    s = reducer(s, { type: "endTurn" });

    expect(s.embers).toBe(2);
    expect(s.log.some((l) => l.includes("embeds 2 smoldering embers"))).toBe(true);
  });

  it("plants 1 ember when Molten Cocoon braces", () => {
    let s = createGame("bloodhowl", "cinder-weaver");
    s = { ...s, intentIndex: 2, round: 3 }; // Molten Cocoon (guard 7)
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    s = reducer(s, { type: "endTurn" });

    expect(s.embers).toBe(1);
    expect(s.log.some((l) => l.includes("Molten Cocoon"))).toBe(true);
  });

  it("quenches 1 ember per assigned Guard die during resolution", () => {
    let s = createGame("gear-saint", "cinder-weaver");
    s.embers = 3;

    // Roll 3 dice, assign 2 to Guard, 1 to Strike
    s = reducer(s, { type: "roll", values: [4, 5, 2] });
    s = reducer(s, { type: "toggleDie", index: 0 }); // Guard
    s = reducer(s, { type: "toggleDie", index: 1 }); // Guard

    // 2 guard dice allocated
    s = reducer(s, { type: "endTurn" });

    // Searing Spinneret plants 2, but 2 were quenched first:
    // 3 - 2 quenched + 2 from spinneret = 3
    expect(s.log.some((l) => l.includes("quenches 2 smoldering embers (1 remaining)"))).toBe(true);
    expect(s.embers).toBe(3);
  });

  it("detonates all active embers on Conflagration for 2 bonus damage each", () => {
    let s = createGame("forge-tank", "cinder-weaver");
    s.embers = 3;
    s.intentIndex = 3; // Conflagration (9 base damage)
    expect(currentIntent(s).label).toBe("Conflagration");

    // Zero guard dice allocated
    s = reducer(s, { type: "roll", values: [4, 4, 4] });
    const hpBefore = s.playerHp;
    s = reducer(s, { type: "endTurn" });

    // 9 base + (3 embers * 2) = 15 total damage!
    expect(s.playerHp).toBe(hpBefore - 15);
    expect(s.embers).toBe(0); // Embers reset after detonation
    expect(s.log.some((l) => l.includes("Conflagration ignites 3 smoldering embers"))).toBe(true);
  });

  it("allows quenching all embers before Conflagration to avoid bonus damage", () => {
    let s = createGame("forge-tank", "cinder-weaver");
    s.embers = 2;
    s.intentIndex = 3; // Conflagration (9 base)

    // Assign all 3 dice to Guard
    s = reducer(s, { type: "roll", values: [4, 4, 4] }); // 12 guard
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "toggleDie", index: i });
    expect(guardTotal(s)).toBe(12);

    const hpBefore = s.playerHp;
    s = reducer(s, { type: "endTurn" });

    // 2 embers quenched -> 0 embers left -> only 9 damage -> 12 guard absorbs all 9 damage!
    expect(s.playerHp).toBe(hpBefore);
    expect(s.embers).toBe(0);
    expect(s.log.some((l) => l.includes("quenches 2 smoldering embers"))).toBe(true);
  });
});

describe("All ten species abilities against new bosses", () => {
  it.each(CHARACTERS)("activates and resolves %s ability against Iron-Bile Gorgon", (c) => {
    let s = createGame(c.id, "iron-bile-gorgon");
    s = reducer(s, { type: "roll", values: [3, 4, 5] });
    expect(canUseAbility(s, c)).toBe(true);

    s = reducer(s, { type: "useAbility", extraDie: 6 });
    expect(s.abilityActive).toBe(true);

    s = reducer(s, { type: "endTurn" });
    expect(s.round).toBe(2);
    expect(s.abilityActive).toBe(false);
  });

  it.each(CHARACTERS)("activates and resolves %s ability against Cinder-Weaver", (c) => {
    let s = createGame(c.id, "cinder-weaver");
    s = reducer(s, { type: "roll", values: [4, 4, 4] });
    expect(canUseAbility(s, c)).toBe(true);

    s = reducer(s, { type: "useAbility", extraDie: 5 });
    expect(s.abilityActive).toBe(true);

    s = reducer(s, { type: "endTurn" });
    expect(s.round).toBe(2);
    expect(s.abilityActive).toBe(false);
  });

  it("verifies The Raven Eightfold Deception evades Gorgon and Weaver attacks", () => {
    let g = createGame("raven", "iron-bile-gorgon");
    g = reducer(g, { type: "roll", values: [1, 2, 3] });
    g = reducer(g, { type: "useAbility" });
    g = reducer(g, { type: "endTurn" });
    expect(g.playerHp).toBe(g.playerMaxHp); // Took 0 damage
    expect(g.corrodedTurns).toBe(0); // Did not get corroded

    let w = createGame("raven", "cinder-weaver");
    w = reducer(w, { type: "roll", values: [1, 2, 3] });
    w = reducer(w, { type: "useAbility" });
    w = reducer(w, { type: "endTurn" });
    expect(w.playerHp).toBe(w.playerMaxHp);
  });

  it("verifies Thornwarden Verdant Snare cancels Gorgon and Weaver actions", () => {
    let g = createGame("thornwarden", "iron-bile-gorgon");
    g = reducer(g, { type: "roll", values: [2, 3, 4] });
    g = reducer(g, { type: "useAbility" });
    g = reducer(g, { type: "endTurn" });
    expect(g.playerHp).toBe(g.playerMaxHp);
    expect(g.log.some((l) => l.includes("Verdant Snare holds fast"))).toBe(true);

    let w = createGame("thornwarden", "cinder-weaver");
    w = reducer(w, { type: "roll", values: [2, 3, 4] });
    w = reducer(w, { type: "useAbility" });
    w = reducer(w, { type: "endTurn" });
    expect(w.playerHp).toBe(w.playerMaxHp);
    expect(w.embers).toBe(0); // Searing spinneret was canceled!
  });

  it("verifies Dirgesinger Requiem reverses Conflagration damage into healing", () => {
    let w = createGame("dirgesinger", "cinder-weaver");
    w.playerHp = 15;
    w.embers = 2;
    w.intentIndex = 3; // Conflagration (9 base + 4 from embers = 13)

    w = reducer(w, { type: "roll", values: [1, 1, 1] });
    w = reducer(w, { type: "useAbility" }); // Requiem
    w = reducer(w, { type: "endTurn" });

    // Healed for 13 damage!
    expect(w.playerHp).toBe(15 + 13);
  });
});

describe("Victory and Defeat terminal states across all encounters", () => {
  it("triggers Victory for Iron-Bile Gorgon with correct victory narrative", () => {
    let s = createGame("oathbreaker", "iron-bile-gorgon");
    s.enemyHp = 5;
    s = reducer(s, { type: "roll", values: [6, 6, 6] });
    s = reducer(s, { type: "endTurn" });

    expect(s.phase).toBe("won");
    expect(s.enemyHp).toBe(0);
    expect(s.log.some((l) => l.includes("shatters into inert slag"))).toBe(true);
  });

  it("triggers Defeat for Cinder-Weaver with correct defeat narrative", () => {
    let s = createGame("bloodhowl", "cinder-weaver");
    s.playerHp = 4;
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    s = reducer(s, { type: "endTurn" });

    expect(s.phase).toBe("lost");
    expect(s.playerHp).toBe(0);
    expect(s.log.some((l) => l.includes("consumed by ash and embers"))).toBe(true);
  });
});
