# UintaWatch — Positioning & Stance (September 2026)

*Where we stand after the stress-test conversation and our own verification.
Read `research-verification-2026-09.md` first for the evidence.*

---

## The stance in one line

We are re-aiming UintaWatch at a **validated, winnable niche** with
published success criteria we can clear — as an open field lab with a portfolio purpose.
The project is not shutting down, and the lab is not designed to produce a negative result.

## The new thesis

> **UintaWatch is an open, off-grid sensing lab for the detection gaps that cameras and
> satellites provably cannot cover: night smoldering, cloud-obscured events, low-intensity
> smoldering on contained/"extinguished" fires, and far-field smoke discrimination.**
>
> We build reproducible low-cost sensor nodes, test them against real fire and real noise,
> and publish hardware, firmware, protocols, raw data, and failures. The goal is not to
> claim a $100 sensor detects wildfires. The goal is to *match or beat the published
> DHS/NRCan results on radically cheaper open hardware, off-grid* — and to find out
> exactly when cheap detection works and when it does not.

## Why this stance is positive, not a disproof exercise

The January 2026 NRCan study (Fire 9(4):141, DHS-funded sensors) gives us **published,
external bars to clear** instead of self-referential success/failure:

| Published result (NRCan 2026, DHS-vendor sensors) | Our target on open hardware |
|---|---|
| 100% detection, fires >100 ha, median 1.5 km distance | Match, with ~$50–100 open nodes and LoRa/mesh instead of internet backhaul |
| 30% detection, fires ≤1 ha | Improve via multi-node corroboration, wind-aware placement, better event algorithms |
| Nighttime smoldering detected where satellites see nothing | **Primary target — this is where we aim** |
| Far-field regional smoke = major unsolved false-positive source | **Solve it with open data + algorithms — first real contribution** |
| Closed vendor hardware, internet backhaul | Open hardware, off-grid — the differentiation that remains unclaimed |

Clearing these bars is a **positive, publishable, portfolio-worthy result**. If some bars
turn out unreachable, that is a published, useful boundary — not a failed project.

## What we keep, change, retire

**Keep:**
- Open source, build-in-public, community participation — aligned with portfolio/X goals.
- Meshtastic as *one tested transport* and community mode.
- The website + app as the public face and event/data surface.
- Phase-1-style pilot budget (~$1k–1.5k) — it is exactly the right scale.

**Change:**
- Identity: "community wildfire detection network" → "open wildfire sensing lab."
- Primary detection claim: BME688 is one *input under test*, never "the fire detector."
- Wind: from ignored variable to first-class measurement (wind speed + direction on nodes
  and one reference station).
- Benchmark against published numbers (NRCan, DHS OIG), not vibes.
- Dataset strategy: start from NRCan's open MIT-licensed data; add our own controlled-burn
  data with a schema aligned to theirs for direct comparability.

**Retire (from website + app copy):**
- "Primary detection — gas sensing picks up combustion before smoke is visible."
- Any acres-per-node / coverage-radius claim.
- "Satellites are hours old."
- "No cell towers, no satellites" as unqualified autonomy.
- Implicit fire-department notification without a verification layer.

**Two-track separation (from the conversation, adopted):**
1. **Field Lab / UintaBench** (open, research, portfolio): protocols, nodes, datasets,
   leaderboard. This is the identity.
2. **BurnOps-style monitoring** (later, possibly commercial): prescribed-fire smoke/wind
   monitoring kits for people who *intentionally* light fires — labeled-data engine and
   eventual revenue path. Not the identity; do not let it redefine the project yet.

## Audience & narrative

- **For the portfolio/X audience:** hypothesis → instrumentation → experiment → evidence →
  iteration, in public. Failure-as-content only *after* we've aimed at a winnable bar.
- **For the fire community:** we are the people making low-cost wildfire sensing
  *reproducible and honest* — we cite the DHS audit and NRCan study up front.
- **For ourselves:** the next milestone is **real data around real fire on open hardware** —
  ahead of an LLC, a grant, an app, or 100 nodes.

## One-paragraph version (reusable on site/README/X)

> Wildfire detection is full of impressive demos. UintaWatch is an open field lab for
> low-cost wildfire sensing: we build open sensor nodes, run reproducible tests against
> real fire, and publish everything — including failures. Published federal research shows
> ground smoke sensors beat satellites at night and during smoldering events that cameras
> and satellites miss; we're rebuilding that capability on open hardware, off-grid, for a
> fraction of the cost, and measuring exactly where cheap detection stops working.
