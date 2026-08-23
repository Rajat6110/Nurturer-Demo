#!/usr/bin/env python3
# ============================================================
# NURTURER - cinematic hero video generator (procedural)
# ------------------------------------------------------------
# Renders the brand shot list as a 15s seamless loop:
#   A 0-3s   macro copper interior, water droplet ripple, glint
#   B 3-6s   slow pull-back reveal: elevated bowl, wood stand,
#            non-slip base on a light wood kitchen floor
#   C 6-10s  golden retriever puppy trots in, settles, eats
#            (tail wag, gentle slow-mo feel)
#   D 10-14s cream cat approaches counter bowl, sniffs, eats
#   E 14-15s calm wide hold, soft light fade, clean left frame
#
# Style: cream / copper / natural wood only, soft window light,
# bokeh, slow cinematic camera moves, warm grade, subtle grain.
# No text, no logos, no captions.
#
# Outputs (assets/video/):
#   hero.mp4 / hero.webm   1920x1080 master homepage loop
#   hero-dog.mp4           dog-only cut (Dogs section)
#   hero-cat.mp4           cat-only cut (Cats section)
#   hero-vertical.mp4      1080x1920 (reels / mobile hero)
#
# Requires: numpy, pillow, imageio, imageio-ffmpeg
# ============================================================

import gc
import math
import os
import subprocess
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import imageio.v2 as imageio
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = os.path.join(ROOT, "assets", "video")
PREV = os.path.join(ROOT, "tools", "preview")
os.makedirs(VID, exist_ok=True)
os.makedirs(PREV, exist_ok=True)

FPS = 24
DUR = 15.0
XF = 0.4  # cross-dissolve seconds

# ---------------- palette (0-255) ----------------
CREAM_WHITE = (255, 250, 240)
WARM_DARK = (42, 33, 27)
WOOD_TOP = (168, 124, 72)
WOOD_BOT = (116, 82, 42)
BASE_DARK = (74, 53, 28)
CU_RIM = (237, 169, 95)
CU_IN = (255, 220, 166)
CU_DEEP = (122, 69, 25)
WATER = (247, 201, 142)
DOG = (211, 160, 95)
DOG_DK = (176, 127, 66)
DOG_LT = (233, 196, 140)
CAT = (221, 208, 184)
CAT_DK = (205, 191, 168)


def C(c):
    return np.asarray(c, np.float32) / 255.0


def clamp01(x):
    return np.clip(x, 0.0, 1.0)


def smoothstep(t):
    t = clamp01(t)
    return t * t * (3.0 - 2.0 * t)


def ease_io(t):
    return smoothstep(t)


def ease_out(t):
    t = clamp01(t)
    return 1.0 - (1.0 - t) ** 3


def lerp(a, b, u):
    return a + (b - a) * u


# ---------------- primitives ----------------

def blend_region(img, x0, y0, mask, color, alpha=1.0):
    h, w = mask.shape
    region = img[y0:y0 + h, x0:x0 + w]
    if region.ndim == 2:
        # grayscale target (e.g. light-shaft masks)
        m = mask * alpha
        region *= (1.0 - m)
        region += m * float(np.asarray(color, np.float32).ravel()[0])
    else:
        m = (mask * alpha)[..., None]
        region *= (1.0 - m)
        region += m * np.asarray(color, np.float32)


def _bbox(W, H, cx, cy, rx, ry, pad=3):
    x0 = max(0, int(math.floor(cx - rx)) - pad)
    y0 = max(0, int(math.floor(cy - ry)) - pad)
    x1 = min(W, int(math.ceil(cx + rx)) + pad)
    y1 = min(H, int(math.ceil(cy + ry)) + pad)
    return x0, y0, x1, y1


def fill_ellipse(img, W, H, cx, cy, rx, ry, color, alpha=1.0, angle=0.0):
    if rx <= 0 or ry <= 0 or alpha <= 0:
        return
    x0, y0, x1, y1 = _bbox(W, H, cx, cy, rx, ry)
    if x1 <= x0 or y1 <= y0:
        return
    X = (x0 + np.arange(x1 - x0, dtype=np.float32))[None, :] - cx
    Y = (y0 + np.arange(y1 - y0, dtype=np.float32))[:, None] - cy
    if angle:
        ca, sa = math.cos(angle), math.sin(angle)
        X, Y = ca * X + sa * Y, -sa * X + ca * Y
    d = np.sqrt((X / rx) ** 2 + (Y / ry) ** 2)
    m = clamp01((1.0 - d) * min(rx, ry) / 1.5)
    blend_region(img, x0, y0, m.astype(np.float32), color, alpha)


def soft_blob(img, W, H, cx, cy, rx, ry, color, alpha, blur=24):
    if rx <= 0 or ry <= 0 or alpha <= 0:
        return
    pad = int(blur * 2) + 4
    x0 = max(0, int(cx - rx) - pad)
    y0 = max(0, int(cy - ry) - pad)
    x1 = min(W, int(cx + rx) + pad)
    y1 = min(H, int(cy + ry) + pad)
    if x1 <= x0 or y1 <= y0:
        return
    gh, gw = y1 - y0, x1 - x0
    Y, X = np.mgrid[0:gh, 0:gw].astype(np.float32)
    d = np.sqrt(((X - (cx - x0)) / rx) ** 2 + ((Y - (cy - y0)) / ry) ** 2)
    m = clamp01(1.0 - d).astype(np.float32)
    im = Image.fromarray((m * 255).astype(np.uint8))
    im = im.filter(ImageFilter.GaussianBlur(max(1.0, blur * 0.5)))
    mask = np.asarray(im, np.float32) / 255.0
    blend_region(img, x0, y0, mask, color, alpha)


