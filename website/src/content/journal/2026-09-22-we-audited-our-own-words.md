---
title: We audited our own words for AI slop
date: 2026-09-22
summary: "This month we pledged that every claim on this site would carry a source. Then we ran a slop detector over the whole repo to see if the writing itself held up. Here's what it found, and what we changed."
tags: [transparency, writing]
---

Last week this site made a pledge: every claim carries a source. The pledge covered citations. It didn't cover the prose. So before letting this post loose, we ran an AI-slop audit over the whole repo and published the scores, warts included.

## The setup

We loaded [the-antislop](https://github.com/aplaceforallmystuff/the-antislop), an MIT-licensed detector built on Wikipedia's [Signs of AI Writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), and pointed it at three targets: nine planning documents, every page and journal post on this site, and every user-facing string in the app. Audit first, no edits. Then we fixed what it found and re-scored.

## The numbers, self-scored

The planning set told the real story. `technical-architecture.md` scored 0. The wildfire research doc scored 2, and it earned that only through one verb choice. The app's prose topped out at 4, mostly because our simulated alert feed writes like a machine, which for a sensor network is arguably correct.

The marketing copy was a different story. `README.md` scored 15. The get-involved page scored 11. The preamble draft hit 31, the highest score in the repo, and it earned that by failing the detector's core test: could anyone have written this, for anyone? Swap "Utah" for another state and it still reads fine. That's the problem.

## What it actually caught

Vocabulary was never the issue. No "delve," no "seamless," no "cutting-edge" anywhere in the repo. What caught us was shape.

Three fragments in a row, deployed as a homepage headline: "Solar-powered. Mesh-connected. Open by default." The same shape twice within three lines on the get-involved page: "Every ridge. Every canyon. Every neighbor watching." The verification log contained six separate "it's X, not Y" constructions. And the tagline about ridges and canyons watching appeared verbatim in four different files, which is the writing equivalent of sampling your own chorus.

The embarrassing finding was one we should have predicted. The homepage stat cards carried four hard numbers with no citation at all, in the same month the journal promised that every claim would carry a source. The audit caught us before a reader could.

## What changed

The fragments became sentences with actual connective tissue. Six of the seven "X, not Y" comparators went, and we kept the ones that carry weight ("We didn't kill the project. We changed what it claims to be." stays; a benchmark line against published numbers stays). Every headline statistic now cites the reporting it comes from: Deseret News wildfire coverage from August 2026, the Utah State Forester, and federal incident reports, all traceable through `planning/utah-wildfire-research.md` in the [project repo](https://github.com/aglamadrid19/uintawatch). The README's BME688 claim now matches what the pivot post says, instead of quietly disagreeing with it.

One file we're calling a false positive. The September verification log scored 15 on raw points, but every point came from its habit of saying what a thing *isn't*. It's also the most sourced document in the repo, with a DOI and a dated IG report behind nearly every line. We kept two of its comparators and let the rest go.

The rebuild score for everything we touched: 4 or below. The preamble went from 31 to 8, which is the difference between copy that was written at you and copy someone actually made choices in.

## Why publish this

A lab that measures its own detection claims in public should apply the same treatment to its own voice. The clichés are now in this post too, which felt like the honest place for them.
