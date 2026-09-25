#!/usr/bin/env python3
# Builds uintawatch-teaser.mp4 — 1920x1080@30, silent. Cards + bezel pre-rendered with Pillow.
# Phone layering: cream canvas -> soft shadow -> footage (432x940) -> bezel ring -> text card.
import subprocess, shlex

BASE = "/Volumes/CrucialX10/uintawatch/planning/teaser"
VIDS = "/private/var/folders/sw/msxtzdfd6xl84srgfwhy5jbc0000gn/T/opencode/uw-capture"
CARDS = f"{BASE}/cards"
BEZEL = f"{BASE}/bezel"
OUT = f"{BASE}/uintawatch-teaser.mp4"
LOGO = "/Volumes/CrucialX10/uintawatch/planning/logo/logo-trans.png"
CREAM = "0xFAF8F5"
TR = 0.4
SHADOW_PAD = 90

inputs, segs_info = [], []

def add_input(spec):
    inputs.append(spec)
    return len(inputs) - 1

def phone_seg(vid, t0, t1, card, text_st=0.25, slow=1.0):
    """slow>1 stretches time (1.15 = 15% slower)."""
    raw_d = (t1 - t0) * slow
    d = round(raw_d, 3)
    vi = add_input(f"-i {VIDS}/{vid}")
    sh_i = add_input(f"-loop 1 -t {d} -i {BEZEL}/shadow.png")
    bz_i = add_input(f"-loop 1 -t {d} -i {BEZEL}/bezel.png")
    tx_i = add_input(f"-loop 1 -t {d} -i {CARDS}/{card}.png")
    k = len(segs_info)
    pts = f"setpts=PTS*{slow}" if slow != 1.0 else "setpts=PTS-STARTPTS"
    chain = (f"[{vi}:v]trim=start={t0}:end={t1},setpts=PTS-STARTPTS,{pts},"
             f"scale=432:940:flags=lanczos[p{k}];"
             f"color=c={CREAM}:s=1920x1080:d={d}[b{k}];"
             f"[b{k}][{sh_i}:v]overlay=1204:-28[osh{k}];"
             f"[osh{k}][p{k}]overlay=1312:70[od{k}];"
             f"[od{k}][{bz_i}:v]overlay=1290:48[obb{k}];"
             f"[{tx_i}:v]format=rgba,fade=t=in:st={text_st}:d=0.45:alpha=1[tx{k}];"
             f"[obb{k}][tx{k}]overlay=0:0,fps=30,format=yuv420p,setsar=1[s{k}]")
    segs_info.append((chain, d))

def color_seg(d, cards_with_st):
    k = len(segs_info)
    chain = f"color=c={CREAM}:s=1920x1080:d={d}[b{k}a]"
    n = 0
    for card, st in cards_with_st:
        if card.startswith("LOGO"):
            i = add_input(f"-loop 1 -t {d} -i {LOGO}")
            size = card.split(":")[1]
            n += 1
            chain += f";[{i}:v]scale={size}:{size}[lg{k}];[b{k}{chr(96+n)}][lg{k}]overlay=(main_w-overlay_w)/2:{card.split(':')[2]}[b{k}{chr(97+n)}]"
        else:
            i = add_input(f"-loop 1 -t {d} -i {CARDS}/{card}.png")
            n += 1
            chain += (f";[{i}:v]format=rgba,fade=t=in:st={st}:d=0.45:alpha=1[t{k}];"
                      f"[b{k}{chr(96+n)}][t{k}]overlay=0:0[b{k}{chr(97+n)}]")
    chain += f";[b{k}{chr(97+n)}]fps=30,format=yuv420p,setsar=1[s{k}]"
    segs_info.append((chain, d))

def webcard_seg(d, card, text_st=0.25, zoom=0.0006):
    """Website screenshot as a large browser card on the right (no text overlap).
    Card is 1000x630 at (880,240); frame ring 1008x638 at (876,236)."""
    k = len(segs_info)
    vi = add_input(f"-i {CARDS}/webcrop.png")          # 860x540
    sh_i = add_input(f"-loop 1 -t {d} -i {BEZEL}/cardshadow.png")
    fr_i = add_input(f"-loop 1 -t {d} -i {BEZEL}/cardframe.png")
    tx_i = add_input(f"-loop 1 -t {d} -i {CARDS}/{card}.png")
    chain = (f"[{vi}:v]scale=927:584:flags=lanczos,"
             f"zoompan=z='min(1.0+{zoom}*on,1.1)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2'"
             f":d={int(d*30)+1}:s=1000x630:fps=30[p{k}];"
             f"color=c={CREAM}:s=1920x1080:d={d}[b{k}];"
             f"[b{k}][{sh_i}:v]overlay=787:126[osh{k}];"
             f"[osh{k}][p{k}]overlay=880:240[od{k}];"
             f"[od{k}][{fr_i}:v]overlay=876:236[obb{k}];"
             f"[{tx_i}:v]format=rgba,fade=t=in:st={text_st}:d=0.45:alpha=1[tx{k}];"
             f"[obb{k}][tx{k}]overlay=0:0,fps=30,format=yuv420p,setsar=1[s{k}]")
    segs_info.append((chain, d))

# ---------------- segments ----------------
# 0 title (big logo)
color_seg(4.2, [("LOGO:340:270", 0), ("card-title", 0.25)])
# 1 stats
color_seg(4.2, [("card-stats", 0.2)])
# 2..9 phone segments
phone_seg("A-home-pulse.mov", 1.2, 6.2, "txt-network")
phone_seg("A4-sheet-spring.mov", 0.8, 7.9, "txt-list")
phone_seg("B-node-detail.mov", 1.6, 7.1, "txt-node")
phone_seg("C2-alert-detail.mov", 1.5, 7.5, "txt-alerts")
phone_seg("D4-agent-stream.mov", 3.0, 8.0, "txt-agent-a")
phone_seg("D4-agent-stream.mov", 11.8, 17.8, "txt-agent-b")
phone_seg("E3-report-submit.mov", 2.8, 5.4, "txt-report-a")
phone_seg("E3-report-submit.mov", 9.6, 15.5, "txt-report-b", slow=1.18)
# 10 website browser card
webcard_seg(5.0, "txt-web")
# 11 end card (bigger logo)
color_seg(6.0, [("LOGO:240:170", 0), ("card-end", 0.5)])

# ---------------- xfade chain ----------------
# per-join fade durations: join i = the transition INTO segment i.
# Slower (0.7s) into/out of the report flow and the website card; 0.4s elsewhere.
JOIN_TR = {8: 0.7, 9: 0.7, 10: 0.7, 11: 0.7}
fc = ";".join(c for c, _ in segs_info)
off, last = 0.0, "s0"
for i in range(1, len(segs_info)):
    tr = JOIN_TR.get(i, TR)
    off += segs_info[i - 1][1] - tr
    out = "vout" if i == len(segs_info) - 1 else f"x{i}"
    fc += f";[{last}][s{i}]xfade=transition=fade:duration={tr}:offset={round(off,3)}[{out}]"
    last = out

total = sum(s[1] for s in segs_info) - sum(JOIN_TR.values()) - TR * (len(segs_info) - 1 - len(JOIN_TR))
print(f"segments={len(segs_info)}  total={total:.1f}s")

cmd = shlex.split("ffmpeg -y -v error " + " ".join(inputs))
cmd += ["-filter_complex", fc, "-map", "[vout]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", OUT]
r = subprocess.run(cmd, capture_output=True, text=True)
if r.returncode:
    print("FAIL:\n", r.stderr[-3500:])
else:
    print("BUILD OK ->", OUT)
