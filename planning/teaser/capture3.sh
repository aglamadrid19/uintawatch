#!/bin/zsh
# capture3: A3 = fluid sheet open/close; D4 = agent stream with a 90s window.
UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4
QA="/Volumes/CrucialX10/uintawatch/app/qa/qa"
FRAMES=/Volumes/CrucialX10/uintawatch/planning/teaser/frames
VIDS=/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture
LOG=/Volumes/CrucialX10/uintawatch/planning/teaser/capture3.log
export QA_UDID=$UDID
: > "$LOG"
snap(){ $QA snap "$1" >/dev/null 2>&1 && cp "$QA/screenshots/$1.png" "$FRAMES/" 2>/dev/null; }
rec(){ xcrun simctl io $UDID recordVideo --codec h264 --force "$VIDS/$1.mov" >/dev/null 2>&1 & RECPID=$!; sleep 1; }
endrec(){ kill -INT $RECPID 2>/dev/null; sleep 2; kill -9 $RECPID 2>/dev/null; }

# ---------- A3: fluid sheet open/close ----------
$QA tap-label "^Network, tab" >> "$LOG" 2>&1
sleep 3
rec A3-sheet-fluid
$QA swipe 320 611 120 611 0.9      # carousel swipe (cards slide)
sleep 1.5
$QA swipe 201 495 201 430 1.1      # slow drag stage 1 on handle
sleep 0.4
$QA swipe 201 430 201 310 1.3      # slow drag stage 2 -> expanded
sleep 2.5
snap teaser-a3-expanded
$QA swipe 201 330 201 420 1.0      # drag down a little
sleep 1.0
$QA swipe 201 420 201 780 1.2      # collapse
sleep 2.5
endrec A3-sheet-fluid

# ---------- D4: agent, long window ----------
$QA relaunch >/dev/null 2>&1
sleep 7
rec D4-agent-stream
$QA tap-label "^Agent, tab" >> "$LOG" 2>&1
sleep 2.5
$QA tap-label "Ask the Uinta Agent" >> "$LOG" 2>&1
sleep 1
$QA text "What should we do about the Burner Ridge alert?" >> "$LOG" 2>&1
sleep 1
$QA tap-label "Send message" >> "$LOG" 2>&1
sleep 78
snap teaser-d4-agent-stream
sleep 4
endrec D4-agent-stream
echo done >> "$LOG"
