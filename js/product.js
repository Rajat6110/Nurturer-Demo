/* NURTURER - product detail page renderer */
(function () {
  "use strict";
  var NRT = window.NRT;
  var product, sel = { size: 0, color: 0, qty: 1 };

  function money(n) { return NRT.php(n); }

  function unitPrice() {
    return product.price + (product.sizes[sel.size].delta || 0);
  }

  function renderGallery() {
    return '<div class="pdp-gallery">' +
      '<div class="pdp-main-img" id="mainImg">' + NRT.bowlArt({ coat: product.colors[sel.color].key }) + "</div>" +
      '<div class="pdp-thumbs" id="thumbs">' +
      product.colors.map(function (c, i) {
        return '<button data-color="' + i + '" class="' + (i === sel.color ? "on" : "") +
          '" title="' + c.name + '">' + NRT.bowlArt({ coat: c.key }) + "</button>";
      }).join("") +
      "</div></div>";
  }

  function renderInfo() {
    var stars = "&#9733;".repeat(Math.round(product.rating));
    return '<div class="pdp-info">' +
      '<span class="mini-meta">' + product.collection.toUpperCase() + " \u2022 SKU " + product.sku + "</span>" +
      "<h1>" + product.name + "</h1>" +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="stars">' + stars + '</span><span class="mini-meta">' + product.rating + " \u2022 " + product.reviewCount + ' verified reviews</span></div>' +
      '<p class="mt-1" style="color:var(--ink-soft)">' + product.blurb + "</p>" +
      '<div class="price-row mt-2"><span class="price" id="livePrice" style="font-size:26px">' + money(unitPrice()) + "</span>" +
      (product.compareAt ? '<span class="price-was">' + money(product.compareAt + (product.sizes[sel.size].delta || 0)) + "</span>" : "") +
      '<span class="badge green" style="position:static">In stock</span></div>' +

      /* size / life-stage variants */
      '<div class="opt-group"><span class="opt-label">Size &amp; life stage</span><div class="size-grid" id="sizeGrid">' +
      product.sizes.map(function (s, i) {
        return '<button class="size-opt' + (i === sel.size ? " on" : "") + '" data-size="' + i + '"><b>' + s.label + "</b><span>" + s.lifeStage + "</span></button>";
      }).join("") + "</div>" +
      '<p class="tag-note mt-1" id="sizeDetail">' + product.sizes[sel.size].detail + (product.sizes[sel.size].delta ? " (+\u20B1" + product.sizes[sel.size].delta + ")" : "") + "</p></div>" +

      /* colors */
      '<div class="opt-group"><span class="opt-label">Finish: <span id="colorName">' + product.colors[sel.color].name + "</span></span>" +
      '<div class="swatch-row" id="swatchRow">' +
      product.colors.map(function (c, i) {
        return '<button class="swatch' + (i === sel.color ? " on" : "") + '" data-sw="' + i + '" style="background:' + c.hex + '" aria-label="' + c.name + '"></button>';
      }).join("") + "</div></div>" +

      '<div class="opt-group"><span class="opt-label">Make it theirs</span>' +
      '<a class="btn btn-outline btn-sm" href="customize.html?product=' + product.id + '">Add custom engraving from &#8369;350</a> ' +
      '<span class="tag-note">Name, font, color &amp; motif - with artwork approval in your account.</span></div>' +

      '<div class="buy-row">' +
      '<span class="qty-box"><button type="button" data-q="-1">&minus;</button><input id="qtyInput" value="1" inputmode="numeric" readonly><button type="button" data-q="1">+</button></span>' +
      '<button class="btn btn-primary" id="addCartBtn">Add to cart</button>' +
      '<button class="btn btn-dark" id="buyNowBtn">Buy now</button>' +
      "</div>" +
      '<div class="fb-note">Free Philippine shipping over \u20B11,500 &bull; SEA delivery 5-9 days &bull; 30-day Clean Meal Promise</div>' +

      '<ul class="spec-list mt-3">' +
      "<li><b>Copper-lined interior:</b> naturally anti-bacterial, keeps food/water fresher longer</li>" +
      "<li><b>Elevated design:</b> better digestion and posture at mealtime</li>" +
      "<li><b>Non-slip base:</b> no movement, no spills</li>" +
      "<li><b>Durable construction:</b> long-term daily use</li>" +
      "<li><b>Easy to maintain:</b> 60-second weekly clean</li>" +
      "</ul></div>";
  }

  function bindEvents() {
    document.querySelectorAll("[data-size]").forEach(function (b) {
      b.addEventListener("click", function () {
        sel.size = +b.getAttribute("data-size");
        document.getElementById("sizeGrid").querySelectorAll(".size-opt").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        document.getElementById("sizeDetail").textContent = product.sizes[sel.size].detail + (product.sizes[sel.size].delta ? " (+\u20B1" + product.sizes[sel.size].delta + ")" : "");
        document.getElementById("livePrice").textContent = money(unitPrice());
      });
    });
    document.querySelectorAll("[data-sw], #thumbs [data-color]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = +(b.getAttribute("data-sw") || b.getAttribute("data-color"));
        sel.color = idx;
        document.getElementById("mainImg").innerHTML = NRT.bowlArt({ coat: product.colors[idx].key });
        document.getElementById("colorName").textContent = product.colors[idx].name;
        document.querySelectorAll("#swatchRow .swatch").forEach(function (x, i) { x.classList.toggle("on", i === idx); });
        document.querySelectorAll("#thumbs button").forEach(function (x, i) { x.classList.toggle("on", i === idx); });
      });
    });
    document.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        sel.qty = Math.max(1, Math.min(20, sel.qty + (+b.getAttribute("data-q"))));
        document.getElementById("qtyInput").value = sel.qty;
      });
    });

    function addLine() {
      var s = product.sizes[sel.size];
      NRT.cart.add({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sizeKey: s.key,
        sizeLabel: s.label,
        lifeStage: s.lifeStage,
        colorKey: product.colors[sel.color].key,
        colorName: product.colors[sel.color].name,
        unitPrice: product.price,
        delta: s.delta || 0,
        qty: sel.qty
      });
    }
    document.getElementById("addCartBtn").addEventListener("click", function () {
      addLine();
      NRT.toast("Added to cart - free shipping at \u20B11,500!");
    });
    document.getElementById("buyNowBtn").addEventListener("click", function () {
      addLine();
      location.href = "checkout.html";
    });
  }

  function renderFBTable() {
    document.getElementById("fbTableBody").innerHTML = [
      ["Copper-Lined", "Naturally hygienic, anti-bacterial; keeps food/water fresher longer"],
      ["Elevated Design", "Promotes better digestion and posture for cats and dogs during mealtime"],
      ["Non-Slip Base", "Prevents movement and spills"],
      ["Customizable", "Fur parents can personalize bowls with pet names or custom text for a unique look"],
      ["Durable Construction", "Built for regular, long-term use"],
      ["Easy to Maintain", "Convenient for everyday cleaning/use"]
    ].map(function (r) {
      return "<tr><td><b>" + r[0] + '</b></td><td><span style="color:var(--copper);font-weight:800;margin-right:8px">&rarr;</span>' + r[1] + "</td></tr>";
    }).join("");
  }

  function renderReviews() {
    var sample = [
      { n: "Paolo M.", t: "Sturdy, beautiful, and my golden actually finishes his meals now. The copper interior wipes clean like new.", d: "2 weeks ago" },
      { n: "Bea S.", t: "Bought the small size for our shih tzu puppy. The non-slip base is a lifesaver on our floor tiles.", d: "1 month ago" },
      { n: "Rina T.", t: "Upgraded from plastic and the difference in water freshness is real. Worth it.", d: "1 month ago" }
    ];
    document.getElementById("reviewsBlock").innerHTML =
      '<div class="card" style="padding:28px">' +
      '<h3 style="font-size:22px">Verified reviews <span class="text-muted" style="font-weight:600;font-size:15px">(' + product.reviewCount + ")</span></h3>" +
      '<div class="stat-row" style="margin-top:10px;gap:22px">' +
      '<div class="stat"><b style="font-size:38px">' + product.rating + '</b><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span></div>' +
      '<div class="stat" style="align-self:center"><b style="font-size:16px;color:var(--green)">96%</b><span>would recommend</span></div></div>' +
      sample.map(function (r) {
        return '<hr style="border:none;border-top:1px solid var(--line);margin:16px 0">' +
          '<div><b style="font-size:14.5px">' + r.n + '</b> <span class="tag-note">\u2022 ' + r.d + '</span>' +
          '<div class="stars" style="font-size:13px">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
          '<p style="font-size:14.5px;color:var(--ink-soft);margin-top:4px">' + r.t + "</p></div>";
      }).join("") +
      '<button class="btn btn-ghost btn-sm mt-2" onclick="NRT.toast(\'Thanks! Review submission opens after purchase.\')">Write a review</button></div>';
  }

  function renderRelated() {
    var rel = NRT_PRODUCTS.filter(function (p) { return p.id !== product.id && p.species.some(function (s) { return product.species.indexOf(s) > -1; }); }).slice(0, 4);
    document.getElementById("relatedGrid").innerHTML = rel.map(NRT.productCardHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var id = new URLSearchParams(location.search).get("id");
    product = NRT_PRODUCTS.find(function (p) { return p.id === id || p.sku === id; }) || NRT_PRODUCTS[0];
    document.title = product.name + " | NURTURER";
    document.getElementById("crumb").textContent = "/ " + product.name;

    var root = document.getElementById("pdpRoot");
    root.innerHTML = "";
    root.insertAdjacentHTML("beforeend", '<div id="galHost"></div>');
    root.insertAdjacentHTML("beforeend", '<div id="infoHost"></div>');
    document.getElementById("galHost").outerHTML = renderGallery();
    document.getElementById("infoHost").outerHTML = renderInfo();
    bindEvents();
    renderFBTable();
    renderReviews();
    renderRelated();
  });
})();
