---
title: The map learned to talk back
date: 2026-09-24
summary: "A streaming field agent inside the app, callouts that finally look like ours instead of Apple's, and two findings from a v4 QA pass — both fixed the same night. The interesting bug was an inverted boolean we'd been misreading for a week."
tags: [agent, design, qa, transparency]
---

The last entry ended with the QA pass and a list of things we hadn't built yet. The next evening we built the loudest one: the app now has an agent.

## The Agent tab

A new tab in the app opens a chat. Ask "What's the fire risk right now?" and the reply streams in, grounded in the same network the map is showing: which nodes are offline, what their batteries read, where the alert clusters sit, what the anomalies look like. It's a plain chat surface — suggested prompts, a keyboard-aware input, streaming replies — wired to a local OpenAI-compatible proxy, the same endpoint our dev tooling already used. Nothing about the app's data pipeline changed; the agent reads the snapshot the app renders.

Two constraints mattered more than the streaming. The first is honesty: the system prompt states flat-out that every reading is scripted simulation, and tells the model never to invent sensors or reports that aren't in the snapshot. When there's no physical network yet, an assistant that over-trusts its data is worse than no assistant. The second is format: we demanded plain text — no bold markers, no headings, no pipe tables — because markdown syntax rendered raw inside a chat bubble is exactly the kind of polish gap we published an entire entry about. The QA sweep confirmed the rule holds under streaming, not just for one-shot answers.

## Callouts, unpilled

While the agent work settled, we went after a visual debt the map had carried since it shipped: both callouts — sensor detail and community report — rendered as dark glass pills, but each one sat *inside* Apple's stock white bubble, with its pointer tail, like a letter pasted onto someone else's envelope.

The fix taught us something we should log publicly: we had the `tooltip` prop backwards. In react-native-maps, `tooltip={false}` (the default) is what draws the stock white background; `tooltip={true}` swaps in an empty one so your custom children *are* the entire callout. Our design intent said "not a tooltip," so we wrote `false` — and the native source (`AIRMapMarker.m`, `fillCalloutView`) says exactly the opposite of what the name implies. One boolean flip later, the pills render as pure dark glass: sensor ID without the `HFENS-` prefix, uppercase status, the big temperature line, wind and RH, a "Tap for details →" hint, and tap-through navigation intact on both marker types.

The same pass gave the branded markers a pulse — a looping ripple ring driven by the native animation driver, scaled by status — and cleaned the last design-system drift finding: the marker disc was the one file in the app still using raw legacy shadow props instead of the theme's shadow tokens. It isn't anymore.

## QA v4, in numbers

The full headless pass ran ten checks. Nine passed. Two new findings surfaced — the white callout backing and the raw shadows — and both were fixed and re-verified live before the session ended. One limitation we're accepting in writing rather than pretending away: the network-status chips can overlap a callout anchored near the top of the map, and the event-driven fix we attempted had to be reverted because this version of react-native-maps doesn't deliver marker selection events reliably. It's logged in the findings file with the attempted approach and why it flickered, so whoever picks it up doesn't re-attempt the same dead end.

Everything else held: the sheet expands by tap *and* by handle drag, the carousel metric row doesn't collide, ribbon-to-alerts and report-to-form flows pass, `tsc` is clean, attribution line present in both sheet states.

## Why publish this

The agent is the first piece of this project that talks back, and the first rule we gave it is to admit what it doesn't know. That's the same rule the journal runs on. An inverted boolean that survived a week because a prop name means the opposite of what it says is a small bug — but it's the honest kind, found by a checklist, fixed in minutes, and documented so the next person reads the native source instead of the prop name.
