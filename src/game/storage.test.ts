import { beforeEach, expect, it } from "vitest";
import {
  loadSelected,
  loadSelectedEncounter,
  loadSelectedLoadout,
  saveSelected,
  saveSelectedEncounter,
  saveSelectedLoadout,
} from "./storage";

beforeEach(() => localStorage.clear());

it("saves and reads a valid species and rejects stale values", () => {
  expect(loadSelected()).toBeNull();
  saveSelected("oracle");
  expect(loadSelected()).toBe("oracle");
  localStorage.setItem("dreadveil.selectedCharacter", "invalid");
  expect(loadSelected()).toBeNull();
});

it("saves, reads, and validates encounter selection with fallback to mire-hound", () => {
  expect(loadSelectedEncounter()).toBe("mire-hound");
  saveSelectedEncounter("iron-bile-gorgon");
  expect(loadSelectedEncounter()).toBe("iron-bile-gorgon");
  saveSelectedEncounter("cinder-weaver");
  expect(loadSelectedEncounter()).toBe("cinder-weaver");
  localStorage.setItem("dreadveil.selectedEncounter", "invalid-boss");
  expect(loadSelectedEncounter()).toBe("mire-hound");
});

it("saves, reads, and validates polyhedral loadout with fallback to default triad", () => {
  expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);
  saveSelectedLoadout(["d6", "d8", "d10"]);
  expect(loadSelectedLoadout()).toEqual(["d6", "d8", "d10"]);
  saveSelectedLoadout(["d4", "d8", "d20"]);
  expect(loadSelectedLoadout()).toEqual(["d4", "d8", "d20"]);

  // Stale/corrupt data defaults back to ["d4", "d6", "d8"]
  localStorage.setItem("dreadveil.selectedLoadout", "invalid-json");
  expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);

  localStorage.setItem("dreadveil.selectedLoadout", JSON.stringify(["d4", "not-a-die", "d8"]));
  expect(loadSelectedLoadout()).toEqual(["d4", "d6", "d8"]);
});
