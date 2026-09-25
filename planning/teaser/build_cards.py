#!/usr/bin/env python3
# Renders all text cards/overlays as transparent 1920x1080 PNGs using the brand fonts.
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = "/Volumes/CrucialX10/uintawatch/planning/teaser"
F = f"{BASE}/fonts"
OUTD = f"{BASE}/cards"
BEZELD = f"{BASE}/bezel"
import os
os.makedirs(OUTD, exist_ok=True)

CREAM = (250, 248, 245, 0)      # transparent canvas; cream comes from ffmpeg
INK = (28, 24, 20, 255)
SOFT = (74, 68, 62, 255)
ACCENT = (196, 90, 59, 255)
ALERT = (232, 89, 58, 255)

SERIF = f"{F}/DMSerifDisplay-Regular.ttf"
ARCH = f"{F}/Archivo-Medium.ttf"
ARCHB = f"{F}/Archivo-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def card(name, draw_fn):
    im = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    draw_fn(d, im)
    im.save(f"{OUTD}/{name}.png")
    print("card:", name)

def fadein_lines(lines, base_alpha=255):
    pass  # fades handled in ffmpeg; static PNGs

# ---- left column caption cards (for phone segments) ----
def left_card(name, kicker, head, sub=None, head_size=76, sub_color=SOFT):
    def fn(d, im):
        y = 255
        if kicker:
            d.text((150, y), kicker, font=font(ARCHB, 30), fill=ACCENT)
            y = 325
        if head:
            d.text((150, y), head, font=font(SERIF, head_size), fill=INK)
            y += int(head_size * 1.55)
        if sub:
            d.text((150, y + 30), sub, font=font(ARCH, 36), fill=sub_color)
    card(name, fn)

left_card("txt-network", "NETWORK MAP", "8 nodes on one map", "A scripted simulation of the mesh we are building")
left_card("txt-list", "SENSOR LIST", "Every node, one tap away")
left_card("txt-node", "NODE DETAIL", "Readings, wind, mesh health", "Battery 3.69V — solar needed. The app tells you.")
left_card("txt-alerts", "ALERTS", "Alerts that explain themselves", "What fired, why, and which node corroborates.", head_size=72)
left_card("txt-agent-a", "UINTA AGENT", "Ask the network what it sees")
left_card("txt-agent-b", None, None, "Grounded in the app data — honest about simulation.")
left_card("txt-report-a", "COMMUNITY REPORTS", "See smoke? Report it.")
left_card("txt-report-type", "WHAT DID YOU SEE?", "Type what you see.", "Every report is public and geotagged.")
left_card("txt-report-b", None, None, "Reports persist offline until the backend exists.")
left_card("txt-web", "OPEN BY DEFAULT", "Published in public", "uintawatch.com — the public lab notebook")

# ---- full-frame cards ----
def title():
    def fn(d, im):
        d.text((960, 205), "ANTSEED BUILD CONTEST · SEPT 25, 2026", font=font(ARCHB, 30), fill=ACCENT, anchor="ma")
        d.text((960, 665), "UintaWatch", font=font(SERIF, 140), fill=INK, anchor="ma")
        d.text((960, 880), "An open field lab for low-cost wildfire sensing", font=font(ARCH, 44), fill=SOFT, anchor="ma")
    card("card-title", fn)

def stats():
    def fn(d, im):
        d.text((150, 255), "THE COST", font=font(ARCHB, 30), fill=ACCENT)
        d.text((150, 325), "Utah is burning.", font=font(SERIF, 100), fill=INK)
        y = 545
        for line in ["1.2M+ acres burned since 2015",
                     "$240M fighting fires in 2025 alone",
                     "75% of Utah wildfires are human-caused"]:
            d.text((150, y), "—   " + line, font=font(ARCH, 42), fill=INK)
            y += 84
    card("card-stats", fn)

def endcard():
    def fn(d, im):
        d.text((960, 480), "The ridges are watching.", font=font(SERIF, 100), fill=INK, anchor="ma")
        d.text((960, 655), "Now they keep a lab notebook, too.", font=font(SERIF, 58), fill=ACCENT, anchor="ma")
        d.text((960, 845), "github.com/aglamadrid19/uintawatch", font=font(ARCHB, 38), fill=INK, anchor="ma")
        d.text((960, 920), "Built with opencode × AntSeed", font=font(ARCH, 32), fill=SOFT, anchor="ma")
    card("card-end", fn)

# ---- website browser-card assets ----
def webcard():
    home = Image.open(f"{BASE}/frames/web/home.png").convert("RGBA")
    crop = home.crop((1085, 81, 1891, 589))          # 806 x 508: hero photo + cream margin right, no nav/text
    crop.save(f"{OUTD}/webcrop.png")
    CW, CH = 1000, 630                                # browser card size on canvas
    pad = 90
    m = Image.new("L", (CW + pad * 2, CH + pad * 2), 0)
    dm = ImageDraw.Draw(m)
    dm.rounded_rectangle([pad + 6, pad + 16, pad + CW - 6, pad + CH + 16], radius=30, fill=100)
    m = m.filter(ImageFilter.GaussianBlur(24))
    shadow = Image.new("RGBA", m.size, (20, 14, 8, 0)); shadow.putalpha(m)
    shadow.save(f"{BEZELD}/cardshadow.png")
    # thin frame ring: CW+8 x CH+8 with CW x CH rounded hole + rim
    W, H = CW + 8, CH + 8
    mask = Image.new("L", (W, H), 0)
    dmk = ImageDraw.Draw(mask)
    dmk.rounded_rectangle([0, 0, W - 1, H - 1], radius=32, fill=255)
    dmk.rounded_rectangle([4, 4, W - 5, H - 5], radius=28, fill=0)
    frame = Image.new("RGBA", (W, H), (24, 19, 15, 255)); frame.putalpha(mask)
    dvf = ImageDraw.Draw(frame)
    dvf.rounded_rectangle([3, 3, W - 4, H - 4], radius=29, outline=(70, 62, 52, 255), width=2)
    frame.save(f"{BEZELD}/cardframe.png")

title(); stats(); endcard(); webcard()
print("done")
