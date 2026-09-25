#!/bin/zsh
# UintaWatch teaser capture v2 — flows B–F + expanded-sheet fix-up. Resilient: no set -e.
UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4
QA="/Volumes/CrucialX10/uintawatch/app/qa/qa"
FRAMES=/Volumes/CrucialX10/uintawatch/planning/teaser/frames
VIDS=/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture
LOG=/Volumes/CrucialX10/uintawatch/planning/teaser/capture2.log
export QA_UDID=$UDID
: > "$LOG"

snap() { $QA snap "$1" >/dev/null 2>&1 && cp "$QA/screenshots/$1.png" "$FRAMES/" && echo "snap $1 ok" >> "$LOG"; }

rec() { xcrun simctl io $UDID recordVideo --codec h264 --force "$VIDS/$1.mov" >/dev/null 2>&1 & RECPID=$!; sleep 1; echo "rec start $1" >> "$LOG"; }
endrec() { kill -INT $RECPID 2>/dev/null; sleep 2; kill -9 $RECPID 2>/dev/null; echo "rec end $1" >> "$LOG"; }
d() { $QA describe >> "$LOG" 2>&1; }
tl() { $QA tap-label "$1" >> "$LOG" 2>&1; }

# ---------- Fix-up A2: sheet expansion (handle drag) ----------
$QA tap-label "^Network, tab" >/dev/null 2>&1
sleep 3
rec A2-sheet-expand
$QA swipe 201 495 201 300 0.8            # drag the handle itself upward
sleep 3.5
snap teaser-a2-sheet-expanded
d
$QA swipe 201 300 201 700 0.8
sleep 2
endrec A2-sheet-expand

# ---------- Flow B: sensor card -> node detail ----------
rec B-node-detail
tl "HFENS-Burner-Ridge-01.*view details"
sleep 3
d
snap teaser-b-node-detail
$QA swipe 201 680 201 280 0.5
sleep 2.5
snap teaser-b-node-detail2
tl "^Back"
sleep 2
endrec B-node-detail

# ---------- Flow C: alerts feed -> alert detail ----------
rec C-alerts
tl "^Alerts, tab"
sleep 3
d
snap teaser-c-alerts
tl "Smoke detected" 2>/dev/null || tl "alert" 2>/dev/null
sleep 3
d
snap teaser-c-alert-detail
tl "^Back" 2>/dev/null
sleep 2
endrec C-alerts

# ---------- Flow D: agent streaming ----------
rec D-agent
tl "^Agent, tab"
sleep 2.5
d
snap teaser-d-agent-top
tl "fire risk" 2>/dev/null || tl "risk" 2>/dev/null
sleep 12
snap teaser-d-agent-reply
sleep 2
endrec D-agent

# ---------- Flow E: report typed + submitted ----------
rec E-report
tl "^Report"
sleep 2.5
d
tl "Describe|describe|observed|Observed|What" 2>/dev/null
sleep 1
$QA text "Smoke column rising off the ridge line, drifting east with the wind." >> "$LOG" 2>&1
sleep 2
snap teaser-e-report-typed
tl "Submit"
sleep 3
snap teaser-e-report-success
sleep 2
endrec E-report

# ---------- Flow F: lab leaderboard ----------
rec F-lab
tl "^Lab, tab"
sleep 3
d
snap teaser-f-lab
$QA swipe 201 650 201 250 0.6
sleep 2.5
snap teaser-f-lab2
endrec F-lab

$QA tap-label "^Network, tab" >/dev/null 2>&1
echo "--- capture2 done ---" >> "$LOG"
ls -la "$VIDS" >> "$LOG"
