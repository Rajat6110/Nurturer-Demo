#!/usr/bin/env python3
"""Quick probe of generated videos: duration, resolution, codecs."""
import os
import subprocess

import imageio_ffmpeg

VID = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "video")
ff = imageio_ffmpeg.get_ffmpeg_exe()

for name in ["hero.mp4", "hero.webm", "hero-dog.mp4", "hero-cat.mp4", "hero-vertical.mp4"]:
    p = os.path.join(VID, name)
    if not os.path.exists(p):
        print("%-20s MISSING" % name)
        continue
    r = subprocess.run([ff, "-i", p], capture_output=True, text=True)
    lines = [l.strip() for l in r.stderr.splitlines()
             if ("Duration" in l or "Stream #" in l)]
    size_mb = os.path.getsize(p) / 1048576.0
    print("== %s (%.2f MB)" % (name, size_mb))
    for l in lines:
        print("   ", l)