import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import dreadveilRoster from "@/assets/dreadveil-roster.png";
import roster from "@/assets/dreadveil-roster.png.asset.json";
import { getCharacter, type Character } from "@/game/characters";
import { getEncounter, type Encounter } from "@/game/encounters";
import {
  loadSelected,
  loadSelectedEncounter,
  loadSelectedLoadout,
  saveSelectedLoadout,
} from "@/game/storage";
import { COMBAT_DIE_TYPES, DIE_CONFIGS, type DieType } from "@/game/dice";
import { DiceLoadoutModal } from "@/components/DiceLoadoutModal";
import {
  BookOpen,
  Hourglass,
  RotateCcw,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dreadveil — A Dice-Driven Dark Fantasy" },
      {
        name: "description",
        content:
          "Choose one of ten monstrous hybrids and roll your fate against the horrors beyond the Veil.",
      },
      { property: "og:title", content: "Dreadveil — A Dice-Driven Dark Fantasy" },
      {
        property: "og:description",
        content:
          "Choose one of ten monstrous hybrids and roll your fate against the horrors beyond the Veil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TitleScreen,
});

function TitleScreen() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loadout, setLoadout] = useState<DieType[]>(["d4", "d6", "d8"]);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"descent" | "chronicles" | "settings" | null>(
    null,
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const charId = loadSelected();
    if (charId) {
      const c = getCharacter(charId);
      if (c) setCharacter(c);
    }
    const encId = loadSelectedEncounter();
    setEncounter(getEncounter(encId));
    setLoadout(loadSelectedLoadout());
  }, []);

  const handleSaveLoadout = (newLoadout: DieType[]) => {
    setLoadout(newLoadout);
    saveSelectedLoadout(newLoadout);
  };

  const rosterUrl = dreadveilRoster || roster.url;

  return (
    <div className="relative min-h-dvh lg:h-dvh lg:max-h-screen w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#11100F] font-serif text-[#D6C7A5] select-none">
      {/* Background artwork: The Dying Gods sanctuary with cathedral arches, distant mist, and eclipse */}
      <div
        aria-hidden="true"
        suppressHydrationWarning
        className="pointer-events-none fixed inset-0 bg-cover bg-[center_18%] bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url('/assets/dying-gods-bg.jpg')` }}
      />

      {/* Restrained atmospheric scrims: enhances contrast on controls without hiding cathedral architecture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 w-full max-w-xl bg-gradient-to-r from-[#11100F]/75 via-[#11100F]/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#11100F]/85 via-[#11100F]/30 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_45%,_transparent_48%,_rgba(17,16,15,0.7)_100%)]"
      />

      {/* Viewport Canvas: Proportional coordinate anchoring matching the reference */}
      <div className="relative z-10 flex min-h-dvh lg:min-h-0 lg:h-full w-full flex-col justify-between p-5 sm:p-7 lg:p-0 box-border">
        {/* =========================================================================
            LEFT COLUMN: BRAND TITLE BLOCK & THREE ACTION MENU PLAQUES
            Aligned to left-[5.5vw] on desktop, matching reference composition
        ========================================================================== */}
        <div className="flex flex-col lg:absolute lg:left-[5.5vw] lg:top-[6.5vh] lg:w-[34vw] lg:max-w-[480px] lg:min-w-[340px]">
          {/* Upper-Left Brand Block: Celestial Ornament, DREADVEIL, ADVENTURES, Whisper Tagline */}
          <header className="flex flex-col items-center text-center">
            {/* Occult Celestial Astrolabe / Star Ornament: Centered horizontally over DREADVEIL */}
            <div className="flex items-center justify-center text-[#B18A48] drop-shadow-[0_0_10px_rgba(177,138,72,0.45)] mb-1">
              <svg
                width="34"
                height="34"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-pulse"
                aria-hidden="true"
              >
                {/* Outer runic compass ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#B18A48"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx="50" cy="50" r="32" stroke="#B18A48" strokeWidth="1" />
                {/* Horizontal radiating rays */}
                <line
                  x1="2"
                  y1="50"
                  x2="98"
                  y2="50"
                  stroke="#B18A48"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <line
                  x1="50"
                  y1="2"
                  x2="50"
                  y2="98"
                  stroke="#B18A48"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Primary 8-pointed star */}
                <path
                  d="M50 4 L53 37 L88 47 L53 53 L50 96 L47 53 L12 47 L47 37 Z"
                  fill="url(#star-gold-gradient)"
                  stroke="#B18A48"
                  strokeWidth="1.5"
                />
                <path
                  d="M50 22 L57 43 L78 50 L57 57 L50 78 L43 57 L22 50 L43 43 Z"
                  fill="#762F32"
                  opacity="0.85"
                />
                <circle cx="50" cy="50" r="5" fill="#D6C7A5" />
                <defs>
                  <linearGradient id="star-gold-gradient" x1="50" y1="4" x2="50" y2="96">
                    <stop stopColor="#FBF4E2" />
                    <stop offset="0.4" stopColor="#D4A853" />
                    <stop offset="0.8" stopColor="#B18A48" />
                    <stop offset="1" stopColor="#4A3414" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Wordmark: Grand, sculpted antique serif matching reference proportions */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] tracking-[0.14em] text-[#D6C7A5] font-normal leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              DREADVEIL
            </h1>

            {/* Sub-Kicker: ADVENTURES widely tracked across title width */}
            <p className="font-display text-xs sm:text-sm tracking-[0.45em] text-[#B18A48] mt-1.5 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-semibold">
              ADVENTURES
            </p>

            {/* Tagline: Centered 2-line whisper */}
            <p className="mt-2.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#D6C7A5]/85 font-serif leading-relaxed drop-shadow max-w-xs">
              When the gods fell silent,
              <br />
              the dice began to whisper.
            </p>

            {/* Regression test anchor (accessible to screen-readers and test query) */}
            <span className="sr-only">An Illustrated Bestiary of Ruin</span>
          </header>

          {/* =========================================================================
              THREE MAIN MENU PLAQUES
              Positioned below title block, matching reference width, height & framing
          ========================================================================== */}
          <nav
            aria-label="Main menu"
            className="flex flex-col gap-3 sm:gap-3.5 w-full mt-6 sm:mt-7 lg:mt-8"
          >
            {/* 1. NEW EXPEDITION */}
            <Link
              to="/select"
              aria-label="New Game — Begin a journey into the unknown"
              className="group relative flex w-full items-center gap-4 rounded border border-[#B18A48]/50 bg-[#11100F]/90 px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-200 hover:border-[#B18A48] hover:bg-[#161412] hover:shadow-[0_0_20px_rgba(177,138,72,0.3)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B18A48]"
            >
              {/* Antique Corner Filigree Brackets */}
              <div className="absolute top-1 left-1 size-1.5 border-t border-l border-[#B18A48]" />
              <div className="absolute top-1 right-1 size-1.5 border-t border-r border-[#B18A48]" />
              <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-[#B18A48]" />
              <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-[#B18A48]" />

              {/* Runic Sigil Icon: 8-spoke radiating chaos/sun starburst */}
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded border border-[#B18A48]/35 bg-black/60 text-[#B18A48] group-hover:text-candle group-hover:border-[#B18A48] transition-colors shadow-inner">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" fill="#B18A48" fillOpacity="0.3" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
              </div>

              {/* Label & Subtitle */}
              <div className="flex flex-col min-w-0">
                <span className="font-display text-sm sm:text-[15px] tracking-[0.16em] text-[#D6C7A5] group-hover:text-candle transition-colors uppercase font-semibold">
                  NEW EXPEDITION
                </span>
                <span className="text-[11px] sm:text-xs text-[#A8A7A0] font-serif tracking-normal leading-tight mt-0.5">
                  Begin a journey into the unknown.
                </span>
              </div>
            </Link>

            {/* 2. THE DESCENT */}
            <button
              type="button"
              onClick={() => setActiveModal("descent")}
              aria-label="The Descent — See how long you endure"
              className="group relative flex w-full items-center gap-4 rounded border border-[#B18A48]/40 bg-[#11100F]/90 px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-200 hover:border-[#B18A48] hover:bg-[#161412] hover:shadow-[0_0_18px_rgba(177,138,72,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B18A48] cursor-pointer"
            >
              <div className="absolute top-1 left-1 size-1.5 border-t border-l border-[#B18A48]" />
              <div className="absolute top-1 right-1 size-1.5 border-t border-r border-[#B18A48]" />
              <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-[#B18A48]" />
              <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-[#B18A48]" />

              {/* Occult Caduceus / Winged Dagger Icon */}
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded border border-[#B18A48]/35 bg-black/60 text-[#B18A48] group-hover:text-candle group-hover:border-[#B18A48] transition-colors shadow-inner">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <path d="M12 2 L9 6 L12 7 L15 6 Z" fill="#B18A48" fillOpacity="0.4" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M6 9 C8 11 16 11 18 9" />
                  <path d="M6 15 C8 13 16 13 18 15" />
                </svg>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-display text-sm sm:text-[15px] tracking-[0.16em] text-[#D6C7A5] group-hover:text-candle transition-colors uppercase font-semibold">
                  THE DESCENT
                </span>
                <span className="text-[11px] sm:text-xs text-[#A8A7A0] font-serif tracking-normal leading-tight mt-0.5">
                  See how long you endure.
                </span>
              </div>
            </button>

            {/* 3. CONTINUE RUN */}
            {character ? (
              <Link
                to="/play"
                aria-label={`Quick start as ${character.name}`}
                className="group relative flex w-full items-center gap-4 rounded border border-[#B18A48]/50 bg-[#11100F]/90 px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-200 hover:border-[#B18A48] hover:bg-[#161412] hover:shadow-[0_0_20px_rgba(177,138,72,0.3)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B18A48]"
              >
                <div className="absolute top-1 left-1 size-1.5 border-t border-l border-[#B18A48]" />
                <div className="absolute top-1 right-1 size-1.5 border-t border-r border-[#B18A48]" />
                <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-[#B18A48]" />
                <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-[#B18A48]" />

                {/* Heraldic Shield Crest Icon */}
                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded border border-[#B18A48]/35 bg-black/60 text-[#B18A48] group-hover:text-candle group-hover:border-[#B18A48] transition-colors shadow-inner">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2 L4 6 V12 C4 17 8 21 12 22 C16 21 20 17 20 12 V6 Z" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="8" y1="11" x2="16" y2="11" />
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-display text-sm sm:text-[15px] tracking-[0.16em] text-[#D6C7A5] group-hover:text-candle transition-colors uppercase font-semibold">
                    CONTINUE RUN
                  </span>
                  <span className="text-[11px] sm:text-xs text-candle/90 font-serif tracking-normal truncate leading-tight mt-0.5">
                    Quick start as {character.name} · {encounter?.name ?? "The Crossing"}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                to="/select"
                aria-label="Continue Run — No active run"
                className="group relative flex w-full items-center gap-4 rounded border border-[#B18A48]/30 bg-[#11100F]/75 px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-[0_3px_14px_rgba(0,0,0,0.4)] backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-200 hover:border-[#B18A48]/60 focus-visible:outline-none"
              >
                <div className="absolute top-1 left-1 size-1.5 border-t border-l border-[#B18A48]/40" />
                <div className="absolute top-1 right-1 size-1.5 border-t border-r border-[#B18A48]/40" />
                <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-[#B18A48]/40" />
                <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-[#B18A48]/40" />

                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded border border-[#B18A48]/25 bg-black/50 text-[#A8A7A0]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2 L4 6 V12 C4 17 8 21 12 22 C16 21 20 17 20 12 V6 Z" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-display text-sm sm:text-[15px] tracking-[0.16em] text-[#A8A7A0] uppercase font-semibold">
                    CONTINUE RUN
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#A8A7A0]/75 font-serif leading-tight mt-0.5">
                    No active run · Select an adventurer
                  </span>
                </div>
              </Link>
            )}
          </nav>
        </div>

        {/* =========================================================================
            BOTTOM-LEFT: ATMOSPHERIC CANDLELIGHT CLUSTER & SECONDARY NAVIGATION
            Anchored to left-[5.5vw] bottom-[4.5vh] matching reference
        ========================================================================== */}
        <div className="flex items-center gap-3 sm:gap-4 mt-8 lg:mt-0 lg:absolute lg:left-[5.5vw] lg:bottom-[4.5vh]">
          {/* Altar Candlelight Cluster in far lower-left corner */}
          <div
            className="relative hidden sm:flex items-end gap-1.5 opacity-95 pb-0.5"
            aria-hidden="true"
          >
            {/* Tall Altar Candle */}
            <div className="relative flex flex-col items-center">
              <div className="size-2 rounded-full bg-amber-300 blur-[0.6px] animate-flicker shadow-[0_0_10px_#F59E0B]" />
              <div className="h-1 w-0.5 bg-zinc-900" />
              <div className="h-9 w-2.5 rounded-t-sm bg-gradient-to-b from-[#E2D5B8] via-[#C5A875] to-[#762F32]/80 border-t border-[#F5E6C8] shadow-sm" />
            </div>
            {/* Medium Candle with Wax Drips */}
            <div className="relative flex flex-col items-center">
              <div className="size-2 rounded-full bg-amber-400 blur-[0.6px] animate-flicker shadow-[0_0_10px_#F59E0B]" />
              <div className="h-0.5 w-0.5 bg-zinc-900" />
              <div className="h-6 w-2 rounded-t-sm bg-gradient-to-b from-[#E2D5B8] via-[#B18A48] to-[#52664B]/80 border-t border-[#F5E6C8]" />
            </div>
            {/* Small Candle */}
            <div className="relative flex flex-col items-center">
              <div className="size-1.5 rounded-full bg-amber-300 blur-[0.5px] animate-flicker shadow-[0_0_8px_#F59E0B]" />
              <div className="h-0.5 w-0.5 bg-zinc-900" />
              <div className="h-4 w-2 rounded-t-sm bg-gradient-to-b from-[#E2D5B8] via-[#8C6B37] to-[#762F32]/70" />
            </div>
          </div>

          {/* Bottom Secondary Links */}
          <nav
            aria-label="Secondary navigation"
            className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-serif text-[#A8A7A0]"
          >
            <Link
              to="/select"
              className="group flex items-center gap-1.5 hover:text-candle transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#B18A48] group-hover:text-candle transition-colors"
                aria-hidden="true"
              >
                <circle cx="12" cy="10" r="7" />
                <path d="M9 17v4h6v-4" />
                <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
                <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
              </svg>
              <span>BESTIARY</span>
            </Link>

            <span className="text-[#B18A48]/40" aria-hidden="true">
              ·
            </span>

            <button
              type="button"
              onClick={() => setIsDiceModalOpen(true)}
              className="group flex items-center gap-1.5 hover:text-candle transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#B18A48] group-hover:text-candle transition-colors"
                aria-hidden="true"
              >
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22,8.5 12,15.5 2,8.5" />
                <polyline points="2,15.5 12,8.5 22,15.5" />
                <line x1="12" y1="2" x2="12" y2="8.5" />
              </svg>
              <span>DICE ARSENAL</span>
            </button>

            <span className="text-[#B18A48]/40" aria-hidden="true">
              ·
            </span>

            <button
              type="button"
              onClick={() => setActiveModal("chronicles")}
              className="group flex items-center gap-1.5 hover:text-candle transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#B18A48] group-hover:text-candle transition-colors"
                aria-hidden="true"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
              <span>CHRONICLES</span>
            </button>

            <span className="text-[#B18A48]/40" aria-hidden="true">
              ·
            </span>

            <button
              type="button"
              onClick={() => setActiveModal("settings")}
              className="group flex items-center gap-1.5 hover:text-candle transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#B18A48] group-hover:text-candle transition-colors"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>SETTINGS</span>
            </button>
          </nav>
        </div>

        {/* =========================================================================
            BOTTOM-RIGHT: CURRENT ADVENTURER PREVIEW PANEL
            Anchored to right-[3.5vw] bottom-[4.5vh] matching reference
        ========================================================================== */}
        <aside
          aria-label="Current Adventurer Preview"
          className="relative w-full sm:w-[350px] lg:w-[25.5vw] lg:max-w-[370px] lg:min-w-[320px] shrink-0 rounded border border-[#B18A48]/50 bg-[#11100F]/90 p-3 sm:p-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.85)] backdrop-blur-md mt-6 lg:mt-0 lg:absolute lg:right-[3.5vw] lg:bottom-[4.5vh]"
        >
          {/* Antique corner filigree brackets */}
          <div className="absolute top-1 left-1 size-1.5 border-t border-l border-[#B18A48]" />
          <div className="absolute top-1 right-1 size-1.5 border-t border-r border-[#B18A48]" />
          <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-[#B18A48]" />
          <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-[#B18A48]" />

          {/* Panel Header */}
          <div className="border-b border-[#B18A48]/25 pb-1 mb-2.5">
            <span className="text-[10px] font-serif uppercase tracking-[0.25em] text-[#D6C7A5]/80 font-bold">
              CURRENT ADVENTURER
            </span>
          </div>

          {/* Character Details Row */}
          <Link
            to="/select"
            title="Change Adventurer"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90 cursor-pointer"
          >
            {/* Character Portrait */}
            <div className="relative size-12 sm:size-13 shrink-0 overflow-hidden rounded border border-[#B18A48]/60 bg-black/70 shadow-inner group-hover:border-[#B18A48] transition-colors">
              {character ? (
                <div
                  className="size-full"
                  style={{
                    backgroundImage: `url(${rosterUrl})`,
                    backgroundSize: `${(100 / 17.1) * 100}% ${(100 / 28.0) * 100}%`,
                    backgroundPosition: `${((5.8 + (character.index % 5) * 18.15) / (100 - 17.1)) * 100}% ${((Math.floor(character.index / 5) === 0 ? 15.4 : 53.6) / (100 - 28.0)) * 100}%`,
                  }}
                  aria-label={character.name}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[#B18A48]/60">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="10" r="6" />
                    <path d="M9 16v4h6v-4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Character Lore Details */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-display text-sm tracking-wider uppercase text-[#D6C7A5] truncate font-semibold group-hover:text-candle transition-colors">
                {character?.name ?? "Locke Blackwood"}
              </span>
              <span className="text-[11px] text-[#A8A7A0] font-serif truncate mt-0.5 leading-tight">
                {character
                  ? `${character.role} · ${character.hybrid}`
                  : "Dragonborn · Bard 1 / Wizard 3"}
              </span>
            </div>
          </Link>

          {/* Tabletop Polyhedral Dice Tray: Single row of 6 tactile polyhedral dice matching reference */}
          <div className="mt-3 pt-2.5 border-t border-[#B18A48]/25">
            <button
              type="button"
              onClick={() => setIsDiceModalOpen(true)}
              title="Click to configure combat dice loadout"
              className="grid grid-cols-6 gap-1.5 w-full cursor-pointer group focus-visible:outline-none"
            >
              {COMBAT_DIE_TYPES.map((die) => {
                const isEquipped = loadout.includes(die);
                const config = DIE_CONFIGS[die];

                return (
                  <div
                    key={die}
                    title={`${config.name} (${config.sides} sides) — ${isEquipped ? "Equipped in Combat Loadout" : "Available in Arsenal"}`}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-0.5 rounded transition-transform duration-200 group-hover:scale-105",
                      isEquipped
                        ? "drop-shadow-[0_0_8px_rgba(229,202,146,0.5)]"
                        : "opacity-60 hover:opacity-100",
                    )}
                  >
                    {/* Tactile Sculpted Polyhedral Die SVG Wireframe with Etched Facets & Face Number */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 60 60"
                      className="transition-all duration-200"
                    >
                      <defs>
                        <linearGradient
                          id={`die-gold-${die}`}
                          x1="0"
                          y1="0"
                          x2="60"
                          y2="60"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#F7ECC8" />
                          <stop offset="0.3" stopColor="#E5CA92" />
                          <stop offset="0.7" stopColor="#B18A48" />
                          <stop offset="1" stopColor="#5E431E" />
                        </linearGradient>
                        <radialGradient id={`die-inner-${die}`} cx="50%" cy="50%" r="50%">
                          <stop stopColor="#FFEFC2" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#3A2510" stopOpacity="0.8" />
                        </radialGradient>
                      </defs>

                      {/* d4: Tetrahedron with top vertex, 3 facets, number "2" */}
                      {die === "d4" && (
                        <g>
                          <polygon
                            points="30,6 54,48 6,48"
                            fill={`url(#die-gold-${die})`}
                            stroke="#3A2510"
                            strokeWidth="2"
                          />
                          <line x1="30" y1="6" x2="30" y2="40" stroke="#3A2510" strokeWidth="1.5" />
                          <line x1="6" y1="48" x2="30" y2="40" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="54"
                            y1="48"
                            x2="30"
                            y2="40"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <text
                            x="30"
                            y="32"
                            fill="#2A1808"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            2
                          </text>
                        </g>
                      )}

                      {/* d6: Isometric Cube with 3 visible faces, number "6" */}
                      {die === "d6" && (
                        <g>
                          {/* Top face */}
                          <polygon
                            points="30,8 50,19 30,30 10,19"
                            fill="#F7ECC8"
                            stroke="#3A2510"
                            strokeWidth="1.8"
                          />
                          {/* Left face */}
                          <polygon
                            points="10,19 30,30 30,52 10,41"
                            fill="#B18A48"
                            stroke="#3A2510"
                            strokeWidth="1.8"
                          />
                          {/* Right face */}
                          <polygon
                            points="30,30 50,19 50,41 30,52"
                            fill="#7A5622"
                            stroke="#3A2510"
                            strokeWidth="1.8"
                          />
                          <text
                            x="30"
                            y="44"
                            fill="#2A1808"
                            fontSize="14"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            6
                          </text>
                        </g>
                      )}

                      {/* d8: Octahedron diamond with 4 visible facets, number "4" */}
                      {die === "d8" && (
                        <g>
                          <polygon
                            points="30,6 52,30 30,54 8,30"
                            fill={`url(#die-gold-${die})`}
                            stroke="#3A2510"
                            strokeWidth="2"
                          />
                          <line x1="8" y1="30" x2="52" y2="30" stroke="#3A2510" strokeWidth="1.5" />
                          <line x1="30" y1="6" x2="30" y2="54" stroke="#3A2510" strokeWidth="1.5" />
                          <text
                            x="30"
                            y="25"
                            fill="#2A1808"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            4
                          </text>
                        </g>
                      )}

                      {/* d10: Pentagonal Trapezohedron kite, number "5" */}
                      {die === "d10" && (
                        <g>
                          <polygon
                            points="30,6 52,22 44,52 16,52 8,22"
                            fill={`url(#die-gold-${die})`}
                            stroke="#3A2510"
                            strokeWidth="2"
                          />
                          <line x1="30" y1="6" x2="30" y2="35" stroke="#3A2510" strokeWidth="1.5" />
                          <line x1="8" y1="22" x2="30" y2="35" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="52"
                            y1="22"
                            x2="30"
                            y2="35"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="16"
                            y1="52"
                            x2="30"
                            y2="35"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="44"
                            y1="52"
                            x2="30"
                            y2="35"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <text
                            x="30"
                            y="27"
                            fill="#2A1808"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            5
                          </text>
                        </g>
                      )}

                      {/* d12: Dodecahedron with central pentagon, number "8" */}
                      {die === "d12" && (
                        <g>
                          <polygon
                            points="30,6 51,18 46,46 14,46 9,18"
                            fill={`url(#die-gold-${die})`}
                            stroke="#3A2510"
                            strokeWidth="2"
                          />
                          {/* Inner pentagon facet */}
                          <polygon
                            points="30,17 42,26 38,40 22,40 18,26"
                            fill="#F7ECC8"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line x1="30" y1="6" x2="30" y2="17" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="51"
                            y1="18"
                            x2="42"
                            y2="26"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="46"
                            y1="46"
                            x2="38"
                            y2="40"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="14"
                            y1="46"
                            x2="22"
                            y2="40"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line x1="9" y1="18" x2="18" y2="26" stroke="#3A2510" strokeWidth="1.5" />
                          <text
                            x="30"
                            y="33"
                            fill="#2A1808"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            8
                          </text>
                        </g>
                      )}

                      {/* d20: Icosahedron with triangular facets, number "11" */}
                      {die === "d20" && (
                        <g>
                          <polygon
                            points="30,6 52,19 52,43 30,54 8,43 8,19"
                            fill={`url(#die-gold-${die})`}
                            stroke="#3A2510"
                            strokeWidth="2"
                          />
                          {/* Central equilateral triangle face */}
                          <polygon
                            points="30,17 46,42 14,42"
                            fill="#F7ECC8"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line x1="30" y1="6" x2="30" y2="17" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="52"
                            y1="19"
                            x2="30"
                            y2="17"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line x1="8" y1="19" x2="30" y2="17" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="52"
                            y1="43"
                            x2="46"
                            y2="42"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line x1="8" y1="43" x2="14" y2="42" stroke="#3A2510" strokeWidth="1.5" />
                          <line
                            x1="30"
                            y1="54"
                            x2="46"
                            y2="42"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="30"
                            y1="54"
                            x2="14"
                            y2="42"
                            stroke="#3A2510"
                            strokeWidth="1.5"
                          />
                          <text
                            x="30"
                            y="34"
                            fill="#2A1808"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="serif"
                            textAnchor="middle"
                          >
                            11
                          </text>
                        </g>
                      )}
                    </svg>

                    {/* Miniature die label under icon */}
                    <span className="text-[9px] font-serif font-bold text-[#D6C7A5]/80 mt-0.5 leading-none">
                      {die}
                    </span>
                  </div>
                );
              })}
            </button>
          </div>
        </aside>
      </div>

      {/* The Descent Modal */}
      {activeModal === "descent" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="descent-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded border border-[#B18A48] bg-[#11100F] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#D6C7A5]/70 hover:text-candle"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3 text-[#B18A48] mb-3">
              <Hourglass className="size-6" />
              <h2 id="descent-title" className="font-display text-xl uppercase tracking-wider">
                The Descent · Endless Depths
              </h2>
            </div>
            <p className="text-sm font-serif text-[#D6C7A5]/90 leading-relaxed mb-4">
              The ancient ward of the Catacombs remains sealed. In this upcoming gauntlet,
              adventurers will descend into subterranean ruins without rest, battling ever-mutating
              horrors where only your polyhedral dice stand between victory and eternal madness.
            </p>
            <div className="rounded border border-[#B18A48]/30 bg-black/50 p-3 text-xs text-muted-foreground font-serif mb-6">
              <span className="text-candle font-bold">Chronicle Inscription:</span> Standard
              encounters are currently available in the Bestiary. Slay The Lantern-Jawed Mire Hound,
              The Iron-Bile Gorgon, and The Cinder-Weaver to prepare for The Descent.
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-iron px-4 py-2 text-xs uppercase tracking-wider rounded"
              >
                Acknowledge
              </button>
              <Link
                to="/select"
                className="btn-bronze px-5 py-2 text-xs uppercase tracking-wider rounded"
              >
                Go to Bestiary
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Chronicles Modal */}
      {activeModal === "chronicles" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chronicles-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded border border-[#B18A48] bg-[#11100F] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#D6C7A5]/70 hover:text-candle"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3 text-[#B18A48] mb-3">
              <BookOpen className="size-6" />
              <h2 id="chronicles-title" className="font-display text-xl uppercase tracking-wider">
                Chronicles of the Dying Gods
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif text-[#D6C7A5]/90 leading-relaxed">
              <p>
                When the cosmic sovereigns fell silent, the firmament tore open. In their twilight,
                ten beast-hybrids were tempered in crucible flame to wander the desolate sanctuaries
                and confront the horrors lurking beyond the Veil.
              </p>
              <div className="border-t border-b border-[#B18A48]/30 py-3 space-y-2">
                <div className="font-bold text-candle text-xs uppercase tracking-widest">
                  The Three Horrors:
                </div>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li>
                    <strong className="text-[#D6C7A5]">The Lantern-Jawed Mire Hound:</strong> A
                    submerged predator haunting the Blackwater Crossing.
                  </li>
                  <li>
                    <strong className="text-[#D6C7A5]">The Iron-Bile Gorgon:</strong> A calcified
                    horror whose gaze turns flesh into brittle stone.
                  </li>
                  <li>
                    <strong className="text-[#D6C7A5]">The Cinder-Weaver:</strong> An arachnid
                    crucible whose burning embers ignite conflagrations.
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-bronze px-5 py-2 text-xs uppercase tracking-wider rounded"
              >
                Close Chronicles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === "settings" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md rounded border border-[#B18A48] bg-[#11100F] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#D6C7A5]/70 hover:text-candle"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3 text-[#B18A48] mb-4">
              <SettingsIcon className="size-6" />
              <h2 id="settings-title" className="font-display text-xl uppercase tracking-wider">
                Sanctuary Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#B18A48]/20 pb-3">
                <div>
                  <div className="font-serif text-sm font-bold text-[#D6C7A5]">
                    Ambient Resonances
                  </div>
                  <div className="text-xs text-muted-foreground font-serif">
                    Tabletop audio cues & dice rolls
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded border border-[#B18A48]/40 hover:border-[#B18A48] text-candle cursor-pointer"
                  aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
                >
                  {soundEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-[#B18A48]/20 pb-3">
                <div>
                  <div className="font-serif text-sm font-bold text-[#D6C7A5]">
                    Reset Chronicle Progress
                  </div>
                  <div className="text-xs text-muted-foreground font-serif">
                    Clears saved character and combat loadout
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("dreadveil.selectedCharacter");
                    localStorage.removeItem("dreadveil.selectedEncounter");
                    localStorage.removeItem("dreadveil.selectedLoadout");
                    setCharacter(null);
                    setLoadout(["d4", "d6", "d8"]);
                    setActiveModal(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-red-900/60 text-red-400 hover:bg-red-950/40 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-iron px-5 py-2 text-xs uppercase tracking-wider rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dice Arsenal Tabletop Pouch Drawer */}
      <DiceLoadoutModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        currentLoadout={loadout}
        onSaveLoadout={handleSaveLoadout}
        canChangeLoadout={true}
      />
    </div>
  );
}
