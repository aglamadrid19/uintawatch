#!/usr/bin/env python3
# Generates the 13 VO lines with edge-tts (en-US-AndrewNeural).
# Trims leading/trailing silence, then fits each line into its video window,
# bumping rate in small steps only when still overrunning.
import subprocess, os

BASE = "/Volumes/CrucialX10/uintawatch/planning/teaser"
VO = f"{BASE}/vo"
TTS = "/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/ttsvenv/bin/edge-tts"
VOICE = "en-US-AndrewNeural"
os.makedirs(VO, exist_ok=True)

# (cue_s, window_end_s, text)
LINES = [
    (0.30,  3.70, "UintaWatch — an open lab for low-cost wildfire sensing."),
    (4.10,  7.50, "A million acres burned in Utah — most of it, human-caused."),
    (7.90, 11.90, "Eight nodes on one map — a simulation of the mesh we're building."),
    (12.50, 18.60, "Every node, one tap away."),
    (19.20, 23.75, "Battery, wind, mesh health — you can see what a node needs before it fails."),
    (24.30, 29.30, "Alerts explain themselves: what fired, why, and which node corroborates."),
    (29.90, 33.90, "Or just ask the agent."),
    (34.50, 39.20, "It answers from the same data the map sees — and admits it's only a simulation."),
    (39.80, 43.80, "See smoke? Report it."),
    (44.30, 46.00, "Type what you see."),
    (46.40, 49.40, "It persists offline until the backend exists."),
    (50.00, 53.80, "Data, failures, receipts — all published in the open."),
    (54.30, 59.60, "The ridges are watching. Now they keep a lab notebook, too."),
]

TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse")

def run(args):
    return subprocess.run(args, capture_output=True, text=True)

def dur(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path])
    return float(r.stdout.strip())

report = []
for i, (cue, end, text) in enumerate(LINES):
    window = end - cue
    raw = f"{VO}/raw{i:02d}.mp3"
    out = f"{VO}/line{i:02d}.wav"
    rate = 0
    for attempt in range(4):
        args = [TTS, "--voice", VOICE, "--text", text, "--write-media", raw]
        if rate:
            args += ["--rate", f"{rate:+d}%"]
        r = run(args)
        if r.returncode:
            print(f"line{i:02d}: TTS FAIL", r.stderr[-300:]); break
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", TRIM,
             "-ar", "48000", "-ac", "2", out])
        d = dur(out)
        if d <= window - 0.2:
            break
        rate += 6
    fit = "OK  " if d <= window - 0.2 else "OVER"
    report.append(f"line{i:02d}: cue={cue:6.2f} speech_ends={cue+d:6.2f} "
                  f"(window {end:6.2f})  dur={d:4.2f}s rate={rate:+d}%  {fit}")
print("\n".join(report))
