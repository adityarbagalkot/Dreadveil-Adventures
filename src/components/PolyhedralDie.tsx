import type { DieRole, DieType } from "@/game/dice";
import { DIE_CONFIGS, isNatural1, isNatural20 } from "@/game/dice";
import { Shield, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface PolyhedralDieProps {
  type: DieType;
  value: number;
  role?: DieRole;
  index?: number;
  onClick?: () => void;
  className?: string;
  isRolling?: boolean;
  interactive?: boolean;
}

/**
 * High-fidelity SVG wireframe silhouettes and facet geometry for standard tabletop RPG polyhedrals.
 * Supports all 7 standard physical D&D dice: d4, d6, d8, d10, d12, d20, and d% (percentile).
 */
export function PolyhedralGeometry({
  type,
  value,
  role = "strike",
}: {
  type: DieType;
  value: number;
  role?: DieRole;
}) {
  const isStrike = role === "strike";
  const strokeColor = isStrike ? "#b91c1c" : "#ca8a04"; // Blood red vs Antique Bronze/Gold
  const facetFill = isStrike ? "#2a1215" : "#221c13";
  const innerLineColor = isStrike ? "#7f1d1d" : "#854d0e";
  const isCrit = isNatural20(value, type);
  const isFumble = isNatural1(value, type);

  const displayValue = type === "d%" ? String(value).padStart(2, "0") : String(value);

  return (
    <div className="relative flex h-16 w-16 items-center justify-center select-none">
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "h-full w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform duration-200",
          isCrit && "drop-shadow-[0_0_12px_rgba(250,204,21,0.7)] animate-pulse",
          isFumble && "drop-shadow-[0_0_10px_rgba(185,28,28,0.7)]",
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {type === "d4" && (
          // Tetrahedron: Sharp equilateral triangle with inner facet ridges meeting at central apex
          <>
            <polygon
              points="50,12 90,82 10,82"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Facet ridges meeting at center */}
            <line x1="50" y1="12" x2="50" y2="56" stroke={innerLineColor} strokeWidth="2.5" />
            <line x1="10" y1="82" x2="50" y2="56" stroke={innerLineColor} strokeWidth="2.5" />
            <line x1="90" y1="82" x2="50" y2="56" stroke={innerLineColor} strokeWidth="2.5" />
          </>
        )}

        {type === "d6" && (
          // Hexahedron: Isometric beveled cube with perspective and defined facet edges
          <>
            <rect
              x="16"
              y="16"
              width="68"
              height="68"
              rx="8"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
            />
            {/* Inner beveled border */}
            <rect
              x="24"
              y="24"
              width="52"
              height="52"
              rx="4"
              stroke={innerLineColor}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </>
        )}

        {type === "d8" && (
          // Octahedron: Diamond silhouette with 4 triangular face bevels
          <>
            <polygon
              points="50,10 88,50 50,90 12,50"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Central equator and meridian lines */}
            <line x1="12" y1="50" x2="88" y2="50" stroke={innerLineColor} strokeWidth="2" />
            <line x1="50" y1="10" x2="50" y2="90" stroke={innerLineColor} strokeWidth="2" />
          </>
        )}

        {type === "d10" && (
          // Pentagonal Trapezohedron: Kite silhouette with angled facet ridges
          <>
            <polygon
              points="50,8 88,38 74,88 26,88 12,38"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Facet vertex spokes */}
            <line x1="50" y1="8" x2="50" y2="54" stroke={innerLineColor} strokeWidth="2" />
            <line x1="12" y1="38" x2="50" y2="54" stroke={innerLineColor} strokeWidth="2" />
            <line x1="88" y1="38" x2="50" y2="54" stroke={innerLineColor} strokeWidth="2" />
            <line x1="26" y1="88" x2="50" y2="54" stroke={innerLineColor} strokeWidth="2" />
            <line x1="74" y1="88" x2="50" y2="54" stroke={innerLineColor} strokeWidth="2" />
          </>
        )}

        {type === "d12" && (
          // Dodecahedron: Regular pentagon with 5 surrounding facet trapezoids
          <>
            <polygon
              points="50,10 90,38 76,86 24,86 10,38"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner pentagon face */}
            <polygon
              points="50,30 72,46 64,72 36,72 28,46"
              stroke={innerLineColor}
              strokeWidth="2"
            />
            <line x1="50" y1="10" x2="50" y2="30" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="90" y1="38" x2="72" y2="46" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="76" y1="86" x2="64" y2="72" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="24" y1="86" x2="36" y2="72" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="10" y1="38" x2="28" y2="46" stroke={innerLineColor} strokeWidth="1.5" />
          </>
        )}

        {type === "d20" && (
          // Icosahedron: Hexagonal outer ring with central triangular face and surrounding facet edges
          <>
            <polygon
              points="50,10 88,30 88,72 50,92 12,72 12,30"
              fill={facetFill}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Central triangle face */}
            <polygon
              points="50,32 74,68 26,68"
              fill={isStrike ? "#38161a" : "#2e2417"}
              stroke={innerLineColor}
              strokeWidth="2"
            />
            <line x1="50" y1="10" x2="50" y2="32" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="88" y1="30" x2="50" y2="32" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="88" y1="30" x2="74" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="88" y1="72" x2="74" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="50" y1="92" x2="74" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="50" y1="92" x2="26" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="12" y1="72" x2="26" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="12" y1="30" x2="26" y2="68" stroke={innerLineColor} strokeWidth="1.5" />
            <line x1="12" y1="30" x2="50" y2="32" stroke={innerLineColor} strokeWidth="1.5" />
          </>
        )}

        {type === "d%" && (
          // Percentile Trapezohedron: Distinct dual-contour trapezohedron with astrological dashed ring
          <>
            <polygon
              points="50,6 90,36 74,90 26,90 10,36"
              fill={isStrike ? "#2f1518" : "#261e11"}
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner mystical dashed contour */}
            <polygon
              points="50,16 82,40 70,82 30,82 18,40"
              stroke={innerLineColor}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Radial facet spokes meeting at center */}
            <line x1="50" y1="16" x2="50" y2="52" stroke={innerLineColor} strokeWidth="2" />
            <line x1="18" y1="40" x2="50" y2="52" stroke={innerLineColor} strokeWidth="2" />
            <line x1="82" y1="40" x2="50" y2="52" stroke={innerLineColor} strokeWidth="2" />
            <line x1="30" y1="82" x2="50" y2="52" stroke={innerLineColor} strokeWidth="2" />
            <line x1="70" y1="82" x2="50" y2="52" stroke={innerLineColor} strokeWidth="2" />
          </>
        )}
      </svg>

      {/* Engraved Numeral Face */}
      <span
        className={cn(
          "absolute font-serif font-black tracking-tight select-none",
          type === "d4"
            ? "top-[47%] text-lg"
            : type === "d%"
              ? "top-[50%] text-base"
              : "top-[50%] text-xl",
          "-translate-y-1/2",
          isCrit
            ? "text-amber-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] scale-110"
            : isFumble
              ? "text-rose-400 line-through opacity-85"
              : isStrike
                ? "text-rose-200"
                : "text-amber-100",
        )}
      >
        {displayValue}
      </span>

      {/* Die Type Badge on bottom corner */}
      <span className="absolute -bottom-1 -right-1 rounded bg-black/90 px-1 py-0.2 text-[9px] font-mono font-bold uppercase text-zinc-400 border border-zinc-700/80">
        {type}
      </span>
    </div>
  );
}