def fill_rrect(img, W, H, cx, cy, w, h, r, color, alpha=1.0):
    x0, y0, x1, y1 = _bbox(W, H, cx, cy, w / 2, h / 2)
    if x1 <= x0 or y1 <= y0:
        return
    X = (x0 + np.arange(x1 - x0, dtype=np.float32))[None, :] - cx
    Y = (y0 + np.arange(y1 - y0, dtype=np.float32))[:, None] - cy
    hw, hh = max(w / 2 - r, 0.1), max(h / 2 - r, 0.1)
    dx = np.maximum(np.abs(X) - hw, 0.0)
    dy = np.maximum(np.abs(Y) - hh, 0.0)
    d = np.sqrt(dx * dx + dy * dy) / max(r, 0.001)
    m = clamp01((1.0 - d) * r / 1.5)
    blend_region(img, x0, y0, m.astype(np.float32), color, alpha)


def fill_rrect_gradient(img, W, H, cx, cy, w, h, r, top, bot, alpha=1.0):
    x0, y0, x1, y1 = _bbox(W, H, cx, cy, w / 2, h / 2)
    if x1 <= x0 or y1 <= y0:
        return
    X = (x0 + np.arange(x1 - x0, dtype=np.float32))[None, :] - cx
    Y = (y0 + np.arange(y1 - y0, dtype=np.float32))[:, None] - cy
    hw, hh = max(w / 2 - r, 0.1), max(h / 2 - r, 0.1)
    dx = np.maximum(np.abs(X) - hw, 0.0)
    dy = np.maximum(np.abs(Y) - hh, 0.0)
    d = np.sqrt(dx * dx + dy * dy) / max(r, 0.001)
    m = clamp01((1.0 - d) * r / 1.5) * alpha
    t = clamp01((Y - (cy - h / 2)) / max(h, 1.0))
    cols = np.empty((y1 - y0, x1 - x0, 3), np.float32)
    for k in range(3):
        cols[..., k] = top[k] + (bot[k] - top[k]) * t
    region = img[y0:y1, x0:x1]
    m3 = m[..., None]
    region *= (1.0 - m3)
    region += m3 * cols


def fill_polygon_gradient(img, W, H, pts, top, bot, alpha=1.0, ss=4):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0 = max(0, int(min(xs)) - 2)
    y0 = max(0, int(min(ys)) - 2)
    x1 = min(W, int(max(xs)) + 3)
    y1 = min(H, int(max(ys)) + 3)
    if x1 <= x0 or y1 <= y0:
        return
    im = Image.new("L", ((x1 - x0) * ss, (y1 - y0) * ss), 0)
    dr = ImageDraw.Draw(im)
    dr.polygon([((px - x0) * ss, (py - y0) * ss) for px, py in pts], fill=255)
    im = im.resize((x1 - x0, y1 - y0), Image.Resampling.BILINEAR)
    m = (np.asarray(im, np.float32) / 255.0) * alpha
    Y = (y0 + np.arange(y1 - y0, dtype=np.float32))[:, None]
    t = clamp01((Y - min(ys)) / max(max(ys) - min(ys), 1.0))
    cols = np.empty((y1 - y0, x1 - x0, 3), np.float32)
    for k in range(3):
        cols[..., k] = top[k] + (bot[k] - top[k]) * t
    region = img[y0:y1, x0:x1]
    m3 = m[..., None]
    region *= (1.0 - m3)
    region += m3 * cols


def ring(img, W, H, cx, cy, r0, thick, color, alpha, squash=0.38):
    if r0 <= 0 or alpha <= 0:
        return
    rx, ry = r0, r0 * squash
    x0, y0, x1, y1 = _bbox(W, H, cx, cy, rx + thick, ry + thick)
    if x1 <= x0 or y1 <= y0:
        return
    X = (x0 + np.arange(x1 - x0, dtype=np.float32))[None, :] - cx
    Y = (y0 + np.arange(y1 - y0, dtype=np.float32))[:, None] - cy
    d = np.sqrt((X / max(rx, .1)) ** 2 + (Y / max(ry, .1)) ** 2)
    m = np.exp(-(((d - 1.0) * max(rx, 1.0)) / max(thick, .5)) ** 2) * alpha
    blend_region(img, x0, y0, m.astype(np.float32), color)


# ---------------- environment ----------------

