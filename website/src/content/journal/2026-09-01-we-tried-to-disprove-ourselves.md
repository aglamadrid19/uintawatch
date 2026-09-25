---
title: We tried to disprove ourselves
date: 2026-09-01
summary: We asked another AI to break the UintaWatch thesis, then verified every key claim ourselves. The sensor physics didn't survive. Here's what we found, sources included.
tags: [research, verification, history]
---

Before going further, we stress-tested the thesis. The result: **the "community early wildfire detection network" framing was substantially disproven.** Then we re-verified the critique claim-by-claim rather than taking it on faith. This entry is the record.

## The verdict that hit hardest: DHS already tried this

From 2020–2024, DHS Science & Technology funded **N5 Sensors** to deploy ground-based wildfire detection sensors — a far more sophisticated stack than ours: multimodal chemical, particulate, and thermal sensing, AI anomaly detection, cloud software, solar power, and LoRa/cellular/satellite backhaul.

In April 2026, the DHS Office of Inspector General concluded those sensors **"did not consistently detect wildfires or provide early warning."** One sensor less than 100 feet from a fire alerted 30 minutes after the fire department had already dispatched. Fires were missed because wind blew smoke away from the sensors. DHS ended the contract with no plans to renew (Report OIG-26-05, April 27, 2026).

If a multimodal, AI-assisted, federally funded system couldn't consistently deliver, a $35 BME688 on a Meshtastic node doesn't leapfrog it by being cheaper.

## The physics problem we're retiring from our site

Our sensors page claimed the BME688's gas sensing "detects combustion in the air before visible smoke appears" as the system's **primary detection** mechanism. That claim doesn't survive outdoor geometry:

- A camera sees a smoke column from kilometers away.
- A gas sensor must be physically exposed to the plume.
- Plume transport depends on wind direction, atmospheric stability, terrain, inversions, and canyon effects — exactly the factors the DHS audit cited as causing missed detections.

For scale: the open-source BioBot project demonstrated its BME688 + particulate sensor detecting smoke through obstruction at **~7 meters** in real controlled burns.

## The landscape squeeze

- **Watch Duty** reached 16.8M yearly active users in 2025 with trained human verification across the US. The "community wildfire information network" already exists at national scale.
- **Pano AI** cameras are already deployed in Utah — and already detected a real fire start at Lewis Peak for the North Summit Fire District.
- **NASA FIRMS** now offers Ultra Real-Time fire detections under 60 seconds for much of the US and Canada — our old "satellites are hours old" line was obsolete.

## Why we're telling you this

Because we'd rather publish our disproofs than have someone else find them. Every claim on this site from now on will carry a source or an explicit "unknown" label. The next entry explains where we landed.
