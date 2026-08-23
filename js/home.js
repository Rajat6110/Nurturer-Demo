/* NURTURER - homepage rendering */
(function () {
  "use strict";
  var NRT = window.NRT;

  document.addEventListener("DOMContentLoaded", function () {

    /* audience branch cards */
    document.querySelectorAll("[data-audience]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        NRT.audience.set(btn.getAttribute("data-audience"));
        if (btn.getAttribute("data-audience") === "b2b") location.href = "b2b.html";
        else { NRT.toast("Welcome, fur parent! Shop away."); location.href = "shop.html"; }
      });
    });

    /* feature -> benefit grid (exact mapping from brand brief) */
    var features = [
      { icon: "drop", feature: "Copper-Lined", benefit: "Naturally hygienic and anti-bacterial; keeps food and water fresher longer." },
      { icon: "layers", feature: "Elevated Design", benefit: "Promotes better digestion and posture for cats and dogs during mealtime." },
      { icon: "shield", feature: "Non-Slip Base", benefit: "Prevents movement and spills - no more chased bowls across the floor." },
      { icon: "brush", feature: "Customizable", benefit: "Personalize with your pet's name or custom text for a one-of-one look." },
      { icon: "star", feature: "Durable Construction", benefit: "Built for regular, long-term daily use - puppyhood to senior years." },
      { icon: "sparkle", feature: "Easy to Maintain", benefit: "Convenient for everyday cleaning; 60 seconds a week keeps it bright." }
    ];
    var fg = document.getElementById("featureGrid");
    if (fg) {
      fg.innerHTML = features.map(function (f) {
        return '<div class="feature-tile">' +
          '<div class="ic">' + NRT.icon(f.icon) + "</div>" +
          "<h3>" + f.feature + "</h3>" +
          '<p class="benefit"><span class="feature-benefit-arrow">&rarr;</span> ' + f.benefit + "</p></div>";
      }).join("");
    }

    /* product spotlight (4 picks across species & tiers) */
    var picks = ["signature-elevated-dog", "signature-cat-raised", "everyday-elevated-dog", "everyday-cat"];
    var hp = document.getElementById("homeProducts");
    if (hp && window.NRT_PRODUCTS) {
      hp.innerHTML = picks.map(function (id) {
        var p = NRT_PRODUCTS.find(function (x) { return x.id === id; });
        if (!p) return "";
        return NRT.productCardHTML(p);
      }).join("");
      hp.querySelectorAll(".thumb").forEach(function (t) { t.classList.add("breathe"); });
    }

    /* testimonials */
    var tg = document.getElementById("testimonialGrid");
    if (tg && window.NRT_TESTIMONIALS) {
      tg.innerHTML = NRT_TESTIMONIALS.slice(0, 4).map(function (t, i) {
        return '<div class="card quote-card">' +
          '<span class="stars">' + "&#9733;".repeat(t.stars) + "</span>" +
          "<p>\u201C" + t.quote + "\u201D</p>" +
          '<div class="quote-who"><div class="avatar' + (i % 2 ? " g2" : "") + '">' + t.name.charAt(0) + "</div><div><b>" +
          t.name + "</b><span>" + t.who + "</span></div></div></div>";
      }).join("");
    }

    /* blog teaser */
    var bt = document.getElementById("blogTeaser");
    if (bt && window.NRT_POSTS) {
      bt.innerHTML = NRT_POSTS.slice(0, 3).map(function (post) {
        return '<a class="card blog-card" href="blog.html#post-' + post.slug + '">' +
          '<div class="thumb">' + NRT.bowlArt({ coat: "cream" }) + "</div>" +
          '<div class="body"><span class="blog-tag">' + post.tag + " \u2022 " + post.minutes + ' min read</span>' +
          '<h3 style="font-size:19px;margin-top:8px">' + post.title + "</h3>" +
          '<p class="text-muted" style="font-size:14px;margin-top:6px">' + post.excerpt + "</p></div></a>";
      }).join("");
    }
  });
})();
