import { getCharacter, type CharacterId } from "./characters";
import { getEncounter, type EncounterId } from "./encounters";
import { DEFAULT_LOADOUT, isValidLoadout, type DieType } from "./dice";

const CHAR_KEY = "dreadveil.selectedCharacter";
const ENCOUNTER_KEY = "dreadveil.selectedEncounter";
const LOADOUT_KEY = "dreadveil.selectedLoadout";

export function loadSelected(): CharacterId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CHAR_KEY);
    return getCharacter(v)?.id ?? null;
  } catch {
    return null;
  }
}

export function saveSelected(id: CharacterId) {
  try {
    window.localStorage.setItem(CHAR_KEY, id);
  } catch {
    /* storage unavailable: selection just won't persist */
  }
}

export function loadSelectedEncounter(): EncounterId {
  if (typeof window === "undefined") return "mire-hound";
  try {
    const v = window.localStorage.getItem(ENCOUNTER_KEY);
    return getEncounter(v).id;
  } catch {
    return "mire-hound";
  }
}

export function saveSelectedEncounter(id: EncounterId) {
  try {
    window.localStorage.setItem(ENCOUNTER_KEY, id);
  } catch {
    /* storage unavailable */
  }
}

export function loadSelectedLoadout(): DieType[] {
  if (typeof window === "undefined") return [...DEFAULT_LOADOUT];
  try {
    const v = window.localStorage.getItem(LOADOUT_KEY);
    if (!v) return [...DEFAULT_LOADOUT];
    const parsed = JSON.parse(v);
    return isValidLoadout(parsed) ? parsed : [...DEFAULT_LOADOUT];
  } catch {
    return [...DEFAULT_LOADOUT];
  }
}

export function saveSelectedLoadout(loadout: DieType[]) {
  try {
    window.localStorage.setItem(LOADOUT_KEY, JSON.stringify(loadout));
  } catch {
    /* storage unavailable */
  }
}
