/* NURTURER - shared runtime: SVG art, header/footer, cart store,
   audience branching, toasts, newsletter, chat widget.
   Vanilla JS, no dependencies, works over file:// */

(function () {
  "use strict";

  var NRT = (window.NRT = window.NRT || {});

  /* ---------------- storage helpers ---------------- */
  NRT.store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem("nrt_" + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set: function (key, val) {
      try { localStorage.setItem("nrt_" + key, JSON.stringify(val)); } catch (e) {}
    },
    del: function (key) {
      try { localStorage.removeItem("nrt_" + key); } catch (e) {}
    }
  };

  /* ---------------- money ---------------- */
  NRT.php = function (n) {
    return "\u20B1" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 0 });
  };

  /* ---------------- SVG art library ---------------- */
  function copperDefs(id, base, light, dark) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + light + '"/>' +
      '<stop offset="45%" stop-color="' + base + '"/>' +
      '<stop offset="100%" stop-color="' + dark + '"/></linearGradient></defs>';
  }

  /* A bowl with optional stand + engraving text */
  var artUid = 0;
  NRT.bowlArt = function (opts) {
    opts = opts || {};
    var gid = "nrtGrad" + (++artUid);
    var body = opts.body || "#b87333", bodyL = "#e8b57c", bodyD = "#7a4519";
    if (opts.coat === "charcoal") { body = "#3a342e"; bodyL = "#6b625a"; bodyD = "#211d19"; }
    else if (opts.coat === "steel") { body = "#9aa0a6"; bodyL = "#d3d8dc"; bodyD = "#5f666c"; }
    else if (opts.coat === "cream") { body = "#e8d9bf"; bodyL = "#f7efe0"; bodyD = "#bfa87f"; }
    else if (opts.coat === "teal") { body = "#37655f"; bodyL = "#6da29a"; bodyD = "#1f403c"; }
    else if (opts.coat === "blush") { body = "#d8a49b"; bodyL = "#efcdc6"; bodyD = "#a56e64"; }
    var inner = "#e9a55f", innerL = "#ffd9a1", innerD = "#a96a2c";
    var text = opts.text ? opts.text.slice(0, 14) : "";
    var motif = "";
    if (opts.motif === "paw") motif = pawPath(58, 128, "#8a5220");
    if (opts.motif === "heart") motif = heartPath(58, 124, "#8a5220");
    if (opts.motif === "fish") motif = fishPath(50, 122, "#8a5220");
    if (opts.motif === "bone") motif = bonePath(46, 126, "#8a5220");
    return '<svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Copper-lined pet bowl">' +
      copperDefs(gid, body, bodyL, bodyD) +
      '<ellipse cx="120" cy="196" rx="86" ry="12" fill="rgba(90,58,25,.14)"/>' +
      (opts.stand ?
        '<rect x="52" y="150" width="136" height="34" rx="10" fill="#8a6234"/>' +
        '<rect x="60" y="184" width="120" height="12" rx="6" fill="#6f4d26"/>' : "") +
      /* bowl outer */
      '<path d="M36 92 Q40 158 120 160 Q200 158 204 92 Z" fill="url(#' + gid + ')" stroke="' + bodyD + '" stroke-width="2"/>' +
      /* copper-lined interior rim + basin */
      '<ellipse cx="120" cy="92" rx="84" ry="24" fill="' + inner + '" stroke="' + innerD + '" stroke-width="2"/>' +
      '<ellipse cx="120" cy="94" rx="70" ry="17" fill="' + innerL + '"/>' +
      '<ellipse cx="104" cy="91" rx="26" ry="7" fill="rgba(255,255,255,.5)"/>' +
      /* shine */
      '<path d="M52 108 Q58 138 78 148 L72 152 Q54 142 48 112 Z" fill="rgba(255,255,255,.28)"/>' +
      (motif ? motif : "") +
      (text ? '<text x="120" y="' + (motif ? "112" : "132") + '" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="17" fill="' + (opts.engraveDark || "#6f3f16") + '">' + esc(text) + "</text>" : "") +
      '</svg>';
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function pawPath(x, y, fill) {
    return '<g transform="translate(' + x + "," + y + ') scale(.9)" fill="' + fill + '">' +
      '<ellipse cx="18" cy="18" rx="16" ry="13"/>' +
      '<circle cx="4" cy="4" r="5"/><circle cx="15" cy="0" r="5"/><circle cx="27" cy="2" r="5"/><circle cx="35" cy="11" r="4.5"/></g>';
  }
  function heartPath(x, y, fill) {
    return '<path transform="translate(' + x + "," + y + ') scale(.06)" fill="' + fill + '" d="M240 80 C210 30 140 20 110 70 C85 115 130 165 240 250 C350 165 395 115 370 70 C340 20 270 30 240 80 Z"/>';
  }
  function fishPath(x, y, fill) {
    return '<path transform="translate(' + x + "," + y + ')" fill="' + fill + '" d="M0 14 Q14 0 32 0 Q52 0 62 14 Q52 28 32 28 Q14 28 0 14 Z M62 14 L78 2 L74 14 L78 26 Z"/>';
  }
  function bonePath(x, y, fill) {
    return '<g transform="translate(' + x + "," + y + ') rotate(-18)" fill="' + fill + '">' +
      '<rect x="8" y="8" width="44" height="10" rx="5"/>' +
      '<circle cx="8" cy="9" r="7"/><circle cx="8" cy="19" r="7"/><circle cx="52" cy="9" r="7"/><circle cx="52" cy="19" r="7"/></g>';
  }

  /* Cute pet faces for hero / sections */
  NRT.petArt = function (kind, sizeClass) {
    var dog = '<g>' +
      '<path d="M60 30 Q95 8 130 30 Q150 42 148 74 Q146 100 118 106 L72 106 Q44 100 42 74 Q40 42 60 30 Z" fill="#c99559"/>' +
      '<ellipse cx="75" cy="34" rx="16" ry="26" fill="#a9713a" transform="rotate(-18 75 34)"/>' +
      '<ellipse cx="116" cy="34" rx="16" ry="26" fill="#a9713a" transform="rotate(18 116 34)"/>' +
      '<circle cx="82" cy="66" r="7" fill="#2a211b"/><circle cx="110" cy="66" r="7" fill="#2a211b"/>' +
      '<circle cx="84.5" cy="63.5" r="2.2" fill="#fff"/><circle cx="112.5" cy="63.5" r="2.2" fill="#fff"/>' +
      '<ellipse cx="96" cy="88" rx="9" ry="7" fill="#2a211b"/><path d="M96 95 L96 102 M96 102 Q88 110 80 105 M96 102 Q104 110 112 105" stroke="#2a211b" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="68" cy="84" rx="6" ry="4" fill="#e8b57c"/><ellipse cx="124" cy="84" rx="6" ry="4" fill="#e8b57c"/></g>';
    var cat = '<g>' +
      '<path d="M62 44 L58 14 L88 32 Z" fill="#8f8578"/><path d="M130 44 L134 14 L104 32 Z" fill="#8f8578"/>' +
      '<path d="M64 41 L61 21 L83 34 Z" fill="#d9b8a6"/><path d="M128 41 L131 21 L109 34 Z" fill="#d9b8a6"/>' +
      '<ellipse cx="96" cy="72" rx="42" ry="38" fill="#a89a8a"/>' +
      '<ellipse cx="80" cy="66" rx="6" ry="8" fill="#3f6b52"/><ellipse cx="112" cy="66" rx="6" ry="8" fill="#3f6b52"/>' +
      '<circle cx="81.5" cy="63" r="2" fill="#fff"/><circle cx="113.5" cy="63" r="2" fill="#fff"/>' +
      '<path d="M92 82 Q96 86 100 82" stroke="#2a211b" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M96 86 L96 92 M96 92 Q90 98 84 94 M96 92 Q102 98 108 94" stroke="#2a211b" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M52 76 L30 70 M53 84 L32 86" stroke="#8a7a6c" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M140 76 L162 70 M139 84 L160 86" stroke="#8a7a6c" stroke-width="2" stroke-linecap="round"/></g>';
    var svg = '<svg class="' + (sizeClass || "") + '" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">' + (kind === "cat" ? cat : dog) + "</svg>";
    return svg;
  };

  /* small UI icons */
  NRT.icon = function (name) {
    var p = {
      cart: '<path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.6" fill="currentColor"/><circle cx="17" cy="21" r="1.6" fill="currentColor"/>',
      user: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      chat: '<path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      shield: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      drop: '<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      chevron: '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
      star: '<path d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.2 1.3-6.6L2.5 9l6.6-.8z" fill="currentColor"/>',
      sparkle: '<path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="currentColor"/>',
      gift: '<rect x="3" y="9" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 13h18M12 9v12M12 9c-4 0-6-2-6-4s4-2 6 4zM12 9c4 0 6-2 6-4s-4-2-6 4z" fill="none" stroke="currentColor" stroke-width="2"/>',
      heart: '<path d="M12 21S4 14.5 4 9a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5.5-8 12-8 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/>',
      brush: '<path d="M6 21c0-3 2-3 3-6l9-9 3 3-9 9c-3 1-3 3-6 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
    }[name] || "";
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + "</svg>";
  };

  /* ---------------- product card renderer ---------------- */
  NRT.productCardHTML = function (p) {
    var badge = p.badge ? '<span class="badge' + (p.tier === "premium" ? " gold" : " green") + '">' + p.badge + "</span>" : "";
    return '<a class="card product-card" href="product.html?id=' + p.id + '">' +
      '<div class="thumb">' + badge + NRT.bowlArt({ coat: (p.colors[0] || {}).key }) + "</div>" +
      '<div class="body">' +
      '<span class="mini-meta">' + (p.species.indexOf("cat") > -1 && p.species.indexOf("dog") > -1 ? "Dogs & Cats" : p.species[0] === "dog" ? "Dogs" : "Cats") + " \u2022 " + (p.tier === "premium" ? "Premium" : "Mainstream") + "</span>" +
      "<h3>" + p.name + "</h3>" +
      '<div><span class="stars" style="font-size:13px">&#9733;</span> <span class="mini-meta">' + p.rating + " (" + p.reviewCount + ")</span></div>" +
      '<div class="price-row"><span class="price">' + NRT.php(p.price) + "</span>" +
      (p.compareAt ? '<span class="price-was">' + NRT.php(p.compareAt) + "</span>" : "") + "</div>" +
      '<span class="mini-meta">Sizes: ' + p.sizes.map(function (s) { return s.label; }).join(" \u2022 ") + "</span>" +
      "</div></a>";
  };

  /* ---------------- toast ---------------- */
  NRT.toast = function (msg) {
    var zone = document.querySelector(".toast-zone");
    if (!zone) {
      zone = document.createElement("div");
      zone.className = "toast-zone";
      document.body.appendChild(zone);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    zone.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .4s"; }, 2600);
    setTimeout(function () { t.remove(); }, 3100);
  };

  /* ---------------- cart store ---------------- */
  NRT.cart = {
    items: function () { return NRT.store.get("cart", []); },
    count: function () {
      return this.items().reduce(function (n, i) { return n + i.qty; }, 0);
    },
    add: function (line) {
      var items = this.items();
      var match = items.find(function (i) {
        return i.id === line.id && i.sizeKey === line.sizeKey && i.colorKey === line.colorKey &&
          (!i.customized && !line.customized);
      });
      if (match) { match.qty += line.qty || 1; }
      else { line.qty = line.qty || 1; items.push(line); }
      NRT.store.set("cart", items);
      this.refreshBadge();
    },
    updateQty: function (idx, qty) {
      var items = this.items();
      if (qty <= 0) items.splice(idx, 1);
      else items[idx].qty = qty;
      NRT.store.set("cart", items);
      this.refreshBadge();
    },
    remove: function (idx) {
      var items = this.items();
      items.splice(idx, 1);
      NRT.store.set("cart", items);
      this.refreshBadge();
    },
    clear: function () { NRT.store.set("cart", []); this.refreshBadge(); },
    subtotal: function () {
      return this.items().reduce(function (s, i) {
        return s + (i.unitPrice + (i.delta || 0)) * i.qty;
      }, 0);
    },
    refreshBadge: function () {
      var el = document.getElementById("cartCount");
      if (el) {
        var n = this.count();
        el.textContent = n;
        el.style.display = n ? "grid" : "none";
      }
    }
  };

  /* ---------------- auth ---------------- */
  NRT.auth = {
    user: function () { return NRT.store.get("user", null); },
    login: function (email, name) {
      var u = { email: email, name: name || email.split("@")[0], since: new Date().toISOString() };
      if (!NRT.store.get("pointsHistory", null)) seedPoints(u.email);
      NRT.store.set("user", u);
      return u;
    },
    logout: function () { NRT.store.del("user"); }
  };
  function seedPoints(email) {
    NRT.store.set("points", 320);
    NRT.store.set("pointsHistory", [
      { when: "2026-08-02", label: "Welcome bonus", pts: 100 },
      { when: "2026-07-18", label: "Order #NRT-10231 - Signature Elevated Dog Bowl", pts: 180 },
      { when: "2026-07-18", label: "Referral: friend's first order", pts: 40 }
    ]);
  }

  /* ---------------- audience branch ---------------- */
  NRT.audience = {
    get: function () { return NRT.store.get("audience", null); },
    set: function (mode) {
      NRT.store.set("audience", mode);
      document.dispatchEvent(new CustomEvent("nrt:audience", { detail: mode }));
      applyAudience(mode);
    }
  };
  function applyAudience(mode) {
    var pillB2C = document.getElementById("pillB2C");
    var pillB2B = document.getElementById("pillB2B");
    if (pillB2C) pillB2C.classList.toggle("on", mode === "b2c");
    if (pillB2B) pillB2B.classList.toggle("on", mode === "b2b");
    document.querySelectorAll("[data-b2c-only]").forEach(function (el) {
      el.style.display = mode === "b2b" ? "none" : "";
    });
    document.querySelectorAll("[data-b2b-only]").forEach(function (el) {
      el.style.display = mode === "b2c" ? "none" : "";
    });
  }

  /* ---------------- header / footer ---------------- */
  function navLink(href, label, current) {
    var active = location.pathname.split("/").pop() === href ||
      (href === "shop.html" && ["product.html"].indexOf(current) > -1);
    return '<a href="' + href + '"' + (active ? ' class="active"' : "") + ">" + label + "</a>";
  }

  NRT.renderHeader = function () {
    var host = document.getElementById("siteHeader");
    if (!host) return;
    var cur = location.pathname.split("/").pop();
    host.innerHTML =
      '<div class="announce">Free Philippine shipping on orders over \u20B11,500 &nbsp;\u2022&nbsp; Now shipping to <strong>Singapore, Malaysia &amp; Thailand</strong></div>' +
      '<header class="site-header"><div class="wrap header-inner">' +
      '<button class="nav-toggle" id="navToggle" aria-label="Menu">' + NRT.icon("menu") + "</button>" +
      '<a class="logo" href="index.html"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#b87333"/><ellipse cx="20" cy="16" rx="13" ry="5.5" fill="#f7e8d6"/><ellipse cx="20" cy="17.5" rx="9.5" ry="3.6" fill="#e9a55f"/><path d="M8 17 Q10 30 20 31 Q30 30 32 17 Z" fill="#8a5220"/></svg>NURTURER</a>' +
      '<nav class="main-nav" id="mainNav">' +
      '<a href="shop.html?species=dog"' + (cur === "shop.html" ? "" : "") + ' data-cursor="dog">Dogs</a>' +
      '<a href="shop.html?species=cat" data-cursor="cat">Cats</a>' +
      navLink("learn.html", "Why Copper?", cur) +
      navLink("customize.html", "Customize", cur) +
      navLink("b2b.html", "For Business", cur) +
      navLink("blog.html", "Blog", cur) +
      "</nav>" +
      '<div class="header-actions">' +
      '<span class="audience-pill"><button id="pillB2C">Fur Parent</button><button id="pillB2B">Business</button></span>' +
      '<a class="icon-btn" href="account.html" aria-label="Account">' + NRT.icon("user") + "</a>" +
      '<a class="icon-btn" href="cart.html" aria-label="Cart">' + NRT.icon("cart") +
      '<span class="cart-count" id="cartCount" style="display:none">0</span></a>' +
      "</div></div></header>";
    document.getElementById("navToggle").addEventListener("click", function () {
      document.getElementById("mainNav").classList.toggle("open");
    });
    document.getElementById("pillB2C").addEventListener("click", function () { NRT.audience.set("b2c"); NRT.toast("Shopping as a fur parent"); });
    document.getElementById("pillB2B").addEventListener("click", function () { NRT.audience.set("b2b"); NRT.toast("Switched to business mode - wholesale pricing unlocked"); });
    NRT.cart.refreshBadge();
    applyAudience(NRT.audience.get() || "b2c");
  };

  NRT.renderFooter = function () {
    var host = document.getElementById("siteFooter");
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-inner">' +
      '<div class="footer-brand">' +
      '<a class="logo" href="index.html" style="color:#fff"><svg viewBox="0 0 40 40" width="30" height="30"><circle cx="20" cy="20" r="19" fill="#b87333"/><ellipse cx="20" cy="16" rx="13" ry="5.5" fill="#f7e8d6"/><path d="M8 17 Q10 30 20 31 Q30 30 32 17 Z" fill="#8a5220"/></svg>NURTURER</a>' +
      "<p>Copper-lined, elevated feeding for dogs and cats across the Philippines and Southeast Asia. Comfortable for them. Effortless for you.</p>" +
      '<p style="font-size:13px;margin-top:16px">Made for fur parents. Built for businesses.</p></div>' +
      "<div><h4>Shop</h4><ul>" +
      '<li><a href="shop.html?species=dog">Dog Bowls</a></li>' +
      '<li><a href="shop.html?species=cat">Cat Bowls</a></li>' +
      '<li><a href="customize.html">Custom Engraving</a></li>' +
      '<li><a href="rewards.html">Rewards &amp; Points</a></li></ul></div>' +
      "<div><h4>Learn</h4><ul>" +
      '<li><a href="learn.html">Why Copper-Lined?</a></li>' +
      '<li><a href="faq.html">FAQ</a></li>' +
      '<li><a href="faq.html#materials">Materials &amp; Safety</a></li>' +
      '<li><a href="blog.html">Blog</a></li></ul></div>' +
      "<div><h4>Company</h4><ul>" +
      '<li><a href="foundation.html">Pet Foundation</a></li>' +
      '<li><a href="b2b.html">Wholesale / B2B</a></li>' +
      '<li><a href="contact.html">Contact Us</a></li>' +
      '<li><a href="account.html">My Account</a></li></ul></div>' +
      "</div>" +
      '<div class="footer-bottom"><span>\u00A9 2026 NURTURER Pet Supplies Corp. Philippines</span>' +
      "<span>GCash \u2022 Maya \u2022 Visa \u2022 COD \u2022 Bank Transfer</span></div>" +
      "</div></footer>";
  };

  /* ---------------- newsletter capture (all pages) ---------------- */
  NRT.bindNewsletter = function () {
    document.querySelectorAll("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = form.querySelector("input[type=email]").value.trim();
        if (!email) return;
        var list = NRT.store.get("subscribers", []);
        if (!list.some(function (s) { return s.email === email; })) {
          list.push({ email: email, at: new Date().toISOString(), source: location.pathname });
          NRT.store.set("subscribers", list);
        }
        form.innerHTML = '<p style="color:#fff;font-weight:800">You\'re in! Watch your inbox for your 10% first-order code.</p>';
        NRT.toast("Subscribed - welcome to the NURTURER pack!");
      });
    });
  };

  /* ---------------- chat widget ---------------- */
  function botReply(text) {
    var t = text.toLowerCase();
    if (t.includes("custom") || t.includes("engrav") || t.includes("name"))
      return { html: 'We personalize bowls with names, fonts, colors, and motifs. Design yours in the <a href="customize.html" style="text-decoration:underline"><b>Customize Studio</b></a>, then approve the artwork from your account before we etch it.', quick: ["Open Customize Studio"] };
    if (t.includes("wholesale") || t.includes("b2b") || t.includes("resell") || t.includes("business"))
      return { html: 'Great - our B2B portal covers wholesale pricing, MOQs, and co-branded bowls for stores, clinics, groomers, and hotels. Start here: <a href="b2b.html" style="text-decoration:underline"><b>Wholesale Inquiry</b></a>', quick: ["Wholesale pricing", "MOQ?"] };
    if (t.includes("ship") || t.includes("deliver") || t.includes("singapore") || t.includes("malaysia"))
      return { html: "We ship nationwide in the Philippines (free over \u20B11,500, 2-5 days via our courier partners) and now deliver to Singapore, Malaysia, and Thailand (5-9 days). More SEA countries are rolling out through 2027." };
    if (t.includes("clean") || t.includes("care") || t.includes("wash"))
      return { html: "Easy: hand-wash with mild soap and warm water, wipe dry - about 60 seconds a week. Avoid abrasive scouring pads on the exterior coat. Full guide is in our FAQ under Care Instructions." };
    if (t.includes("copper") || t.includes("why"))
      return { html: 'Our hero feature! Copper lining is naturally anti-bacterial and keeps food and water fresher longer than plastic or plain steel. See the science and an interactive comparison here: <a href="learn.html" style="text-decoration:underline"><b>Why Copper?</b></a>' };
    if (t.includes("price") || t.includes("how much") || t.includes("cost"))
      return { html: 'The Everyday line starts at \u20B1645 and the premium Signature Collection at \u20B11,295. Use code <b>NURTURER10</b> for 10% off your first order.' };
    if (t.includes("moq"))
      return { html: "Wholesale MOQ starts at just 24 units per SKU, with tiered discounts at 50, 100, and 250+ units. The full price ladder is on the B2B page." };
    if (t.includes("hi") || t.includes("hello") || t.includes("hey"))
      return { html: "Hi there! Welcome to NURTURER. Are you shopping for your own fur baby or looking into wholesale for a business?" , quick: ["For my pet", "For my business"] };
    return { html: "Thanks for the message! A human teammate will follow up within business hours (9am-6pm PHT). Meanwhile, try asking me about copper lining, shipping, customization, or wholesale." };
  }

  function initChat() {
    var launcher = document.createElement("button");
    launcher.className = "chat-launcher";
    launcher.setAttribute("aria-label", "Chat with us");
    launcher.innerHTML = NRT.icon("chat");
    var panel = document.createElement("div");
    panel.className = "chat-panel";
    panel.innerHTML =
      '<div class="chat-head"><b>NURTURER Assistant</b><span>Typically replies in minutes \u2022 9am-6pm PHT</span></div>' +
      '<div class="chat-log" id="chatLog"></div>' +
      '<form class="chat-input" id="chatForm"><input type="text" placeholder="Ask about copper, shipping, wholesale..." aria-label="Message"><button type="submit">Send</button></form>';
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    var log = panel.querySelector("#chatLog");
    var form = panel.querySelector("#chatForm");
    var input = form.querySelector("input");

    function push(cls, content, quick) {
      var m = document.createElement("div");
      m.className = "msg " + cls;
      m.innerHTML = content;
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      if (quick) {
        quick.forEach(function (q) {
          var b = document.createElement("button");
          b.className = "chip";
          b.style.margin = "3px";
          b.textContent = q;
          b.addEventListener("click", function () {
            input.value = q;
            form.dispatchEvent(new Event("submit"));
          });
          var wrap = document.createElement("div");
          wrap.appendChild(b);
          m.after(wrap);
          log.scrollTop = log.scrollHeight;
        });
      }
    }

    launcher.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      if (open && !log.children.length) {
        push("bot", "Hi, I'm the NURTURER assistant! Copper keeps bowls naturally hygienic - ask me anything about bowls, shipping, customization, or wholesale.", ["What makes copper special?", "Shipping to my area?", "Customize with my pet's name"]);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      push("user", esc(v));
      input.value = "";
      setTimeout(function () {
        var r = botReply(v);
        push("bot", r.html, r.quick);
      }, 450);
    });
  }

  /* ---------------- abandoned cart reminder ---------------- */
  function initAbandonedCart() {
    var dismissed = sessionStorage.getItem("nrt_abDismissed");
    setInterval(function () {
      if (dismissed) return;
      if (location.pathname.indexOf("cart.html") > -1 || location.pathname.indexOf("checkout.html") > -1) return;
      var items = NRT.cart.items();
      if (!items.length) return;
      var flag = sessionStorage.getItem("nrt_abShown");
      if (flag) return;
      sessionStorage.setItem("nrt_abShown", "1");
      var bar = document.createElement("div");
      bar.className = "toast-zone";
      bar.id = "abZone";
      bar.innerHTML = '<div class="toast" style="display:flex;gap:16px;align-items:center">You left something behind - your bowl is still waiting. <a class="btn btn-primary btn-sm" href="cart.html">Resume checkout</a><button class="link-danger" id="abClose" style="color:#eac9a4">Dismiss</button></div>';
      document.body.appendChild(bar);
      bar.querySelector("#abClose").addEventListener("click", function () {
        sessionStorage.setItem("nrt_abDismissed", "1");
        bar.remove();
      });
    }, 20000);
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    NRT.renderHeader();
    NRT.renderFooter();
    NRT.bindNewsletter();
    initChat();
    initAbandonedCart();
  });
})();
