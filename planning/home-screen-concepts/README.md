# Home Screen UI Concepts

Generated mockups exploring 5 redesign directions for the Uinta Watch app home
screen (`app/app/(tabs)/index.tsx`), produced with `nano-banana-pro` via the
local antseed proxy (`http://localhost:8377/v1/images/generations`, key
`antseed`, size `1024x1536`). Design constraints come from
`app/.opencode/skills/mobile-app-ui-design/SKILL.md` and the app's existing
theme tokens (`app/src/theme/colors.ts`).

## The 5 directions

| # | Concept | Status | Brief |
|---|---------|--------|-------|
| 1 | Live Ops Map-First | **Generated** — `concept-01.png` | Full-bleed Utah map, alert ribbon as focal point, glass stat chips, urgent-first sensor cards in a bottom sheet, thumb-zone "Report Smoke" |
| 2 | Status Hero | not generated | Large network-health hero card with fire-risk dial, quick-action row, compact map strip |
| 3 | Sensor Carousel | not generated | Horizontal snap carousel of rich sensor cards over a map, prioritized by status |
| 4 | Dark Command Center | **Generated** — `concept-04.png` (1 re-roll needed: rendered two phones side-by-side instead of one edge-to-edge screen) | Warm-dark field theme, incident banner, glowing mesh map, metric grid |
| 5 | Community Feed | not generated | "Report Smoke" hero CTA + vertical timeline of sightings and sensor events |

Full briefs in `prompts/concept-0X.txt`; the two shortened prompts that worked
reliably are `prompts/concept-01-short.txt` and `concept-04-short.txt`.

## How to resume

```sh
cd planning/home-screen-concepts
python3 gen.py nano-banana-pro prompts/concept-02-short.txt concept-02.png
```

- Keep prompts under ~1500 chars — longer ones fail consistently on peers
- Failures surface as HTTP 400 "try another peer" and still bill as attempts,
  so run one generation at a time with no retry loops
- Concepts 2, 3, 5 still need their short versions written
  (condense from the long briefs like the two existing short ones)

## Known artifacts in the generated images

- `concept-01.png`: right-edge card is cut off mid-word; card titles are generic
- `concept-04.png`: two phones side-by-side on a backdrop instead of a single
  edge-to-edge screen