class Env:
    def __init__(self, W, H, bx_frac=0.64):
        self.W, self.H = W, H
        self.s = min(W, H) / 1080.0
        self.horizon = 0.76 * H
        self.bx = bx_frac * W
        self.kitchen = self._kitchen()
        self.macro = self._macro_bg()
        self.vignette = self._vignette()
        self.bokeh = self._bokeh()
        rng = np.random.default_rng(7)
        self.grains = [rng.normal(0, 1, (H, W)).astype(np.float32) * 0.012 for _ in range(6)]

    def bowl_geom(self, scale=1.0, bx=None):
        s = self.s * scale
        bx = self.bx if bx is None else bx
        gy = self.horizon + 85 * self.s
        base_bot = gy
        base_top = gy - 34 * s
        stand_top = base_top - 118 * s
        rim_y = stand_top - 164 * s
        return dict(bx=bx, s=s, gy=gy, base_bot=base_bot, base_top=base_top,
                    stand_top=stand_top, rim_y=rim_y, rw=270 * s, ry=76 * s,
                    depth=184 * s, stand=True)

    def _kitchen(self):
        W, H, s = self.W, self.H, self.s
        hor = self.horizon
        img = np.empty((H, W, 3), np.float32)
        tw = clamp01(np.arange(H, dtype=np.float32) / max(hor, 1))[:, None]
        for k in range(3):
            img[..., k] = (248, 238, 221)[k] / 255.0 + ((238, 222, 196)[k] - (248, 238, 221)[k]) / 255.0 * tw
        tf = clamp01((np.arange(H, dtype=np.float32) - hor)[:, None] / max(H - hor, 1))
        fl = np.empty((H, W, 3), np.float32)
        for k in range(3):
            fl[..., k] = (222, 186, 138)[k] / 255.0 + ((185, 141, 88)[k] - (222, 186, 138)[k]) / 255.0 * tf
        rows = np.arange(H)
        img[rows >= hor] = fl[rows >= hor]
        # plank seams
        seam = np.zeros((H, W), np.float32)
        step = max(60, int(190 * s))
        for x in range(int(0.04 * W), W, step):
            seam[:, x:x + 2] = 1.0
        seam[rows < hor, :] = 0.0
        img *= (1.0 - seam * 0.09)[..., None]
        # baseboard
        bb = int(hor - 16 * s)
        img[bb:int(hor), :] = C((232, 213, 182))
        # window glow
        soft_blob(img, W, H, 0.72 * W, 0.16 * H, 0.34 * W, 0.30 * H, C((255, 243, 221)), 0.55, blur=int(90 * s))
        soft_blob(img, W, H, 0.58 * W, 0.30 * H, 0.20 * W, 0.22 * H, C((255, 240, 214)), 0.20, blur=int(80 * s))
        # light shaft
        shaft = np.zeros((H, W), np.float32)
        fill_polygon(shaft, W, H, [(0.80 * W, -20), (0.99 * W, -20),
                                   (0.62 * W, H + 20), (0.33 * W, H + 20)], (1, 1, 1), 1.0)
        sim = Image.fromarray((shaft * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(max(8, int(70 * s))))
        img += (np.asarray(sim, np.float32) / 255.0 * 0.10)[..., None] * C((255, 244, 222))
        # floor light pool
        soft_blob(img, W, H, 0.66 * W, hor + 60 * s, 0.30 * W, 60 * s, C((255, 236, 205)), 0.16, blur=int(50 * s))
        return img

    def _macro_bg(self):
        W, H, s = self.W, self.H, self.s
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        cx, cy = 0.60 * W, 0.52 * H
        r = np.sqrt(((xx - cx) / (0.78 * W)) ** 2 + ((yy - cy) / (0.78 * W)) ** 2)
        t = clamp01(r)
        pos = np.array([0.0, 0.45, 1.0], np.float32)
        img = np.empty((H, W, 3), np.float32)
        for k in range(3):
            img[..., k] = np.interp(t, pos,
                                    [C((242, 192, 136))[k], C((192, 127, 58))[k], C((122, 69, 25))[k]])
        streak = (np.sin(xx / (26.0 * s) + yy / (140.0 * s)) * 0.5 + 0.5)
        img += (streak * 0.045 - 0.02)[..., None]
        soft_blob(img, W, H, 0.42 * W, 0.34 * H, 0.16 * W, 0.10 * H, C((255, 240, 214)), 0.20, blur=int(60 * s))
        soft_blob(img, W, H, 0.74 * W, 0.68 * H, 0.14 * W, 0.09 * H, C((255, 236, 205)), 0.14, blur=int(60 * s))
        return img

    def _vignette(self):
        W, H = self.W, self.H
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (0.62 * W)) ** 2 + ((yy - H / 2) / (0.62 * H)) ** 2)
        return (1.0 - 0.30 * clamp01(r) ** 1.7).astype(np.float32)

    def _bokeh(self):
        W, H, s = self.W, self.H, self.s
        rng = np.random.default_rng(11)
        items = []
        for (fx, fy) in [(0.14, 0.24), (0.30, 0.13), (0.86, 0.30), (0.55, 0.10),
                         (0.93, 0.50), (0.07, 0.46), (0.44, 0.19)]:
            r = rng.uniform(26, 60) * s
            size = int(r * 2 + 8)
            Y, X = np.mgrid[0:size, 0:size].astype(np.float32)
            d = np.sqrt((X - size / 2) ** 2 + (Y - size / 2) ** 2) / r
            im = Image.fromarray((clamp01(1.0 - d) * 255).astype(np.uint8))
            im = im.filter(ImageFilter.GaussianBlur(max(4, int(r * 0.35))))
            items.append(dict(spr=np.asarray(im, np.float32) / 255.0, x=fx * W, y=fy * H,
                              ax=rng.uniform(8, 20) * s, ay=rng.uniform(5, 12) * s,
                              sp=rng.uniform(0.25, 0.6), ph=rng.uniform(0, 6.28),
                              a=rng.uniform(0.05, 0.10)))
        return items

    def draw_bokeh(self, img, t):
        W, H = self.W, self.H
        for b in self.bokeh:
            spr = b["spr"]
            h, w = spr.shape
            x = b["x"] + math.sin(t * b["sp"] + b["ph"]) * b["ax"]
            y = b["y"] + math.cos(t * b["sp"] * 0.8 + b["ph"]) * b["ay"]
            a = b["a"] * (0.7 + 0.3 * math.sin(t * 0.5 + b["ph"] * 2))
            x0, y0 = int(x - w / 2), int(y - h / 2)
            x1, y1 = x0 + w, y0 + h
            sx0, sy0 = max(0, -x0), max(0, -y0)
            sx1 = w - max(0, x1 - W)
            sy1 = h - max(0, y1 - H)
            if sx1 <= sx0 or sy1 <= sy0:
                continue
            sub = img[y0 + sy0:y0 + sy1, x0 + sx0:x0 + sx1]
            m = (spr[sy0:sy1, sx0:sx1] * a)[..., None]
            sub *= (1.0 - m)
            sub += m * C((255, 240, 214))


