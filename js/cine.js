/* NURTURER - cinematic hero storyboard (15s pure-code loop).
   Injects five animated scenes into .hero-media on the homepage.
   Auto-overridden by assets/video/hero.mp4 when present. */
(function () {
  "use strict";

  var DEFS =
    '<linearGradient id="cuG" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#eebd85"/><stop offset="45%" stop-color="#c07f3a"/><stop offset="100%" stop-color="#8a5220"/></linearGradient>' +
    '<linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a87c48"/><stop offset="100%" stop-color="#74522a"/></linearGradient>' +
    '<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6c99e"/><stop offset="100%" stop-color="#cfa873"/></linearGradient>' +
    '<radialGradient id="glowWarm" cx="0.68" cy="0.3" r="0.9"><stop offset="0%" stop-color="#fff3dd"/><stop offset="100%" stop-color="#ecd9ba"/></radialGradient>' +
    '<linearGradient id="glintG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="50%" stop-color="#fff" stop-opacity=".75"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="vinG" cx="0.5" cy="0.45" r="0.95"><stop offset="62%" stop-color="#2a211b" stop-opacity="0"/>' +
    '<stop offset="100%" stop-color="#2a211b" stop-opacity=".55"/></radialGradient>';

  function svg(inner) {
    return '<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">' + inner + "</svg>";
  }

  /* A - macro: copper interior, droplet ripple rings, light glint */
  var A = svg('<rect width="1920" height="1080" fill="url(#glowWarm)"/><g class="cam">' +
    '<ellipse cx="1350" cy="820" rx="1150" ry="600" fill="url(#cuG)"/>' +
    '<ellipse cx="1330" cy="700" rx="920" ry="430" fill="#ffd9a1"/>' +
    '<path d="M420 520 Q900 300 1500 430 L1470 520 Q940 400 500 600 Z" fill="rgba(255,255,255,.32)"/>' +
    '<g fill="none" stroke="#b96f24" stroke-width="12">' +
    '<ellipse class="ripple-ring r1" cx="1210" cy="640" rx="190" ry="52"/>' +
    '<ellipse class="ripple-ring r2" cx="1210" cy="640" rx="190" ry="52"/>' +
    '<ellipse class="ripple-ring r3" cx="1210" cy="640" rx="190" ry="52"/></g>' +
    '<circle cx="1210" cy="566" r="26" fill="#fff" opacity=".85"/>' +
    '<rect class="glint-bar" x="-160" y="180" width="240" height="860" rx="120" fill="url(#glintG)" opacity="0"/></g>');

  /* bowl helper for B/C/E */
  function bowl(cx, rimY, rw, rh, sw) {
    return '<ellipse cx="' + cx + '" cy="' + (rimY + 452 - 430) + '" rx="0" ry="0"/>' +
      '<path d="M' + (cx - rw) + " " + rimY + " Q" + (cx - rw + 11) + " " + (rimY + 176) + " " + cx + " " + (rimY + 184) +
      " Q" + (cx + rw - 11) + " " + (rimY + 176) + " " + (cx + rw) + " " + rimY +
      ' Z" fill="url(#cuG)" stroke="#7a4519" stroke-width="' + sw + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + rimY + '" rx="' + rw * 0.72 + '" ry="' + rh + '" fill="#eda95f" stroke="#a96a2c" stroke-width="' + sw + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + (rimY + 9) + '" rx="' + rw * 0.59 + '" ry="' + rh * 0.69 + '" fill="#ffdca6"/>' +
      '<ellipse cx="' + (cx - rw * 0.25) + '" cy="' + (rimY - 3) + '" rx="' + rw * 0.21 + '" ry="' + rh * 0.24 + '" fill="rgba(255,255,255,.5)"/>';
  }
  function stand(cx, y) {
    return '<rect x="' + (cx - 190) + '" y="' + y + '" width="380" height="118" rx="26" fill="url(#woodG)"/>' +
      '<rect x="' + (cx - 168) + '" y="' + (y + 114) + '" width="336" height="34" rx="17" fill="#5d421f"/>';
  }

  /* B - pull-back reveal */
  var B = svg('<rect width="1920" height="1080" fill="url(#glowWarm)"/>' +
    '<polygon points="0,0 640,0 260,1080 0,1080" fill="#ffffff" opacity=".22"/>' +
    '<rect y="850" width="1920" height="230" fill="url(#floorG)"/>' +
    '<g class="cam"><ellipse cx="1290" cy="884" rx="360" ry="34" fill="rgba(90,58,25,.15)"/>' +
    stand(1290, 650) + bowl(1290, 430, 270, 76, 5) + "</g>");

  /* C - golden puppy trots in, settles, eats */
  var C = svg('<rect width="1920" height="1080" fill="url(#glowWarm)"/>' +
    '<rect y="850" width="1920" height="230" fill="url(#floorG)"/>' +
    '<g class="cam"><ellipse cx="1400" cy="886" rx="350" ry="32" fill="rgba(90,58,25,.15)"/>' +
    stand(1400, 652) + bowl(1400, 434, 268, 74, 5) +
    '<g class="puppy"><path class="wagger" d="M880 668 Q800 628 814 556" stroke="#c99559" stroke-width="26" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="1030" cy="708" rx="150" ry="94" fill="#d3a05f"/>' +
    '<rect x="948" y="768" width="34" height="88" rx="17" fill="#c08e4c"/>' +
    '<rect x="1084" y="768" width="34" height="88" rx="17" fill="#c08e4c"/>' +
    '<g class="nibbler"><circle cx="1172" cy="646" r="72" fill="#d3a05f"/>' +
    '<ellipse cx="1134" cy="590" rx="18" ry="34" fill="#b07f42" transform="rotate(-24 1134 590)"/>' +
    '<ellipse cx="1172" cy="684" rx="44" ry="30" fill="#e9c48c"/>' +
    '<circle cx="1220" cy="660" r="13" fill="#2a211b"/>' +
    '<circle cx="1172" cy="636" r="10" fill="#2a211b"/></g></g></g>');

  /* D - cream cat at counter bowl */
  var D = svg('<rect width="1920" height="1080" fill="url(#glowWarm)"/>' +
    '<g class="cam"><rect x="930" y="600" width="990" height="34" rx="8" fill="#caa06a"/>' +
    '<rect x="930" y="634" width="990" height="120" fill="#b98d58"/>' +
    '<ellipse cx="1590" cy="606" rx="250" ry="16" fill="rgba(90,58,25,.14)"/>' +
    '<path d="M1390 400 Q1398 518 1590 524 Q1782 518 1790 400 Z" fill="url(#cuG)" stroke="#7a4519" stroke-width="4"/>' +
    '<ellipse cx="1590" cy="400" rx="200" ry="54" fill="#eda95f" stroke="#a96a2c" stroke-width="4"/>' +
    '<ellipse cx="1590" cy="408" rx="162" ry="37" fill="#ffdca6"/>' +
    '<g class="catwalk"><path class="cat-tail" d="M1130 512 Q1050 480 1064 396" stroke="#cdbfa8" stroke-width="22" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="1268" cy="518" rx="130" ry="62" fill="#ddd0b8"/>' +
    '<g class="cat-head"><path d="M1372 428 L1362 372 L1412 398 Z" fill="#cdbfa8"/>' +
    '<path d="M1452 428 L1462 372 L1412 398 Z" fill="#cdbfa8"/>' +
    '<circle cx="1412" cy="452" r="58" fill="#ddd0b8"/>' +
    '<ellipse cx="1388" cy="440" rx="7" ry="10" fill="#3f6b52"/>' +
    '<ellipse cx="1436" cy="440" rx="7" ry="10" fill="#3f6b52"/>' +
    '<path d="M1400 472 Q1412 482 1424 472" stroke="#2a211b" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M1352 462 L1318 454 M1354 476 L1322 482 M1472 462 L1506 454 M1470 476 L1502 482" stroke="#b7a98f" stroke-width="3.5" stroke-linecap="round"/></g></g></g>');

  /* E - calm wide hold, soft fade, clean frame left for CTA */
  var E = svg('<rect width="1920" height="1080" fill="url(#glowWarm)"/>' +
    '<rect y="880" width="1920" height="200" fill="url(#floorG)"/>' +
    '<g class="cam"><ellipse cx="1330" cy="902" rx="290" ry="28" fill="rgba(90,58,25,.13)"/>' +
    stand(1330, 720) + bowl(1330, 550, 208, 58, 4) + "</g>" +
    '<rect width="1920" height="1080" fill="url(#vinG)"/>' +
    '<rect class="dimmer" width="1920" height="1080" fill="#2a211b" opacity="0"/>');

  function inject() {
    var media = document.querySelector(".hero-video .hero-media");
    if (!media || media.querySelector(".cine")) return;
    var wrap = document.createElement("div");
    wrap.className = "cine";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<svg width="0" height="0" focusable="false" style="position:absolute"><defs>' + DEFS + "</defs></svg>" +
      '<div class="scene scene-a">' + A + "</div>" +
      '<div class="scene scene-b">' + B + "</div>" +
      '<div class="scene scene-c">' + C + "</div>" +
      '<div class="scene scene-d">' + D + "</div>" +
      '<div class="scene scene-e">' + E + "</div>";
    media.insertBefore(wrap, media.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();
})();
