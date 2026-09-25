---
title: What comes next
date: 2026-09-22
summary: The working roadmap — from reproducing published federal results on open data, to five deliberately different node configs, to first field numbers around partnered prescribed burns.
tags: [roadmap, experiments]
---

Here's the working plan, in public, with the gates that decide each step.

## Phase 0 — Data bootstrap (now)

Before building hardware, the lab starts from **data that already exists**: the DHS-purchased, Canadian-field-tested sensor dataset (MIT license, Zenodo 10.5281/zenodo.18222779). First deliverables:

- Reproduce the study's headline numbers from their raw data
- Define the **UintaBench** schema — fire, sensor, geometry, environment, and results fields aligned to the published study so our results are directly comparable
- Stand up the public leaderboard table, with every benchmark cell to be filled from real field data

## Phase 1 — Honest copy (now)

Retire every claim the DHS audit and the physics undermine; label hypotheses as hypotheses; add the Open Questions page. Cheap diffs, large credibility.

## Phase 2 — Five deliberately different node configs

Five *comparable* configurations, built in pairs:

- **A:** BME688 only (baseline, comparable to other open BME688 projects)
- **B:** BME688 + PM2.5 (the actual smoke signal)
- **C:** B + CO (combustion indicator)
- **D:** C + wind measurement (wind is first-class data)
- **E:** environment-only **negative control** — the false-positive reference node

## Phase 3 — Real data path

The backend comes up schema-first around UintaBench (raw time-series ingest, known burn events, negative events, CSV export). The mobile app points at it when it's ready — no new features until ingest and export work. Groundwork already exists: user reports submitted while offline now persist locally (SecureStore, capped at 50), designed as the offline upload queue this phase will drain.

## Phase 4–5 — Partnered burns, first numbers

Place 3–6 nodes around 3–5 partnered prescribed burns (Utah FFSL / DEQ smoke management windows), run negative-control weeks between burns, then publish:

- Detection probability vs. distance, wind, fuel, and fire size
- Time-to-detection vs. GOES/VIIRS FIRMS, 911, and Watch Duty timelines for the same events
- False alarms per node-day and packet delivery through real terrain

## The clean kill criterion

We keep one from the stress test, reframed positively: if the instruments can't demonstrate earlier, unique, actionable detections than cameras/satellites/911 in at least some repeatable circumstances, early detection remains a research track — and the lab's datasets, protocols, and bench remain the contribution. The project can't really fail anymore; it can only publish.