def fill_polygon(img, W, H, pts, color, alpha=1.0, ss=4, angle=0.0):
    if alpha <= 0 or len(pts) < 3:
        return
    if angle:
        mx = sum(p[0] for p in pts) / len(pts)
        my = sum(p[1] for p in pts) / len(pts)
        ca, sa = math.cos(angle), math.sin(angle)
        pts = [(mx + (px - mx) * ca - (py - my) * sa,
                my + (px - mx) * sa + (py - my) * ca) for px, py in pts]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0 = max(0, int(min(xs)) - 2)
    y0 = max(0, int(min(ys)) - 2)
    x1 = min(W, int(max(xs)) + 3)
    y1 = min(H, int(max(ys)) + 3)
    if x1 <= x0 or y1 <= y0:
        return
    im = Image.new("L", ((x1 - x0) * ss, (y1 - y0) * ss), 0)
    dr = ImageDraw.Draw(im)
    dr.polygon([((px - x0) * ss, (py - y0) * ss) for px, py in pts], fill=255)
    im = im.resize((x1 - x0, y1 - y0), Image.Resampling.BILINEAR)
    blend_region(img, x0, y0, np.asarray(im, np.float32) / 255.0, color, alpha)


# ---------------- props ----------------

def draw_bowl(env, img, g, water=True, kibble=False, t=0.0):
    W, H, s = env.W, env.H, g["s"]
    bx, rim_y, rw, ry, depth = g["bx"], g["rim_y"], g["rw"], g["ry"], g["depth"]
    if g.get("stand", True):
        soft_blob(img, W, H, bx, g["base_bot"] + 6 * s, rw * 1.25, 26 * s, C((60, 40, 20)), 0.20, blur=int(18 * s))
        fill_rrect(img, W, H, bx, g["base_top"] + 17 * s, 336 * s, 34 * s, 17 * s, C(BASE_DARK))
        fill_rrect(img, W, H, bx, g["base_top"] + 6 * s, 336 * s, 10 * s, 5 * s, C((96, 70, 38)))
        fill_rrect_gradient(img, W, H, bx, g["base_top"] - 59 * s, 380 * s, 118 * s, 26 * s,
                            C(WOOD_TOP), C(WOOD_BOT))
        fill_rrect(img, W, H, bx, g["base_top"] - 112 * s, 340 * s, 10 * s, 5 * s, C((214, 178, 128)))
    else:
        soft_blob(img, W, H, bx, rim_y + depth + 4 * s, rw * 1.15, 14 * s, C((60, 40, 20)), 0.18, blur=int(12 * s))
    # bowl silhouette
    p0 = (bx - rw, rim_y)
    p1 = (bx - rw + 11 * s, rim_y + depth * 0.96)
    p2 = (bx, rim_y + depth)
    p3 = (bx + rw - 11 * s, rim_y + depth * 0.96)
    p4 = (bx + rw, rim_y)
    pts = [p0]
    n = 26
    for qa, qb, qc in ((p0, p1, p2), (p2, p3, p4)):
        for i in range(1, n + 1):
            u = i / n
            pts.append(((1 - u) ** 2 * qa[0] + 2 * (1 - u) * u * qb[0] + u ** 2 * qc[0],
                        (1 - u) ** 2 * qa[1] + 2 * (1 - u) * u * qb[1] + u ** 2 * qc[1]))
    fill_polygon_gradient(img, W, H, pts, C((217, 154, 86)), C(CU_DEEP))
    fill_ellipse(img, W, H, bx, rim_y, rw, ry, C(CU_RIM))
    fill_ellipse(img, W, H, bx, rim_y + 8 * s, rw * 0.86, ry * 0.78, C(CU_IN))
    if water:
        fill_ellipse(img, W, H, bx, rim_y + 10 * s, rw * 0.70, ry * 0.56, C(WATER))
        hx = bx - rw * 0.25 + math.sin(t * 0.8) * 8 * s
        soft_blob(img, W, H, hx, rim_y + 2 * s, rw * 0.22, ry * 0.16, C((255, 250, 240)), 0.55, blur=int(10 * s))
    if kibble:
        rng = np.random.default_rng(5)
        for i in range(7):
            kx = bx - rw * 0.45 + (i % 4) * rw * 0.24 + rng.uniform(-8, 8) * s
            ky = rim_y + 6 * s + (i // 4) * ry * 0.30 + rng.uniform(-4, 4) * s
            fill_ellipse(img, W, H, kx, ky, 15 * s, 11 * s,
                         C((138, 90, 46) if i % 2 else (160, 106, 53)))
    gx = bx - rw * 0.55 + math.sin(t * 0.5 + 1.0) * rw * 0.12
    soft_blob(img, W, H, gx, rim_y + depth * 0.45, rw * 0.16, depth * 0.30, C((255, 244, 224)), 0.16, blur=int(16 * s))
    fill_ellipse(img, W, H, bx - rw * 0.45, rim_y - ry * 0.28, rw * 0.16, ry * 0.16, C((255, 246, 230)), 0.5)


def _leg(img, W, H, x, y_top, w, hgt, swing, color, s):
    fill_rrect(img, W, H, x + swing * 14 * s, y_top + hgt / 2, w, hgt, w / 2, color)
    fill_ellipse(img, W, H, x + swing * 20 * s, y_top + hgt, w * 0.62, w * 0.42, color)


def draw_tail(img, W, H, x0, y0, ang, length, w0, color, s):
    ca, sa = math.cos(ang), math.sin(ang)
    for i in range(7):
        u = i / 6.0
        r = (w0 * (1.0 - 0.55 * u)) * s
        fill_ellipse(img, W, H, x0 + ca * length * u, y0 + sa * length * u + math.sin(u * 2.2) * 6 * s,
                     r, r * 0.85, color)


def draw_puppy(env, img, x, gy, t, wp, eat, wag_hz):
    """Metrics tuned so the muzzle meets an elevated bowl rim."""
    W, H, s = env.W, env.H, env.s
    bob = abs(math.sin(wp * 0.5)) * 6 * s * (1.0 - eat)
    by = gy - 236 * s + bob          # body centre height
    fill_ellipse(img, W, H, x - 115 * s, by + 8 * s, 110 * s, 92 * s, C((207, 154, 88)))
    fill_ellipse(img, W, H, x, by, 170 * s, 105 * s, C(DOG))
    fill_ellipse(img, W, H, x + 95 * s, by + 10 * s, 95 * s, 72 * s, C((224, 180, 118)))
    amp = 1.0 - eat
    sw1 = math.sin(wp) * amp
    sw2 = math.sin(wp + math.pi) * amp
    _leg(img, W, H, x + 118 * s, gy - 150 * s, 34 * s, 150 * s, sw1, C((192, 142, 76)), s)
    _leg(img, W, H, x + 70 * s, gy - 148 * s, 32 * s, 148 * s, sw2, C(DOG), s)
    _leg(img, W, H, x - 70 * s, gy - 148 * s, 32 * s, 148 * s, sw2, C((192, 142, 76)), s)
    _leg(img, W, H, x - 118 * s, gy - 150 * s, 34 * s, 150 * s, sw1, C(DOG), s)
    wag = math.sin(t * wag_hz) * (0.55 + 0.25 * eat)
    draw_tail(img, W, H, x - 155 * s, by - 40 * s, -2.35 + wag, 110 * s, 19, C((201, 149, 89)), s)
    nib = math.sin(t * 13.0) * 4 * s * eat
    hx, hy = x + 185 * s, by - 95 * s + eat * 85 * s + nib
    fill_ellipse(img, W, H, hx, hy, 62 * s, 58 * s, C(DOG))
    fill_ellipse(img, W, H, hx - 26 * s, hy - 36 * s, 20 * s, 38 * s, C(DOG_DK), angle=-0.45)
    sn = hy + 16 * s + eat * 8 * s
    fill_ellipse(img, W, H, hx + 40 * s, sn, 38 * s, 26 * s, C(DOG_LT))
    fill_ellipse(img, W, H, hx + 72 * s, sn - 2 * s, 10 * s, 8 * s, C(WARM_DARK))
    ey = hy - 14 * s - eat * 6 * s
    fill_ellipse(img, W, H, hx + 22 * s, ey, 8.5 * s, 9.5 * s, C(WARM_DARK))
    fill_ellipse(img, W, H, hx + 25 * s, ey - 3 * s, 2.6 * s, 2.6 * s, (1, 1, 1))
    fill_ellipse(img, W, H, hx - 2 * s, hy - 42 * s, 7 * s, 5 * s, C(DOG_DK), 0.6)


def draw_cat(env, img, x, gy, t, wp, eat, sniff):
    W, H, s = env.W, env.H, env.s
    bob = abs(math.sin(wp * 0.5)) * 4 * s * (1.0 - eat)
    by = gy - 66 * s + bob
    fill_ellipse(img, W, H, x, by, 122 * s, 56 * s, C(CAT))
    fill_ellipse(img, W, H, x - 70 * s, by + 6 * s, 70 * s, 48 * s, C(CAT))
    amp = 1.0 - eat
    sw1 = math.sin(wp) * amp
    sw2 = math.sin(wp + math.pi) * amp
    _leg(img, W, H, x + 78 * s, gy - 46 * s, 22 * s, 46 * s, sw1, C(CAT_DK), s)
    _leg(img, W, H, x + 44 * s, gy - 44 * s, 20 * s, 44 * s, sw2, C(CAT), s)
    _leg(img, W, H, x - 46 * s, gy - 44 * s, 20 * s, 44 * s, sw2, C(CAT_DK), s)
    _leg(img, W, H, x - 80 * s, gy - 46 * s, 22 * s, 46 * s, sw1, C(CAT), s)
    sway = math.sin(t * 1.4) * 0.30
    draw_tail(img, W, H, x - 118 * s, by - 10 * s, -1.9 + sway, 100 * s, 14, C(CAT_DK), s)
    head_dy = -24 * s * math.sin(math.pi * clamp01(sniff)) + eat * 34 * s \
        + (math.sin(t * 9.0) * 3 * s * eat)
    hx, hy = x + 150 * s, by - 58 * s + head_dy
    tilt = -0.35 * math.sin(math.pi * clamp01(sniff))
    fill_ellipse(img, W, H, hx, hy, 58 * s, 54 * s, C(CAT), angle=tilt)
    for ex in (-30, 30):
        exx = hx + ex * s * math.cos(tilt)
        exy = hy - 44 * s + ex * s * math.sin(tilt) * 0.4
        fill_polygon(img, W, H, [(exx - 16 * s, exy + 12 * s), (exx - 2 * s, exy - 26 * s),
                                 (exx + 14 * s, exy + 10 * s)], C(CAT_DK), angle=tilt)
        fill_polygon(img, W, H, [(exx - 9 * s, exy + 8 * s), (exx - 2 * s, exy - 14 * s),
                                 (exx + 8 * s, exy + 7 * s)], C((239, 228, 205)), angle=tilt)
    fill_ellipse(img, W, H, hx + 34 * s, hy + 14 * s, 26 * s, 18 * s, C((239, 228, 205)))
    fill_ellipse(img, W, H, hx + 56 * s, hy + 12 * s, 7 * s, 5.5 * s, C((42, 33, 27)))
    ey = hy - 12 * s
    fill_ellipse(img, W, H, hx + 16 * s, ey, 7 * s, 9 * s, C((63, 107, 82)), angle=tilt)
    fill_ellipse(img, W, H, hx + 40 * s, ey, 7 * s, 9 * s, C((63, 107, 82)), angle=tilt)
    fill_ellipse(img, W, H, hx + 18 * s, ey - 2 * s, 2.2 * s, 3.2 * s, (1, 1, 1))
    fill_ellipse(img, W, H, hx + 42 * s, ey - 2 * s, 2.2 * s, 3.2 * s, (1, 1, 1))


# ---------------- scenes ----------------

def scene_A(env, img, u, t):
    img[:] = env.macro
    W, H, s = env.W, env.H, env.s
    cx, cy = 0.63 * W, 0.585 * H
    for i in range(3):
        ph = (u * 2.2 + i / 3.0) % 1.0
        ring(img, W, H, cx, cy, (30 + ph * 430) * s, 10 * s, C((255, 236, 205)), (1 - ph) ** 1.6 * 0.5)
    pulse = 1 + 0.06 * math.sin(u * 40)
    fill_ellipse(img, W, H, cx, cy - 6 * s, 17 * s * pulse, 13 * s * pulse, C(CREAM_WHITE), 0.9)
    fill_ellipse(img, W, H, cx - 4 * s, cy - 10 * s, 5 * s, 4 * s, (1, 1, 1), 0.95)
    for j, (dx, dy, rr) in enumerate([(-180, 60, 7), (150, 90, 5), (60, -120, 4)]):
        fill_ellipse(img, W, H, cx + dx * s, cy + dy * s, rr * s, rr * s * 0.8, C(CREAM_WHITE), 0.5)
    gu = (u - 0.10) / 0.62
    if 0.0 < gu < 1.0:
        layer = Image.new("L", (W, H), 0)
        bw, bh = max(20, int(150 * s)), int(H * 1.4)
        tmp = Image.new("L", (bw, bh), 0)
        ImageDraw.Draw(tmp).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=bw // 2, fill=255)
        tmp = tmp.filter(ImageFilter.GaussianBlur(max(6, int(30 * s))))
        gx = lerp(-0.15 * W, 1.12 * W, gu)
        layer.paste(tmp, (int(gx - bw / 2), int(-bh * 0.2)))
        layer = layer.rotate(-14, center=(gx, H / 2), resample=Image.Resampling.BILINEAR)
        m = (np.asarray(layer, np.float32) / 255.0) * 0.5 * math.sin(math.pi * gu)
        img += m[..., None] * C((255, 246, 228))


def scene_B(env, img, u, t):
    img[:] = env.kitchen
    draw_bowl(env, img, env.bowl_geom(), water=True, t=t)
    env.draw_bokeh(img, t)


def _puppy_timeline(env, img, u, t, win):
    g = env.bowl_geom()
    draw_bowl(env, img, g, water=False, kibble=True, t=t)
    we = 0.42
    settle_x = g["bx"] - 330 * env.s
    start_x = -0.28 * env.W
    if u < we:
        p = ease_io(u / we)
        x = lerp(start_x, settle_x, p)
        wp = p * 14.0
        eat = 0.0
    else:
        x = settle_x
        eat = ease_io((u - we) / 0.16)
        wp = 14.0 + (u - we) * 6.0
    draw_puppy(env, img, x, g["gy"], t, wp, eat, wag_hz=7 + 5 * eat)


def scene_C(env, img, u, t):
    img[:] = env.kitchen
    _puppy_timeline(env, img, u, t, 4.0)
    env.draw_bokeh(img, t)


def scene_D(env, img, u, t):
    W, H, s = env.W, env.H, env.s
    img[:] = env.kitchen
    ct = 0.52 * H
    x0, x1 = int(0.44 * W), int(1.02 * W)
    img[int(ct):int(ct + 26 * s), x0:x1] = C((214, 178, 128))
    img[int(ct + 26 * s):int(ct + 190 * s), x0:x1] = C((186, 146, 96))
    img[int(ct + 26 * s):int(ct + 190 * s):max(2, int(60 * s)), x0:x1] *= 0.94
    g2 = dict(bx=0.74 * W, s=s * 0.62, gy=ct, rim_y=ct - 184 * (s * 0.62),
              rw=270 * (s * 0.62), ry=76 * (s * 0.62), depth=184 * (s * 0.62), stand=False)
    draw_bowl(env, img, g2, water=True, t=t)
    we = 0.35
    settle_x = g2["bx"] - 60 * g2["s"] - 150 * s
    start_x = -0.25 * W
    sniff = 0.0
    if u < we:
        p = ease_io(u / we)
        x = lerp(start_x, settle_x, p)
        wp = p * 12.0
        eat = 0.0
    else:
        x = settle_x
        su = (u - we) / 0.22
        sniff = su if su < 1.0 else 0.0
        eat = ease_io((u - we - 0.22) / max((1 - we - 0.22), 0.001) * 1.5) if su >= 1.0 else 0.0
        wp = 12.0 + (u - we) * 5.0
    draw_cat(env, img, x, ct, t, wp, eat, sniff)
    env.draw_bokeh(img, t)


def scene_E(env, img, u, t):
    img[:] = env.kitchen
    draw_bowl(env, img, env.bowl_geom(scale=0.92), water=True, t=t)
    env.draw_bokeh(img, t)
    dim = 0.30 * smoothstep((u - 0.25) / 0.75)
    if dim > 0:
        img *= (1.0 - dim)
        img += dim * C(WARM_DARK)


SCENES = {"A": scene_A, "B": scene_B, "C": scene_C, "D": scene_D, "E": scene_E}


def cam_A(u):
    return 1.02 + 0.11 * ease_io(u), 0.63, 0.585


def cam_B(u):
    e = ease_out(u)
    return 1.55 - 0.55 * e, 0.64 - 0.12 * e, 0.57 - 0.07 * e


def cam_C(u):
    return 1.05, 0.53 - 0.04 * u, 0.55


def cam_C2(u):
    return 1.30 + 0.10 * u, 0.60, 0.60


def cam_D(u):
    return 1.07 - 0.06 * u, 0.60, 0.50


def cam_D2(u):
    return 1.28 + 0.08 * u, 0.66, 0.47


def cam_E(u):
    return 1.0 + 0.03 * u, 0.55, 0.52


SEG_MASTER = [("A", 0, 3, cam_A), ("B", 3, 6, cam_B), ("C", 6, 10, cam_C),
              ("D", 10, 14, cam_D), ("E", 14, 15, cam_E)]
SEG_DOG = [("A", 0, 3, cam_A), ("B", 3, 6, cam_B), ("C", 6, 11, cam_C),
           ("C", 11, 14, cam_C2), ("E", 14, 15, cam_E)]
SEG_CAT = [("A", 0, 3, cam_A), ("B", 3, 6, cam_B), ("D", 6, 11, cam_D),
           ("D", 11, 14, cam_D2), ("E", 14, 15, cam_E)]


# ---------------- frame pipeline ----------------

def to_u8(x):
    return (np.clip(x, 0.0, 1.0) * 255.0 + 0.5).astype(np.uint8)


def cam_apply(im, z, cx, cy):
    W, H = im.size
    cw, ch = W / z, H / z
    x0 = min(max(cx * W - cw / 2, 0.0), W - cw)
    y0 = min(max(cy * H - ch / 2, 0.0), H - ch)
    box = (int(round(x0)), int(round(y0)), int(round(x0 + cw)), int(round(y0 + ch)))
    return im.crop(box).resize((W, H), Image.Resampling.BILINEAR)


def render_frame(env, segs, t, fi):
    W, H = env.W, env.H
    acc = None
    wsum = 0.0
    half = XF * 0.5
    for name, a, b, cam in segs:
        if t < a - half or t > b + half:
            continue
        u = (t - a) / (b - a)
        # crossfade straddles each boundary so weights always sum to 1
        w_in = 1.0 if a <= 0 else smoothstep((t - (a - half)) / XF)
        w_out = 1.0 if b >= DUR else smoothstep(((b + half) - t) / XF)
        w = w_in * w_out
        if w <= 0:
            continue
        buf = np.empty((H, W, 3), np.float32)
        SCENES[name](env, buf, clamp01(u), t)
        frame = Image.fromarray(to_u8(buf))
        del buf
        z, cx, cy = cam(clamp01(u))
        if z > 1.001:
            frame = cam_apply(frame, z, cx, cy)
        arr = np.asarray(frame, np.float32) / 255.0
        acc = arr * w if acc is None else acc + arr * w
        wsum += w
    if acc is None:
        acc = np.zeros((H, W, 3), np.float32)
        wsum = 1.0
    acc /= wsum
    acc *= env.vignette[..., None]
    acc[..., 0] *= 1.03
    acc[..., 2] *= 0.96
    acc += env.grains[fi % 6][..., None]
    return to_u8(acc)


def render(name, segs, size, bx_frac, previews=False):
    W, H = size
    env = Env(W, H, bx_frac)
    n_frames = int(round(DUR * FPS))
    out = os.path.join(VID, name + ".mp4")
    wr = imageio.get_writer(out, fps=FPS, codec="libx264", bitrate="5000k",
                            pixelformat="yuv420p", macro_block_size=8,
                            output_params=["-movflags", "+faststart"])
    prev_idx = {int(tt * FPS): tt for tt in (1.5, 4.5, 8.0, 12.0, 14.5)}
    import time as _time
    t0 = _time.time()
    for fi in range(n_frames):
        t = fi / FPS
        fr = render_frame(env, segs, t, fi)
        wr.append_data(fr)
        if previews and fi in prev_idx:
            Image.fromarray(fr).save(os.path.join(PREV, "%s-%.1fs.png" % (name, prev_idx[fi])))
        if fi % 48 == 0:
            el = _time.time() - t0
            print("  [%s] frame %d/%d (%.0fs elapsed)" % (name, fi, n_frames, el), flush=True)
    wr.close()
    print("  [%s] done in %.0fs -> %s" % (name, _time.time() - t0, out), flush=True)
    del env
    gc.collect()
    return out


# ---------------- audio ----------------

SR = 44100


def build_audio(path):
    n = int(SR * DUR)
    tt = np.arange(n, dtype=np.float64) / SR
    mix = np.zeros(n, dtype=np.float64)
    # warm ambient pad (Fmaj9-ish, low register)
    for f, a in [(87.31, 1.0), (130.81, 0.7), (174.61, 0.55), (220.0, 0.4), (261.63, 0.22), (329.63, 0.14)]:
        det = 1.0 + 0.0012 * math.sin(f)
        mix += a * np.sin(2 * np.pi * f * det * tt + 0.7 * f)
        mix += a * 0.5 * np.sin(2 * np.pi * f * 0.5 * tt + 1.3 * f)
    mix *= 0.10 * (1.0 + 0.15 * np.sin(2 * np.pi * 0.09 * tt))
    # gentle filtered noise air
    rng = np.random.default_rng(3)
    air = rng.normal(0, 1, n)
    FA = np.fft.rfft(air)
    fr = np.fft.rfftfreq(n, 1.0 / SR)
    FA *= (fr / 900.0) ** 2 / (1.0 + (fr / 900.0) ** 2) ** 2
    mix += 0.015 * np.fft.irfft(FA, n)
    # water plinks
    def plink(t0, f0, f1, dur, amp):
        i0 = int(t0 * SR)
        m = int(dur * SR)
        ts = np.arange(m) / SR
        f = f0 + (f1 - f0) * (ts / dur)
        ph = 2 * np.pi * np.cumsum(f) / SR
        mix[i0:i0 + m] += amp * np.exp(-ts * 16.0) * np.sin(ph)
    plink(0.9, 950, 480, 0.22, 0.045)
    plink(1.7, 720, 400, 0.20, 0.028)
    plink(10.8, 850, 460, 0.20, 0.030)
    # global lowpass warmth
    MX = np.fft.rfft(mix)
    MX *= 1.0 / (1.0 + (fr / 1400.0) ** 2)
    mix = np.fft.irfft(MX, n)
    # fades + normalize
    fade = int(0.5 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix *= 0.12 / max(np.max(np.abs(mix)), 1e-9)
    # stereo width
    right = np.roll(mix, int(0.010 * SR))
    data = np.empty((n, 2), dtype=np.int16)
    data[:, 0] = np.clip(mix * 32767, -32767, 32767).astype(np.int16)
    data[:, 1] = np.clip(right * 32767, -32767, 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(data.tobytes())
    print("  [audio] ambient bed written ->", path, flush=True)


def mux_audio(video, wav):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = video + ".mux.mp4"
    cmd = [ff, "-y", "-loglevel", "error", "-i", video, "-i", wav,
           "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
           "-movflags", "+faststart", "-shortest", tmp]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0 and os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, video)
        print("  [mux] audio added ->", video, flush=True)
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
        print("  [mux] skipped (audio not muxed)", flush=True)


def make_webm(src_mp4, dst_webm):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ff, "-y", "-loglevel", "error", "-i", src_mp4,
           "-c:v", "libvpx-vp9", "-b:v", "1300k", "-row-mt", "1", "-an", dst_webm]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0 and os.path.exists(dst_webm) and os.path.getsize(dst_webm) > 100000:
        print("  [webm]", dst_webm, flush=True)
        return True
    if os.path.exists(dst_webm):
        os.remove(dst_webm)
    print("  [webm] unavailable - mp4 alone is fine (browser falls back)", flush=True)
    return False


# ---------------- main ----------------

def main():
    wav = os.path.join(VID, "ambient.wav")
    build_audio(wav)
    print("[1/4] master 1920x1080 hero loop", flush=True)
    hero = render("hero", SEG_MASTER, (1920, 1080), 0.64, previews=True)
    mux_audio(hero, wav)
    make_webm(hero, os.path.join(VID, "hero.webm"))
    print("[2/4] dog-only cut 1280x720", flush=True)
    dog = render("hero-dog", SEG_DOG, (1280, 720), 0.62)
    mux_audio(dog, wav)
    print("[3/4] cat-only cut 1280x720", flush=True)
    cat = render("hero-cat", SEG_CAT, (1280, 720), 0.66)
    mux_audio(cat, wav)
    print("[4/4] vertical 1080x1920", flush=True)
    ver = render("hero-vertical", SEG_MASTER, (1080, 1920), 0.50)
    mux_audio(ver, wav)
    if os.path.exists(wav):
        os.remove(wav)
    print("ALL DONE", flush=True)
    for f in sorted(os.listdir(VID)):
        p = os.path.join(VID, f)
        print("  %-22s %.2f MB" % (f, os.path.getsize(p) / 1048576.0), flush=True)


if __name__ == "__main__":
    main()