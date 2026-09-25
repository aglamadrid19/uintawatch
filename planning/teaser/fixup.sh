#!/bin/zsh
# Fix-up pass: alert detail + report flow (CTA path), both recorded.
UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4
QA="/Volumes/CrucialX10/uintawatch/app/qa/qa"
FRAMES=/Volumes/CrucialX10/uintawatch/planning/teaser/frames
VIDS=/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture
LOG=/Volumes/CrucialX10/uintawatch/planning/teaser/fixup.log
export QA_UDID=$UDID
: > "$LOG"
snap() { $QA snap "$1" >/dev/null 2>&1 && cp "$QA/screenshots/$1.png" "$FRAMES/" && echo "snap $1 ok" >> "$LOG"; }
rec() { xcrun simctl io $UDID recordVideo --codec h264 --force "$VIDS/$1.mov" >/dev/null 2>&1 & RECPID=$!; sleep 1; }
endrec() { kill -INT $RECPID 2>/dev/null; sleep 2; kill -9 $RECPID 2>/dev/null; }

# ---------- C-fix: alert detail ----------
rec C2-alert-detail
$QA tap-label "^Alerts, tab" >/dev/null 2>&1
sleep 3
$QA tap-label "Critical, 6m ago" >> "$LOG" 2>&1
sleep 3.5
$QA describe >> "$LOG" 2>&1
snap teaser-c2-alert-detail
sleep 1.5
$QA tap-label "^Back" >/dev/null 2>&1
sleep 2
endrec

# ---------- E-fix: report flow via CTA ----------
$QA tap-label "^Network, tab" >/dev/null 2>&1
sleep 2.5
rec E2-report
$QA tap-label "Report smoke or fire" >> "$LOG" 2>&1
sleep 2.5
$QA describe >> "$LOG" 2>&1
snap teaser-e2-report-form
$QA tap-label "Describe|describe|observed|Observed|What did|location" >> "$LOG" 2>&1
sleep 1
$QA text "Smoke column rising off the ridge line, drifting east with the wind." >> "$LOG" 2>&1
sleep 1.5
snap teaser-e2-report-typed
$QA tap-label "Submit" >> "$LOG" 2>&1
sleep 3
$QA describe >> "$LOG" 2>&1
snap teaser-e2-report-success
sleep 2
endrec

echo "--- fixup done ---" >> "$LOG"
