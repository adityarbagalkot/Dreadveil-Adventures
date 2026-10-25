import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Dice5,
  Dices,
  Flame,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dreadveilRoster from "@/assets/dreadveil-roster.png";
import roster from "@/assets/dreadveil-roster.png.asset.json";
import { getCharacter, portraitStyle, type Character, type CharacterId } from "@/game/characters";
import { getEncounter, type Encounter, type EncounterId, type Intent } from "@/game/encounters";
import {
  BASE_DICE,
  canUseAbility,
  createGame,
  currentIntent,
  guardTotal,
  nextIntent,
  reducer,
  rollActiveLoadout,
  rollDie,
  strikeTotal,
  type DieType,
} from "@/game/engine";
import { DIE_CONFIGS, isNatural1, isNatural20 } from "@/game/dice";
import {
  loadSelected,
  loadSelectedEncounter,
  loadSelectedLoadout,
  saveSelectedLoadout,
} from "@/game/storage";
import { EncounterArt } from "@/components/EncounterArt";
import { PolyhedralGeometry } from "@/components/PolyhedralDie";
import { DiceLoadoutModal } from "@/components/DiceLoadoutModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "The Dying Gods Combat Arena — Dreadveil" },
      {
        name: "description",
        content: "Tabletop tactical combat against ancient horrors beyond the Veil.",
      },
      { property: "og:title", content: "The Dying Gods Combat Arena — Dreadveil" },
      {
        property: "og:description",
        content: "Tabletop tactical combat against ancient horrors beyond the Veil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayScreen,
});

export function PlayScreen() {
  const [charId, setCharId] = useState<CharacterId | null | undefined>(undefined);
  const [encounterId, setEncounterId] = useState<EncounterId>("mire-hound");
  const [loadout, setLoadout] = useState<DieType[]>(["d4", "d6", "d8"]);

  useEffect(() => {
    setCharId(loadSelected());
    setEncounterId(loadSelectedEncounter());
    setLoadout(loadSelectedLoadout());
  }, []);

  if (charId === undefined) return <div className="min-h-screen" aria-label="Loading encounter" />;
  const character = getCharacter(charId);
  const encounter = getEncounter(encounterId);

  if (!character)
    return (
      <div className="empty-encounter min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="eyebrow text-bronze uppercase tracking-widest text-xs font-mono">
          At the threshold
        </p>
        <h1 className="text-3xl font-serif font-bold text-[#E6C687] mt-2 mb-3">
          No species chosen
        </h1>
        <p className="text-zinc-400 font-serif mb-6">Who will step into the black water?</p>
        <Button variant="bronze" asChild>
          <Link to="/select">
            Choose Species <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );

  return (
    <EncounterSession
      key={`${character.id}-${encounter.id}`}
      character={character}
      encounter={encounter}
      initialLoadout={loadout}
    />
  );
}

function EncounterSession({
  character,
  encounter,
  initialLoadout,
}: {
  character: Character;
  encounter: Encounter;
  initialLoadout: DieType[];
}) {
  const [run, setRun] = useState(0);
  return (
    <Battle
      key={run}
      character={character}
      encounter={encounter}
      initialLoadout={initialLoadout}
      onRestart={() => setRun((r) => r + 1)}
    />
  );
}

const ALL_POLYHEDRALS: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20"];

const CANONICAL_FACES: Record<DieType, number> = {
  d4: 2,
  d6: 6,
  d8: 5,
  d10: 8,
  d12: 8,
  d20: 17,
  "d%": 50,
};

