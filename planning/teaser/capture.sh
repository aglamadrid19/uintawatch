#!/bin/zsh
# UintaWatch teaser capture — Release build on UW iOS27 simulator.
# Records 6 flows + hi-res stills. No dev-client gear (Release config).
set -e

UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4
QA="/Volumes/CrucialX10/uintawatch/app/qa/qa"
FRAMES=/Volumes/CrucialX10/uintawatch/planning/teaser/frames
VIDS=/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture
export QA_UDID=$UDID
mkdir -p "$FRAMES" "$VIDS"

rec() { # rec <name> — starts recording
  xcrun simctl io $UDID recordVideo --codec h264 --force "$VIDS/$1.mov" &
  RECPID=$!
  sleep 1
}
endrec() {
  kill -INT $RECPID 2>/dev/null || true
  wait $RECPID 2>/dev/null || true
  echo "recoded: $1"
}

snap() { $QA snap "$1" >/dev/null; cp "$QA_DIR_SHOTS/$1.png" "$FRAMES/" 2>/dev/null || true; }
QA_DIR_SHOTS=/Volumes/CrucialX10/uintawatch/app/qa/screenshots
snap() { $QA snap "$1" >/dev/null; cp "$QA_DIR_SHOTS/$1.png" "$FRAMES/"; }

# ---------- Flow A: home map pulse + sheet drag ----------
$QA relaunch
sleep 7
rec A-home-pulse
sleep 6                                  # pulsing markers + alert banner
$QA swipe 201 812 201 400 0.8            # drag sheet up (expanded)
sleep 4
snap teaser-a-sheet-expanded
$QA swipe 201 300 201 700 0.8            # collapse back
sleep 2
endrec A-home-pulse

# ---------- Flow B: marker callout -> node detail ----------
rec B-callout-node
$QA tap 258 250                          # tap marker cluster
sleep 2.5
$QA tap-label "Tap for details"          # dark glass callout
sleep 3
snap teaser-b-node-detail
$QA swipe 201 700 201 300 0.5            # scroll readings/chart
sleep 2.5
snap teaser-b-node-detail2
endrec B-callout-node

# ---------- Flow C: alerts ----------
rec C-alerts
$QA tap-label "^Alerts, tab"
sleep 3
snap teaser-c-alerts
$QA tap-label "1 active alert, view alert feed" 2>/dev/null || $QA tap 171 156
sleep 3
snap teaser-c-alert-detail
endrec C-alerts
$QA tap-label "^Network, tab"
sleep 2

# ---------- Flow D: agent streaming ----------
rec D-agent
$QA tap-label "^Agent, tab"
sleep 2.5
snap teaser-d-agent-top
$QA tap-label "What.*fire risk|fire risk" 2>/dev/null || $QA tap 201 700
sleep 10                                 # streaming reply
snap teaser-d-agent-reply
sleep 2
endrec D-agent

# ---------- Flow E: report submit ----------
rec E-report
$QA tap-label "^Report"
sleep 2.5
$QA tap-label "describe|Describe|observed|Observed" 2>/dev/null || $QA tap 201 500
sleep 1
$QA text "Smoke column rising off the ridge line, drifting east with the wind."
sleep 2
snap teaser-e-report-typed
$QA tap-label "Submit"
sleep 3
snap teaser-e-report-success
sleep 2
endrec E-report

# ---------- Flow F: lab leaderboard ----------
rec F-lab
$QA tap-label "^Lab, tab"
sleep 3
snap teaser-f-lab
$QA swipe 201 650 201 250 0.6
sleep 2.5
snap teaser-f-lab2
endrec F-lab

# ---------- Stills: settings ----------
$QA tap-label "^Settings, tab"
sleep 2.5
snap teaser-g-settings
$QA tap-label "^Network, tab"

echo "--- all captures done ---"
ls -la "$VIDS"
ls "$FRAMES"
