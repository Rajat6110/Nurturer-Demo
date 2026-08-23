/* NURTURER motion engine:
   1. page fade transitions between routes
   2. inertia smooth scrolling (Lenis CDN if online; eased anchors always)
   3. scroll-reveal system (IntersectionObserver, auto-tagged sections)
   4. custom paw cursor w/ trailing prints + dog/cat variants (desktop only)
   5. hero video lazy activation (local assets/video/hero.mp4|webm) + poster
      Ken-Burns fallback, data-saver aware
*/
(function () {
  "use strict";
  var NRT = window.NRT || {};
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- paw icons ---------------- */
  function pawSvg(cat) {
    return '<svg viewBox="0 0 40 40" fill="currentColor">' +
      '<g class="paw-claws">' +
      '<path d="M8 6l1.6 3.4-3-1z"/><path d="M15 2.5l.7 3.6-2.6-2.2z"/>' +
      '<path d="M24 2.5l-.7 3.6 2.6-2.2z"/><path d="M32 6l-1.6 3.4 3-1z"/></g>' +
      '<ellipse cx="20" cy="27" rx="9.5" ry="7.5"/>' +
      '<ellipse cx="9" cy="17" rx="3.4" ry="4.2" transform="rotate(-18 9 17)"/>' +
      '<ellipse cx="16.5" cy="11.5" rx="3.4" ry="4.4" transform="rotate(-6 16.5 11.5)"/>' +
      '<ellipse cx="23.5" cy="11.5" rx="3.4" ry="4.4" transform="rotate(6 23.5 11.5)"/>' +
      '<ellipse cx="31" cy="17" rx="3.4" ry="4.2" transform="rotate(18 31 17)"/></svg>';
  }

  /* ---------------- 1. page transitions ---------------- */
  function initPageFade() {
    var f = document.createElement("div");
    f.className = "page-fade boot";
    document.body.appendChild(f);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { f.classList.remove("boot"); });
    });
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank") return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript)/i.test(href)) return;
      if (!/\.html(\?|#|$)/.test(href)) return;
      e.preventDefault();
      f.classList.add("leaving");
      setTimeout(function () { location.href = href; }, REDUCE ? 0 : 240);
    }, true);
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) f.classList.remove("leaving");
    });
  }

  /* ---------------- 2. smooth scrolling ---------------- */
  var lenisReady = false;
  function loadLenis(cb) {
    var s = document.createElement("script");
    s.src = "https://unpkg.com/lenis@1.1.14/dist/lenis.min.js";
    s.onload = cb; s.onerror = cb;
    document.head.appendChild(s);
  }
  function initSmoothScroll() {
    if (REDUCE) { bindAnchors(null); return; }
    loadLenis(function () {
      if (window.Lenis && !lenisReady) {
        lenisReady = true;
        /* lerp 0.16: still silky but noticeably snappier than 0.12 */
        NRT.lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1, smoothWheel: true });
        function raf(t) { NRT.lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
      }
      bindAnchors(NRT.lenis);
    });
    bindAnchors(NRT.lenis); /* works pre-load via fallback too */
  }
  function easedTo(y) {
    var start = window.scrollY, dist = y - start, t0 = null, dur = Math.min(1100, 380 + Math.abs(dist) * 0.25);
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, start + dist * p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function goTo(target) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 84;
    if (NRT.lenis && lenisReady) NRT.lenis.scrollTo(el, { offset: -84, duration: 1.15 });
    else easedTo(Math.max(0, y));
  }
  function bindAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a || e.metaKey || e.ctrlKey) return;
      var href = a.getAttribute("href");
      var hashIdx = href.indexOf("#");
      if (hashIdx === -1) return;
      var path = href.slice(0, hashIdx);
      var here = location.pathname.split("/").pop() || "index.html";
      if (path && path !== here) return;
      var id = href.slice(hashIdx + 1);
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      goTo(el);
      history.replaceState(null, "", "#" + id);
    });
  }

  /* ---------------- 3. scroll reveals ---------------- */
  var REVEAL_SEL = [
    ".section-head", ".feature-tile", ".quote-card", ".blog-card", ".product-card",
    ".cta-banner", ".newsletter", ".compare-shell", "[data-compare-wipe]",
    ".branch-card", ".card", ".form-card", ".summary-card", ".points-hero",
    ".split > div", ".hero-proof", ".social-strip", ".empty-state"
  ].join(",");
  function initReveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SEL));
    if (REDUCE) return;
    els.forEach(function (el) {
      if (el.classList.contains("rv") || el.closest(".hero")) return;
      el.classList.add("rv");
    });
    /* stagger siblings inside grids/splits */
    document.querySelectorAll(".grid").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        if (c.classList.contains("rv")) c.style.transitionDelay = (i % 4) * 90 + "ms";
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });

    /* timeline items cascade when visible */
    document.querySelectorAll(".timeline").forEach(function (tl) {
      var obs = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) {
          Array.prototype.forEach.call(tl.children, function (li, i) {
            li.style.transition = "opacity .5s ease " + i * 120 + "ms, transform .5s ease " + i * 120 + "ms";
            li.style.opacity = 0; li.style.transform = "translateX(-14px)";
            requestAnimationFrame(function () {
              li.style.opacity = 1; li.style.transform = "none";
            });
          });
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      obs.observe(tl);
    });
  }

  /* ---------------- 4. custom paw cursor ---------------- */
  function initCursor() {
    if (!FINE || REDUCE) return;
    var cur = document.createElement("div");
    cur.className = "paw-cursor";
    cur.innerHTML = pawSvg(false);
    var dot = document.createElement("div");
    dot.className = "paw-dot";
    document.body.appendChild(cur);
    document.body.appendChild(dot);
    document.body.classList.add("paw-on");

    var mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, dx = mx, dy = my;
    var lastTrail = 0, lx = mx, ly = my;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      cur.classList.add("on"); dot.style.display = "block";
      var now = performance.now();
      var dist = Math.hypot(mx - lx, my - ly);
      if (!REDUCE && now - lastTrail > 90 && dist > 26) {
        lastTrail = now; lx = mx; ly = my;
        var t = document.createElement("div");
        t.className = "paw-trail-print";
        t.style.left = mx + "px"; t.style.top = my + "px";
        t.style.setProperty("--rot", (Math.random() * 50 - 25).toFixed(0) + "deg");
        t.innerHTML = pawSvg(false);
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 850);
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.remove("on"); dot.style.display = "none"; });
    document.addEventListener("mousedown", function () { cur.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cur.classList.remove("is-down"); });

    /* hover state detection */
    var LINKY = 'a, button, .chip, .size-opt, .swatch, .font-opt, .motif-opt, label, [role="tab"]';
    document.addEventListener("mouseover", function (e) {
      var zone = e.target.closest("[data-cursor]");
      var linky = e.target.closest(LINKY);
      cur.classList.toggle("is-link", !!linky);
      var variant = zone ? zone.getAttribute("data-cursor") : null;
      if (!variant) {
        var speciesLink = e.target.closest('a[href*="species=dog"], a[href*="species=cat"]');
        if (speciesLink) variant = speciesLink.getAttribute("href").indexOf("cat") > -1 ? "cat" : "dog";
      }
      cur.classList.toggle("is-cat", variant === "cat");
      cur.classList.toggle("is-dog", variant === "dog");
    });

    (function loop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      dx += (mx - dx) * 0.55; dy += (my - dy) * 0.55;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      dot.style.transform = "translate(" + dx + "px," + dy + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- 5. hero video ---------------- */
  function initHeroVideo() {
    var v = document.getElementById("heroVideo");
    if (!v) return;
    var media = v.parentElement;
    var conn = navigator.connection || {};
    var slow = conn.saveData || /2g/i.test(conn.effectiveType || "");
    var mobile = window.matchMedia("(max-width: 760px)").matches;

    function activate() {
      v.querySelectorAll("source[data-src]").forEach(function (s) {
        s.src = s.getAttribute("data-src");
        s.removeAttribute("data-src");
      });
      v.addEventListener("canplay", function () {
        media.classList.add("video-live");
        document.querySelector(".hero").classList.add("has-video");
      }, { once: true });
      v.load();
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* stay on poster */ });
    }

    if (slow) return;                       /* respect data-saver: poster only */
    if (mobile) return;                     /* mobile: poster + Ken Burns only */
    var kick = (window.requestIdleCallback || function (f) { setTimeout(f, 900); });
    kick(activate);

    var snd = document.getElementById("heroSoundBtn");
    if (snd) {
      snd.addEventListener("click", function () {
        v.muted = !v.muted;
        snd.innerHTML = v.muted
          ? '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        snd.title = v.muted ? "Unmute" : "Mute";
      });
    }
  }

  /* ---------------- 5b. scroll performance ----------------
     - sticky header: drop backdrop-filter once scrolled (blur repaints the
       whole page behind the bar every frame)
     - hero: pause its video + all animations while offscreen or tab hidden
       (a looping 1080p decode + full-screen SVG animations are the heaviest
       things on the page and pure waste when not visible)            */
  function initScrollPerf() {
    var header = document.querySelector(".site-header");
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var hero = document.querySelector(".hero");
    var v = document.getElementById("heroVideo");
    function setHeroVisible(vis) {
      if (hero) hero.classList.toggle("hero-paused", !vis);
      if (!v || !v.getAttribute("src")) return;
      if (vis) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    }
    if (hero && "IntersectionObserver" in window) {
      var hio = new IntersectionObserver(function (es) {
        setHeroVisible(es[0].isIntersecting);
      }, { threshold: 0.04 });
      hio.observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      setHeroVisible(!document.hidden);
    });
  }

  /* ---------------- 6. subtle parallax accents ---------------- */
  function initParallax() {
    if (REDUCE) return;
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!els.length) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var vh = innerHeight;
        els.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var sp = parseFloat(el.getAttribute("data-parallax")) || 20;
          var prog = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform = "translateY(" + (-prog * sp).toFixed(1) + "px)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    initPageFade();
    initSmoothScroll();
    initReveals();
    initCursor();
    initHeroVideo();
    initScrollPerf();
    initParallax();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
