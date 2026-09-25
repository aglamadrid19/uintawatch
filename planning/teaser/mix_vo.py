#!/usr/bin/env python3
# Mixes the 13 VO lines at their cue offsets onto a silent 59.97s bed
# (loudnorm to -16 LUFS), then muxes onto the teaser as uintawatch-teaser-vo.mp4.
import subprocess

BASE = "/Volumes/CrucialX10/uintawatch/planning/teaser"
CUES = [300, 4100, 7900, 12500, 19200, 24300, 29900, 34500, 39800, 44300,
        46400, 50000, 54300]  # ms, one per line

inputs, fc = [], []
for i, c in enumerate(CUES):
    inputs += ["-i", f"{BASE}/vo/line{i:02d}.wav"]
    fc.append(f"[{i}:a]adelay={c}:all=1[a{i}]")
fc.append("[a0][a1][a2][a3][a4][a5][a6][a7][a8][a9][a10][a11][a12]"
          "amix=inputs=13:normalize=0:duration=longest,apad,"
          "loudnorm=I=-16:TP=-1.5:LRA=11[aout]")

# pass 1: build the 59.97s voice bed
r = subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs,
                    "-f", "lavfi", "-t", "59.97", "-i", "anullsrc=r=48000:cl=stereo",
                    "-filter_complex", ";".join(fc) + ";[13:a][aout]amix=inputs=2:normalize=0:duration=first[vbed]",
                    "-map", "[vbed]", "-c:a", "pcm_s16le", f"{BASE}/vo/mix.wav"],
                   capture_output=True, text=True)
if r.returncode:
    print("MIX FAIL:\n", r.stderr[-2000:]); raise SystemExit(1)

# pass 2: mux onto the silent master (video copied untouched)
r = subprocess.run(["ffmpeg", "-y", "-v", "error",
                    "-i", f"{BASE}/uintawatch-teaser.mp4",
                    "-i", f"{BASE}/vo/mix.wav",
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart",
                    f"{BASE}/uintawatch-teaser-vo.mp4"],
                   capture_output=True, text=True)
if r.returncode:
    print("MUX FAIL:\n", r.stderr[-2000:]); raise SystemExit(1)

r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                    "format=duration:stream=codec_type,codec_name",
                    "-of", "default=noprint_wrappers=1",
                    f"{BASE}/uintawatch-teaser-vo.mp4"], capture_output=True, text=True)
print(r.stdout)
print("BUILD OK -> uintawatch-teaser-vo.mp4")
