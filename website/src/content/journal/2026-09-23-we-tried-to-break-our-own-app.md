---
title: We tried to break our own app
date: 2026-09-23
summary: "Seven bugs, three of them functional, all of them ours. A headless simulator QA pass found them, fixed them, and left two sessions dead on the floor — both killed by the agent running the QA, not the app. Here's the log."
tags: [qa, testing, transparency]
---

The writing audit covered our words. The code needed the same treatment. So on September 22 we ran the mobile app through a full headless QA pass — every interaction driven from the terminal through `idb` and `simctl`, no cursor automation, screenshots kept as evidence — on an iOS 18.4 simulator, then repeated the sweep on an iOS 27 device. Seven bugs. We're publishing all of them.

## The functional bugs

**B1 — The units preference was decorative.** Settings offered Metric or Imperial, persisted the choice across relaunches, and then every screen ignored it. Cards, map callouts, wind chips, and charts read raw values and hardcoded metric. Selecting Imperial produced a settings screen that said Imperial and an app that stayed metric. The fix routes all five components through one formatting store, accessibility labels included, and the re-test rendered `87.4° / 9.2 mph` where the day before it rendered `30.3° / 3.5`.

**B2 — The success alert lied.** Submit a community report while the app showed its offline banner, and you got an alert promising "Your sighting is now in the community feed and on the public map." Relaunch, and the report was gone — nothing was persisted anywhere. This is the same failure mode the slop audit caught in our prose: the interface claiming more than the system does. The fix persists user reports locally (SecureStore, debounced writes, capped at 50) and hydrates them on launch. That local store is now the seed of the offline upload queue the real backend will need in Phase 3.

**B3 — Community reports weren't tappable.** The report cards rendered without any press handler on both the Alerts tab and the Network tab, and no detail screen existed. Tapping a report scrolled the list. We built the detail route — full observation text, photo when present, verified/unverified banner, coordinates on a mini map — and wired tap-through from every place a report card appears.

## The visual bugs, one root cause

Four findings, and they shared a cause: the app didn't account for safe-area insets on the newer iPhone layout. The branded header sat partially behind the Dynamic Island on two tabs, the offline banner was clipped by it, the Lab tab's heading collided with its own subtitle, and scrolling pushed content up under the clock. Three of the four disappeared with proper inset handling; the fourth needed the header moved outside its scroll container.

The irony is that a project whose first journal entry is about sensors on ridgelines spent an evening fixing things hiding behind a notional island.

## The two sessions we lost to ourselves

Both QA sessions that day ended in `failed`, and in both cases the app under test was fine. The agent running the QA killed the session.

The first died after loading two screenshots in one turn. Once a session overflows on images, resuming fails too — "please continue" was tried twice and produced nothing. All progress survived only because findings had been written into `QA-FINDINGS.md` continuously, which is now a rule rather than a habit. The second session survived 31 screenshot views by loading one per turn, but it kept re-viewing screenshots it had already seen; each re-read added a full second copy to context, and it failed after about 21 MB of session log, mid-regression. A fresh session finished the remaining steps using text-based accessibility checks instead of more images.

**The other trap was quieter.** One device still had a dev-client build embedding a `main.jsbundle` compiled before the report-detail route existed. That stale bundle produced a convincing false bug — an "Unmatched Route" for a route that clearly existed on disk — and hid one of the header fixes. App relaunches, Metro restarts, and deep links didn't help, because the embedded bundle never asked Metro for anything. A rebuild with no embedded bundle fixed everything instantly. The lesson is now encoded as a pre-flight step: never file a bug against code whose bundle you haven't verified is fresh.

## What the pass confirmed

Onboarding, deep links, the report flow with its character counter and success alert, sensor node detail, alert-to-sensor navigation, map type switching, permission handling, and simulated GPS all behaved. Settings choices persist. The app is intentionally locked to light mode — a decision we're recording here because the dark sweep flagged it twice, and now that it's written in public, dark mode is on the list.

Coverage gaps we're logging rather than hiding: photo attachments, push notifications, the Lab sub-pages, iPad layout, map pinch/zoom, and accessibility content sizes. They're listed in [`app/qa/QA-FINDINGS.md`](https://github.com/aglamadrid19/uintawatch/blob/main/app/qa/QA-FINDINGS.md) alongside every fix, root cause, and evidence screenshot, with a regression checklist in the QA README so the next pass — by us or anyone — starts from the same baseline.

## Why publish this

A lab that publishes negative field results should also publish its software failures, including the ones where the failure was the process. Seven bugs found by us beats one found by a stranger with a screenshot. The over-promising alert is the finding we care about most: the app told users something was published when it wasn't, and that instinct — claim first, persist never — is exactly what this project exists to unlearn.
