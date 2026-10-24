import { useState } from "react";
import {
  ALL_DIE_TYPES,
  COMBAT_DIE_TYPES,
  DICE_PRESETS,
  DIE_CONFIGS,
  rollPercentile,
  type DieType,
  type PercentileRollResult,
} from "@/game/dice";
import { Button } from "@/components/ui/button";
import {
  Check,
  Compass,
  Dices,
  Eye,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PolyhedralGeometry } from "./PolyhedralDie";

interface DiceLoadoutModalProps {
  currentLoadout: DieType[];
  onSaveLoadout: (loadout: DieType[]) => void;
  isOpen: boolean;
  onClose: () => void;
  canChangeLoadout: boolean; // only in roll phase
}

export function DiceLoadoutModal({
  currentLoadout,
  onSaveLoadout,
  isOpen,
  onClose,
  canChangeLoadout,
}: DiceLoadoutModalProps) {
  const [selectedDice, setSelectedDice] = useState<DieType[]>([...currentLoadout]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [inspectedDie, setInspectedDie] = useState<DieType>("d4");
  const [percentileResult, setPercentileResult] = useState<PercentileRollResult | null>(null);
  const [activeTab, setActiveTab] = useState<"loadout" | "oracle">("loadout");

  if (!isOpen) return null;

  const handleSelectDieForSlot = (dieType: DieType) => {
    if (!canChangeLoadout) return;
    if (DIE_CONFIGS[dieType]?.category !== "combat") return;
    const next = [...selectedDice];
    next[activeSlot] = dieType;
    setSelectedDice(next);
  };

  const handleApplyPreset = (dice: DieType[]) => {
    if (!canChangeLoadout) return;
    setSelectedDice([...dice]);
  };

  const handleSave = () => {
    onSaveLoadout(selectedDice);
    onClose();
  };

  const handleCastOracle = () => {
    const result = rollPercentile();
    setPercentileResult(result);
  };

  // Stats calculation
  const minSum = selectedDice.reduce((acc, d) => {
    // d20 fumble can yield 0 value on that die
    if (d === "d20") return acc + 0;
    return acc + 1;
  }, 0);
  const minFaceSum = selectedDice.reduce((acc) => acc + 1, 0);

  const maxFaceSum = selectedDice.reduce((acc, d) => acc + (DIE_CONFIGS[d]?.sides ?? 6), 0);
  const maxCritSum = selectedDice.reduce((acc, d) => {
    const sides = DIE_CONFIGS[d]?.sides ?? 6;
    return acc + (d === "d20" ? sides + 5 : sides);
  }, 0);

  const faceAvgSum = selectedDice.reduce(
    (acc, d) => acc + (1 + (DIE_CONFIGS[d]?.sides ?? 6)) / 2,
    0,
  );
  const critAvgSum = selectedDice.reduce((acc, d) => {
    if (d === "d20") {
      // (0 + 189 + 25) / 20 = 10.7
      return acc + 10.7;
    }
    return acc + (1 + (DIE_CONFIGS[d]?.sides ?? 6)) / 2;
  }, 0);

  const hasD20 = selectedDice.includes("d20");
  const d4Count = selectedDice.filter((d) => d === "d4").length;

  const inspectedConfig = DIE_CONFIGS[inspectedDie];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dice-loadout-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="iron-frame relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-bronze/60 bg-zinc-950 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-candle/40 bg-candle/10 p-2 text-candle">
              <Dices size={24} />
            </div>
            <div>
              <h2
                id="dice-loadout-title"
                className="font-serif text-xl sm:text-2xl font-bold text-candle tracking-wide"
              >
                The Arsenal of Fates
              </h2>
              <p className="text-xs text-zinc-400">
                Tabletop polyhedral collection · Configure active casting bones or consult the
                Oracle.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dice loadout drawer"
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("loadout")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider transition-colors cursor-pointer",
              activeTab === "loadout"
                ? "bg-bronze/30 text-candle border border-bronze/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900",
            )}
          >
            <Dices size={14} /> Active Combat Tray
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("oracle")}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider transition-colors cursor-pointer",
              activeTab === "oracle"
                ? "bg-amber-950/50 text-amber-300 border border-amber-700/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900",
            )}
          >
            <Compass size={14} /> The Oracle's Wheel (Percentile Divination)
          </button>
        </div>

        {!canChangeLoadout && (
          <div className="mt-3 flex items-center gap-2 rounded border border-amber-900/60 bg-amber-950/40 p-2 text-xs text-amber-300">
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              Dice are currently cast for this round. You may inspect the collection and consult the
              Oracle, but active combat loadouts can only be altered during the Roll phase.
            </span>
          </div>
        )}

        {activeTab === "loadout" ? (
          <>
            {/* Active Tray Slots */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-xs text-bronze">
                  Active Casting Tray (3 Combat Slots)
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Click a slot to replace with collection die
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {selectedDice.map((dieType, slotIdx) => {
                  const cfg = DIE_CONFIGS[dieType] ?? DIE_CONFIGS.d6;
                  const isActiveSlot = activeSlot === slotIdx;

                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => {
                        setActiveSlot(slotIdx);
                        setInspectedDie(dieType);
                      }}
                      className={cn(
                        "group flex flex-col items-center justify-between rounded-lg border p-3 text-center transition-all cursor-pointer relative",
                        isActiveSlot
                          ? "border-candle bg-candle/15 shadow-[0_0_14px_rgba(245,214,142,0.25)] ring-1 ring-candle"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900",
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono uppercase text-zinc-400">
                          Slot {slotIdx + 1}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{cfg.shape}</span>
                      </div>
                      <div className="my-1.5 flex flex-col items-center">
                        <strong className="font-serif text-2xl font-black text-candle">
                          {cfg.label}
                        </strong>
                        <span className="text-[11px] font-serif text-zinc-200 font-medium">
                          {cfg.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-bronze uppercase tracking-wider font-mono">
                        <span>{cfg.facesDisplay}</span>
                        {dieType === "d4" && <span className="text-amber-400">(+1 Ward)</span>}
                        {dieType === "d20" && <span className="text-amber-400">(Crit/Fumble)</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tray Stats Summary */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800/80 bg-black/40 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">
                    Theoretical Average:{" "}
                    <strong className="text-candle">{faceAvgSum.toFixed(1)}</strong>
                    {hasD20 && (
                      <span className="text-[11px] text-amber-400/90 ml-1">
                        ({critAvgSum.toFixed(1)} with Crits)
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">
                    Range:{" "}
                    <strong className="text-zinc-200">
                      {minFaceSum} – {maxFaceSum}
                    </strong>
                    {hasD20 && (
                      <span className="text-[11px] text-amber-400/90 ml-1">
                        (eff. {minSum} – {maxCritSum})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {d4Count > 0 && (
                    <span className="rounded bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-800/60">
                      +{d4Count} Guard via Steadfast Ward
                    </span>
                  )}
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {selectedDice.join(" + ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Grid for Active Slot */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-xs text-bronze">
                  Tabletop Combat Dice (Select for Slot {activeSlot + 1})
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Standard Physical Polyhedrals
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMBAT_DIE_TYPES.map((type) => {
                  const cfg = DIE_CONFIGS[type];
                  const isEquippedInActive = selectedDice[activeSlot] === type;
                  const isEquippedAnywhere = selectedDice.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        handleSelectDieForSlot(type);
                        setInspectedDie(type);
                      }}
                      onMouseEnter={() => setInspectedDie(type)}
                      disabled={!canChangeLoadout}
                      className={cn(
                        "group flex flex-col text-left rounded-md border p-2.5 transition-all cursor-pointer relative",
                        isEquippedInActive
                          ? "border-candle bg-zinc-900 shadow-[0_0_12px_rgba(245,214,142,0.2)] ring-1 ring-candle/60"
                          : isEquippedAnywhere
                            ? "border-bronze/40 bg-zinc-950/90 hover:border-bronze hover:bg-zinc-900/60"
                            : "border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-900/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg font-bold text-candle">
                          {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {cfg.facesDisplay}
                        </span>
                      </div>
                      <p className="text-xs font-serif font-bold text-zinc-200 mt-0.5">
                        {cfg.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">{cfg.shape}</p>
                      <p className="mt-1.5 text-[10px] text-amber-200/90 leading-tight">
                        {cfg.specialTrait}
                      </p>
                      {isEquippedInActive && (
                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-candle" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lore & Trait Inspection Panel */}
            <div className="mt-4 rounded-lg border border-bronze/40 bg-zinc-900/70 p-3.5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-bronze/40 bg-zinc-950 flex items-center justify-center text-candle">
                  <PolyhedralGeometry type={inspectedDie} value={inspectedConfig.sides} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-candle">
                      {inspectedConfig.label} — {inspectedConfig.name} ({inspectedConfig.shape})
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Faces: {inspectedConfig.facesDisplay}
                    </span>
                  </div>
                  <p className="text-xs italic text-amber-100/90 mt-1 leading-relaxed">
                    "{inspectedConfig.lore}"
                  </p>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    <strong className="text-zinc-100">Tactical Role:</strong>{" "}
                    {inspectedConfig.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="mt-5 border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-xs text-bronze">Curated Battle Presets</span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Theoretical vs Critical Statistics
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DICE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.dice)}
                    disabled={!canChangeLoadout}
                    className="flex flex-col text-left rounded border border-zinc-800/70 bg-zinc-900/40 p-2.5 transition-colors hover:border-bronze hover:bg-zinc-900 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-candle">{preset.name}</span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {preset.dice.join("·")}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-serif italic mt-0.5">
                      {preset.subtitle}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-300 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-amber-400 border-t border-zinc-800/60 pt-1">
                      <span>Avg: {preset.faceAvg.toFixed(1)}</span>
                      <span>
                        Range: {preset.minSum}–{preset.maxSum}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* The Oracle's Wheel (Percentile Divination Tab) */
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-amber-500/40 bg-amber-500/10 p-2 text-amber-300">
                  <Compass size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-200">
                    d% — The Oracle's Wheel (Percentile Divination 1–100)
                  </h3>
                  <p className="text-xs italic text-amber-100/90 mt-1">
                    "{DIE_CONFIGS["d%"].lore}"
                  </p>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    In standard tabletop RPGs, percentile rolls (1–100) are cast by pairing a
                    10-sided percentile die (tens: 00–90) with a single-digit d10 (ones: 0–9). By
                    universal tabletop convention, a roll of <strong>00 and 0</strong> represents{" "}
                    <strong>100</strong>, producing an exact 1–100 range with a perfectly uniform 1%
                    distribution.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Oracle Divination Casting Box */}
            <div className="rounded-lg border border-zinc-800 bg-black/60 p-5 text-center">
              <span className="eyebrow text-xs text-amber-400">Cast the Oracle's Wheel</span>

              <div className="mt-4 flex items-center justify-center gap-6">
                {/* Tens Die (d%) */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Tens Die (d%)
                  </span>
                  <div className="h-20 w-20 flex items-center justify-center rounded-lg border border-amber-700/60 bg-amber-950/40 shadow-inner">
                    <span className="font-serif text-3xl font-black text-amber-200">
                      {percentileResult ? percentileResult.tensDisplay : "00"}
                    </span>
                  </div>
                </div>

                <span className="font-serif text-2xl text-zinc-500">+</span>

                {/* Ones Die (d10) */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Ones Die (d10)
                  </span>
                  <div className="h-20 w-20 flex items-center justify-center rounded-lg border border-amber-700/60 bg-amber-950/40 shadow-inner">
                    <span className="font-serif text-3xl font-black text-amber-200">
                      {percentileResult ? percentileResult.onesDisplay : "0"}
                    </span>
                  </div>
                </div>

                <span className="font-serif text-2xl text-zinc-500">=</span>

                {/* Final 1-100 Percentile Total */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase text-candle mb-1">
                    Divined Total
                  </span>
                  <div className="h-20 w-24 flex items-center justify-center rounded-lg border-2 border-candle bg-candle/15 shadow-[0_0_16px_rgba(245,214,142,0.3)]">
                    <span className="font-serif text-4xl font-black text-candle">
                      {percentileResult ? percentileResult.total : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {percentileResult && (
                <div className="mt-4 rounded border border-amber-800/40 bg-zinc-950/80 p-3 text-left">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                    <Eye size={14} />
                    <span>Oracle's Omen (Percentile {percentileResult.total}/100):</span>
                  </div>
                  <p className="mt-1 font-serif text-sm italic text-amber-100">
                    {percentileResult.omen}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <Button variant="bronze" onClick={handleCastOracle} className="px-6 py-2">
                  <Sparkles size={16} /> Cast the Oracle's Wheel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            Dreadveil Adventures · Tabletop Dice Arsenal
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="iron" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="bronze" onClick={handleSave} disabled={!canChangeLoadout}>
              <Check size={16} /> Save Active Loadout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
