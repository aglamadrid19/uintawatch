---
title: Where we started
date: 2026-09-01
summary: Two sprint weekends, one thesis — cover Utah's wildlands with community-built solar mesh sensors that detect fires before smoke is visible. Here's what we built and what we believed.
tags: [origin, history]
---

Uinta Watch started on **August 29, 2026** with a first commit at 22:22 and an X account the same day. The idea was straightforward and urgent:

> Fires in Utah start where infrastructure ends — no cell signal, no grid power, and satellites that are stale by the time they process. The gap between smoke starting and someone reacting is measured in hours. Solar-powered LoRa mesh sensors on canyons and ridgelines could detect heat, dry air, and combustion-gas signatures before visible smoke, relay alerts over a self-healing Meshtastic mesh to internet gateways, and feed a public map, alert feed, and citizen-reporting app.

The problem is real and well documented: over 1.2 million acres burned in Utah since 2015, a $240 million firefighting season in 2025, 180+ structures destroyed in 2026, and roughly 75% of Utah's wildfires human-caused — which means *catchable* early. Figures compiled from Deseret News wildfire reporting (Aug 2026), the Utah State Forester, and federal incident reports; year-by-year detail and citations in the repo's planning/utah-wildfire-research.md.

## What we built in two weekends

In two weekends, we built a mobile app — React Native 0.86 + Expo SDK 57, with a sensor map (status pins), an alert feed, a smoke/fire report form with GPS pre-fill, and sensor detail routes, offline-first with automatic fallback to bundled sample data. The website, Astro + Tailwind, went live at uintawatch.com with a phased rollout plan, a hardware guide, and a Playwright QA suite. The whole thing was built with AI coding agents (opencode + AntSeed free models), custom vision sub-agents for screenshot QA, and a CDP plugin for live browser research.

## What we believed

That detection was fundamentally a hardware and connectivity problem: build enough ~$100 nodes, get them onto strategic ridgelines, and early detection follows.

That belief is the subject of the next entry — because we put it on trial.
