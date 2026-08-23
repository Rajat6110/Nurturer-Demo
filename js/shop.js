/* NURTURER - shop page filtering */
(function () {
  "use strict";
  var NRT = window.NRT;
  var state = { species: "all", tier: "all", sort: "featured" };

  function params() {
    return new URLSearchParams(location.search);
  }

  function applyParams() {
    var q = params();
    if (q.get("species")) state.species = q.get("species");
    if (q.get("tier")) state.tier = q.get("tier");
    syncChips();
    var title = document.getElementById("shopTitle");
    var lead = document.getElementById("shopLead");
    if (state.species === "dog") {
      title.textContent = "Copper-lined bowls for dogs.";
      lead.textContent = "From wobbly puppy first-meals to dignified senior dining - elevated heights sized for every stage, with the same anti-bacterial copper interior throughout.";
    } else if (state.species === "cat") {
      title.textContent = "Copper-lined bowls for cats.";
      lead.textContent = "Shallow, whisker-friendly dishes raised to a comfortable height. No squished whiskers, no chin irritation - just cleaner, calmer meals.";
    }
  }

  function syncChips() {
    document.querySelectorAll('[data-filter="species"] .chip').forEach(function (c) {
      c.classList.toggle("on", c.getAttribute("data-val") === state.species);
    });
    document.querySelectorAll('[data-filter="tier"] .chip').forEach(function (c) {
      c.classList.toggle("on", c.getAttribute("data-val") === state.tier);
    });
  }

  function render() {
    var list = NRT_PRODUCTS.filter(function (p) {
      if (state.species !== "all" && p.species.indexOf(state.species) === -1) return false;
      if (state.tier !== "all" && p.tier !== state.tier) return false;
      return true;
    });
    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });

    document.getElementById("resultCount").textContent =
      list.length + " product" + (list.length === 1 ? "" : "s") + " \u2022 free PH shipping over \u20B11,500 \u2022 SEA delivery available";
    var grid = document.getElementById("productGrid");
    grid.innerHTML = list.length
      ? list.map(NRT.productCardHTML).join("")
      : '<div class="empty-state"><h3>No matches</h3><p class="text-muted">Try clearing a filter.</p></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyParams();
    document.querySelectorAll("[data-filter] .chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.parentElement.getAttribute("data-filter");
        state[group] = chip.getAttribute("data-val");
        try { history.replaceState(null, "", "shop.html?species=" + state.species + "&tier=" + state.tier); } catch (e) { /* file:// */ }
        syncChips();
        render();
      });
    });
    document.getElementById("sortSel").addEventListener("change", function (e) {
      state.sort = e.target.value;
      render();
    });
    render();
  });
})();
