import { describe, expect, it } from "vitest";
import { createGame, reducer } from "./engine";

describe("engine", () => {
  it("runs a round and progresses", () => {
    let s = createGame("forge-tank");
    s = reducer(s, { type: "roll", values: [6, 6, 1] });
    s = reducer(s, { type: "toggleDie", index: 2 });
    s = reducer(s, { type: "endTurn" });
    expect(s.enemyHp).toBe(46 - 12);
    expect(s.playerHp).toBe(44 - 6);
    expect(s.round).toBe(2);
    expect(s.phase).toBe("roll");
  });
  it("snare skips enemy action and unmake sets 6s", () => {
    let s = createGame("thornwarden");
    s = reducer(s, { type: "roll", values: [1, 1, 1] });
    s = reducer(s, { type: "useAbility" });
    s = reducer(s, { type: "endTurn" });
    expect(s.playerHp).toBe(32);
    let h = reducer(createGame("hollow-star"), { type: "roll", values: [1, 2, 3] });
    h = reducer(h, { type: "useAbility" });
    expect(h.dice.map((d) => d.value)).toEqual([6, 6, 6]);
  });
  it("reaches victory", () => {
    let s = createGame("oathbreaker");
    for (let i = 0; i < 20 && s.phase !== "won" && s.phase !== "lost"; i++) {
      s = reducer(s, { type: "roll", values: [6, 6, 6] });
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("won");
  });
});
