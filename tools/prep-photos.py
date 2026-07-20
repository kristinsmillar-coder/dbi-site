#!/usr/bin/env python3
"""Convert the DBI archive to a single monochrome look and size it for the web.

A flat desaturate averages the channels and turns red polos into mud. This uses
luminance weighting (Rec.709), then a gentle S-curve so stage light keeps its
snap and the fluorescent lecture-hall frames stop looking flat. The point is that
287 phone photos shot under wildly different light end up reading as one shoot.

    python3 tools/prep-photos.py
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image, ImageEnhance, ImageOps

SRC = pathlib.Path.home() / "Desktop/DBI IMAGES"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets/img"

# name -> (source file, longest edge px). 2x of the largest slot it fills.
PLATES = {
    "summit-stage":    ("IMG_1888.JPG", 2400),   # DBI marquee + judges in silhouette — native B&W
    "spotlight":       ("IMG_8477.JPG", 1800),   # a student alone in the spotlight — native B&W
    "marquee-d":       ("IMG_8465.JPG", 1800),   # student pitching beside the lit D — native B&W
    "judges":          ("IMG_1883.JPG", 1800),   # the judging table — native B&W
    "presenting":      ("IMG_1886.JPG", 1800),   # mid-presentation on stage — native B&W
    "cohort":          ("IMG_0342.jpeg", 2400),  # the whole cohort in red polos
    "lecture-hall":    ("IMG_0610.jpeg", 2000),  # the room, full
    "surfline-case":   ("IMG_1769.jpeg", 1600),  # WHERE WOULD YOU EXPAND — the actual case
    "dorm-drop":       ("IMG_2071.jpeg", 1600),  # Joey's Lego dorm room + moving truck
    "theater":         ("IMG_1778.jpeg", 2400),  # the venue before doors
    "winner-reveal":   ("IMG_0492.jpeg", 2000),  # NOW the WINNER on the big screen
    "pitch-interview": ("IMG_2073.jpeg", 1600),  # January pitch interviews
}


def s_curve(x: int) -> int:
    """Gentle contrast lift — lighten highlights, deepen shadows, protect midtones."""
    t = x / 255.0
    t = t * t * (3 - 2 * t)          # smoothstep
    t = 0.82 * t + 0.09 * (x / 255)  # pull back toward linear so faces don't blow out
    return max(0, min(255, round(t * 255)))


LUT = [s_curve(i) for i in range(256)]


def convert(src: pathlib.Path, dest_stem: str, longest: int) -> tuple[str, int] | None:
    try:
        im = Image.open(src)
    except Exception as e:
        print(f"  !! {src.name}: {e}", file=sys.stderr)
        return None

    im = ImageOps.exif_transpose(im).convert("RGB")
    # Rec.709 luminance — keeps the red polos as a distinct mid-grey instead of mud.
    im = im.convert("L", matrix=(0.2126, 0.7152, 0.0722, 0))
    im = im.point(LUT)
    im = ImageEnhance.Contrast(im).enhance(1.06)

    if max(im.size) > longest:
        r = longest / max(im.size)
        im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)

    dest = OUT / f"{dest_stem}.jpg"
    im.convert("RGB").save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    return dest.name, dest.stat().st_size


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    if not SRC.exists():
        sys.exit(f"Source archive not found: {SRC}")

    total = 0
    for stem, (fname, longest) in PLATES.items():
        src = SRC / fname
        if not src.exists():
            print(f"  !! missing: {fname}", file=sys.stderr)
            continue
        got = convert(src, stem, longest)
        if got:
            name, size = got
            total += size
            print(f"  {name:22} {size // 1024:5} KB")
    print(f"\n{total // 1024} KB total")


if __name__ == "__main__":
    main()