function Battle({
  character: c,
  encounter: enc,
  initialLoadout,
  onRestart,
}: {
  character: Character;
  encounter: Encounter;
  initialLoadout: DieType[];
  onRestart: () => void;
}) {
  const [s, dispatch] = useReducer(reducer, null, () => createGame(c.id, enc.id, initialLoadout));
  const [isLoadoutOpen, setIsLoadoutOpen] = useState(false);
  const outcomeRef = useRef<HTMLHeadingElement>(null);
  const intent = currentIntent(s);
  const over = s.phase === "won" || s.phase === "lost";

  useEffect(() => {
    if (over) outcomeRef.current?.focus();
  }, [over]);

  const foresee = c.id === "oracle" && s.abilityActive;
  const snared = c.id === "thornwarden" && s.abilityActive;
  const abilityReady = canUseAbility(s, c);
  const strike = strikeTotal(s);
  const guard = guardTotal(s);

  const abilityStatus = s.abilityActive
    ? "Active this round"
    : s.abilityCooldown > 0
      ? `Ready in ${s.abilityCooldown} round${s.abilityCooldown === 1 ? "" : "s"}`
      : (c.id === "bloodhowl" && s.playerHp <= 5) || (c.id === "hollow-star" && s.playerHp <= 6)
        ? "Not enough HP"
        : s.phase === "roll"
          ? "Available after rolling"
          : "Ready";

  const handleSaveLoadout = (newLoadout: DieType[]) => {
    dispatch({ type: "setLoadout", loadout: newLoadout });
    saveSelectedLoadout(newLoadout);
  };

  const handleGuardAll = () => {
    const allGuard = s.dice.every((d) => d.role === "guard");
    s.dice.forEach((d, idx) => {
      if (allGuard ? d.role === "guard" : d.role === "strike") {
        dispatch({ type: "toggleDie", index: idx });
      }
    });
  };

  // Map active rolled dice into the 6-slot visual polyhedral tray
  type ActiveDie = (typeof s.dice)[number];
  interface PolyhedralSlot {
    type: DieType;
    activeDie: ActiveDie | null;
    activeIndex: number;
  }

  const usedIndices = new Set<number>();
  const polyhedralSlots: PolyhedralSlot[] = ALL_POLYHEDRALS.map((type) => {
    const activeIdx = s.dice.findIndex((d, idx) => !usedIndices.has(idx) && d.type === type);
    if (activeIdx !== -1 && s.dice[activeIdx]) {
      usedIndices.add(activeIdx);
      return { type, activeDie: s.dice[activeIdx], activeIndex: activeIdx };
    }
    return { type, activeDie: null, activeIndex: -1 };
  });

  // Assign any remaining unplaced active dice to open slots
  s.dice.forEach((d, idx) => {
    if (!usedIndices.has(idx)) {
      const openSlot = polyhedralSlots.find((slot) => slot.activeDie === null);
      if (openSlot) {
        openSlot.activeDie = d;
        openSlot.activeIndex = idx;
        usedIndices.add(idx);
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#070605] text-[#ECE0CA] flex flex-col justify-between p-2 sm:p-4 select-none font-body">
      {/* Top Application Bar */}
      <header className="flex items-center justify-between border-b border-[#3D3022] pb-2 mb-2 px-1">
        <div className="flex items-center gap-3">
          <Button variant="iron" size="sm" asChild className="h-7 text-xs font-serif">
            <Link to="/select">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Roster
            </Link>
          </Button>
          <span className="font-serif font-black tracking-[0.25em] text-[#CDB486] text-sm uppercase">
            Combat Arena UI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-black/60 border border-[#4A3B2C]">
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#A69375]">
              Round
            </span>
            <strong className="text-sm font-mono font-bold text-[#E6C687]">
              {String(s.round).padStart(2, "0")}
            </strong>
          </div>
          <Button
            variant="iron"
            size="sm"
            onClick={() => setIsLoadoutOpen(true)}
            aria-label="Open dice pouch and customize loadout"
            className="h-7 px-2.5 text-xs font-mono"
          >
            <Dices className="mr-1 h-3.5 w-3.5 text-candle" /> Pouch ({s.loadout.join("·")})
          </Button>
          <Button variant="iron" size="sm" asChild className="h-7 text-xs font-serif">
            <Link to="/">Title</Link>
          </Button>
        </div>
      </header>

      {/* Main Arena Tabletop Container */}
      <main className="flex-1 flex flex-col justify-center max-w-[1360px] w-full mx-auto">
        {/* UPPER ROW: Enemy Artwork (Dominant Left) & Parchment Lore/Intent (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-3 items-stretch">
          {/* Main Enemy Artwork Panel */}
          <section
            className="relative bg-[#0A0807] border-2 border-[#54422E] rounded-xs shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            aria-label="Enemy"
          >
            {/* Top header directly on the artwork */}
            <div className="p-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent z-10">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="font-serif font-bold text-base sm:text-lg lg:text-xl tracking-wider text-[#F0DFBE] uppercase drop-shadow-md">
                  {enc.name}
                </h2>
                <span className="font-mono text-xs sm:text-sm text-[#D4C3A3] font-bold">
                  {s.enemyHp} / {s.enemyMaxHp} HP
                </span>
              </div>
              {/* Crimson Health Track */}
              <div
                className="w-full h-2.5 sm:h-3 bg-black/90 border border-[#54422E] rounded-xs overflow-hidden shadow-inner"
                role="meter"
                aria-label="Enemy vitality"
                aria-valuenow={s.enemyHp}
                aria-valuemin={0}
                aria-valuemax={s.enemyMaxHp}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#7B1F24] via-[#A82B31] to-[#D94545] transition-all duration-300"
                  style={{
                    width: `${Math.max(0, Math.min(100, (s.enemyHp / s.enemyMaxHp) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Artwork Container */}
            <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] w-full overflow-hidden bg-black flex items-center justify-center">
              <EncounterArt encounter={enc} className="w-full h-full object-cover object-center" />

              {/* Bottom-left Antique Bronze Medallion Badge (Threat / Armor Rating) */}
              <div
                className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#9E7D46] bg-[#1A1510] text-[#E6C687] font-serif font-black shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-sm z-10"
                title="Archival Threat Grade"
                aria-hidden="true"
              >
                8
              </div>
            </div>
          </section>

          {/* Upper-Right: Parchment Lore and Intent Panel */}
          <aside
            className="bg-[#D6C7A5] border-2 border-[#4A3B2B] rounded-xs p-3.5 sm:p-4 text-[#261B10] flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.7)] relative min-h-[260px] lg:min-h-full"
            aria-label="Enemy lore and intent"
          >
            <div>
              {/* Classification */}
              <div className="text-[11px] font-serif font-bold uppercase tracking-[0.2em] text-[#7A2C2F]">
                {enc.subtitle}
              </div>

              {/* Atmospheric Lore */}
              <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#2D2115] font-serif italic">
                {enc.lore}
              </p>

              {/* Decorative Divider */}
              <div className="my-3 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-[#8F7D65]/40" />
                <span className="text-[#6E5A44] text-[10px]">❖</span>
                <div className="h-[1px] flex-1 bg-[#8F7D65]/40" />
              </div>

              {/* Enemy Intent Section */}
              <div className="text-[11px] font-serif font-bold uppercase tracking-[0.22em] text-[#54412E]">
                ENEMY INTENT
              </div>

              {snared ? (
                <div className="mt-2 flex items-center gap-2 text-emerald-900 font-serif font-bold">
                  <Shield size={18} />
                  <span>Entangled — cannot act this round</span>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-[#7A2C2F]/15 text-[#7A2C2F]">
                      {intent.kind === "attack" ? <Swords size={18} /> : <Shield size={18} />}
                    </div>
                    <span className="font-serif font-bold text-base sm:text-lg text-[#1E150D]">
                      {intent.label}
                    </span>
                  </div>
                  <div className="text-right leading-none">
                    <span className="font-serif font-black text-2xl sm:text-3xl text-[#1E150D]">
                      {intent.amount}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider font-mono text-[#574431]">
                      {intent.kind === "attack" ? "Attack" : "Guard"}
                    </span>
                  </div>
                </div>
              )}

              {/* Intent Evocative Narrative Description */}
              <p className="mt-2 text-xs leading-relaxed text-[#3B2C1E] font-serif">
                {intent.description}
              </p>

              {/* Foreseen next intent if Oracle ability is active */}
              {foresee && (
                <div className="mt-2 pt-2 border-t border-[#8F7D65]/30 text-xs italic text-[#574431]">
                  Foreseen next: {nextIntent(s).label} ({nextIntent(s).amount} {nextIntent(s).kind})
                </div>
              )}
            </div>

            {/* Boss Status Ailment Stamps */}
            {(s.poisonTurns > 0 || s.petrification > 0 || s.corrodedTurns > 0 || s.embers > 0) && (
              <div className="mt-3 pt-2.5 border-t border-[#8F7D65]/40 space-y-1 text-[11px] font-mono">
                {s.poisonTurns > 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <span>❖</span>
                    <span>Living Contagion · 3 dmg × {s.poisonTurns} rds left</span>
                  </div>
                )}
                {s.petrification > 0 && (
                  <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                    <ShieldAlert size={12} className="text-stone-800" />
                    <span>Petrification: {s.petrification} / 3 (shatters at 3)</span>
                  </div>
                )}
                {s.corrodedTurns > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                    <ShieldAlert size={12} className="text-amber-900" />
                    <span>Corroded Armor · -3 Guard this round</span>
                  </div>
                )}
                {s.embers > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-950 font-bold">
                    <Flame size={12} className="text-orange-900" />
                    <span>Smoldering Embers: {s.embers} (Guard quenches 1/die)</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* LOWER ROW: Player Sheet (Left), 6-Die Tray & Controls (Center), Signature Ability (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[270px_1fr_270px] gap-3 mt-3 items-stretch">
          {/* Lower-Left: Player Character Panel */}
          <section
            className="bg-[#0A0807] border-2 border-[#54422E] rounded-xs p-3 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            aria-label="Your species"
          >
            <div className="flex gap-3 items-center">
              {/* Character Portrait */}
              <div
                className="w-16 h-20 sm:w-18 sm:h-22 border border-[#8E7040] rounded-xs shrink-0 shadow-md bg-cover bg-no-repeat"
                style={portraitStyle(c.index, dreadveilRoster || roster.url)}
                role="img"
                aria-label={c.name}
                suppressHydrationWarning
              />

              {/* Character Meta */}
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-[11px] font-serif uppercase tracking-wider text-zinc-400">
                  {c.role}
                </p>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#E6C687] uppercase tracking-wider truncate">
                  {c.name}
                </h3>
                <p className="text-[11px] font-serif text-zinc-400 truncate italic">{c.hybrid}</p>

                {/* Player Health */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 font-semibold mb-1">
                    <span>HP</span>
                    <span>
                      {s.playerHp} / {s.playerMaxHp}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 bg-black/90 border border-[#54422E] rounded-xs overflow-hidden shadow-inner"
                    role="meter"
                    aria-label="Your vitality"
                    aria-valuenow={s.playerHp}
                    aria-valuemin={0}
                    aria-valuemax={s.playerMaxHp}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#7B1F24] via-[#A82B31] to-[#D94545] transition-all duration-300"
                      style={{
                        width: `${Math.max(0, Math.min(100, (s.playerHp / s.playerMaxHp) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Sigil Medallions */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#3E3022]/60 px-1">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-600/70 bg-emerald-950/70 text-emerald-400 shadow-sm"
                  title="Ward Stance"
                  aria-hidden="true"
                >
                  <Shield size={12} />
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-600/70 bg-rose-950/70 text-rose-400 shadow-sm"
                  title="Strike Stance"
                  aria-hidden="true"
                >
                  <Swords size={12} />
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-sky-600/70 bg-sky-950/70 text-sky-400 shadow-sm"
                  title="Arcane Conduit"
                  aria-hidden="true"
                >
                  <Sparkles size={12} />
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                READY
              </span>
            </div>
          </section>

          {/* Lower-Middle: Polyhedral Dice Tray & Wide Combat Controls */}
          <section
            className="bg-[#0B0908] border-2 border-[#54422E] rounded-xs p-3 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            aria-label="Dice tray"
          >
            {/* The Six Polyhedral Dice Row */}
            <div>
              {/* Live Totals Bar in Assign Phase */}
              {s.phase === "assign" && (
                <div
                  className="flex items-center justify-between text-xs font-mono px-3 py-1 bg-black/60 border border-[#3E3022] rounded-xs mb-2"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <Swords size={14} className="text-rose-400" />
                    <span>Strike Total:</span>
                    <strong className="text-rose-200 text-sm font-bold">{strike}</strong>
                    {s.dice.some((d) => d.role === "strike" && isNatural20(d.value, d.type)) && (
                      <span className="text-[10px] text-amber-300 font-bold">(Nat 20 +5!)</span>
                    )}
                    {s.dice.some((d) => d.role === "strike" && isNatural1(d.value, d.type)) && (
                      <span className="text-[10px] text-rose-400 font-bold">(Nat 1 Fumble)</span>
                    )}
                  </span>

                  <span className="flex items-center gap-1.5 text-sky-300">
                    <Shield size={14} className="text-sky-400" />
                    <span>Guard Total:</span>
                    <strong className="text-sky-200 text-sm font-bold">{guard}</strong>
                    {s.dice.some((d) => d.role === "guard" && d.type === "d4") && (
                      <span className="text-[10px] text-amber-300 font-bold">(+1 Steadfast)</span>
                    )}
                    {s.corrodedTurns > 0 && (
                      <span className="text-[10px] text-amber-500 font-bold">(-3 Corroded)</span>
                    )}
                  </span>
                </div>
              )}

              {/* Six Polyhedrals in Horizontal Alignment */}
              <div className="flex items-center justify-around gap-1 sm:gap-2 py-1">
                {polyhedralSlots.map((slot, i) => {
                  const { type, activeDie, activeIndex } = slot;
                  const config = DIE_CONFIGS[type];

                  if (s.phase === "assign" && activeDie !== null) {
                    const isStrike = activeDie.role === "strike";
                    return (
                      <button
                        key={i}
                        type="button"
                        role="button"
                        aria-pressed={activeDie.role === "guard"}
                        aria-label={`Die ${activeIndex + 1} (${activeDie.type}): ${activeDie.value} (${activeDie.role})`}
                        onClick={() => dispatch({ type: "toggleDie", index: activeIndex })}
                        className={cn(
                          "group flex flex-col items-center justify-center p-1 rounded-sm border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candle",
                          isStrike
                            ? "border-rose-900/60 bg-rose-950/20 hover:border-rose-600 shadow-[0_0_12px_rgba(185,28,28,0.2)]"
                            : "border-sky-900/60 bg-sky-950/20 hover:border-sky-600 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
                        )}
                      >
                        <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
                          <PolyhedralGeometry
                            type={type}
                            value={activeDie.value}
                            role={activeDie.role}
                          />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4C3A3] font-bold mt-1">
                          {type}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-serif uppercase tracking-wider font-bold mt-0.5 px-1 rounded",
                            isStrike
                              ? "text-rose-300 bg-rose-950/60"
                              : "text-sky-300 bg-sky-950/60",
                          )}
                        >
                          {activeDie.role}
                        </span>
                      </button>
                    );
                  }

                  // Reserve / Uncast Polyhedral Die
                  const face = CANONICAL_FACES[type];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center p-1 opacity-70 grayscale-[25%] select-none"
                      aria-hidden="true"
                    >
                      <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
                        <PolyhedralGeometry type={type} value={face} role="guard" />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A69375] font-semibold mt-1">
                        {type}
                      </span>
                      <span className="text-[9px] font-serif uppercase tracking-wider text-zinc-500 mt-0.5">
                        {config?.name ?? "Die"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combat Action Controls */}
            <div className="mt-2.5">
              {s.phase === "roll" ? (
                <Button
                  variant="bronze"
                  onClick={() => dispatch({ type: "roll", values: rollActiveLoadout(s.loadout) })}
                  aria-label={`Roll ${s.loadout.length} casting bones`}
                  className="w-full h-12 text-base font-serif font-bold tracking-widest uppercase shadow-lg"
                >
                  <Dice5 className="mr-2 h-5 w-5" /> Roll {s.loadout.length} Dice
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* STRIKE Button (Blood-Wine / Crimson Plaque) */}
                  <Button
                    type="button"
                    onClick={() => dispatch({ type: "endTurn" })}
                    aria-label={`End Turn — Strike with ${strike} attack`}
                    className="flex-1 h-12 bg-[#762F32] hover:bg-[#8B383C] active:bg-[#632729] border-2 border-[#9B4549] text-[#F4E3C7] rounded-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                  >
                    <Swords size={18} className="text-[#F4E3C7]/90" />
                    <span className="font-serif font-bold text-base tracking-widest text-[#F4E3C7]">
                      STRIKE
                    </span>
                    <span className="text-xs font-mono text-[#F4E3C7]/80 font-bold">
                      ({strike})
                    </span>
                    <span className="sr-only">End Turn</span>
                  </Button>

                  {/* GUARD Button (Dark Slate Iron Plaque) */}
                  <Button
                    type="button"
                    onClick={handleGuardAll}
                    aria-label={`Guard with ${guard} defense. Click to set all bones to Guard.`}
                    className="flex-1 h-12 bg-[#18202A] hover:bg-[#202B38] active:bg-[#121921] border-2 border-[#2E3F52] text-[#B8D0E6] rounded-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                  >
                    <Shield size={18} className="text-[#B8D0E6]/90" />
                    <span className="font-serif font-bold text-base tracking-widest text-[#B8D0E6]">
                      GUARD
                    </span>
                    <span className="text-xs font-mono text-[#B8D0E6]/80 font-bold">({guard})</span>
                  </Button>

                  {/* REROLL Button (Muted Forest Green Plaque) */}
                  <Button
                    type="button"
                    disabled={s.rerollsLeft <= 0}
                    onClick={() =>
                      dispatch({
                        type: "reroll",
                        values: s.dice.map((d) => rollDie(d.type)),
                      })
                    }
                    aria-label={`Reroll all dice. ${s.rerollsLeft} rerolls remaining this round.`}
                    className="flex-1 h-12 bg-[#3D4D38] hover:bg-[#4A5D44] active:bg-[#32402E] border-2 border-[#587050] text-[#D0E6B8] rounded-xs flex items-center justify-center gap-1.5 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={16} className="text-[#D0E6B8]/90" />
                    <span className="font-serif font-bold text-base tracking-widest text-[#D0E6B8]">
                      REROLL
                    </span>
                    <span className="text-xs font-mono text-[#D0E6B8]/90 font-bold">
                      ({s.rerollsLeft})
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Lower-Right: Signature Ability Card */}
          <section
            className="bg-[#0A0807] border-2 border-[#54422E] rounded-xs p-3 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center text-center"
            aria-label="Species ability"
          >
            <div className="flex flex-col items-center">
              {/* Sigil Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8E7040] bg-[#1A1510] text-[#E6C687] shadow-inner mb-2">
                <Sparkles size={18} />
              </div>

              {/* Title */}
              <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-[#E6C687]">
                {c.ability}
              </h4>

              {/* Description */}
              <p
                id="ability-description"
                className="mt-1 text-xs text-zinc-300 font-serif leading-relaxed line-clamp-3"
              >
                {c.abilityText}
              </p>
            </div>

            {/* Invoke Action / Cooldown Status */}
            <div className="w-full mt-3">
              {abilityReady ? (
                <Button
                  variant="bronze"
                  size="sm"
                  onClick={() =>
                    dispatch({ type: "useAbility", extraDie: rollDie(s.loadout[1] ?? "d6") })
                  }
                  aria-describedby="ability-description"
                  aria-label={`Invoke ${c.ability}: ${c.abilityText}. Status: ${abilityStatus}.`}
                  className="w-full h-8 font-serif font-bold tracking-wider uppercase text-xs"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Invoke
                </Button>
              ) : (
                <div className="w-full py-1.5 text-center text-[11px] font-mono text-zinc-400 bg-black/60 border border-[#3E3022] rounded-xs">
                  {over ? "Encounter ended" : abilityStatus}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Combat Chronicle (Accessible Battle Log Strip) */}
        <section
          className="combat-journal mt-3 bg-[#0A0807] border border-[#3E3022] rounded-xs p-2.5 text-xs font-mono text-zinc-400 shadow-inner"
          aria-label="Battle log"
        >
          <div className="flex items-center justify-between mb-1 text-[11px] uppercase tracking-wider text-bronze border-b border-[#3E3022]/60 pb-1">
            <span className="flex items-center gap-1.5 font-bold">
              <BookOpen size={13} /> Combat Journal
            </span>
            <span className="text-zinc-500">Latest Event First</span>
          </div>
          <ol className="space-y-1 max-h-16 overflow-y-auto pr-2">
            {s.log.map((line, i) => (
              <li
                key={s.log.length - i}
                className={cn(
                  "leading-relaxed transition-colors",
                  i === 0 ? "text-[#E6C687] font-semibold journal-latest" : "text-zinc-400",
                )}
              >
                {line}
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* Terminal Outcome Overlay Modal (Victory / Defeat) */}
      {over && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="max-w-md w-full bg-[#0D0B0A] border-2 border-[#8E7040] rounded-xs p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            <span className="text-3xl text-[#E6C687] font-serif block mb-2" aria-hidden="true">
              {s.phase === "won" ? "✧" : "†"}
            </span>
            <h2
              ref={outcomeRef}
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-serif font-black tracking-widest uppercase text-[#F0DFBE] outline-none"
            >
              {s.phase === "won" ? "Victory" : "Defeat"}
            </h2>
            <p className="mt-3 text-sm text-zinc-300 font-serif leading-relaxed">
              {s.phase === "won" ? `${enc.name} is unmade in ${s.round} rounds.` : enc.defeatText}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="bronze" onClick={onRestart} className="px-6">
                <RotateCcw className="mr-1.5 h-4 w-4" /> Fight Again
              </Button>
              <Button variant="iron" asChild className="px-6">
                <Link to="/select">Change Adversary / Species</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dice Loadout Pouch Modal */}
      <DiceLoadoutModal
        isOpen={isLoadoutOpen}
        onClose={() => setIsLoadoutOpen(false)}
        currentLoadout={s.loadout}
        onSaveLoadout={handleSaveLoadout}
        canChangeLoadout={s.phase === "roll"}
      />
    </div>
  );
}
