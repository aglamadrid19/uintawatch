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

# web slide: centered above/below the browser card (no left column — card is standalone)
def txt_web():
    def fn(d, im):
        d.text((960, 58), "OPEN BY DEFAULT", font=font(ARCHB, 30), fill=ACCENT, anchor="ma")
        d.text((960, 98), "Published in public", font=font(SERIF, 76), fill=INK, anchor="ma")
        d.text((960, 945), "uintawatch.com — the public lab notebook", font=font(ARCH, 36), fill=SOFT, anchor="ma")
    card("txt-web", fn)

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

# ---- website browser-card assets: centered full-site slide ----
CW, CH_CONTENT = 1100, 619          # full site scaled to 1100 wide
CHROME_H = 52
CH = CHROME_H + CH_CONTENT          # 671 total card height
CARD_X, CARD_Y = 410, 235           # card top-left on canvas

def webcard():
    home = Image.open(f"{BASE}/frames/web/home.png").convert("RGB")
    dc0 = ImageDraw.Draw(home)
    # paint out the floating widget in the bottom-right corner (half-cut by the card frame)
    dc0.rounded_rectangle([1660, 900, 1920, 1080], radius=20, fill=(250, 248, 245))
    full = home.resize((CW, CH_CONTENT), Image.LANCZOS)
    # round bottom corners via mask composited over opaque cream (zoompan drops alpha)
    r = 18
    mask = Image.new("L", (CW, CH_CONTENT), 255)
    dm = ImageDraw.Draw(mask)
    dm.rectangle([0, CH_CONTENT - r, r, CH_CONTENT], fill=0)
    dm.pieslice([0, CH_CONTENT - 2 * r, 2 * r, CH_CONTENT], 90, 180, fill=255)
    dm.rectangle([CW - r, CH_CONTENT - r, CW, CH_CONTENT], fill=0)
    dm.pieslice([CW - 2 * r, CH_CONTENT - 2 * r, CW, CH_CONTENT], 0, 90, fill=255)
    cream = Image.new("RGB", (CW, CH_CONTENT), (250, 248, 245))
    Image.composite(full, cream, mask).save(f"{OUTD}/webfull.png")
    # chrome bar: rounded top corners (rect drawn taller, bottom rounding clipped off)
    chrome = Image.new("RGBA", (CW, CHROME_H), (0, 0, 0, 0))
    dc = ImageDraw.Draw(chrome)
    dc.rounded_rectangle([0, 0, CW - 1, CHROME_H * 2], radius=r, fill=(240, 235, 227, 255))
    for i, col in enumerate([(201, 106, 86), (214, 170, 90), (137, 166, 120)]):
        x = 32 + i * 30
        dc.ellipse([x - 7, CHROME_H // 2 - 7, x + 7, CHROME_H // 2 + 7], fill=col + (255,))
    dc.rounded_rectangle([360, 11, 740, 41], radius=15, fill=(250, 248, 245, 255),
                         outline=(214, 205, 194, 255), width=1)
    dc.text((CW // 2, CHROME_H // 2), "uintawatch.com", font=font(ARCH, 20), fill=SOFT, anchor="mm")
    chrome.save(f"{BEZELD}/browser-chrome.png")
    # frame ring: CW+8 x CH+8 with CW x CH rounded hole + rim
    W, H = CW + 8, CH + 8
    mk = Image.new("L", (W, H), 0)
    dmk = ImageDraw.Draw(mk)
    dmk.rounded_rectangle([0, 0, W - 1, H - 1], radius=24, fill=255)
    dmk.rounded_rectangle([4, 4, W - 5, H - 5], radius=20, fill=0)
    frame = Image.new("RGBA", (W, H), (24, 19, 15, 255)); frame.putalpha(mk)
    dvf = ImageDraw.Draw(frame)
    dvf.rounded_rectangle([3, 3, W - 4, H - 4], radius=23, outline=(70, 62, 52, 255), width=2)
    frame.save(f"{BEZELD}/browser-frame.png")
    # soft shadow behind the card
    pad = 90
    m = Image.new("L", (CW + pad * 2, CH + pad * 2), 0)
    dm2 = ImageDraw.Draw(m)
    dm2.rounded_rectangle([pad + 6, pad + 16, pad + CW - 6, pad + CH + 16], radius=30, fill=100)
    m = m.filter(ImageFilter.GaussianBlur(24))
    shadow = Image.new("RGBA", m.size, (20, 14, 8, 0)); shadow.putalpha(m)
    shadow.save(f"{BEZELD}/browsershadow.png")
    print(f"browser card: content {CW}x{CH_CONTENT} chrome {CHROME_H} card {CW}x{CH} at ({CARD_X},{CARD_Y})")

title(); stats(); endcard(); txt_web(); webcard()
print("done")
