/* NURTURER - Copper vs conventional bowls: interactive comparison module.
   Two interactions:
   1) Material toggle -> updates a live comparison matrix (anti-bacterial,
      durability, hygiene + more).
   2) Before/after wipe slider (drag handle) comparing a traditional bowl
      week vs NURTURER copper-lined bowl week.
   Auto-mounts into any element with [data-compare-module] / [data-compare-wipe]. */

(function () {
  "use strict";

  var MATERIALS = {
    plastic: {
      name: "Plastic Bowl",
      rows: [
        { dim: "Anti-Bacterial", pip: "bad", text: "Scratches harbor biofilm and bacteria within weeks; degrades with every wash." },
        { dim: "Hygiene", pip: "bad", text: "Absorbs oils and odors; slime film returns hours after cleaning." },
        { dim: "Durability", pip: "mid", text: "Cheap to buy, but cracks, chews, and stains force frequent replacement." },
        { dim: "Pet Health", pip: "bad", text: "Linked to feline chin acne and irritation; micro-scratches can transfer to food." },
        { dim: "Freshness", pip: "bad", text: "Water goes stale-tasting fast; pets often drink less." }
      ]
    },
    ceramic: {
      name: "Ceramic Bowl",
      rows: [
        { dim: "Anti-Bacterial", pip: "mid", text: "Glazed surface resists bacteria - until the glaze chips, then it traps grime." },
        { dim: "Hygiene", pip: "mid", text: "Easy to clean while intact; hairline cracks are invisible germ hotels." },
        { dim: "Durability", pip: "bad", text: "Heavy but fragile - one drop on tile ends its life (and possibly yours, stepping on shards)." },
        { dim: "Pet Health", pip: "mid", text: "Lead-free certification varies widely by maker; verify before buying." },
        { dim: "Freshness", pip: "mid", text: "Neutral taste, but no active freshness protection." }
      ]
    },
    steel: {
      name: "Standard Stainless Steel",
      rows: [
        { dim: "Anti-Bacterial", pip: "mid", text: "Passive material only - it does not fight bacteria; scratches still harbor film." },
        { dim: "Hygiene", pip: "good", text: "Dishwasher-safe and non-porous when new." },
        { dim: "Durability", pip: "good", text: "Tough and long-lasting; lightweight bowls slide everywhere without grip." },
        { dim: "Pet Health", pip: "mid", text: "Safe, but floor-level sliding causes spills and mealtime stress for flat-faced pets." },
        { dim: "Freshness", pip: "mid", text: "No odor absorption, but water develops slime within a day." }
      ]
    },
    copper: {
      name: "NURTURER Copper-Lined",
      highlight: true,
      rows: [
        { dim: "Anti-Bacterial", pip: "good", text: "Copper contact surfaces naturally eliminate up to 99% of common bacteria* - no chemicals needed." },
        { dim: "Hygiene", pip: "good", text: "Biofilm can't establish like plastic; weekly 60-second rinse keeps the lining bright." },
        { dim: "Durability", pip: "good", text: "Solid body with non-slip weighted base; built for years of daily use, life-stage after life-stage." },
        { dim: "Pet Health", pip: "good", text: "Elevated heights support digestion and posture; shallow cat dish respects whiskers." },
        { dim: "Freshness", pip: "good", text: "Water stays noticeably fresher longer between refills." }
      ]
    }
  };

  function matrixHTML(key) {
    var m = MATERIALS[key];
    return '<table class="matrix"><thead><tr><th>Dimension</th><th>' +
      '<span class="status-pill ' + (m.highlight ? "approved" : "pending") + '">' +
      (m.highlight ? '<span class="status-dot"></span>' : "") + m.name + "</span></th></tr></thead><tbody>" +
      m.rows.map(function (r) {
        return "<tr><td>" + r.dim + '</td><td><span class="pip ' + r.pip + '"></span>' + r.text + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function initMatrix(host) {
    host.innerHTML =
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center">' +
      '<h3 style="font-size:20px">Health benefits matrix &mdash; live comparison</h3>' +
      '<span class="tag-note">*Laboratory-tested antimicrobial efficacy of copper contact surfaces</span></div>' +
      '<div class="mat-toggle" role="tablist">' +
      Object.keys(MATERIALS).map(function (k) {
        return '<button role="tab" data-mat="' + k + '" class="' + (k === "copper" ? "on" : "") + '">' + MATERIALS[k].name + "</button>";
      }).join("") + "</div>" +
      '<div data-mat-output>' + matrixHTML("copper") + "</div>";

    var out = host.querySelector("[data-mat-output]");
    host.querySelectorAll("[data-mat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        host.querySelectorAll("[data-mat]").forEach(function (b) { b.classList.remove("on"); });
        btn.classList.add("on");
        out.style.opacity = 0;
        setTimeout(function () { out.innerHTML = matrixHTML(btn.getAttribute("data-mat")); out.style.opacity = 1; }, 120);
      });
    });
    out.style.transition = "opacity .2s ease";
  }

  /* ---- wipe slider ---- */
  function initWipe(host) {
    host.innerHTML =
      '<div class="wipe-slider" data-slider>' +
      '<div class="wipe-panel">' +
      '<div class="wipe-side old"><span class="blog-tag" style="color:#8a6414">Traditional Bowl &mdash; Day 7</span>' +
      "<h3 style=\"font-size:22px;color:#6d5c49\">Slimy film. Sour smell. Scrubbing on your knees.</h3>" +
      '<p style="font-size:14px;color:#7a6a58">Biofilm rebuilds within hours on scratched plastic and plain steel. Water gets refilled, but never feels fresh.</p></div>' +
      '<div class="wipe-side new"><span class="blog-tag">NURTURER Copper-Lined &mdash; Day 7</span>' +
      "<h3 style=\"font-size:22px\">Clean basin. Fresher water. One quick rinse.</h3>" +
      '<p style="font-size:14px;color:#7d5a33">The copper interior actively suppresses bacterial growth between washes. Maintenance is a 60-second routine, not a workout.</p></div>' +
      "</div>" +
      '<div class="wipe-handle" aria-hidden="true"></div></div>' +
      '<p class="center tag-note mt-1">Drag the handle to reveal the difference.</p>';

    var slider = host.querySelector("[data-slider]");
    var handle = host.querySelector(".wipe-handle");
    var panel = slider.querySelector(".wipe-panel");
    var dragging = false;

    function move(clientX) {
      var rect = slider.getBoundingClientRect();
      var pct = Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100));
      handle.style.left = pct + "%";
      panel.style.gridTemplateColumns = pct + "% 1fr";
      panel.querySelector(".new").style.overflow = "hidden";
    }
    function start(e) {
      dragging = true;
      if (e.touches) e.preventDefault();
      move((e.touches ? e.touches[0] : e).clientX);
    }
    slider.addEventListener("mousedown", start);
    slider.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("mousemove", function (e) { if (dragging) move(e.clientX); });
    window.addEventListener("mouseup", function () { dragging = false; });
    window.addEventListener("touchmove", function (e) { if (dragging && e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
    window.addEventListener("touchend", function () { dragging = false; });

    /* keyboard accessibility */
    handle.setAttribute("tabindex", "0");
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.style.left || "50");
      if (e.key === "ArrowLeft") { handle.style.left = Math.max(8, cur - 4) + "%"; panel.style.gridTemplateColumns = Math.max(8, cur - 4) + "% 1fr"; }
      if (e.key === "ArrowRight") { handle.style.left = Math.min(92, cur + 4) + "%"; panel.style.gridTemplateColumns = Math.min(92, cur + 4) + "% 1fr"; }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-compare-module]").forEach(initMatrix);
    document.querySelectorAll("[data-compare-wipe]").forEach(initWipe);
  });
})();
