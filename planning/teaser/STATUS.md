# STATUS — UintaWatch AntSeed submission (article 2 + teaser video)

**Date: Fri Sep 25, 2026 — CONTEST DEADLINE DAY (AntSeed build contest, Sept 25).**
Session was compacted; this file is the handoff. Working dir: `/Volumes/CrucialX10/uintawatch`.

## Goal
1. Article 2 (follow-up to `article1.txt`, but standalone/unique) for the final submission.
2. Teaser video (16:9 1920x1080, ~50s, **silent** — the user records VO over it afterward) cut from real app footage.

## Where we are

### 1. Article 2 — DRAFTED, near-final
- File: `planning/teaser/article2-draft.md`
- Angle chosen by user: **mix** of (a) disproof/pivot story, (b) engineering war stories, (c) contest wrap.
- Title: "We Scored Our Own Project 2/10 in Public. Here's What Survived."
- Voice: MoonKid (article 1's persona), X long-form article, ~1000 words.
- Content anchors: DHS OIG-26-05 audit, NRCan Fire 9(4):141 positive twin, pivot to "open field lab for low-cost wildfire sensing", app v2 (agent tab, Lab/UintaBench, 7 published bugs), agent-killed-QA-sessions meta story, phases 0–5, AntSeed credit.
- Antislop skill was loaded and applied: title fixed (old title collided with journal entry), vague attribution fixed (ChatGPT named), engagement-bait opener removed, em dashes trimmed. **TODO: final read-through + maybe one more antislop pass after video section finalized.**
- Article references a teaser video placeholder `[teaser video here]` — video must exist to embed.

### 2. Teaser video — v1 RENDERED, needs revision
- Current output: `planning/teaser/uintawatch-teaser.mp4` (54s, 1920x1080@30, h264 crf18, silent, 4.3MB)
- Builder: `planning/teaser/build_video.py` (generates ffmpeg filtergraph; 12 segments, xfade 0.4s)
- Cards: `planning/teaser/build_cards.py` → `planning/teaser/cards/*.png` (Pillow, brand fonts, transparent 1920x1080) — title/stats/end cards + left-column caption cards. **Fonts converted woff2→ttf** (homebrew ffmpeg 9.0.2 has NO drawtext — no freetype; that's why cards are PNGs) in `planning/teaser/fonts/`.
- Brand: cream `#FAF8F5`, ink `#1C1814`, soft `#4A443E`, accent `#C45A3B`, alert `#E8593A`. Fonts: DM Serif Display (headlines), Archivo (body).

### 3. App footage — captured from a RELEASE build (per user requirement: no Expo dev gear)
- Release app: `app/ios/build/ios27-release/Build/Products/Release-iphonesimulator/UintaWatch.app` — **BUILD SUCCEEDED**, installed on booted sim "UW iOS27" (`FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4`), verified clean (no gear).
- QA harness: `cd app/qa && export QA_UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4` then `./qa describe|tap-label|swipe|text|snap|nav|relaunch`.
- Status bar overridden to 9:41 / battery 100% via `xcrun simctl status_bar $UDID override --time "9:41" --batteryLevel 100 --batteryState charged --wifiBars 3 --cellularBars 4`.
- Recordings (in `/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture/`):
  - `A-home-pulse.mov` 15.3s — home map, pulsing markers, alert banner. OK.
  - `A2-sheet-expand.mov` 9.0s — sheet expand via handle drag. **USER: NOT FLUID ENOUGH — re-record with slower staged drag (see TODO).**
  - `B-node-detail.mov` 11.4s — sensor card tap → node detail → scroll (wind/mesh health) → back. OK.
  - `C2-alert-detail.mov` 11.1s — alerts feed → critical alert detail → back. OK.
  - `D2-agent-stream.mov` 24s — UNUSABLE (reply rendered in last 0.03s).
  - `D3-agent-stream.mov` 40.6s — **JUST RECORDED, NOT YET QA'D.** Frames dense to 15.25s then jump to 40.62 — likely same problem (reply at very end). Agent first-token latency is 10–40s (variable); app DOES stream (SSE, `streamAgentReply` in `app/src/services/agent.ts`). Next attempt: record ~90s window.
  - `E3-report-submit.mov` 17.3s — report form → typed text (~12s) → success dialog (13–16s). OK.
  - Junk deleted: `B-callout-node.mov` (1.18GB runaway), `E-report.mov`.
- Stills for article embeds: `planning/teaser/frames/*.png` (all QA'd PASS except `teaser-d3-agent-stream.png` unverified). Notable: `teaser-a2-sheet-expanded.png` (expanded sheet), `teaser-b-node-detail.png`, `teaser-d-agent-reply.png`, `teaser-f-lab.png` (Lab tab: "The Lab" manifesto + UintaBench "?" table), `teaser-e3-report-*`, `teaser-c2-alert-detail`.
- Website b-roll: `planning/teaser/frames/web/{home,open-questions,journal,get-involved}.png` (1920x1080, live uintawatch.com). Home hero: "Utah is burning. Now it's your turn to watch." + stats row — QA'd PASS.
- Probes: `planning/teaser/probe/` (contact sheets etc.)

## STATUS: COMPLETE (Sept 25, 2026)
All TODOs below were finished:
1. ✅ iPhone bezel (`planning/teaser/bezel/{bezel,shadow}.png`, builder `build_bezel.py`) — overlaid on all phone segments; corners covered by the ring; Dynamic Island comes from the footage itself.
2. ✅ Fluid drawer: `A4-sheet-spring.mov` — expand/collapse via the app's native spring (tap "View all sensors" / "Collapse sensor list"), plus a list scroll. Old A2/A3 superseded.
3. ✅ Agent money shot: `D4-agent-stream.mov` — question + dots (0–13.3s), reply streams on camera (13.3–15.5s), settled by 17.8s. (D5's recorder died early; D4 delivered.)
4. ✅ Final render: `planning/teaser/uintawatch-teaser.mp4` — 55.7s, 1920x1080@30, h264 crf18, silent, ~4.5MB. Full contact-sheet + title/end card QA PASS.
5. ✅ Article final pass: phases 0/1/2–5 list completed, deadline corrected to "today, Sept. 25", agent cross-report detail added, media placeholder formatted (`[MEDIA: ...]`).
6. ✅ Hygiene: status_bar override cleared; units back to Metric (°C, m/s).

## TODO (in order)
1. **iPhone device frame (user-requested).** Build bezel PNG + soft shadow with Pillow (Pillow IS available; fontTools venv at `/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/fontvenv`). Technique decided: overlay a bezel PNG (dark rounded-rect ring with transparent rounded hole + subtle inner ring stroke) ON TOP of the footage — footage corners get covered by the bezel ring (no alpha-merge of footage needed). Footage = 432x940 (scale of 1206x2622); bezel ≈ 468x976, hole radius ~56px. Add soft blurred shadow PNG behind. Then in `build_video.py` overlay: footage → bezel → text card. QA the bezel on a still frame before rebuild.
2. **Re-record drawer fluidly (user-requested).** From Network rest: slow handle drag `./qa swipe 201 495 201 380 1.3` (or staged: several 0.2s small swipes in sequence), settle ~1.5s; optionally add a horizontal carousel swipe `./qa swipe 300 611 80 611 0.9`. Replace `A2-sheet-expand.mov`.
3. **Agent money shot.** Record ~90s (D4): relaunch, Agent tab, tap input, type "What should we do about the Burner Ridge alert?", Send, wait. Trim later: question+dots ~2s → cut → streaming reply. Check `teaser-d3-agent-stream.png` first; if the stream never got caught, re-record longer.
4. **Update `build_video.py`**: bezel compositing + new A3/D4 clips, re-render, then full contact-sheet QA (`fps=1/3,scale=300:169,tile=6x3`).
5. **Article final pass**: re-read draft, tighten, confirm every stat matches README/sources, drop in final video file reference (X articles take video URLs — user will upload; leave a clean placeholder line), one more antislop read.
6. **Deliverables summary for user**: article text (paste-ready), teaser mp4 path, article embed stills list.
7. **Hygiene** (after all captures): restore units Metric (°C) + Standard map in app Settings; `xcrun simctl status_bar $UDID clear`; the submitted test report stays in the sim's SecureStore (fine).

## Gotchas learned (do not rediscover)
- **`./qa` taps use POINTS (402x874); screenshots are PIXELS (1206x2622).** Tab bar y=819.5: Network 40.2, Alerts 120.5, Agent 201 (center FAB), Lab 281.5, Settings 361.8. Report tab is hidden (`href: null` in `(tabs)/_layout.tsx`) — reached via "Report smoke or fire" CTA (201,721.6) or deep link.
- **`tap-label` failures + `set -e` = script dies and leaves the recorder running.** No `set -e` in capture scripts; always kill leftover `simctl io ... recordVideo` (SIGINT then -9).
- **Recordings are VFR (sparse when static)** — probing with `select=gte(n,30)` misleads; use `ffmpeg -ss <t>` + `-frames:v 1` for ground truth.
- **simctl io fails writing to the external volume** → write captures to `/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture/`.
- **Agent (Agent tab) requires the local proxy on localhost:8377** — it was running; if a re-record shows no reply, check the proxy first.
- Image budget rule (app/qa/README gotcha 10): **max ONE image viewed per turn**; don't re-view images already seen.
- The app runs on a **clearly-labeled scripted simulation** (no backend, no nodes yet) — every caption in the video must stay honest about that (current captions already do).
