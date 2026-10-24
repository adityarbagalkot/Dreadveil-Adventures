# Dice And Beasts

Create a new project named Dreadveil — a dark-fantasy, dice-driven tactical puzzle adventure. This is a CLEAN, carefully structured rebuild, not a generic dashboard. Preserve the supplied design direction: antique illustrated bestiary, dark iron frame, parchment roster, muted bronze, candlelight, dark teal shadows, expressive weird animal-hybrid monsters. The ten-species roster reference image is available at https://d2ol7oe51mr4n9.cloudfront.net/user_3J4cr2yIYoTSOlYreJPMK2uhj6t/bcf116b1-dcb1-4c65-a80b-f58638f41495.png — use it as the main character selection artwork if accessible. Existing design: title screen, then a clickable ten-character roster with selectable hotspots over the roster artwork, selected state/highlight, details panel, and an Enter the Veil button disabled until selection. Ten species: 1 Forge Tank — Rhinoceros × Badger × Tortoise, Tank/Defender, anvil maul, Molten Bastion. 2 Raven — Raven × Octopus, Rogue/Assassin, twin crescent daggers, Eightfold Deception. 3 Plaguewright — Hyena × Axolotl × Leech, Alchemist/Controller, distillation staff, Living Contagion. 4 Oathbreaker — Stag × Vulture × Scorpion, Duelist/Counterattacker, spectral greatsword, Betrayer's Riposte. 5 Oracle — Owl × Moth × Anglerfish, Mage/Seer, rune staff, Borrowed Tomorrow. 6 Bloodhowl — Boar × Wolf × Bat, Berserker/High Risk, executioner cleaver, Near-Death Frenzy. 7 Thornwarden — Praying Mantis × Deer × Pangolin, Ranger/Trapper, thornwood bow, Verdant Snare. 8 Gear-Saint — Frog × Armadillo × Beetle, Artificer/Chronomancer, arcane chronometer, Overclock. 9 Dirgesinger — Fox × Peacock × Cicada, Bard/Manipulator, hexed lute, Requiem of Reversal. 10 Hollow Star — Hare × Abyssal Eel × Anglerfish, Warlock/Reality Bender, void focus, Unmake Fate. Must make every portrait clickable and keyboard accessible, preserve selected character across screen navigation using browser storage, and start a new game with that character selected. Start with a functional title-to-selection-to-game flow, not a static mockup. For first playable game screen, create a small functional turn-based dice combat encounter with clear enemy intent, roll controls, health, player choices, turn progression, win/lose and restart. Keep game rules/state separate from UI. Character abilities must have actual simple gameplay effects or be clearly marked as not yet implemented; do not pretend placeholder abilities work. Use React + TypeScript + Tailwind, PixiJS only if useful for an actual 2D scene; avoid unnecessary dependencies and backend setup. Make mobile responsive. Do not leave inert buttons, fake interactions, or broken routes. Test build/typecheck and the core user flow, fix errors before declaring done. Build incrementally, favor reliability over unnecessary complexity.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5b4606eb-5b09-48cc-bf72-203531e762bc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
