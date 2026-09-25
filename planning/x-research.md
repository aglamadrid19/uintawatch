# X/Twitter Research — Uinta Watch (for blog post)

Extraction date: 2026-09-20, via CDP on live Chrome session.
Raw dumps: `aglamadrid_posts.json`, `uintawatch_posts.json`, `thread_a.json`, `thread_u.json`, `assets/` (84 images).

## Accounts

### @moon_kidR (personal)
- Bio: "Tech Freedom Champion | Opinions are my own"
- Tone: enthusiast/general tech content — AI tooling opinions, DKIM/SPF explainers, Utah hashtags, some Spanish
- 255 timeline posts span 2024 → 2026; the project burst in Aug 29–30, 2026, plus one Sept 19 revival post

### @UintaWatch (project)
- Bio: "Utah's community wildfire watch. Open-source sensor mesh · Built by Utahns · See it first, stop it small. 🔥 · @antseed · Aug 30 weekend challenge by @moon_kidR"
- Tone: distinct brand voice built around the tagline "The ridges are watching. Now it's your turn."

## Chronology of shill posts (what was said publicly)

**Aug 29, 2026 (project account launch day):**
- Launch post ×2 (repost): tagline + "Solar-powered LoRa sensors. Real-time alerts. Citizen reporting. No cell towers required." (9–21 views)
- Follow-up with the damage stats: "1.2M acres burned since 2015. $240M firefighting costs in 2025. 180+ structures destroyed in 2026." (21 views)
- "Hello World" ta @AntSeed ta @moon_kidR (97 views — best-early reach)

**Aug 30 (project):**
- 4:32 AM thread "Our first commit is in": 4 posts w/ 1 image. Reveals: repo shipped sub-agents w/ Chrome control for search (captcha-aware), vision subagents for image gen + QA, landing page, mobile app; credits "planning agent" for kickstarting. "This wouldn't have been possible without all the cool tech that's available to all of us for free."
- Asked @grok "how are we moving so far? check on progress" — grok-based progress checks as content
- "first comment from building in public, will pin" (88 views) and "Good feedback 🤠" (102 views — engaged with community replies)

**Aug 30 (personal):**
- 9:23 AM: "iPhone and iPad view for @UintaWatch. I do want to push some more updates… sensor list as a bottom drawer, full-screen map, maybe a custom map like Vercel's" — roadmap-in-public (52 views, 2 imgs)
- 9:44 AM: flagship thread "What am I building at @UintaWatch?" + **6-part thread** on "six trends reshaping software in 2026" (156 views on root, best personal post):
  1/6 AI agents (opencode + AntSeed free models, Gemini vision subagents, Chrome plugin, MCP) — "90% of professional devs…"
  2/6 Offline-first table stakes
  3/6 Edge analytics (~75% of IoT data at edge)
  4/6 LoRa mesh over 5G (Meshtastic 100k+ nodes, LoRaWAN 125M devices) — "Infrastructure you can't take down"
  5/6 Cross-platform newest stack (Expo 57, RN 0.86, React 19, TS 6, EAS)
  6/6 Static-first Astro 7 (prefetch, view transitions, self-hosted fonts, PNG→50KB WebP, AI-generated photography)
- 9:50ish: also context post "Say you identified a problem in your community… that affects millions of lives" (63 views)

**Sept 1:** personal, banter with "Terra" (an AI persona?)

**Sept 19 (both accounts):**
- Personal: "Im on with image models provided on @AntSeed, first generation is out" — new imagery round
- Project: "Now with GLM 5.3 Flash free on @AntSeed and in advance to their Sept 25 build contest we are going for one more weekend of building in the open with free models where possible 😇" (45 views)

## What resonated (engagement)
- Best personal: the 8/30 flagship thread root (156 views, 7 likes, 1 RT, 5 bookmarks) — mostly from a small community of fellow "grok/opencode/antseed" builders replying ("finally a building-in-public project that touches actual grass")
- Best project: the intro video/launch post + first-commit thread (~3–4 views… e.g. 54, 60, 97 views); replies community mostly the same handful (20, 91, 3 likes)
- Community replies include encouraging strangers: "finally a 'building in public' project that touches actual grass"
- Founder replied personally to feedback; mats (low counts overall = early audience, pre-contest)

## Asset/brand notes
- Website brand: serif headlines (DM Serif Display), "Utah is burning. Now it's your turn to watch." hero banner w/ logo + terracotta/cream palette + layered mountain ridge silhouette graphics
- Product shots: 3-phone composite (Sensor Network / Fire Alerts / Report Sighting tabs), showing "8 active sensor nodes", HFENS-* mock sensor names (HFENS-Uintah-01, HFENS-Ouary-01, HFENS-Brinker-Bridge-01), stats bar 8 nodes / 24/7 / 100% open source
- GitHub repo card shared in posts (aglamadrid19/uintawatch)
- Blog voice already largely pre-written in these posts — blog should reuse the "six trends" thread as the skeleton

## Implications for the blog post
1. The "six trends reshaping software in 2026" thread is the strongest narrative spine — reuse it nearly verbatim as section structure
2. Both "wildfire problem" emotional framing (stats) and "AI-agents-are-eating-solo-dev-stack" angle resonate; the latter had more tech-community engagement
3. Community outreach existed: founder engaged every reply personally (good humility angle)
4. Sept 25 AntSeed build contest is the next scheduled moment — blog timing should land before it
5. Don't over-restate the already-used tagline; the blog can go deeper on *how* it was built (opencode, sub-agents, Chrome-CDP research pipeline, mock-first)
