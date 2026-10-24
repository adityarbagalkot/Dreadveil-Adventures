import { Check, Flame, Heart, ShieldAlert, Skull, Swords } from "lucide-react";
import { ENCOUNTER_LIST, type EncounterId } from "@/game/encounters";
import { EncounterArt } from "./EncounterArt";
import { cn } from "@/lib/utils";

interface EncounterSelectorProps {
  selectedId: EncounterId;
  onSelect: (id: EncounterId) => void;
  className?: string;
  compact?: boolean;
}

export function EncounterSelector({
  selectedId,
  onSelect,
  className = "",
  compact = false,
}: EncounterSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Encounter adversaries"
      className={cn(
        "grid gap-4",
        compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3",
        className,
      )}
    >
      {ENCOUNTER_LIST.map((enc) => {
        const isSelected = enc.id === selectedId;
        const difficultyColor =
          enc.difficulty === "Apprentice"
            ? "text-emerald-400 border-emerald-900/60 bg-emerald-950/40"
            : enc.difficulty === "Veteran"
              ? "text-amber-400 border-amber-900/60 bg-amber-950/40"
              : "text-rose-400 border-rose-900/60 bg-rose-950/40";

        return (
          <button
            key={enc.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(enc.id)}
            className={cn(
              "group relative flex flex-col justify-between text-left rounded-md border p-4 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candle focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "border-candle/80 bg-zinc-900/90 shadow-[0_0_18px_rgba(245,214,142,0.15)] ring-1 ring-candle/50"
                : "border-bronze/30 bg-zinc-950/60 hover:border-bronze/70 hover:bg-zinc-900/40",
            )}
          >
            {/* Top header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
                    difficultyColor,
                  )}
                >
                  <Skull size={12} />
                  {enc.difficulty} (Rank {enc.difficultyRating})
                </span>

                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? "border-candle bg-candle text-zinc-950"
                      : "border-zinc-700 bg-zinc-900 text-transparent group-hover:border-zinc-500",
                  )}
                  aria-hidden="true"
                >
                  <Check size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
                </div>
              </div>

              {/* Artwork preview */}
              <div className="mb-3 h-32 w-full overflow-hidden rounded border border-bronze/40 bg-zinc-950">
                <EncounterArt encounter={enc} size="sm" className="h-full w-full" />
              </div>

              <p className="eyebrow text-xs text-bronze">{enc.title}</p>
              <h3 className="font-serif text-lg font-bold text-candle group-hover:text-amber-200">
                {enc.name}
              </h3>
              <p className="text-xs italic text-zinc-400 mb-2">{enc.location}</p>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs mb-3 text-zinc-300">
                <span className="flex items-center gap-1 text-blood font-medium">
                  <Heart size={13} />
                  {enc.maxHp} HP
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {enc.pattern.length} intents
                </span>
              </div>

              {/* Mechanics summary */}
              <div className="rounded bg-black/40 border border-zinc-800 p-2 text-xs mb-3">
                <p className="text-zinc-300">
                  <strong className="text-candle">Threat: </strong>
                  {enc.mechanicsSummary}
                </p>
              </div>

              {/* Counter-tactics snippet */}
              {!compact && (
                <div className="space-y-1 text-[11px] text-zinc-400">
                  <p className="font-semibold text-zinc-300 flex items-center gap-1">
                    <ShieldAlert size={12} className="text-amber-500" />
                    Counter-tactics:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400 pl-1">
                    {enc.counterTactics.slice(0, 2).map((tactic, idx) => (
                      <li key={idx} className="line-clamp-2">
                        {tactic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Selection footer label */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                {isSelected ? (
                  <span className="text-candle font-medium">Target Adversary Selected</span>
                ) : (
                  <span className="text-zinc-500 group-hover:text-zinc-300">Click to Select</span>
                )}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {enc.id === "mire-hound"
                  ? "Folio #01"
                  : enc.id === "iron-bile-gorgon"
                    ? "Folio #02"
                    : "Folio #03"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
