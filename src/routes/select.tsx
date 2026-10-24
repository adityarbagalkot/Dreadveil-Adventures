import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Shield, Skull, Sparkles, Swords } from "lucide-react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Button } from "@/components/ui/button";
import dreadveilRoster from "@/assets/dreadveil-roster.png";
import roster from "@/assets/dreadveil-roster.png.asset.json";
import { CHARACTERS, getCharacter, portraitStyle, type CharacterId } from "@/game/characters";
import { ENCOUNTERS, ENCOUNTER_LIST, getEncounter, type EncounterId } from "@/game/encounters";
import {
  loadSelected,
  loadSelectedEncounter,
  loadSelectedLoadout,
  saveSelected,
  saveSelectedEncounter,
} from "@/game/storage";
import { DIE_CONFIGS, type DieType } from "@/game/dice";
import { EncounterArt } from "@/components/EncounterArt";
import { EncounterSelector } from "@/components/EncounterSelector";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/select")({
  head: () => ({
    meta: [
      { title: "Choose Your Species & Adversary — Dreadveil" },
      {
        name: "description",
        content:
          "An illustrated bestiary of ten monstrous hybrids and three horrors beyond the Veil. Choose your species and adversary.",
      },
      { property: "og:title", content: "Choose Your Species & Adversary — Dreadveil" },
      {
        property: "og:description",
        content:
          "An illustrated bestiary of ten monstrous hybrids and three horrors beyond the Veil. Choose your species and adversary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelectScreen,
});

type Tab = "species" | "encounters";

function SelectScreen() {
  const rosterUrl = dreadveilRoster || roster.url;
  const [activeTab, setActiveTab] = useState<Tab>("species");
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(null);
  const [selectedEncounterId, setSelectedEncounterId] = useState<EncounterId>("mire-hound");
  const [loadout, setLoadout] = useState<DieType[]>(["d4", "d6", "d8"]);

  useEffect(() => {
    setSelectedCharId(loadSelected());
    setSelectedEncounterId(loadSelectedEncounter());
    setLoadout(loadSelectedLoadout());
  }, []);

  const char = getCharacter(selectedCharId);
  const encounter = getEncounter(selectedEncounterId);

  const chooseSpecies = (value: string) => {
    const next = getCharacter(value);
    if (!next) return;
    setSelectedCharId(next.id);
    saveSelected(next.id);
  };

  const chooseEncounter = (id: EncounterId) => {
    setSelectedEncounterId(id);
    saveSelectedEncounter(id);
  };

  return (
    <div className="game-shell bestiary-shell">
      <header className="game-nav">
        <Button variant="iron" asChild>
          <Link to="/">
            <ArrowLeft /> Title
          </Link>
        </Button>
        <Link to="/" className="wordmark">
          Dreadveil
        </Link>
        <span className="folio-label">
          Bestiary · {activeTab === "species" ? "Folio I" : "Folio II"}
        </span>
      </header>

      {/* Folio navigation tabs */}
      <nav aria-label="Bestiary folios" className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("species")}
          className={cn(
            "rounded-t border-b-2 px-4 py-2 text-sm font-serif uppercase tracking-wider transition-all",
            activeTab === "species"
              ? "border-candle text-candle font-bold bg-zinc-900/60 shadow-sm"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700",
          )}
        >
          Folio I · The Ten Species
        </button>
        <span className="text-zinc-600 font-serif" aria-hidden="true">
          ✧
        </span>
        <button
          type="button"
          onClick={() => setActiveTab("encounters")}
          className={cn(
            "rounded-t border-b-2 px-4 py-2 text-sm font-serif uppercase tracking-wider transition-all",
            activeTab === "encounters"
              ? "border-candle text-candle font-bold bg-zinc-900/60 shadow-sm"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700",
          )}
        >
          Folio II · The Three Horrors
        </button>
      </nav>

      <section className="page-heading">
        <p className="eyebrow">
          {activeTab === "species" ? "The ten species" : "Threats beyond the veil"}
        </p>
        <h1>{activeTab === "species" ? "Choose your species" : "Choose your adversary"}</h1>
        <div className="heading-rule" aria-hidden="true">
          <span>✧</span>
        </div>
      </section>

      <div className="bestiary-layout">
        {activeTab === "species" ? (
          <section aria-label="Species bestiary">
            <RadioGroup.Root
              value={selectedCharId ?? ""}
              onValueChange={chooseSpecies}
              aria-label="Species"
              className="species-grid"
            >
              {CHARACTERS.map((c) => (
                <RadioGroup.Item
                  key={c.id}
                  value={c.id}
                  className="species-card"
                  aria-label={`${c.name}, ${c.role}, ${c.ability}`}
                  aria-describedby={`species-ability-${c.id}`}
                >
                  <div
                    className="species-art"
                    style={portraitStyle(c.index, rosterUrl)}
                    aria-hidden="true"
                    suppressHydrationWarning
                  />
                  <div className="species-card-copy">
                    <span className="species-number">{String(c.index + 1).padStart(2, "0")}</span>
                    <RadioGroup.Indicator className="species-check">
                      <Check size={15} />
                    </RadioGroup.Indicator>
                    <h2>{c.name}</h2>
                    <p className="species-role">{c.role}</p>
                    <p className="species-signature" id={`species-ability-${c.id}`}>
                      <Sparkles size={12} />
                      {c.ability}
                    </p>
                  </div>
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
          </section>
        ) : (
          <section aria-label="Encounter bestiary" className="min-w-0 flex-1">
            <EncounterSelector selectedId={selectedEncounterId} onSelect={chooseEncounter} />
          </section>
        )}

        {/* Specimen and Encounter Inspection Panel */}
        <aside className="bestiary-entry" aria-label="Selected expedition">
          <div className="entry-paper parchment" aria-live="polite" aria-atomic="true">
            {char ? (
              <>
                <p className="eyebrow">Specimen {String(char.index + 1).padStart(2, "0")} / X</p>
                <div
                  key={char.id}
                  className="entry-portrait"
                  style={portraitStyle(char.index, rosterUrl)}
                  role="img"
                  aria-label={char.name}
                  suppressHydrationWarning
                />
                <h2>{char.name}</h2>
                <p className="entry-hybrid">{char.hybrid}</p>
                <p className="entry-role">{char.role}</p>
                <dl className="entry-stats">
                  <div>
                    <dt>
                      <Heart size={14} /> Vitality
                    </dt>
                    <dd>{char.maxHp} HP</dd>
                  </div>
                  <div>
                    <dt>
                      <Swords size={14} /> Weapon
                    </dt>
                    <dd>{char.weapon}</dd>
                  </div>
                </dl>
                <div className="entry-ability">
                  <span className="eyebrow">
                    Signature ability · {char.cooldown}-round cooldown
                  </span>
                  <h3>{char.ability}</h3>
                  <p>{char.abilityText}</p>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">The field notes</p>
                <div className="entry-empty" aria-hidden="true">
                  ✧
                </div>
                <h2>A soul yet unchosen</h2>
                <p className="entry-hybrid">Ten strange bloodlines at the threshold of the Veil.</p>
              </>
            )}

            {/* Target Adversary Section in the specimen sheet */}
            <div className="mt-4 border-t border-amber-900/40 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="eyebrow text-xs text-amber-900">Target Adversary</span>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "species" ? "encounters" : "species")}
                  className="text-[11px] font-mono text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  {activeTab === "species" ? "Change Horrors →" : "View Species →"}
                </button>
              </div>

              <div className="flex items-center gap-3 rounded border border-amber-900/30 bg-amber-950/10 p-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-amber-900/40 bg-zinc-950">
                  <EncounterArt encounter={encounter} size="sm" className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="font-serif text-sm font-bold text-amber-950 truncate">
                    {encounter.name}
                  </h4>
                  <p className="text-[11px] text-amber-900/80 truncate">
                    {encounter.difficulty} · {encounter.maxHp} HP
                  </p>
                </div>
              </div>

              <div className="mt-2 border-t border-amber-900/20 pt-2 text-[11px] text-amber-900">
                <div className="flex items-center justify-between font-mono">
                  <span>Casting Tray:</span>
                  <span className="font-bold text-amber-950">{loadout.join(" · ")}</span>
                </div>
                <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-amber-950/80 font-serif">
                  {loadout.map((d, i) => {
                    const cfg = DIE_CONFIGS[d];
                    return (
                      <span key={i} className="truncate">
                        • {cfg ? `${cfg.label}: ${cfg.name}` : d}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="entry-departure">
            <span className="text-sm text-muted-foreground">
              {char ? `${char.name} vs ${encounter.name}` : "No species selected"}
            </span>
            {char ? (
              <Button variant="bronze" className="w-full" asChild>
                <Link to="/play">
                  Enter the Veil <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button variant="bronze" className="w-full" disabled>
                Enter the Veil <ArrowRight />
              </Button>
            )}
          </div>
        </aside>
      </div>

      <footer className="game-footer">
        <span>Dreadveil · An illustrated bestiary of ruin</span>
        <span>Ten bloodlines. Three horrors. One fate.</span>
      </footer>
    </div>
  );
}
