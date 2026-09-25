# Article 2 — draft

Title: We Scored Our Own Project 2/10 in Public. Here's What Survived.

Intro

Last article ended with a question: "Where from here?" I promised a Sept. 25 deadline, the AntSeed contest, first sensors, an App Store review. What actually happened between then and now is a better story than the one I was planning to tell. It starts with a federal audit.

Happy to report: the project didn't die. The thesis did. On purpose, in public, and it got replaced by something stronger.

The audit

In April 2026, the DHS Inspector General published OIG-26-05. Summary: wildfire ground sensors contracted by DHS S&T — built by N5 Sensors, with multimodal chemical, particulate and thermal sensing, AI anomaly detection, cloud software, solar power, and LoRa/cellular/satellite backhaul — "did not consistently detect fires and provide early warning." One sensor sat less than 100 feet from a fire and alerted 30 minutes after the fire department had already dispatched. Other fires were missed because wind blew the smoke away from the sensors. Partners told the IG the alerts gave "no actionable information."

Read that stack again. It is more sophisticated than anything UintaWatch could build this year, on any budget we have.

I'm leading with the audit because I ran the same kind of test against our own thesis — "$100 sensor detects wildfire, mesh carries the alert, community responds early" — in a long stress-test conversation with ChatGPT, and it mostly succeeded in tearing the thesis apart. We could have kept the nice website and the good vibes. Instead we re-verified the disproof ourselves: pulled the OIG report directly, checked the competitor numbers (Watch Duty: 16.8M yearly users; Pano AI already detected a real fire start in Utah; NASA FIRMS streams detections under 60 seconds, so our "satellites are hours old" line was dead on arrival), and scored our own project honestly. As a "reliable public-safety detection network," UintaWatch scored 2/10. The evidence says wildfire detection is not a hardware-cost problem. It's a sensing-physics, placement, validation and trust problem. A $100 node buys the easy part.

The positive twin

Here's the part that kept the project alive. In January 2026, a study in Fire (Natural Resources Canada, 9(4):141) field-tested continuous ground smoke sensors across 20 real fires — and the sensors were purchased by DHS S&T. The same program the audit condemned, used well:

- In 6 of the 10 largest fires, ground smoke sensors beat satellites on time-to-first-detection.
- 100% detection of fires over 100 hectares at a median distance of ~1.5 km.
- 30% detection on fires under 1 ha — an honest limit, published as such.
- And the validated niche: nighttime smoldering, cloud-obscured events, and monitoring "extinguished" fires — exactly where satellites see nothing.

That same study's dataset is open (MIT license). So the lab's first experiments can run on real labeled fire data before a single node exists.

What changed

Not the mission. The claim. Here's what changed:

- From "community early wildfire detection network" to an open field lab for low-cost wildfire sensing.
- The BME688 gas sensor went from "the fire detector" to "one input under test."
- Wind went from ignored variable to first-class measurement.
- Every claim on the website got re-audited against the sources; the ones that didn't survive are gone. We added an Open Questions page, and a journal that publishes what breaks.
- Five deliberately different node configs, including a negative-control node whose entire job is to produce false positives — because an honest benchmark needs a reference for what "wrong" looks like.
- UintaBench: a public leaderboard where every cell starts as "?" and gets filled in against real burns. Negative tests count as results.

The line we kept from the stress test, reframed: the project can't really fail anymore. It can only publish.

What we shipped since the last article

The app got its 2.0 rebuild, and the discipline changed with the thesis:

- A new home screen — live map, pulsing branded markers, dark-glass callouts, sensor carousel — where every pixel of the callout is ours now. (The fix was one boolean: react-native-maps' `tooltip` prop means the exact opposite of what its name says. That bug survived a week by hiding behind its own name.)
- An Agent tab: ask "what's the fire risk right now?" and it answers grounded in the same network snapshot the map shows — my favorite moment: it cited a community report I'd filed through the app a minute earlier. First rule we gave it: admit that every reading is simulation, never invent a sensor. An assistant that over-trusts its data is worse than no assistant.
- A Lab tab: the UintaBench table, in the app, starting as a wall of question marks.
- Settings that actually do what they say (units, map type) — after QA found the units preference was decorative.
- A report flow that no longer lies: the old success alert promised your sighting hit the public feed while storing it nowhere. Now it persists locally, and that store is the seed of the real backend's offline upload queue.

Seven bugs in the last QA sweep. Three functional, four visual, all ours, all published with evidence. My favorite war story from the pass: two QA sessions died mid-sweep, and in both cases the app was fine — the AI agent running the QA killed itself, once by loading two screenshots in one turn, once by re-reading screenshots it had already seen until the context overflowed. A third lesson is now a pre-flight rule: never file a bug against code whose bundle you haven't verified is fresh — a stale embedded bundle produced a very convincing false bug.

If you're keeping score at home: AI agents built the app, QA'd the app, broke the QA sessions, wrote the journal, and we published all of it. The humans steered.

Where from here — the answer, for real this time

- Phase 0 (next): reproduce the NRCan study's headline numbers from their open data, lock the UintaBench schema.
- Phase 1 (done): the website message surgery — every claim re-audited against sources, an Open Questions page, a journal that publishes what breaks.
- Phase 2: build configs A–E — roughly $40–110 per node, BOMs and firmware published as they land.
- Phase 3: the backend, schema-first around the bench — raw time series, burn events, negative events, CSV export.
- Phase 4–5: 3–6 nodes around partnered prescribed burns with Utah FFSL / DEQ, then publish detection probability vs. distance, wind and fire size; time-to-detection vs. GOES, 911 and Watch Duty; and false alarms per node-day.

And the deadline: today, Sept. 25, the AntSeed contest closes. I'm submitting this article with a teaser video cut from the actual app — no mockups, no Figma.

[MEDIA: uintawatch-teaser.mp4 — 60s, 1080p, silent. Record the VO over it.]

None of the inference that built this cost me more than a few dollars. Research, verification, code, QA, visuals — mostly free through the providers in the AntSeed network. That's the whole point of what AntSeed is doing, and the reason a weekend project from Utah can afford to be honest in public.

The ridges are still watching. Now they keep a lab notebook, too.

Code: https://github.com/aglamadrid19/uintawatch
Site: https://uintawatch.com
