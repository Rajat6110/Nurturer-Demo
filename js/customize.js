/* NURTURER - Custom Design Studio
   5-step wizard with live SVG preview. On submit, creates a design order in
   localStorage (nrt_orders) starting at status "Artwork Pending", which the
   account page tracks through the approval pipeline:
   Artwork Pending -> In Design -> Awaiting Your Approval -> Approved / Revision */

(function () {
  "use strict";
  var NRT = window.NRT;

  var FONTS = [
    { key: "elegant", name: "Elegant Serif", css: '"Fraunces", Georgia, serif', weight: "700" },
    { key: "script", name: "Playful Script", css: '"Pacifico", cursive', weight: "400" },
    { key: "bold", name: "Bold Caps", css: '"Bebas Neue", Impact, sans-serif', weight: "400" },
    { key: "clean", name: "Clean Modern", css: '"Nunito Sans", sans-serif', weight: "800" }
  ];
  var FINISHES = [
    { key: "hammered", name: "Hammered Copper", hex: "#b87333" },
    { key: "rose", name: "Rose Copper", hex: "#c98a6b" },
    { key: "charcoal", name: "Charcoal + Copper", hex: "#3a342e" },
    { key: "cream", name: "Cream Enamel", hex: "#e8d9bf" },
    { key: "teal", name: "Deep Teal", hex: "#37655f" }
  ];
  var MOTIFS = [
    { key: "none", label: "None" }, { key: "paw", label: "Paw" },
    { key: "heart", label: "Heart" }, { key: "fish", label: "Fish" }, { key: "bone", label: "Bone" }
  ];
  var ENGRAVE_FEE = 350;

  var state = {
    step: 1,
    productId: null,
    sizeIdx: 0,
    text: "",
    fontKey: "elegant",
    finishKey: "hammered",
    motifKey: "none",
    isB2B: false
  };

  function product() {
    return NRT_PRODUCTS.find(function (p) { return p.id === state.productId; }) || NRT_PRODUCTS[0];
  }

  /* ---------- preview ---------- */
  function renderPreview() {
    var stage = document.getElementById("previewStage");
    var art = NRT.bowlArt({ coat: state.finishKey, text: state.text || "", motif: state.motifKey });
    stage.innerHTML = art;
    if (state.text) {
      var f = FONTS.find(function (x) { return x.key === state.fontKey; });
      var t = stage.querySelector("text");
      if (t && f) {
        t.style.fontFamily = f.css;
        t.style.fontWeight = f.weight;
        t.setAttribute("font-style", f.key === "bold" ? "normal" : f.key === "clean" ? "normal" : "italic");
      }
    }
    updateSummary();
  }

  function updateSummary() {
    var p = product();
    var s = p.sizes[state.sizeIdx];
    document.getElementById("sumModel").textContent = p.name;
    document.getElementById("sumSize").textContent = s.label + " - " + s.lifeStage;
    document.getElementById("sumText").textContent = state.text ? '"' + state.text + '"' + (state.isB2B ? " + logo" : "") : "None yet";
    document.getElementById("sumStyle").textContent =
      FONTS.find(function (x) { return x.key === state.fontKey; }).name + " \u2022 " +
      FINISHES.find(function (x) { return x.key === state.finishKey; }).name;
    document.getElementById("sumBase").textContent = NRT.php(p.price + (s.delta || 0));
    document.getElementById("sumTotal").textContent = NRT.php(p.price + (s.delta || 0) + ENGRAVE_FEE);
  }

  /* ---------- steps ---------- */
  function renderRail() {
    var names = ["Model", "Text", "Font", "Finish", "Motif & Submit"];
    document.getElementById("stepsRail").innerHTML = names.map(function (n, i) {
      return '<span class="step-chip' + (i + 1 <= state.step ? " on" : "") + '">' + (i + 1) + " \u2022 " + n + "</span>";
    }).join("");
  }

  function showStep(n) {
    state.step = n;
    document.querySelectorAll("[data-step]").forEach(function (el) {
      el.hidden = +el.getAttribute("data-step") !== n;
    });
    document.getElementById("prevBtn").hidden = n === 1;
    document.getElementById("nextBtn").hidden = n === 5;
    document.getElementById("submitBtn").hidden = n !== 5;
    renderRail();
  }

  function buildControls() {
    /* model select */
    var ms = document.getElementById("modelSel");
    ms.innerHTML = NRT_PRODUCTS.map(function (p) {
      return '<option value="' + p.id + '">' + p.name + " (" + p.collection + ")</option>";
    }).join("");
    ms.addEventListener("change", function () {
      state.productId = ms.value; state.sizeIdx = 0; fillSizes();
    });

    fillSizes();

    /* fonts */
    document.getElementById("fontRow").innerHTML = FONTS.map(function (f, i) {
      return '<button class="font-opt' + (i === 0 ? " on" : "") + '" data-font="' + f.key +
        '" style="font-family:' + f.css + ';font-weight:' + f.weight + '">Bantay<small>' + f.name + "</small></button>";
    }).join("");
    document.querySelectorAll("[data-font]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.fontKey = b.getAttribute("data-font");
        document.querySelectorAll("[data-font]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        renderPreview();
      });
    });

    /* finishes */
    document.getElementById("colorRow").innerHTML = FINISHES.map(function (c, i) {
      return '<button class="swatch' + (i === 0 ? " on" : "") + '" data-finish="' + c.key +
        '" style="background:' + c.hex + '" aria-label="' + c.name + '"></button>';
    }).join("");
    document.querySelectorAll("[data-finish]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.finishKey = b.getAttribute("data-finish");
        document.querySelectorAll("[data-finish]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        document.getElementById("finishName").textContent =
          FINISHES.find(function (x) { return x.key === state.finishKey; }).name;
        renderPreview();
      });
    });
    document.getElementById("finishName").textContent = FINISHES[0].name;

    /* motifs */
    document.getElementById("motifRow").innerHTML = MOTIFS.map(function (m, i) {
      var ic = m.key === "none" ? "&#8212;" : m.key === "paw"
        ? '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="26" rx="9" ry="7" fill="currentColor"/><circle cx="10" cy="17" r="3.4" fill="currentColor"/><circle cx="16" cy="13" r="3.4" fill="currentColor"/><circle cx="24" cy="13" r="3.4" fill="currentColor"/><circle cx="30" cy="17" r="3.4" fill="currentColor"/></svg>'
        : m.key === "heart"
          ? '<svg viewBox="0 0 24 24"><path d="M12 21S4 14.5 4 9a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5.5-8 12-8 12z" fill="currentColor"/></svg>'
          : m.key === "fish"
            ? '<svg viewBox="0 0 80 28"><path d="M2 14 Q16 0 34 0 Q54 0 64 14 Q54 28 34 28 Q16 28 2 14 Z M64 14 L78 3 L74 14 L78 25 Z" fill="currentColor"/></svg>'
            : '<svg viewBox="0 0 60 28"><g fill="currentColor"><rect x="12" y="11" width="36" height="6" rx="3"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="18" r="5"/><circle cx="48" cy="12" r="5"/><circle cx="48" cy="18" r="5"/></g></svg>';
      return '<button class="motif-opt' + (i === 0 ? " on" : "") + '" data-motif="' + m.key + '" title="' + m.label + '">' + ic + "</button>";
    }).join("");
    document.querySelectorAll("[data-motif]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.motifKey = b.getAttribute("data-motif");
        document.querySelectorAll("[data-motif]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        renderPreview();
      });
    });

    /* text input */
    document.getElementById("engraveText").addEventListener("input", function (e) {
      state.text = e.target.value;
      renderPreview();
    });
    document.getElementById("b2bLogo").addEventListener("change", function (e) {
      state.isB2B = e.target.checked;
      updateSummary();
    });

    /* nav buttons */
    document.getElementById("prevBtn").addEventListener("click", function () {
      if (state.step > 1) showStep(state.step - 1);
    });
    document.getElementById("nextBtn").addEventListener("click", function () {
      showStep(Math.min(5, state.step + 1));
    });

    /* submit */
    document.getElementById("submitBtn").addEventListener("click", submitDesign);
  }

  function fillSizes() {
    var p = product();
    var ss = document.getElementById("sizeSel");
    ss.innerHTML = p.sizes.map(function (s, i) {
      return '<option value="' + i + '">' + s.label + " - " + s.lifeStage + " (+\u20B1" + (s.delta || 0) + ")</option>";
    }).join("");
    ss.addEventListener("change", function () {
      state.sizeIdx = +ss.value;
      renderPreview();
    });
    document.getElementById("modelNote").textContent = p.blurb;
    updateSummary();
  }

  function submitDesign() {
    if (!state.text.trim()) { NRT.toast("Add a pet name or custom text first."); return; }

    var user = NRT.auth.user();
    if (!user) {
      var email = prompt("Almost done! Enter your email so we can link this design to your account:");
      if (!email) return;
      user = NRT.auth.login(email);
    }

    var p = product(), s = p.sizes[state.sizeIdx];
    var orders = NRT.store.get("orders", []);
    var num = "NRT-" + (20000 + orders.length + 47);
    orders.push({
      number: num,
      type: "custom-design",
      email: user.email,
      placedAt: new Date().toISOString(),
      items: [{
        id: p.id, name: p.name, sku: p.sku,
        sizeLabel: s.label, lifeStage: s.lifeStage,
        colorName: FINISHES.find(function (f) { return f.key === state.finishKey; }).name,
        qty: 1, unitPrice: p.price + (s.delta || 0), delta: 0
      }],
      design: {
        text: state.text, font: state.fontKey, finish: state.finishKey,
        motif: state.motifKey, isB2B: state.isB2B,
        engravingFee: ENGRAVE_FEE,
        total: p.price + (s.delta || 0) + ENGRAVE_FEE,
        status: "Artwork Pending",
        history: [{ at: new Date().toLocaleString(), note: "Design brief submitted from the studio." }]
      },
      total: p.price + (s.delta || 0) + ENGRAVE_FEE,
      pointsEarned: Math.round((p.price + s.delta + ENGRAVE_FEE) / 100),
      status: "Processing"
    });
    NRT.store.set("orders", orders);
    location.href = "account.html?tab=orders&submitted=1";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var preselect = new URLSearchParams(location.search).get("product");
    state.productId = preselect && NRT_PRODUCTS.some(function (p) { return p.id === preselect; }) ? preselect : NRT_PRODUCTS[0].id;
    document.getElementById("modelSel").value = state.productId;
    buildControls();
    fillSizes();
    renderPreview();
    showStep(1);
  });
})();
