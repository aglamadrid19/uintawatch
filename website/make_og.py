#!/usr/bin/env python3
"""Compose OG/social cards (1200x630) matching the site's editorial style.

Generates:
- public/images/og-default.png        (site default, for pages without their own)
- public/images/og/<slug>.png         (one per journal entry, keyed by the
                                       Astro content slug = file stem)

Run from website/: python3 make_og.py

Every page must reference an existing image. The Playwright suite
(tests/basic.spec.ts, "Social cards" block) verifies og:image on every page
and that the referenced URL resolves to a real image — if a journal entry is
added without regenerating cards, the entry falls back to og-default (Layout
prop) unless its [slug].astro passes a missing path, which the QA test will
flag as a 404.
"""
from pathlib import Path
import math
import re

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = "#FAF8F5"
INK = "#1A1A1A"
INK_MUTED = "#6B6B6B"
ACCENT = "#C45A3B"
ACCENT_DARK = "#A34830"

FONT_DIR = "node_modules/@fontsource"
DM_SERIF = f"{FONT_DIR}/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2"
ARCHIVO = f"{FONT_DIR}/archivo/files/archivo-latin-400-normal.woff2"
ARCHIVO_MED = f"{FONT_DIR}/archivo/files/archivo-latin-500-normal.woff2"
ARCHIVO_BOLD = f"{FONT_DIR}/archivo/files/archivo-latin-700-normal.woff2"

PANEL_X = 660
LX = 72
MAX_TEXT_W = PANEL_X - LX - 40


def tracked(draw, xy, text, font, fill, tracking=0):
    """Draw text with letter-spacing (tracking in px)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def _backdrop():
    """Paper canvas + terracotta-to-amber sky, sun glow, mountain layers."""
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        if t < 0.5:
            tt = t / 0.5
            r = int(0xC4 + (0xD4 - 0xC4) * tt)
            g = int(0x5A + (0x68 - 0x5A) * tt)
            b = int(0x3B + (0x4D - 0x3B) * tt)
        else:
            tt = (t - 0.5) / 0.5
            r = int(0xD4 + (0xE9 - 0xD4) * tt)
            g = int(0x68 + (0xB0 - 0x68) * tt)
            b = int(0x4D + (0x84 - 0x4D) * tt)
        draw.line([(PANEL_X, y), (W, y)], fill=(r, g, b))

    sun_cx, sun_cy, sun_r = PANEL_X + 260, 190, 130
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(sun_r, 0, -1):
        a = int(60 * (1 - i / sun_r))
        gd.ellipse([sun_cx - i, sun_cy - i, sun_cx + i, sun_cy + i], fill=(0xFA, 0xE3, 0xC2, a))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.ellipse([sun_cx - 34, sun_cy - 34, sun_cx + 34, sun_cy + 34], fill="#F7DDB4")

    def mountains(base_y, amp, color, seed):
        pts = [(PANEL_X, H), (W, H)]
        steps = 60
        for i in range(steps + 1):
            x = PANEL_X + (W - PANEL_X) * i / steps
            y = base_y - amp * (
                0.5 + 0.5 * math.sin(seed + i * 0.55) * 0.6
                + 0.4 * math.sin(seed * 2 + i * 0.23)
            )
            pts.append((x, y))
        draw.polygon(pts, fill=color)

    mountains(470, 70, "#8A4327", 1.3)
    mountains(520, 90, "#6B3119", 2.1)
    mountains(565, 95, "#4A2113", 0.7)

    try:
        logo = Image.open("public/images/logo-badge.png").convert("RGBA")
        logo.thumbnail((64, 64), Image.LANCZOS)
        img.paste(logo, (LX, 56), logo)
    except Exception as e:
        print("logo skipped:", e)

    return img, draw


def wrap(draw, text, font, max_width):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_title(draw, text, sizes=(66, 58, 50, 44), max_lines=3):
    """Pick the largest size whose wrap stays within max_lines."""
    for size in sizes:
        font = ImageFont.truetype(DM_SERIF, size)
        lines = wrap(draw, text, font, MAX_TEXT_W)
        if len(lines) <= max_lines:
            return font, lines
    return ImageFont.truetype(DM_SERIF, sizes[-1]), lines


def truncate(draw, text, font, max_width):
    if draw.textlength(text, font=font) <= max_width:
        return text
    out = text
    while out and draw.textlength(out + "…", font=font) > max_width:
        out = out[:-1]
    return out + "…"


def make_card(out_path, kicker, title, blurb=None, url="uintawatch.com",
              accent_last=False, title_sizes=(66, 58, 50, 44)):
    img, draw = _backdrop()

    tracked(draw, (LX, 170), kicker, ImageFont.truetype(ARCHIVO_BOLD, 25), ACCENT, tracking=5)

    font, lines = fit_title(draw, title, sizes=title_sizes)
    y = 228
    for i, line in enumerate(lines):
        color = ACCENT if (accent_last and i == len(lines) - 1) else INK
        draw.text((LX - 4, y), line, font=font, fill=color)
        y += int(font.size * 1.18)

    if blurb:
        bf = ImageFont.truetype(ARCHIVO, 24)
        draw.text((LX, 520), truncate(draw, blurb, bf, MAX_TEXT_W), font=bf, fill=INK_MUTED)

    rule_y = 570
    draw.line([(LX, rule_y), (LX + 52, rule_y)], fill=ACCENT, width=3)
    draw.text((LX + 66, rule_y - 15), url, font=ImageFont.truetype(ARCHIVO_MED, 26), fill=ACCENT_DARK)

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True)
    print("saved", out_path, img.size)


def parse_entries():
    """Slug + frontmatter fields for every journal entry (slug = file stem,
    matching Astro's content id and therefore the page URL)."""
    for md in sorted(Path("src/content/journal").glob("*.md")):
        text = md.read_text(encoding="utf-8")

        def field(name):
            m = re.search(rf"^{name}:\s*(.+)$", text, re.M)
            return m.group(1).strip().strip('"') if m else ""

        yield md.stem, field("title"), field("date"), field("summary")


def kicker_for_date(iso):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso)
    if not m:
        return "LAB JOURNAL"
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    y, mo, d = m.groups()
    return f"LAB JOURNAL · {months[int(mo) - 1]} {int(d)}, {y}"


def main():
    # Site default card (homepage + pages without a dedicated image)
    make_card(
        "public/images/og-default.png",
        kicker="OPEN WILDFIRE SENSING LAB",
        title="Utah is burning. Now it's your turn to watch.",
        blurb="Open hardware, open data, published results.",
        title_sizes=(66,),
    )

    # One card per journal entry — unique image URL per page, which also
    # busts X/Meta card caches that saved a failed earlier fetch.
    for slug, title, date, summary in parse_entries():
        make_card(
            f"public/images/og/{slug}.png",
            kicker=kicker_for_date(date),
            title=title,
            blurb=summary,
        )


if __name__ == "__main__":
    main()