export function PolyhedralDie({
  type,
  value,
  role = "strike",
  index = 0,
  onClick,
  className = "",
  isRolling = false,
  interactive = true,
}: PolyhedralDieProps) {
  const config = DIE_CONFIGS[type] ?? DIE_CONFIGS.d6;
  const isStrike = role === "strike";
  const isCrit = isNatural20(value, type);
  const isFumble = isNatural1(value, type);
  const isD4Guard = type === "d4" && role === "guard";

  const ariaLabel = `Die ${index + 1}: ${config.label} (${config.name}), rolled ${
    type === "d%" ? String(value).padStart(2, "0") : value
  } (faces: ${config.facesDisplay}), assigned to ${role}.${
    isCrit ? " Natural 20 Critical Surge (+5)!" : ""
  }${isFumble ? " Natural 1 Critical Fumble (0 value)!" : ""}${
    isD4Guard ? " Steadfast Ward: +1 bonus Guard." : ""
  }${interactive && onClick ? ` Press to reassign to ${isStrike ? "Guard" : "Strike"}.` : ""}`;

  return (
    <button
      type="button"
      role="button"
      aria-pressed={role === "guard"}
      aria-label={ariaLabel}
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={cn(
        "group relative flex flex-col items-center justify-between rounded-lg border p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candle focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        interactive ? "cursor-pointer" : "cursor-default",
        isStrike
          ? "border-blood/60 bg-blood/10 hover:border-blood hover:bg-blood/20 shadow-[0_0_12px_rgba(185,28,28,0.15)]"
          : "border-candle/60 bg-candle/10 hover:border-candle hover:bg-candle/20 shadow-[0_0_12px_rgba(245,214,142,0.15)]",
        isRolling && "animate-bounce",
        isCrit && "border-amber-400 bg-amber-950/30 shadow-[0_0_16px_rgba(250,204,21,0.35)]",
        isFumble && "border-rose-800 bg-rose-950/40 shadow-[0_0_12px_rgba(185,28,28,0.35)]",
        className,
      )}
    >
      {/* Visual Die Face Geometry */}
      <div className="relative p-1">
        <PolyhedralGeometry type={type} value={value} role={role} />
      </div>

      {/* Die Role Assignment Banner */}
      <div
        className={cn(
          "mt-1 flex items-center justify-center gap-1 rounded px-2 py-0.5 text-xs font-serif font-bold uppercase tracking-wider w-full text-center transition-colors",
          isStrike
            ? "bg-blood/80 text-blood-foreground group-hover:bg-blood"
            : "bg-candle/80 text-zinc-950 group-hover:bg-candle",
        )}
      >
        {isStrike ? <Swords size={12} /> : <Shield size={12} />}
        <span>{role}</span>
        {isD4Guard && <span className="text-[10px] text-amber-950 font-mono">+1</span>}
      </div>

      {/* Special trait tag if applicable */}
      {isCrit && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-amber-500 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-black tracking-widest shadow-md">
          NAT 20 (+5)
        </span>
      )}
      {isFumble && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-rose-700 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-white tracking-widest shadow-md">
          FUMBLE (0)
        </span>
      )}
    </button>
  );
}
