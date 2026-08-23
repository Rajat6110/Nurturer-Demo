/* NURTURER - account: auth, order history, design approval tracking, rewards */
(function () {
  "use strict";
  var NRT = window.NRT;

  var DESIGN_PIPELINE = ["Artwork Pending", "In Design", "Awaiting Your Approval", "Approved", "Engraving", "Shipped"];
  function statusClass(s) {
    if (s === "Artwork Pending") return "pending";
    if (s === "In Design") return "progress";
    if (s === "Awaiting Your Approval") return "approval";
    if (s === "Approved" || s === "Engraving") return "approved";
    return "done";
  }
  function pill(status) {
    return '<span class="status-pill ' + statusClass(status) + '"><span class="status-dot"></span>' + status + "</span>";
  }

  /* ---------- orders ---------- */
  function ordersTab(host) {
    var orders = NRT.store.get("orders", []);
    if (!orders.length) {
      host.innerHTML = '<div class="empty-state card"><h3>No orders yet</h3><p class="text-muted mb-2">Your purchase history and design approvals will live here.</p><a class="btn btn-primary btn-sm" href="shop.html">Shop bowls</a></div>';
      return;
    }
    host.innerHTML = '<div class="card table-scroll" style="padding:8px 22px"><table class="data-table"><thead><tr>' +
      "<th>Order</th><th>Date</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th></th>" +
      "</tr></thead><tbody>" +
      orders.map(function (o, idx) {
        return "<tr><td><b>" + o.number + "</b></td>" +
          "<td>" + new Date(o.placedAt).toLocaleDateString() + "</td>" +
          "<td>" + (o.type === "custom-design" ? "Custom design" : "Purchase") + "</td>" +
          "<td>" + o.items.map(function (i) { return i.qty + "\u00D7 " + i.name; }).join(", ") + "</td>" +
          "<td>" + NRT.php(o.total) + "</td>" +
          "<td>" + (o.type === "custom-design" ? pill(o.design.status) : pill(o.status)) + "</td>" +
          '<td><button class="btn btn-ghost btn-sm" data-view="' + idx + '">Details</button></td></tr>';
      }).join("") + "</tbody></table></div>" +
      '<div id="orderDetail"></div>';

    host.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { orderDetail(+b.getAttribute("data-view")); });
    });
    function orderDetail(idx) {
      var o = NRT.store.get("orders", [])[idx];
      var hostD = document.getElementById("orderDetail");
      if (!o) return;
      if (o.type === "custom-design") {
        var stepIdx = DESIGN_PIPELINE.indexOf(o.design.status);
        hostD.innerHTML = '<div class="card mt-2" style="padding:30px">' +
          '<h3 style="font-size:20px">Design ' + o.number + ' &mdash; "' + o.design.text + '"</h3>' +
          '<div style="display:flex;gap:14px;align-items:center;margin-top:10px;flex-wrap:wrap">' + pill(o.design.status) +
          '<button class="btn btn-outline btn-sm" data-sim="' + idx + '">Simulate studio update (demo)</button></div>' +
          '<ul class="timeline">' +
          DESIGN_PIPELINE.map(function (sName, i) {
            var cls = i < stepIdx ? "done" : i === stepIdx ? "now" : "";
            return '<li class="' + cls + '"><b>' + sName + "</b>" +
              (i === stepIdx && sName === "Awaiting Your Approval"
                ? '<span style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn btn-green btn-sm" data-approve="' + idx + '">Approve artwork</button><button class="btn btn-ghost btn-sm" data-revise="' + idx + '">Request revision</button></span>'
                : "") + "</li>";
          }).join("") + "</ul>" +
          '<div class="tag-note">Design brief: font "' + o.design.font + '" \u2022 finish "' + o.design.finish + '" \u2022 motif "' + o.design.motif + '"' + (o.design.isB2B ? " \u2022 B2B co-branding requested" : "") + "</div></div>";
        bindDesignActions(hostD);
      } else {
        hostD.innerHTML = '<div class="card mt-2" style="padding:30px">' +
          '<h3 style="font-size:20px">Order ' + o.number + "</h3>" +
          '<ul class="timeline">' +
          [["Order placed", true], ["Payment confirmed (" + o.payment + ")", true],
           [o.shippingFee === 0 ? "Shipped - free shipping applied" : "Preparing for dispatch", o.status !== "Processing"],
           [o.shipping.country === "PH" ? "Out for delivery (2-5 days PH)" : "International transit (5-9 days)", false]]
            .map(function (s) { return '<li class="' + (s[1] ? "done" : "") + '"><b>' + s[0] + "</b></li>"; }).join("") +
          "</ul>" +
          '<div class="table-scroll"><table class="data-table"><tbody>' +
          o.items.map(function (i) {
            return "<tr><td>" + i.qty + "\u00D7 <b>" + i.name + "</b> (" + i.sizeLabel + ", " + i.colorName + ")</td><td style='text-align:right'>" + NRT.php((i.unitPrice + (i.delta || 0)) * i.qty) + "</td></tr>";
          }).join("") +
          "<tr><td>Shipping" + (o.discount ? " + discount" : "") + (o.donation ? " + foundation donation" : "") + "</td><td style='text-align:right'><b>" + NRT.php(o.total) + "</b></td></tr>" +
          "</tbody></table></div>" +
          '<p class="tag-note mt-2">Earned +' + o.pointsEarned + ' Copper Points. <a href="rewards.html" style="text-decoration:underline;color:var(--copper-deep)">View rewards</a></p></div>';
      }
      hostD.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function bindDesignActions(scope) {
      scope.querySelectorAll("[data-sim]").forEach(function (b) {
        b.addEventListener("click", function () {
          var orders = NRT.store.get("orders", []);
          var o = orders[+b.getAttribute("data-sim")];
          var i = DESIGN_PIPELINE.indexOf(o.design.status);
          o.design.status = DESIGN_PIPELINE[Math.min(i + 1, 3)];
          o.design.history.push({ at: new Date().toLocaleString(), note: "Status advanced to " + o.design.status });
          NRT.store.set("orders", orders);
          NRT.toast("Studio update: " + o.design.status);
          ordersTab(document.getElementById("tabHost"));
        });
      });
      scope.querySelectorAll("[data-approve]").forEach(function (b) {
        b.addEventListener("click", function () {
          var orders = NRT.store.get("orders", []);
          var o = orders[+b.getAttribute("data-approve")];
          o.design.status = "Approved";
          o.design.history.push({ at: new Date().toLocaleString(), note: "Customer approved artwork." });
          NRT.store.set("orders", orders);
          NRT.toast("Artwork approved! Engraving begins shortly.");
          ordersTab(document.getElementById("tabHost"));
        });
      });
      scope.querySelectorAll("[data-revise]").forEach(function (b) {
        b.addEventListener("click", function () {
          var orders = NRT.store.get("orders", []);
          var o = orders[+b.getAttribute("data-revise")];
          o.design.status = "In Design";
          o.design.history.push({ at: new Date().toLocaleString(), note: "Revision requested by customer." });
          NRT.store.set("orders", orders);
          NRT.toast("Revision requested - our studio is on it.");
          ordersTab(document.getElementById("tabHost"));
        });
      });
    }
    bindDesignActions(host);
  }

  /* ---------- designs tab (quick view of custom work) ---------- */
  function designsTab(host) {
    var orders = NRT.store.get("orders", []).filter(function (o) { return o.type === "custom-design"; });
    if (!orders.length) {
      host.innerHTML = '<div class="empty-state card"><h3>No custom designs in progress</h3><p class="text-muted mb-2">Personalize a bowl with your pet\'s name and follow its journey from brief to etch.</p><a class="btn btn-primary btn-sm" href="customize.html">Open the Design Studio</a></div>';
      return;
    }
    host.innerHTML = '<div class="grid grid-2">' + orders.map(function (o) {
      var stepIdx = DESIGN_PIPELINE.indexOf(o.design.status);
      return '<div class="card" style="padding:24px">' +
        '<div style="display:flex;justify-content:space-between;gap:12px;align-items:start;flex-wrap:wrap">' +
        "<h3>\u201C" + o.design.text + "\u201D on " + o.items[0].name.split(" ").slice(0, 2).join(" ") + "</h3>" + pill(o.design.status) + "</div>" +
        '<div style="width:150px;margin:12px auto">' + NRT.bowlArt({ coat: o.design.finish, text: o.design.text }) + "</div>" +
        '<ul class="timeline" style="margin-top:4px">' +
        DESIGN_PIPELINE.slice(0, 4).map(function (sName, i) {
          return '<li class="' + (i < stepIdx ? "done" : i === stepIdx ? "now" : "") + '"><b>' + sName + "</b></li>";
        }).join("") + "</ul></div>";
    }).join("") + "</div>";
  }

  /* ---------- rewards tab ---------- */
  function tierFor(pts) {
    if (pts >= 1000) return "Platinum Paw";
    if (pts >= 500) return "Gold Whisker";
    if (pts >= 200) return "Silver Snout";
    return "Bronze Tail";
  }
  function rewardsTab(host) {
    var pts = NRT.store.get("points", 0);
    var hist = NRT.store.get("pointsHistory", []);
    var tiers = [["Bronze Tail", 0], ["Silver Snout", 200], ["Gold Whisker", 500], ["Platinum Paw", 1000]];
    host.innerHTML =
      '<div class="points-hero"><span style="font-weight:800;letter-spacing:.1em;font-size:12px;text-transform:uppercase">Copper Points Balance</span>' +
      "<b>" + pts + "</b><span>Tier: <b>" + tierFor(pts) + '</b> &bull; 100 pts = &#8369;50 voucher &bull; points from purchases, reviews &amp; referrals</span>' +
      '<div class="tier-track">' + tiers.map(function (t) {
        return '<span class="tier-seg' + (pts >= t[1] ? " hit" : "") + '">' + t[0] + "</span>";
      }).join("") + "</div></div>" +

      '<div class="grid grid-3 mt-2">' +
      [["&#8369;50 off voucher", "100 pts"], ["Free engraving add-on", "250 pts"], ["Donate 10 shelter meals", "120 pts"]]
        .map(function (r) {
          return '<div class="feature-tile"><div class="ic">' + NRT.icon("gift") + "</div><h3>" + r[0] + "</h3><p>Redeem for " + r[1] + '</p><button class="btn btn-outline btn-sm mt-1" data-redeem="' + r[0] + '">Redeem</button></div>';
        }).join("") + "</div>" +

      '<div class="card mt-2" style="padding:26px"><h3 style="font-size:18px">How you earn</h3>' +
      '<ul class="spec-list mt-1"><li><b>&#8369;100 spent = 1 point</b> automatically at checkout</li><li><b>+40 points</b> per successful referral code share</li><li><b>+25 points</b> for every published review with a photo</li><li><b>Double points weekends</b> announced in the newsletter</li></ul></div>' +

      '<div class="card mt-2" style="padding:26px"><h3 style="font-size:18px">Points history</h3><div class="table-scroll mt-1"><table class="data-table"><thead><tr><th>Date</th><th>Activity</th><th>Points</th></tr></thead><tbody>' +
      hist.map(function (h) { return "<tr><td>" + h.when + "</td><td>" + h.label + '</td><td style="color:var(--green);font-weight:800">+' + h.pts + "</td></tr>"; }).join("") +
      "</tbody></table></div></div>";

    host.querySelectorAll("[data-redeem]").forEach(function (b) {
      b.addEventListener("click", function () { NRT.toast("Redemption request noted (demo). Voucher lands in your email within 24h."); });
    });
  }

  /* ---------- settings ---------- */
  function settingsTab(host) {
    var u = NRT.auth.user();
    host.innerHTML = '<div class="form-card"><h3 style="font-size:20px" class="mb-2">Account settings</h3>' +
      '<div class="field"><label>Name</label><input value="' + u.name + '" readonly></div>' +
      '<div class="field"><label>Email</label><input value="' + u.email + '" readonly></div>' +
      '<label style="display:flex;gap:10px;font-size:14px;font-weight:700;margin-bottom:14px"><input type="checkbox" checked> Weekly-to-monthly newsletter (care tips, vouchers, adoptable pets)</label>' +
      '<label style="display:flex;gap:10px;font-size:14px;font-weight:700;margin-bottom:20px"><input type="checkbox" checked> Abandoned cart reminders</label>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-dark btn-sm" href="foundation.html">Manage Pet Foundation giving</a>' +
      '<button class="btn btn-ghost btn-sm" id="wipeData">Clear demo data</button></div></div>';
    document.getElementById("wipeData").addEventListener("click", function () {
      ["cart", "orders", "user", "points", "pointsHistory", "subscribers"].forEach(NRT.store.del.bind(NRT.store));
      location.reload();
    });
  }

  /* ---------- boot ---------- */
  var currentTab = "orders";
  function renderTab() {
    var host = document.getElementById("tabHost");
    if (currentTab === "orders") ordersTab(host);
    else if (currentTab === "designs") designsTab(host);
    else if (currentTab === "rewards") rewardsTab(host);
    else settingsTab(host);
  }

  document.addEventListener("DOMContentLoaded", function () {
    function showAccount() {
      var u = NRT.auth.user();
      document.getElementById("authView").hidden = !!u;
      document.getElementById("accountView").hidden = !u;
      if (u) {
        document.getElementById("helloName").textContent = u.name;
        renderTab();
      }
    }

    document.querySelectorAll("#acctNav button").forEach(function (b) {
      b.addEventListener("click", function () {
        currentTab = b.getAttribute("data-tab");
        document.querySelectorAll("#acctNav button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        renderTab();
      });
    });

    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      NRT.auth.login(document.getElementById("liEmail").value.trim());
      showAccount();
      NRT.toast("Welcome back to the pack!");
    });
    document.getElementById("registerForm").addEventListener("submit", function (e) {
      e.preventDefault();
      NRT.auth.login(document.getElementById("rgEmail").value.trim(), document.getElementById("rgName").value.trim());
      showAccount();
      NRT.toast("Account created - +100 welcome points!");
    });
    document.getElementById("logoutBtn").addEventListener("click", function () {
      NRT.auth.logout();
      location.reload();
    });

    /* deep links: account.html?tab=... */
    var q = new URLSearchParams(location.search);
    if (q.get("tab")) currentTab = q.get("tab");
    if (q.get("submitted")) setTimeout(function () { NRT.toast("Design submitted! Our studio sends artwork within 24 hours."); }, 600);

    document.querySelectorAll("#acctNav button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-tab") === currentTab);
    });
    showAccount();
  });
})();
