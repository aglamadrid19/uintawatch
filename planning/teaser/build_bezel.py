#!/usr/bin/env python3
# Builds an iPhone-style bezel PNG (+ soft shadow) that overlays phone footage.
# Technique: bezel is an opaque rounded-rect RING with a transparent rounded hole;
# overlaid on top of the 432x940 footage it covers the footage's square corners.
from PIL import Image, ImageDraw, ImageFilter

BASE = "/Volumes/CrucialX10/uintawatch/planning/teaser"
OUT = f"{BASE}/bezel"
import os
os.makedirs(OUT, exist_ok=True)

SCREEN_W, SCREEN_H = 432, 940
BORDER = 22                     # bezel thickness around the screen
BW, BH = SCREEN_W + BORDER * 2, SCREEN_H + BORDER * 2   # 476 x 984
OUTER_R = 66
HOLE_R = 48

BEZEL = (18, 13, 10, 255)       # warm near-black, matches ink #1C1814 family
RIM = (58, 50, 42, 255)         # subtle inner rim highlight

# ---- shadow (behind device) ----
pad = 90
sh = Image.new("L", (BW + pad * 2, BH + pad * 2), 0)
d = ImageDraw.Draw(sh)
d.rounded_rectangle([pad + 4, pad + 14, pad + BW - 4, pad + BH + 14], radius=OUTER_R, fill=100)
sh = sh.filter(ImageFilter.GaussianBlur(26))
shadow = Image.new("RGBA", sh.size, (20, 14, 8, 0))
shadow.putalpha(sh)
shadow.save(f"{OUT}/shadow.png")

# ---- bezel ring ----
mask = Image.new("L", (BW, BH), 0)
dm = ImageDraw.Draw(mask)
dm.rounded_rectangle([0, 0, BW - 1, BH - 1], radius=OUTER_R, fill=255)
dm.rounded_rectangle([BORDER, BORDER, BW - 1 - BORDER, BH - 1 - BORDER], radius=HOLE_R, fill=0)
bezel = Image.new("RGBA", (BW, BH), BEZEL)
bezel.putalpha(mask)

# subtle rim stroke around the screen edge (drawn on top, inside the ring)
dv = ImageDraw.Draw(bezel)
dv.rounded_rectangle([BORDER - 1, BORDER - 1, BW - BORDER, BH - BORDER],
                     radius=HOLE_R + 1, outline=RIM, width=2)

# side buttons: power (right), volume up/down (left)
btn = (30, 23, 18, 255)
dv.rounded_rectangle([BW - 2, 250, BW + 5, 356], radius=3, fill=btn)      # power
dv.rounded_rectangle([-5, 208, 2, 268], radius=3, fill=btn)               # vol up (actually action btn on 16 Pro)
dv.rounded_rectangle([-5, 288, 2, 348], radius=3, fill=btn)               # vol up
dv.rounded_rectangle([-5, 366, 2, 426], radius=3, fill=btn)               # vol down
bezel.save(f"{OUT}/bezel.png")

# ---- composite test: one frame from B-node-detail at t=4 ----
import subprocess
VIDS = "/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "4", "-i", f"{VIDS}/B-node-detail.mov",
                "-frames:v", "1", "-vf", "scale=432:940:flags=lanczos", f"{OUT}/test-screen.png"],
               capture_output=True)
screen = Image.open(f"{OUT}/test-screen.png").convert("RGBA")
canvas = Image.new("RGBA", (1920, 1080), (250, 248, 245, 255))
# device centered like in the video: x=1310, y=70 -> bezel at (1290, 48)
canvas.alpha_composite(shadow, (1290 - pad, 48 - pad))
canvas.alpha_composite(screen, (1310, 70))
canvas.alpha_composite(bezel, (1290, 48))
canvas.convert("RGB").save(f"{OUT}/composite-test.png")
print("bezel built:", BW, "x", BH)
