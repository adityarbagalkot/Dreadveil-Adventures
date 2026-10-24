import { describe, expect, it } from "vitest";
import { ENCOUNTERS, ENCOUNTER_LIST, getEncounter } from "./encounters";

describe("encounters module", () => {
  it("defines exactly three distinct encounters with required attributes", () => {
    expect(ENCOUNTER_LIST).toHaveLength(3);
    expect(ENCOUNTER_LIST.map((e) => e.id)).toEqual([
      "mire-hound",
      "iron-bile-gorgon",
      "cinder-weaver",
    ]);

    for (const enc of ENCOUNTER_LIST) {
      expect(enc.name).toBeTruthy();
      expect(enc.title).toBeTruthy();
      expect(enc.location).toBeTruthy();
      expect(enc.lore).toBeTruthy();
      expect(enc.maxHp).toBeGreaterThanOrEqual(40);
      expect(enc.pattern.length).toBeGreaterThanOrEqual(3);
      expect(enc.mechanicsSummary).toBeTruthy();
      expect(enc.counterTactics.length).toBeGreaterThanOrEqual(2);
      expect(enc.victoryText).toBeTruthy();
      expect(enc.defeatText).toBeTruthy();

      // Verify every intent has a valid kind and label
      for (const intent of enc.pattern) {
        expect(["attack", "guard"]).toContain(intent.kind);
        expect(intent.amount).toBeGreaterThan(0);
        expect(intent.label).toBeTruthy();
        expect(intent.description).toBeTruthy();
      }
    }
  });

  it("safely retrieves encounters by ID and falls back to mire-hound", () => {
    expect(getEncounter("mire-hound").id).toBe("mire-hound");
    expect(getEncounter("iron-bile-gorgon").id).toBe("iron-bile-gorgon");
    expect(getEncounter("cinder-weaver").id).toBe("cinder-weaver");
    expect(getEncounter("unknown").id).toBe("mire-hound");
    expect(getEncounter(null).id).toBe("mire-hound");
    expect(getEncounter(undefined).id).toBe("mire-hound");
  });

  it("enforces distinct difficulty ratings and HP pools", () => {
    expect(ENCOUNTERS["mire-hound"].difficulty).toBe("Apprentice");
    expect(ENCOUNTERS["mire-hound"].maxHp).toBe(46);

    expect(ENCOUNTERS["iron-bile-gorgon"].difficulty).toBe("Veteran");
    expect(ENCOUNTERS["iron-bile-gorgon"].maxHp).toBe(52);

    expect(ENCOUNTERS["cinder-weaver"].difficulty).toBe("Master");
    expect(ENCOUNTERS["cinder-weaver"].maxHp).toBe(42);
  });
});
