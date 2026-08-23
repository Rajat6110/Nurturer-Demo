/* NURTURER - checkout logic: totals, donation round-up, order placement */
(function () {
  "use strict";
  var NRT = window.NRT;
  var FREE_SHIP = 1500, SHIP_FEE = 180, SHIP_SEA = 590;
  var voucherCode = sessionStorage.getItem("nrt_voucher");
  var donate = false;

  function discountFor(sub) {
    if (!voucherCode) return 0;
    var v = NRT_VOUCHERS[voucherCode];
    if (!v || (v.minSpend && sub < v.minSpend)) return 0;
    return v.type === "percent" ? Math.round(sub * v.value / 100) : Math.min(v.value, sub);
  }

  function render() {
    var items = NRT.cart.items();
    if (!items.length) {
      document.getElementById("checkoutEmpty").hidden = false;
      document.getElementById("checkoutLayout").style.display = "none";
      return;
    }
    document.getElementById("miniItems").innerHTML = items.map(function (i) {
      return '<div class="summary-line"><span>' + i.qty + "&times; " + i.name +
        ' <span class="tag-note">(' + i.sizeLabel + ")</span></span><b>" +
        NRT.php((i.unitPrice + (i.delta || 0)) * i.qty) + "</b></div>";
    }).join("");

    var region = document.getElementById("coRegion").value;
    var sub = NRT.cart.subtotal();
    var disc = discountFor(sub);
    var afterDisc = sub - disc;
    var ship = afterDisc >= FREE_SHIP && region === "PH" ? 0 : (region === "PH" ? SHIP_FEE : SHIP_SEA);

    document.getElementById("sumSub").textContent = NRT.php(sub);
    document.getElementById("discRow").style.display = disc ? "" : "none";
    document.getElementById("sumDisc").textContent = "\u2212" + NRT.php(disc);
    document.getElementById("sumShip").textContent = ship === 0 ? "FREE" : NRT.php(ship);
    var total = afterDisc + ship + (donate ? Math.ceil(totalRoundUp(afterDisc + ship)) : 0);
    document.getElementById("sumDonate").textContent = NRT.php(donate ? totalRoundUp(afterDisc + ship) : 0);
    document.getElementById("sumTotal").textContent = NRT.php(total);
    document.getElementById("pointsPreview").textContent = "+" + Math.max(1, Math.round(afterDisc / 100));

    function totalRoundUp(n) { return Math.ceil(n / 50) * 50 - n; }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    document.getElementById("coRegion").addEventListener("change", render);
    document.getElementById("donateRoundup").addEventListener("change", function (e) { donate = e.target.checked; render(); });

    document.getElementById("checkoutForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var user = NRT.auth.user();
      var email = document.getElementById("coEmail").value.trim();
      if (!user) NRT.auth.login(email, document.getElementById("coName").value.trim());

      var items = NRT.cart.items();
      var sub = NRT.cart.subtotal();
      var disc = discountFor(sub);
      var afterDisc = sub - disc;
      var region = document.getElementById("coRegion").value;
      var ship = afterDisc >= FREE_SHIP && region === "PH" ? 0 : (region === "PH" ? SHIP_FEE : SHIP_SEA);
      var gift = donate ? Math.ceil((afterDisc + ship) / 50) * 50 - (afterDisc + ship) : 0;
      var payEl = document.querySelector('input[name="pay"]:checked');

      var orders = NRT.store.get("orders", []);
      var num = "NRT-" + (20000 + orders.length + 47);
      orders.push({
        number: num,
        type: "purchase",
        email: email,
        placedAt: new Date().toISOString(),
        items: items,
        shipping: {
          name: document.getElementById("coName").value,
          address: document.getElementById("coAddr").value + ", " + document.getElementById("coCity").value + " " + document.getElementById("coZip").value,
          country: region
        },
        payment: payEl ? payEl.value : "GCash",
        voucher: voucherCode || null,
        subtotal: sub, discount: disc, shippingFee: ship, donation: gift,
        total: afterDisc + ship + gift,
        pointsEarned: Math.max(1, Math.round(afterDisc / 100)),
        status: "Processing"
      });
      NRT.store.set("orders", orders);

      /* award points */
      var pts = NRT.store.get("points", 0) + Math.max(1, Math.round(afterDisc / 100));
      NRT.store.set("points", pts);
      var hist = NRT.store.get("pointsHistory", []);
      hist.unshift({ when: new Date().toISOString().slice(0, 10), label: "Order " + num, pts: Math.max(1, Math.round(afterDisc / 100)) });
      NRT.store.set("pointsHistory", hist);

      /* clear cart & voucher */
      NRT.cart.clear();
      sessionStorage.removeItem("nrt_voucher");

      document.getElementById("checkoutLayout").style.display = "none";
      var s = document.getElementById("orderSuccess");
      s.hidden = false;
      document.getElementById("successMeta").innerHTML =
        "Order <b>" + num + "</b> \u2022 " + (payEl ? payEl.value : "") +
        " \u2022 " + (region === "PH" ? "Arriving in 2-5 days" : "International delivery in 5-9 days") +
        (gift ? " \u2022 Thank you for donating to the Pet Foundation" : "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
})();
