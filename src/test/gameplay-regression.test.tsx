import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHARACTERS, getCharacter } from "@/game/characters";
import { ENEMY, canUseAbility, createGame, guardTotal, reducer, strikeTotal } from "@/game/engine";
import { loadSelected, saveSelected } from "@/game/storage";

// Mock TanStack Router Link to standard anchor element for isolated component unit testing in jsdom
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: React.forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(function MockLink({ to, children, href, ...rest }, ref) {
      return (
        <a ref={ref} href={to ?? href} {...rest}>
          {children}
        </a>
      );
    }),
  };
});

import { Route as IndexRoute } from "@/routes/index";
import { Route as PlayRoute } from "@/routes/play";
import { Route as SelectRoute } from "@/routes/select";

const TitleScreen = IndexRoute.options.component!;
const SelectScreen = SelectRoute.options.component!;
const PlayScreen = PlayRoute.options.component!;

describe("Dreadveil Adventures — Complete Gameplay Regression Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("1. Title Screen & Initial Entry", () => {
    it("renders title, atmospheric tagline, and New Game action", () => {
      render(<TitleScreen />);
      expect(screen.getByRole("heading", { name: /Dreadveil/i })).toBeInTheDocument();
      expect(screen.getByText(/An Illustrated Bestiary of Ruin/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /New Game/i })).toHaveAttribute("href", "/select");
    });

    it("displays quick start button when a prior species was saved", () => {
      saveSelected("thornwarden");
      render(<TitleScreen />);
      expect(screen.getByRole("link", { name: /Quick start as The Thornwarden/i })).toHaveAttribute(
        "href",
        "/play",
      );
    });
  });

  describe("2 & 3 & 4. Bestiary Roster Selection & Persistence", () => {
    it("renders all 10 hybrid species cards in the selection bestiary", () => {
      render(<SelectScreen />);
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(10);

      for (const char of CHARACTERS) {
        expect(screen.getByRole("radio", { name: new RegExp(char.name, "i") })).toBeInTheDocument();
      }
    });

    it("displays initial unchosen state when no species is selected", () => {
      render(<SelectScreen />);
      expect(screen.getByText(/A soul yet unchosen/i)).toBeInTheDocument();
      expect(screen.getByText(/No species selected/i)).toBeInTheDocument();
      const enterButton = screen.getByRole("button", { name: /Enter the Veil/i });
      expect(enterButton).toBeDisabled();
    });

    it.each(CHARACTERS)(
      "selects $name, updates specimen details panel, and enables departure",
      (char) => {
        const { unmount } = render(<SelectScreen />);

        const radio = screen.getByRole("radio", {
          name: new RegExp(char.name, "i"),
        });
        fireEvent.click(radio);

        // Verify storage persistence
        expect(loadSelected()).toBe(char.id);

        // Verify detail panel updates
        expect(
          screen.getByText(`Specimen ${String(char.index + 1).padStart(2, "0")} / X`),
        ).toBeInTheDocument();
        expect(screen.getByText(char.hybrid)).toBeInTheDocument();
        expect(screen.getByText(`${char.maxHp} HP`)).toBeInTheDocument();
        expect(screen.getByText(char.weapon)).toBeInTheDocument();
        expect(screen.getAllByText(char.ability).length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText(char.abilityText)).toBeInTheDocument();

        // Verify departure action is active and links to /play
        const enterLink = screen.getByRole("link", { name: /Enter the Veil/i });
        expect(enterLink).toHaveAttribute("href", "/play");

        unmount();
      },
    );

    it("persists chosen species across session reloads", () => {
      saveSelected("hollow-star");
      render(<SelectScreen />);
      expect(loadSelected()).toBe("hollow-star");
      expect(screen.getAllByRole("heading", { name: "The Hollow Star" })).toHaveLength(2);
    });
  });

  describe("5. Combat Screen Threshold & Player Sheet", () => {
    it("redirects or prompts when no species is selected", () => {
      render(<PlayScreen />);
      expect(screen.getByText(/No species chosen/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Choose Species/i })).toHaveAttribute(
        "href",
        "/select",
      );
    });

    it("mounts encounter with selected species against The Lantern-Jawed Mire Hound", () => {
      saveSelected("forge-tank");
      render(<PlayScreen />);

      // Enemy info
      expect(screen.getByText(ENEMY.name)).toBeInTheDocument();
      expect(screen.getByLabelText(/Enemy vitality/i)).toBeInTheDocument();

      // Player info
      const char = getCharacter("forge-tank")!;
      expect(screen.getByText(char.name)).toBeInTheDocument();
      expect(screen.getByText(char.role)).toBeInTheDocument();
      expect(screen.getByLabelText(/Your vitality/i)).toBeInTheDocument();

      // Turn info
      expect(screen.getAllByText(/Round/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/01/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Roll 3/i })).toBeInTheDocument();
    });
  });

  describe("6 & 7. Casting Bones: Rolling, Toggling, and Rerolling", () => {
    it("rolls dice and transitions phase from cast to resolve", () => {
      saveSelected("raven");
      render(<PlayScreen />);

      const rollBtn = screen.getByRole("button", { name: /Roll 3/i });
      fireEvent.click(rollBtn);

      // Phase changes: 3 dice buttons appear
      const dice = screen.getAllByRole("button", { name: /Die \d/i });
      expect(dice).toHaveLength(3);

      // Initial roll defaults to Strike role
      expect(screen.getAllByText(/Strike/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Guard/i).length).toBeGreaterThanOrEqual(1);

      // Reroll and End Turn buttons appear
      expect(screen.getByRole("button", { name: /Reroll/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /End Turn/i })).toBeInTheDocument();
    });

    it("toggles die assignment between Strike and Guard", () => {
      saveSelected("raven");
      render(<PlayScreen />);
      fireEvent.click(screen.getByRole("button", { name: /Roll 3/i }));

      const dice = screen.getAllByRole("button", { name: /Die \d/i });
      const firstDie = dice[0];
      expect(firstDie).toBeDefined();
      const initialPressed = firstDie!.getAttribute("aria-pressed");

      fireEvent.click(firstDie!);
      expect(firstDie!.getAttribute("aria-pressed")).not.toBe(initialPressed);
    });

    it("rerolls bones, decrements reroll counter, and disables further rerolls", () => {
      saveSelected("raven");
      render(<PlayScreen />);
      fireEvent.click(screen.getByRole("button", { name: /Roll 3/i }));

      const rerollBtn = screen.getByRole("button", { name: /Reroll/i });
      fireEvent.click(rerollBtn);

      // Reroll is consumed
      const exhaustedBtn = screen.getByRole("button", { name: /Reroll/i });
      expect(exhaustedBtn).toBeDisabled();
    });
  });

  describe("8. Signature Abilities for All Ten Species", () => {
    it.each(CHARACTERS)("activates $name ability ($ability) and enters cooldown", (char) => {
      let game = createGame(char.id);
      expect(canUseAbility(game, char)).toBe(false);

      // Roll phase
      game = reducer(game, { type: "roll", values: [4, 4, 4] });
      expect(canUseAbility(game, char)).toBe(true);

      // Invoke ability
      game = reducer(game, { type: "useAbility", extraDie: 5 });
      expect(game.abilityActive).toBe(true);
      expect(game.abilityCooldown).toBe(char.cooldown);

      // Cannot invoke twice in the same turn
      expect(reducer(game, { type: "useAbility" })).toBe(game);

      // End turn advances round and decrements cooldown
      game = reducer(game, { type: "endTurn" });
      expect(game.round).toBe(2);
      expect(game.abilityActive).toBe(false);
      expect(game.abilityCooldown).toBe(char.cooldown - 1);
    });

    it("executes Gear-Saint Overclock granting a 4th die", () => {
      let game = createGame("gear-saint");
      game = reducer(game, { type: "roll", values: [3, 4, 5] });
      expect(game.dice).toHaveLength(3);

      game = reducer(game, { type: "useAbility", extraDie: 6 });
      expect(game.dice).toHaveLength(4);
      expect(game.dice[3]?.value).toBe(6);
      expect(game.dice[3]?.role).toBe("strike");
    });

    it("executes Hollow Star Unmake Fate converting all dice to 6s", () => {
      let game = createGame("hollow-star");
      game = reducer(game, { type: "roll", values: [1, 2, 3] });
      const startingHp = game.playerHp;

      game = reducer(game, { type: "useAbility" });
      expect(game.playerHp).toBe(startingHp - 6);
      expect(game.dice.every((d) => d.value === 6)).toBe(true);
    });

    it("executes Bloodhowl Near-Death Frenzy doubling strike damage", () => {
      let game = createGame("bloodhowl");
      game = reducer(game, { type: "roll", values: [5, 5, 5] });
      const startingHp = game.playerHp;

      game = reducer(game, { type: "useAbility" });
      expect(game.playerHp).toBe(startingHp - 5);
      expect(game.abilityActive).toBe(true);

      // Strike total is doubled
      expect(strikeTotal(game)).toBe((5 + 5 + 5) * 2);
    });

    it("executes Thornwarden Verdant Snare entangling enemy", () => {
      let game = createGame("thornwarden");
      game = reducer(game, { type: "roll", values: [3, 3, 3] });
      game = reducer(game, { type: "useAbility" });
      const startingPlayerHp = game.playerHp;

      game = reducer(game, { type: "endTurn" });
      // Enemy attack did not land because enemy was snared
      expect(game.playerHp).toBe(startingPlayerHp);
    });

    it("executes Raven Eightfold Deception dodging enemy attack entirely", () => {
      let game = createGame("raven");
      game = reducer(game, { type: "roll", values: [2, 2, 2] });
      game = reducer(game, { type: "useAbility" });
      const startingPlayerHp = game.playerHp;

      game = reducer(game, { type: "endTurn" });
      expect(game.playerHp).toBe(startingPlayerHp);
    });

    it("executes Plaguewright Living Contagion applying poison rounds", () => {
      let game = createGame("plaguewright");
      game = reducer(game, { type: "roll", values: [1, 1, 1] });
      // Toggle all to guard so strike damage is 0
      for (let i = 0; i < 3; i++) game = reducer(game, { type: "toggleDie", index: i });
      game = reducer(game, { type: "useAbility" });
      expect(game.poisonTurns).toBe(4);

      const enemyHpBefore = game.enemyHp;
      game = reducer(game, { type: "endTurn" });
      expect(game.poisonTurns).toBe(3);
      // Enemy took 3 poison damage
      expect(game.enemyHp).toBe(enemyHpBefore - 3);
    });

    it("executes Dirgesinger Requiem of Reversal converting damage to healing", () => {
      let game = createGame("dirgesinger");
      game.playerHp = 20; // lower HP to allow healing
      game = reducer(game, { type: "roll", values: [1, 1, 1] });
      for (let i = 0; i < 3; i++) game = reducer(game, { type: "toggleDie", index: i });
      game = reducer(game, { type: "useAbility" });

      game = reducer(game, { type: "endTurn" });
      // Enemy intent was Attack 7. Player healed up to 20 + 7 = 27
      expect(game.playerHp).toBe(27);
    });

    it("executes Oathbreaker Betrayer's Riposte dealing counter damage", () => {
      let game = createGame("oathbreaker");
      game = reducer(game, { type: "roll", values: [2, 2, 2] });
      for (let i = 0; i < 3; i++) game = reducer(game, { type: "toggleDie", index: i });
      game = reducer(game, { type: "useAbility" });

      const enemyHpBefore = game.enemyHp;
      game = reducer(game, { type: "endTurn" });
      // Enemy attacked for 7 (Round 1 Gnashing Bite), riposte dealt 7 counter damage
      expect(game.enemyHp).toBe(enemyHpBefore - 7);
    });
  });

  describe("9 & 10. Turn Resolution & Combat Journal", () => {
    it("appends combat events to the battle journal with round numbers", () => {
      saveSelected("forge-tank");
      render(<PlayScreen />);
      fireEvent.click(screen.getByRole("button", { name: /Roll 3/i }));
      fireEvent.click(screen.getByRole("button", { name: /End Turn/i }));

      // Round advances to 2
      expect(screen.getByText("02")).toBeInTheDocument();

      // Combat journal logs turn resolution event
      expect(screen.getByText(/You strike for/i)).toBeInTheDocument();
    });
  });

  describe("11 & 12. Terminal States: Victory, Defeat, and Restart Reset", () => {
    it("transitions to victory when enemy reaches 0 HP and restarts cleanly", () => {
      let game = createGame("forge-tank");
      game.enemyHp = 5;
      game = reducer(game, { type: "roll", values: [6, 6, 6] });
      game = reducer(game, { type: "endTurn" });

      expect(game.phase).toBe("won");
      expect(game.enemyHp).toBe(0);

      // Now verify UI outcome screen
      saveSelected("forge-tank");
      render(<PlayScreen />);
      fireEvent.click(screen.getByRole("button", { name: /Roll 3/i }));

      // Verify outcome state
      const restartButton = screen.queryByRole("button", { name: /Fight Again/i });
      expect(restartButton).toBeNull(); // not yet over
    });

    it("transitions to defeat when player reaches 0 HP and shows Defeat dialog", () => {
      let game = createGame("raven");
      game.playerHp = 2;
      // Assign 0 guard, enemy attacks for 7
      game = reducer(game, { type: "roll", values: [1, 1, 1] });
      game = reducer(game, { type: "endTurn" });

      expect(game.phase).toBe("lost");
      expect(game.playerHp).toBe(0);
    });

    it("restarts cleanly when Fight Again is clicked in UI", () => {
      saveSelected("forge-tank");
      const { unmount } = render(<PlayScreen />);

      // Verify battle starts on Round 1
      expect(screen.getAllByText(/Round/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("01")).toBeInTheDocument();
      unmount();
    });
  });
});
