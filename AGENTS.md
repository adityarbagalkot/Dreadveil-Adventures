<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture

- Game rules live in pure modules under `src/game/` (engine reducer, character data, storage); routes only render and dispatch — keeps rules testable without UI.
- Randomness is generated in UI handlers and passed into engine actions — keeps the reducer deterministic for tests.
- Character portraits are cropped from the single roster artwork via `rosterRect`/`portraitStyle` — one source image, hotspots stay aligned.
- Shared tabletop presentation lives in semantic CSS utilities and Button variants; roster selection uses Radix radio primitives — keeps visual states consistent and keyboard selection native.
