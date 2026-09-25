#!/bin/zsh
# capture4: A4 = sheet via native expand/collapse taps (spring animation = fluid);
# D5 = agent reply with polling: keep recording until reply text stops growing.
UDID=FCD46F72-A141-4AB5-B0AF-7E1DDF7421C4
QA="/Volumes/CrucialX10/uintawatch/app/qa/qa"
FRAMES=/Volumes/CrucialX10/uintawatch/planning/teaser/frames
VIDS=/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture
LOG=/Volumes/CrucialX10/uintawatch/planning/teaser/capture4.log
export QA_UDID=$UDID
: > "$LOG"
snap(){ $QA snap "$1" >/dev/null 2>&1 && cp "$QA/screenshots/$1.png" "$FRAMES/" 2>/dev/null; }
rec(){ xcrun simctl io $UDID recordVideo --codec h264 --force "$VIDS/$1.mov" >/dev/null 2>&1 & RECPID=$!; sleep 1; echo "rec start $1 pid=$RECPID $(date +%T)" >> "$LOG"; }
endrec(){ kill -INT $RECPID 2>/dev/null; sleep 2; kill -9 $RECPID 2>/dev/null; echo "rec end $(date +%T)" >> "$LOG"; }
sig(){ $QA describe 2>/dev/null | grep "^StaticText" | md5 -q; }

# ---------- A4: sheet ----------
$QA tap-label "^Network, tab" >> "$LOG" 2>&1
sleep 3
rec A4-sheet-spring
$QA tap-label "Expand sensor list" >> "$LOG" 2>&1 || $QA tap-label "View All" >> "$LOG" 2>&1
sleep 2.5
$QA swipe 201 660 201 430 0.7    # scroll the expanded list
sleep 1.5
snap teaser-a4-expanded
$QA tap-label "Collapse sensor list" >> "$LOG" 2>&1
sleep 2.5
endrec

# ---------- D5: agent ----------
$QA relaunch >/dev/null 2>&1
sleep 7
rec D5-agent-stream
$QA tap-label "^Agent, tab" >> "$LOG" 2>&1
sleep 2.5
$QA tap-label "Ask the Uinta Agent" >> "$LOG" 2>&1
sleep 1
$QA text "Which node should we worry about first?" >> "$LOG" 2>&1
sleep 1
$QA tap-label "Send message" >> "$LOG" 2>&1
prev=$(sig); stable=0
for i in $(seq 1 16); do
  sleep 7
  now=$(sig)
  if [ -n "$(ps -p $RECPID -o pid= 2>/dev/null)" ]; then alive=1; else alive=0; fi
  echo "poll $i $(date +%T) stable=$stable alive=$alive" >> "$LOG"
  if [ "$now" = "$prev" ]; then stable=$((stable+1)); else stable=0; fi
  prev=$now
  if [ $alive -eq 0 ]; then rec D5b-agent-stream; sleep 6; fi
  if [ $stable -ge 2 ] && [ $i -ge 2 ]; then break; fi
done
sleep 4
snap teaser-d5-agent-stream
sleep 3
endrec
echo done >> "$LOG"
