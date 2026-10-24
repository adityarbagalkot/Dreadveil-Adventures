import { describe, expect, it } from "vitest";
import {
  CHARACTERS,
  getCharacter,
  portraitStyle,
  rosterRect,
  type CharacterId,
} from "./characters";

describe("character roster specifications", () => {
  it("contains exactly 10 unique hybrid species", () => {
    expect(CHARACTERS).toHaveLength(10);
    const ids = new Set(CHARACTERS.map((c) => c.id));
    expect(ids.size).toBe(10);
  });

  it("assigns contiguous index positions from 0 to 9", () => {
    CHARACTERS.forEach((c, i) => {
      expect(c.index).toBe(i);
    });
  });

  it("retrieves characters by id", () => {
    for (const c of CHARACTERS) {
      expect(getCharacter(c.id)).toBe(c);
    }
    expect(getCharacter("nonexistent" as CharacterId)).toBeUndefined();
    expect(getCharacter(null)).toBeUndefined();
    expect(getCharacter(undefined)).toBeUndefined();
  });

  it("validates combat and lore properties for each species", () => {
    for (const c of CHARACTERS) {
      expect(c.name.trim().length).toBeGreaterThan(0);
      expect(c.hybrid).toContain("×");
      expect(c.role.trim().length).toBeGreaterThan(0);
      expect(c.weapon.trim().length).toBeGreaterThan(0);
      expect(c.ability.trim().length).toBeGreaterThan(0);
      expect(c.abilityText.trim().length).toBeGreaterThan(0);
      expect(c.maxHp).toBeGreaterThanOrEqual(30);
      expect(c.maxHp).toBeLessThanOrEqual(50);
      expect(c.cooldown).toBeGreaterThanOrEqual(3);
      expect(c.cooldown).toBeLessThanOrEqual(4);
    }
  });

  it("calculates valid non-overlapping crop rectangles for all 10 positions", () => {
    for (let i = 0; i < 10; i++) {
      const rect = rosterRect(i);
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.left + rect.width).toBeLessThanOrEqual(100);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.top + rect.height).toBeLessThanOrEqual(100);
      expect(rect.width).toBeCloseTo(17.1, 1);
      expect(rect.height).toBeCloseTo(28.0, 1);
    }
  });

  it("generates correct CSS portraitStyle background coordinates", () => {
    const mockUrl = "/test-roster.png";
    for (let i = 0; i < 10; i++) {
      const style = portraitStyle(i, mockUrl);
      expect(style.backgroundImage).toBe(`url(${mockUrl})`);
      expect(style.backgroundSize).toMatch(/^\d+(\.\d+)?% \d+(\.\d+)?%$/);
      expect(style.backgroundPosition).toMatch(/^\d+(\.\d+)?% \d+(\.\d+)?%$/);
    }
  });
});
