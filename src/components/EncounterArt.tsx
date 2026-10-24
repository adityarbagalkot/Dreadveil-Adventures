import type { Encounter } from "@/game/encounters";
import mireHound from "@/assets/mire-hound.jpg";

interface EncounterArtProps {
  encounter: Encounter;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EncounterArt({ encounter, className = "", size = "lg" }: EncounterArtProps) {
  if (encounter.artType === "image" && encounter.id === "mire-hound") {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={mireHound}
          alt={encounter.name}
          width={1280}
          height={768}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  // Intentional, high-fidelity dark-fantasy bestiary sigil fallback for uncataloged horrors
  const isGorgon = encounter.id === "iron-bile-gorgon";

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden border border-bronze/40 bg-zinc-950/90 p-4 text-center select-none ${className}`}
      role="img"
      aria-label={`${encounter.name} — Archival Field Sketch`}
    >
      {/* Background dark-fantasy runes / texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(180, 130, 60, 0.25) 0%, transparent 70%)",
        }}
      />

      {/* Decorative corner brackets */}
      <div className="pointer-events-none absolute top-2 left-2 text-xs text-bronze/40 font-mono">
        ┌
      </div>
      <div className="pointer-events-none absolute top-2 right-2 text-xs text-bronze/40 font-mono">
        ┐
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 text-xs text-bronze/40 font-mono">
        └
      </div>
      <div className="pointer-events-none absolute bottom-2 right-2 text-xs text-bronze/40 font-mono">
        ┘
      </div>

      {isGorgon ? (
        // Gorgon Serpent / Petrifying Eye Crest
        <div className="relative flex flex-col items-center">
          <svg
            viewBox="0 0 120 120"
            className={`${size === "sm" ? "h-16 w-16" : "h-28 w-28"} drop-shadow-[0_0_12px_rgba(74,222,128,0.25)]`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer calcified ring */}
            <circle cx="60" cy="60" r="52" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="46" stroke="#92400e" strokeWidth="1.5" />
            {/* Serpentine coiled ribcage */}
            <path
              d="M30 60 C30 40, 50 32, 60 32 C75 32, 88 42, 85 58 C82 72, 68 76, 55 76 C42 76, 38 88, 48 94 C58 100, 78 96, 88 84"
              stroke="#ca8a04"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rib bars */}
            <path
              d="M44 44 L48 52 M56 38 L58 48 M70 40 L66 50 M78 50 L70 56 M58 72 L62 82 M48 80 L52 90"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Caustic Eye at center */}
            <circle cx="60" cy="56" r="8" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
            <ellipse cx="60" cy="56" rx="2" ry="6" fill="#4ade80" />
            {/* Dripping bile drops */}
            <circle cx="60" cy="72" r="2.5" fill="#22c55e" />
            <circle cx="62" cy="80" r="1.5" fill="#22c55e" />
          </svg>
          <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-emerald-500 font-mono">
            Caustic · Petrifying
          </span>
        </div>
      ) : (
        // Cinder-Weaver Ash-Furnace Spider Crest
        <div className="relative flex flex-col items-center">
          <svg
            viewBox="0 0 120 120"
            className={`${size === "sm" ? "h-16 w-16" : "h-28 w-28"} drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chitinous furnace web ring */}
            <circle cx="60" cy="60" r="52" stroke="#52525b" strokeWidth="2" strokeDasharray="6 3" />
            <polygon
              points="60,18 96,38 96,82 60,102 24,82 24,38"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            {/* Radiating ash-silk spokes */}
            <line x1="60" y1="20" x2="60" y2="100" stroke="#71717a" strokeWidth="1" />
            <line x1="25" y1="40" x2="95" y2="80" stroke="#71717a" strokeWidth="1" />
            <line x1="25" y1="80" x2="95" y2="40" stroke="#71717a" strokeWidth="1" />
            {/* Eight arched iron legs */}
            <path
              d="M48 52 C32 40, 24 35, 16 48 M48 58 C28 58, 20 62, 14 74 M48 64 C30 72, 26 84, 20 96 M48 68 C38 82, 34 94, 30 106"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M72 52 C88 40, 96 35, 104 48 M72 58 C92 58, 100 62, 106 74 M72 64 C90 72, 94 84, 100 96 M72 68 C82 82, 86 94, 90 106"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Molten belly core */}
            <ellipse
              cx="60"
              cy="62"
              rx="13"
              ry="16"
              fill="#431407"
              stroke="#f97316"
              strokeWidth="2"
            />
            <circle cx="60" cy="54" r="6" fill="#18181b" stroke="#ea580c" strokeWidth="1.5" />
            <circle cx="58" cy="53" r="1.5" fill="#facc15" />
            <circle cx="62" cy="53" r="1.5" fill="#facc15" />
            <circle cx="60" cy="64" r="3.5" fill="#f97316" className="animate-pulse" />
          </svg>
          <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-orange-400 font-mono">
            Ash-Silk · Furnace
          </span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 rounded border border-bronze/30 bg-black/60 px-2 py-0.5 text-[11px] text-zinc-400">
        <span className="text-amber-500 font-serif">✧</span>
        <span>Archival Field Sketch · Bestiary Folio</span>
      </div>
    </div>
  );
}
