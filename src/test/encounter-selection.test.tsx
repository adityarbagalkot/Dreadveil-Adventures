import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Route as SelectRoute } from "../routes/select";
import { Route as PlayRoute } from "../routes/play";
import { saveSelected, saveSelectedEncounter, loadSelectedEncounter } from "../game/storage";
import { getEncounter } from "../game/encounters";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: React.forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ to, children, ...props }, ref) => (
      <a href={to ?? "#"} ref={ref} {...props}>
        {children}
      </a>
    )),
  };
});

describe("Encounter Selection & Progression Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const SelectScreen = SelectRoute.options.component!;
  const PlayScreen = PlayRoute.options.component!;

  it("renders Folio tabs in the selection screen and switches to The Three Horrors", () => {
    saveSelected("forge-tank");
    render(<SelectScreen />);

    // Check Folio tabs exist
    const speciesTab = screen.getByRole("button", { name: /Folio I · The Ten Species/i });
    const horrorsTab = screen.getByRole("button", { name: /Folio II · The Three Horrors/i });

    expect(speciesTab).toBeInTheDocument();
    expect(horrorsTab).toBeInTheDocument();

    // Default tab is species: 10 species cards visible
    expect(screen.getAllByRole("radio")).toHaveLength(10);

    // Switch to Folio II: The Three Horrors
    fireEvent.click(horrorsTab);

    // 3 encounter cards should now be rendered
    expect(screen.getAllByText("The Lantern-Jawed Mire Hound").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("The Iron-Bile Gorgon")).toBeInTheDocument();
    expect(screen.getByText("The Cinder-Weaver")).toBeInTheDocument();

    // Verify difficulty ratings
    expect(screen.getByText(/Apprentice \(Rank 1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Veteran \(Rank 2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Master \(Rank 3\)/i)).toBeInTheDocument();
  });

  it("selects The Iron-Bile Gorgon and persists choice to storage", () => {
    saveSelected("oathbreaker");
    render(<SelectScreen />);

    // Switch to horrors folio
    fireEvent.click(screen.getByRole("button", { name: /Folio II · The Three Horrors/i }));

    // Click Iron-Bile Gorgon radio card
    const gorgonRadio = screen.getByRole("radio", { name: /The Iron-Bile Gorgon/i });
    fireEvent.click(gorgonRadio);

    // Verify storage was updated
    expect(loadSelectedEncounter()).toBe("iron-bile-gorgon");

    // Verify Target Adversary preview updated in the specimen panel
    expect(screen.getByText("The calcified sepulcher")).toBeInTheDocument();
  });

  it("selects The Cinder-Weaver and persists choice to storage", () => {
    saveSelected("bloodhowl");
    render(<SelectScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Folio II · The Three Horrors/i }));

    const weaverRadio = screen.getByRole("radio", { name: /The Cinder-Weaver/i });
    fireEvent.click(weaverRadio);

    expect(loadSelectedEncounter()).toBe("cinder-weaver");
    expect(screen.getByText("The smoking crucible")).toBeInTheDocument();
  });

  it("initializes combat against The Iron-Bile Gorgon with 52 HP and correct intents", () => {
    saveSelected("forge-tank");
    saveSelectedEncounter("iron-bile-gorgon");

    render(<PlayScreen />);

    // Verify Gorgon's vitality
    expect(screen.getByText(/52 HP/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Iron-Bile Gorgon" })).toBeInTheDocument();

    // Verify starting intent is Caustic Bile
    expect(screen.getByText("Caustic Bile")).toBeInTheDocument();

    // Roll bones
    fireEvent.click(screen.getByRole("button", { name: /Roll 3/i }));

    // Verify totals and End Turn
    expect(screen.getByRole("button", { name: /End Turn/i })).toBeInTheDocument();
  });

  it("initializes combat against The Cinder-Weaver with 42 HP and correct intents", () => {
    saveSelected("plaguewright");
    saveSelectedEncounter("cinder-weaver");

    render(<PlayScreen />);

    // Verify Weaver's vitality
    expect(screen.getByText(/42 HP/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Cinder-Weaver" })).toBeInTheDocument();

    // Starting intent is Searing Spinneret
    expect(screen.getByText("Searing Spinneret")).toBeInTheDocument();
  });

  it("preserves selected encounter on combat restart via Fight Again", () => {
    saveSelected("forge-tank");
    saveSelectedEncounter("iron-bile-gorgon");

    const { unmount } = render(<PlayScreen />);

    // Verify Gorgon is present
    expect(screen.getByRole("heading", { name: "The Iron-Bile Gorgon" })).toBeInTheDocument();
    expect(screen.getAllByText(/Round/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("01")).toBeInTheDocument();

    unmount();
  });
});
