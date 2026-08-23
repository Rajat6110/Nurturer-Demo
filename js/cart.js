/* NURTURER - cart page logic incl. vouchers & free-shipping progress */
(function () {
  "use strict";
  var NRT = window.NRT;
  var FREE_SHIP = 1500, SHIP_FEE = 180;
  var voucher = null;

  function discountFor(sub) {
    if (!voucher) return 0;
    var v = NRT_VOUCHERS[voucher];
    if (!v) return 0;
    if (v.minSpend && sub < v.minSpend) return 0;
    return v.type === "percent" ? Math.round(sub * v.value / 100) : Math.min(v.value, sub);
  }

  function render() {
    var items = NRT.cart.items();
    document.getElementById("cartEmpty").hidden = !!items.length;
    document.getElementById("cartLayout").style.display = items.length ? "" : "none";
    if (!items.length) return;

    document.getElementById("cartList").innerHTML = items.map(function (i, idx) {
      return '<div class="cart-item">' +
        '<div class="cart-thumb">' + NRT.bowlArt({ coat: i.colorKey }) + "</div>" +
        "<div><b>" + i.name + "</b> <span class='tag-note'>&bull; " + i.sizeLabel + (i.customText ? " \u2022 engraved \"" + i.customText + '"' : "") + "</span>" +
        '<div class="mini-meta">' + i.colorName + " \u2022 " + i.lifeStage + "</div>" +
        '<button class="link-danger mt-1" data-remove="' + idx + '">Remove</button></div>' +
        '<div style="text-align:right"><div class="price">' + NRT.php((i.unitPrice + (i.delta || 0)) * i.qty) + "</div>" +
        '<div class="qty-box mt-1"><button data-q="' + idx + '" data-d="-1">&minus;</button>' +
        '<input value="' + i.qty + '" readonly><button data-q="' + idx + '" data-d="1">+</button></div></div></div>';
    }).join("");

    var sub = NRT.cart.subtotal();
    var disc = discountFor(sub);
    var afterDisc = sub - disc;
    var ship = afterDisc >= FREE_SHIP ? 0 : SHIP_FEE;

    /* shipping progress */
    var pct = Math.min(100, Math.round(afterDisc / FREE_SHIP * 100));
    document.getElementById("shipBar").style.width = pct + "%";
    document.getElementById("shipMsg").innerHTML = afterDisc >= FREE_SHIP
      ? "You've unlocked <b>FREE Philippine shipping!</b>"
      : "Add <b>" + NRT.php(FREE_SHIP - afterDisc) + "</b> more for free Philippine shipping";

    document.getElementById("sumSub").textContent = NRT.php(sub);
    document.getElementById("sumDisc").textContent = "\u2212" + NRT.php(disc);
    document.getElementById("voucherNote").textContent = voucher ? "(" + voucher + ")" : "";
    document.getElementById("sumShip").textContent = ship === 0 ? "FREE" : NRT.php(ship);
    document.getElementById("sumTotal").textContent = NRT.php(afterDisc + ship);
    document.getElementById("pointsPreview").textContent = "+" + Math.max(1, Math.round(afterDisc / 100));

    document.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () { NRT.cart.remove(+b.getAttribute("data-remove")); render(); });
    });
    document.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        var idx = +b.getAttribute("data-q"), d = +b.getAttribute("data-d");
        var it = NRT.cart.items();
        NRT.cart.updateQty(idx, it[idx].qty + d);
        render();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    document.getElementById("applyVoucher").addEventListener("click", function () {
      var code = document.getElementById("voucherInput").value.trim().toUpperCase();
      var v = NRT_VOUCHERS[code];
      if (!v) { NRT.toast("That code isn't valid. Try NURTURER10."); return; }
      voucher = code;
      sessionStorage.setItem("nrt_voucher", code);
      NRT.toast(v.note);
      render();
    });
    var saved = sessionStorage.getItem("nrt_voucher");
    if (saved && NRT_VOUCHERS[saved]) {
      voucher = saved;
      document.getElementById("voucherInput").value = saved;
    }
  });
})();
