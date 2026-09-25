---
name: qa-audit
description: Project skill. Run a skills-based design / UX / React-Native audit of the UintaWatch app during or after a simulator QA sweep. Use when the user asks to "audit the app's UI/UX", "run a design audit", "QA the app against best practices", "score the screens", or as the mandatory rubric step of any visual QA pass in `app/qa/`. Criteria are drawn from the sibling skills `mobile-app-ui-design`, `expo-design-system` (its references/audit.md), `expo-native-ui`, and `expo-ui` — load those for the full rules; this skill defines the checklist, the workflow, and the scorecard format recorded in `app/qa/QA-FINDINGS.md`.
version: 1.0.0
license: MIT
---

# QA Design & UX Audit

A QA sweep that only hunts functional bugs misses design problems (the
Dynamic Island header collision, V1, was found by luck). This skill makes the
audit rubric explicit: every visual QA pass grades the screens against
criteria sourced from the installed design and Expo skills, and records the
result in `app/qa/QA-FINDINGS.md`.

## Criteria sources (load these first)

| Source | What it contributes |
|---|---|
| `../mobile-app-ui-design/SKILL.md` | Visual hierarchy, thumb zone, empty/loading/error states, interaction feedback |
| `../expo-design-system/SKILL.md` + `references/audit.md` | Token drift checks (hardcoded colors/spacing/fonts/radii/shadows) and scoring rubric |
| `../expo-native-ui/SKILL.md` | HIG conventions, semantic colors, native controls, safe areas |
| `../expo-ui/SKILL.md` | When a screen should use native `@expo/ui` components instead of hand-rolled ones |

The project's theme (`src/theme/`) is the source of truth for all value
checks — audit against it, not against skill examples.

## The checklist

### A. Visual design (per screen)

- [ ] **Visual hierarchy** — one clear focal element; F-pattern reading order
- [ ] **Alignment & spacing** — values come from `src/theme` tokens
      (`spacing`, `radius`); no ad-hoc 13pt paddings
- [ ] **Contrast** — body text ≥ 4.5:1 against its background (check the
      muted/hint text colors especially)
- [ ] **Touch targets** — every tappable element ≥ 44×44pt (verify with
      `./qa describe` frames, not by eye)
- [ ] **Safe areas** — header, banners, and scrolled content clear the
      Dynamic Island / status bar, at rest AND while scrolled (the V1/V2/V4
      bug class)
- [ ] **No truncation or overlap** — headings vs subtitles, long strings,
      values with units (the V3 bug class)

### B. UX structure (per flow)

- [ ] **Primary action in the thumb zone** (bottom third)
- [ ] **Empty states** guide with a CTA, not just text
- [ ] **Loading and error states** exist for every async surface
- [ ] **Action feedback** — submit success/failure is visible; offline
      behavior is stated honestly (the B2 over-promising alert class)
- [ ] **Reduced interaction cost** — key content not buried behind taps

### C. Design-system drift (static, no simulator needed)

Run the grep battery from `../expo-design-system/references/audit.md` §1
against this project's source dirs (`app app src` per its layout, theme =
`src/theme`), then score per category:

> score = hits per 100 SLOC — < 0.5 healthy, 0.5–2.0 drifting, > 2.0 systemic

Include legacy shadow props (`shadowColor|Offset|Opacity|Radius`,
`elevation`) and multiple theme entry points in the checks.

### D. React Native / Expo best practice

- [ ] **accessibilityLabels** present on interactive elements AND correct
      (units, state — the B1 label bug class; verify via `./qa describe`)
- [ ] **Token usage** — no hardcoded colors/typography outside `src/theme`
- [ ] **Virtualization** — long feeds use FlatList/FlashList, not `.map` in
      a ScrollView
- [ ] **Persistence/offline** — user data survives relaunch; nothing is
      lost silently
- [ ] **Platform fit** — native controls where the HIG expects them
      (pickers, switches, grouped sections)

## Workflow

0. **Pre-flight** — `app/qa/README.md` gotcha 9: verify the installed bundle
   is fresh before trusting any result.
1. **Static pass first** (cheap, no simulator): run the §C drift greps and
   the a11y-label grep (`accessibilityLabel` coverage over tappable
   components in `app/app` and `src/components`). Record scores.
2. **Per-screen visual pass**: navigate (deep link `./qa nav <route>` or
   tabs), `./qa describe`, `./qa snap audit-<screen>`, then grade the
   screenshot against §A/§B.
   - **Gotcha 10 applies fully: ONE screenshot viewed per turn, never
     re-view one.** Grade from the a11y tree wherever possible (touch
     target frames, labels) and view only what vision is needed for.
3. **Scorecard**: for each screen (index/Network, Alerts, Report, Lab,
   Settings, node detail, report detail), a pass/fail line per checklist
   item, with the evidence screenshot named.
4. **Record** in `app/qa/QA-FINDINGS.md` under a `## Design & UX audit`
   heading: scorecard, new findings as `V#` (visual) or `U#` (UX) entries
   with evidence paths, and fix status tracked like bug findings.

Report findings first; apply fixes only when asked — same rule as the
design-system audit.
