import { describe, expect, it } from "vitest";
import { CHARACTERS, getCharacter } from "./characters";
import {
  canUseAbility,
  createGame,
  currentIntent,
  guardTotal,
  reducer,
  strikeTotal,
  type CharacterId,
} from "./engine";

function cast(id: CharacterId) {
  return reducer(createGame(id, "mire-hound", ["d6", "d6", "d6"]), {
    type: "roll",
    values: [2, 3, 4],
  });
}
function defend(id: CharacterId) {
  let s = cast(id);
  for (let i = 0; i < 3; i++) s = reducer(s, { type: "toggleDie", index: i });
  return s;
}
describe("combat invariants", () => {
  it("allows one reroll, preserves roles, and resets next round", () => {
    let s = reducer(cast("forge-tank"), { type: "toggleDie", index: 1 });
    s = reducer(s, { type: "reroll", values: [6, 6, 6] });
    expect(s.dice[1]?.role).toBe("guard");
    expect(s.rerollsLeft).toBe(0);
    expect(reducer(s, { type: "reroll", values: [1, 1, 1] })).toBe(s);
    s = reducer(s, { type: "endTurn" });
    expect(s.round).toBe(2);
    expect(s.rerollsLeft).toBe(1);
    expect(s.playerHp).toBe(43);
    expect(s.enemyHp).toBe(34);
    expect(currentIntent(s)).toMatchObject({ kind: "guard", amount: 8 });
    s = reducer(s, { type: "roll", values: [2, 3, 4] });
    s = reducer(s, { type: "endTurn" });
    expect(s.enemyHp).toBe(33);
    expect(s.playerHp).toBe(43);
  });
  it.each(CHARACTERS)("enforces $name ability activation and cooldown", (c) => {
    let s = createGame(c.id);
    expect(canUseAbility(s, c)).toBe(false);
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    s = reducer(s, { type: "useAbility", extraDie: 6 });
    expect(s.abilityActive).toBe(true);
    expect(s.abilityCooldown).toBe(c.cooldown);
    expect(reducer(s, { type: "useAbility" })).toBe(s);
    s = reducer(s, { type: "endTurn" });
    expect(s.abilityCooldown).toBe(c.cooldown - 1);
    for (let i = 1; i < c.cooldown; i++) {
      s = reducer(s, { type: "roll", values: [6, 6, 6] });
      for (let j = 0; j < 3; j++) s = reducer(s, { type: "toggleDie", index: j });
      expect(canUseAbility(s, c)).toBe(false);
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.abilityCooldown).toBe(0);
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    expect(canUseAbility(s, c)).toBe(true);
  });
  it("implements bastion, deception, snare and riposte", () => {
    for (const id of ["forge-tank", "raven", "thornwarden"] as const) {
      let s = reducer(cast(id), { type: "useAbility" });
      if (id === "forge-tank") expect(guardTotal(s)).toBe(10);
      s = reducer(s, { type: "endTurn" });
      expect(s.playerHp).toBe(createGame(id).playerHp);
      expect(s.enemyHp).toBe(id === "forge-tank" ? 34 : 37);
    }
    let s = reducer(cast("oathbreaker"), { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.playerHp).toBe(29);
    expect(s.enemyHp).toBe(30);
  });
  it("poisons for four turns and kills before enemy attacks", () => {
    let s = reducer(defend("plaguewright"), { type: "useAbility" });
    for (let i = 0; i < 4; i++) {
      s = reducer(s, { type: "endTurn" });
      expect(s.poisonTurns).toBe(3 - i);
      expect(s.enemyHp).toBe(46 - (i + 1) * 3);
      if (i < 3) {
        s = reducer(s, { type: "roll", values: [6, 6, 6] });
        for (let j = 0; j < 3; j++) s = reducer(s, { type: "toggleDie", index: j });
      }
    }
    s = reducer({ ...defend("plaguewright"), enemyHp: 3 }, { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.phase).toBe("won");
    expect(s.playerHp).toBe(34);
  });
  it("grants oracle rerolls and integrates overclock's fourth die", () => {
    let s = reducer(cast("oracle"), { type: "useAbility" });
    expect(s.rerollsLeft).toBe(3);
    s = reducer(s, { type: "endTurn" });
    expect(s.rerollsLeft).toBe(1);
    s = reducer(cast("gear-saint"), { type: "useAbility", extraDie: 5 });
    expect(s.dice).toHaveLength(4);
    expect(strikeTotal(s)).toBe(14);
    s = reducer(s, { type: "toggleDie", index: 3 });
    s = reducer(s, { type: "reroll", values: [1, 2, 3, 6] });
    expect(s.dice[3]).toMatchObject({ value: 6, role: "guard" });
    expect(guardTotal(s)).toBe(6);
  });
  it("applies frenzy multipliers and HP costs without lethal activation", () => {
    let s = reducer(cast("bloodhowl"), { type: "useAbility" });
    expect(s.playerHp).toBe(33);
    expect(strikeTotal(s)).toBe(18);
    s = reducer({ ...cast("bloodhowl"), playerHp: 15 }, { type: "useAbility" });
    expect(strikeTotal(s)).toBe(27);
    for (const [id, hp] of [
      ["bloodhowl", 5],
      ["hollow-star", 6],
    ] as const) {
      const low = { ...cast(id), playerHp: hp };
      expect(reducer(low, { type: "useAbility" })).toBe(low);
    }
    s = reducer(cast("hollow-star"), { type: "useAbility" });
    expect(s.playerHp).toBe(24);
    expect(s.dice.map((d) => d.value)).toEqual([6, 6, 6]);
  });
  it("reverses damage into healing capped at maximum HP", () => {
    let s = reducer({ ...cast("dirgesinger"), playerHp: 20 }, { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.playerHp).toBe(27);
    s = reducer(cast("dirgesinger"), { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.playerHp).toBe(32);
  });
  it("locks terminal states and preserves simultaneous death as defeat", () => {
    let s = reducer({ ...cast("oathbreaker"), playerHp: 1, enemyHp: 10 }, { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.phase).toBe("lost");
    expect(s.enemyHp).toBe(0);
    for (const action of [
      { type: "endTurn" },
      { type: "roll", values: [6, 6, 6] },
      { type: "toggleDie", index: 0 },
      { type: "useAbility" },
    ] as const)
      expect(reducer(s, action)).toBe(s);
    expect(reducer(createGame("raven"), { type: "endTurn" }).phase).toBe("roll");
    const assigning = cast("raven");
    expect(reducer(assigning, { type: "toggleDie", index: 9 })).toBe(assigning);
    expect(getCharacter("not-a-species")).toBeUndefined();
  });
});
