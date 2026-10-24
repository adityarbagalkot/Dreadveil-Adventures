import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Dice5,
  Dices,
  Flame,
  Heart,
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
import { PolyhedralDie } from "@/components/PolyhedralDie";
import { DiceLoadoutModal } from "@/components/DiceLoadoutModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Beyond the Veil — Dreadveil" },
      {
        name: "description",
        content: "Cast the bones in a tactical tabletop duel against horrors beyond the Veil.",
      },
      { property: "og:title", content: "Beyond the Veil — Dreadveil" },
      {
        property: "og:description",
        content: "Cast the bones in a tactical tabletop duel against horrors beyond the Veil.",
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
      <div className="empty-encounter">
        <p className="eyebrow">At the threshold</p>
        <h1>No species chosen</h1>
        <p>Who will step into the black water?</p>
        <Button variant="bronze" asChild>
          <Link to="/select">
            Choose Species <ArrowRight />
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

function Health({
  value,
  max,
  label,
  tone,
}: {
  value: number;
  max: number;
  label: string;
  tone: "blood" | "venom";
}) {
  return (
    <div className="health-group">
      <div className="health-label">
        <span>
          <Heart size={13} />
          {label}
        </span>
        <strong>
          {value} <span>/ {max} HP</span>
        </strong>
      </div>
      <div
        className="health-track"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn("health-fill", tone === "blood" ? "bg-blood" : "bg-venom")}
          style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

function IntentBadge({ intent, dim }: { intent: Intent; dim?: boolean }) {
  const Icon = intent.kind === "attack" ? Swords : Shield;
  return (
    <div className={cn("intent-badge", dim && "intent-dim")}>
      <Icon size={21} />
      <div className="min-w-0 flex-1">
        <span className="eyebrow">{dim ? "Foreseen next" : "Enemy intent"}</span>
        <p className="truncate">{intent.label}</p>
        {intent.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-1">{intent.description}</p>
        )}
      </div>
      <strong>
        {intent.amount}
        <small>{intent.kind === "attack" ? "Attack" : "Guard"}</small>
      </strong>
    </div>
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

  return (
    <div className="game-shell encounter-shell">
      <header className="game-nav">
        <Button variant="iron" asChild>
          <Link to="/select">
            <ArrowLeft /> Roster
          </Link>
        </Button>
        <Link to="/" className="wordmark">
          Dreadveil
        </Link>
        <Button variant="iron" asChild>
          <Link to="/">Title</Link>
        </Button>
      </header>

      <div className="encounter-heading">
        <div>
          <p className="eyebrow">
            Beyond the Veil · {enc.difficulty} · {enc.location}
          </p>
          <h1>{enc.title}</h1>
        </div>
        <div className="round-seal">
          <span className="eyebrow">Round</span>
          <strong>{String(s.round).padStart(2, "0")}</strong>
        </div>
      </div>

      <div className="encounter-layout">
        {/* Enemy Sheet */}
        <section className="enemy-sheet iron-frame" aria-label="Enemy">
          <div className="enemy-art">
            <EncounterArt encounter={enc} className="h-full w-full" />
          </div>
          <div className="enemy-details">
            <p className="eyebrow">{enc.subtitle}</p>
            <h2>{enc.name}</h2>
            <Health value={s.enemyHp} max={s.enemyMaxHp} label="Enemy vitality" tone="blood" />

            {!over && (
              <div className="mt-5">
                {snared ? (
                  <div className="intent-badge">
                    <Shield />
                    <p>Entangled — cannot act this round</p>
                  </div>
                ) : (
                  <IntentBadge intent={intent} />
                )}
                {foresee && <IntentBadge intent={nextIntent(s)} dim />}
              </div>
            )}

            {/* Boss status tracks */}
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              {s.poisonTurns > 0 && (
                <p className="text-venom">
                  Living Contagion · 3 damage × {s.poisonTurns} rounds left
                </p>
              )}

              {s.petrification > 0 && (
                <div className="flex items-center gap-2 rounded border border-emerald-900/40 bg-emerald-950/40 px-2 py-1 text-emerald-400">
                  <ShieldAlert size={14} />
                  <span>
                    Petrification: <strong>{s.petrification} / 3</strong> (shatters for 8 damage at
                    3)
                  </span>
                </div>
              )}

              {s.corrodedTurns > 0 && (
                <div className="flex items-center gap-2 rounded border border-amber-900/40 bg-amber-950/40 px-2 py-1 text-amber-400">
                  <ShieldAlert size={14} />
                  <span>Corroded Armor · -3 Guard this round</span>
                </div>
              )}

              {s.embers > 0 && (
                <div className="flex items-center gap-2 rounded border border-orange-900/40 bg-orange-950/40 px-2 py-1 text-orange-400">
                  <Flame size={14} className="animate-pulse" />
                  <span>
                    Smoldering Embers: <strong>{s.embers}</strong> (Guard dice quench 1 per die!)
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Player table */}
        <div className="player-table">
          <section className="player-sheet" aria-label="Your species">
            <div
              className="player-portrait"
              style={portraitStyle(c.index, dreadveilRoster || roster.url)}
              role="img"
              aria-label={c.name}
              suppressHydrationWarning
            />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{c.role}</p>
              <h2>{c.name}</h2>
              <Health value={s.playerHp} max={s.playerMaxHp} label="Your vitality" tone="venom" />
            </div>
          </section>

          {/* Polyhedral Dice Tray */}
          <section className="dice-table" aria-label="Dice tray">
            <div className="tray-heading">
              <div className="flex items-center gap-2">
                <h2>
                  <Dice5 size={19} /> The casting bones
                </h2>
                <Button
                  variant="iron"
                  size="sm"
                  onClick={() => setIsLoadoutOpen(true)}
                  aria-label="Open dice pouch and customize loadout"
                  className="h-7 px-2 text-xs font-mono"
                >
                  <Dices size={14} /> Pouch ({s.loadout.join("·")})
                </Button>
              </div>
              <span className="eyebrow">
                {over ? "Encounter ended" : s.phase === "roll" ? "I · Cast" : "II · Resolve"}
              </span>
            </div>

            {over ? (
              <div className="battle-outcome">
                <span className="outcome-symbol" aria-hidden="true">
                  {s.phase === "won" ? "✧" : "†"}
                </span>
                <h2 ref={outcomeRef} tabIndex={-1}>
                  {s.phase === "won" ? "Victory" : "Defeat"}
                </h2>
                <p>
                  {s.phase === "won"
                    ? `${enc.name} is unmade in ${s.round} rounds.`
                    : enc.defeatText}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="bronze" onClick={onRestart}>
                    <RotateCcw /> Fight Again
                  </Button>
                  <Button variant="iron" asChild>
                    <Link to="/select">Change Adversary / Species</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="dice-row">
                  {s.phase === "roll"
                    ? s.loadout.map((dieType, i) => {
                        const cfg = DIE_CONFIGS[dieType];
                        return (
                          <div
                            key={i}
                            className="uncast-die flex flex-col items-center justify-center font-serif text-sm p-1.5 text-center"
                            aria-hidden="true"
                          >
                            <span className="font-bold text-candle/80">{dieType}</span>
                            <span className="text-[10px] text-zinc-400 font-serif truncate max-w-[80px]">
                              {cfg?.name ?? "Casting Bone"}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">Uncast</span>
                          </div>
                        );
                      })
                    : s.dice.map((d, i) => (
                        <PolyhedralDie
                          key={i}
                          index={i}
                          type={d.type}
                          value={d.value}
                          role={d.role}
                          onClick={() => dispatch({ type: "toggleDie", index: i })}
                        />
                      ))}
                </div>

                {s.phase === "roll" ? (
                  <div className="roll-action">
                    <Button
                      variant="bronze"
                      onClick={() =>
                        dispatch({ type: "roll", values: rollActiveLoadout(s.loadout) })
                      }
                      aria-label={`Roll ${s.loadout.length} casting bones`}
                    >
                      <Dice5 /> Roll {s.loadout.length} Dice
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="resolution-totals" aria-live="polite" aria-atomic="true">
                      <span>
                        <Swords size={18} />
                        Strike <strong>{strike}</strong>
                        {s.dice.some(
                          (d) => d.role === "strike" && isNatural20(d.value, d.type),
                        ) && (
                          <small className="ml-1 text-[11px] text-amber-300 font-mono">
                            (Nat 20 +5!)
                          </small>
                        )}
                        {s.dice.some((d) => d.role === "strike" && isNatural1(d.value, d.type)) && (
                          <small className="ml-1 text-[11px] text-rose-400 font-mono">
                            (Nat 1 Fumble)
                          </small>
                        )}
                      </span>
                      <span>
                        <Shield size={18} />
                        Guard <strong>{guard}</strong>
                        {s.dice.some((d) => d.role === "guard" && d.type === "d4") && (
                          <small className="ml-1 text-[11px] text-amber-400 font-mono">
                            (+Steadfast)
                          </small>
                        )}
                        {s.dice.some((d) => d.role === "guard" && isNatural20(d.value, d.type)) && (
                          <small className="ml-1 text-[11px] text-amber-300 font-mono">
                            (Nat 20 +5!)
                          </small>
                        )}
                        {s.dice.some((d) => d.role === "guard" && isNatural1(d.value, d.type)) && (
                          <small className="ml-1 text-[11px] text-rose-400 font-mono">
                            (Nat 1 Fumble)
                          </small>
                        )}
                        {s.corrodedTurns > 0 && (
                          <small className="ml-1 text-xs text-amber-500 font-mono">
                            (-3 Corroded)
                          </small>
                        )}
                      </span>
                    </div>

                    <div className="turn-actions">
                      <Button
                        variant="iron"
                        disabled={s.rerollsLeft <= 0}
                        onClick={() =>
                          dispatch({
                            type: "reroll",
                            values: s.dice.map((d) => rollDie(d.type)),
                          })
                        }
                        aria-label={`Reroll all dice. ${s.rerollsLeft} rerolls remaining this round.`}
                      >
                        <RotateCcw /> Reroll All ({s.rerollsLeft})
                      </Button>
                      <Button
                        variant="bronze"
                        onClick={() => dispatch({ type: "endTurn" })}
                        aria-label={`End turn. Resolving ${strike} Strike against enemy and ${guard} Guard against enemy intent.`}
                      >
                        End Turn <ArrowRight />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          <section className="ability-strip" aria-label="Species ability">
            <div className="ability-title">
              <Sparkles size={18} />
              <div>
                <p className="eyebrow">Signature ability</p>
                <h3>{c.ability}</h3>
              </div>
            </div>
            <p id="ability-description">{c.abilityText}</p>
            <div className="ability-bottom">
              <span role="status">{over ? "Encounter ended" : abilityStatus}</span>
              <Button
                variant="iron"
                disabled={!abilityReady}
                onClick={() =>
                  dispatch({ type: "useAbility", extraDie: rollDie(s.loadout[1] ?? "d6") })
                }
                aria-describedby="ability-description"
                aria-label={`Invoke ${c.ability}: ${c.abilityText}. Status: ${abilityStatus}.`}
              >
                <Sparkles /> Invoke
              </Button>
            </div>
          </section>
        </div>

        {/* Combat Journal */}
        <section className="combat-journal" aria-label="Battle log">
          <div className="journal-heading">
            <h2>
              <BookOpen size={18} /> Combat journal
            </h2>
            <span className="eyebrow">Latest first</span>
          </div>
          <p className="sr-only" role="status">
            {s.log[0]}
          </p>
          <ol>
            {s.log.map((line, i) => (
              <li key={s.log.length - i} className={i === 0 ? "journal-latest" : ""}>
                {line}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="game-footer">
        <span>
          Dreadveil · {enc.name} · {enc.location}
        </span>
        <span>
          Round {s.round} · {over ? (s.phase === "won" ? "Victorious" : "Fallen") : "Your turn"}
        </span>
      </footer>

      {/* Dice Pouch Loadout Modal */}
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
