(function () {
  "use strict";

  /* =========================================================
     НАЛАШТУВАННЯ — змінюйте тут
     ========================================================= */

  // URL вебзастосунку Google Apps Script. Поки порожній — лишається mailto-fallback.
  var ORDER_ENDPOINT = "";
  var ORDER_EMAIL = "hello@lishchyna.example";

  // Куди приходять замовлення через резервний mailto.

  // Підписки: частка врожаю дерева.
  // budget — максимум чистого ядра фундука (г), fee — вартість дерева і пакування (грн).
  // Розрахунок: 6 кг у шкаралупі ≈ 2 400 г ядра; 1/3 ≈ 800, 1/2 ≈ 1 200, 3/4 ≈ 1 800.
  var TIERS = {
    classic: { name: "Класичний", share: "1/3", budget: 800, fee: 500 },
    gourmet: { name: "Гурман", share: "1/2", budget: 1200, fee: 900 },
    owner: { name: "Господар дерева", share: "3/4", budget: 1800, fee: 1500 },
    advent7: { name: "Адвент-календар «7 днів»", fixedPrice: 1190, noTree: true }
  };

  // Продукти.
  // price — ціна за одиницю (100 г або 100 мл; для штучних — за штуку),
  // kernel — скільки г чистого ядра фундука йде на одиницю, unit — підпис одиниці,
  // size — кількість у одиниці (для підсумку), adult — алкоголь 18+.
  var PRODUCTS = [
    { id: "inshell", name: "Фундук у шкаралупі, сирий", desc: "Свіжий збір, як із гілки", price: 45, kernel: 40, unit: "100 г", size: "100 г" },
    { id: "raw", name: "Чищений фундук, сирий", desc: "Висушений природно, без обсмажування", price: 110, kernel: 100, unit: "100 г", size: "100 г" },
    { id: "roast", name: "Смажений фундук", desc: "Легке обсмажування, насичений аромат", price: 125, kernel: 105, unit: "100 г", size: "100 г" },
    { id: "choc", name: "Фундук у темному шоколаді", desc: "Шоколад 70 %", price: 170, kernel: 55, unit: "100 г", size: "100 г" },
    { id: "caramel", name: "Карамелізований фундук", desc: "Хрусткий, із дрібкою морської солі", price: 150, kernel: 60, unit: "100 г", size: "100 г" },
    { id: "paste", name: "Фундукова паста", desc: "Лише фундук і крапля солі", price: 150, kernel: 95, unit: "100 г", size: "100 г" },
    { id: "chocpaste", name: "Шоколадна фундукова паста", desc: "Фундук, какао, трохи тростинного цукру", price: 130, kernel: 40, unit: "100 г", size: "100 г" },
    { id: "advent24", name: "Адвент-календар «24 дні»", desc: "24 віконця з горіховими сюрпризами", price: 1450, kernel: 150, unit: "шт.", size: "1 шт.", piece: true },
    { id: "tincture", name: "Фундукова настоянка", desc: "Авторська, міцність 40 %", price: 220, kernel: 50, unit: "100 мл", size: "100 мл", adult: true },
    { id: "liqueur", name: "Шоколадно-фундуковий лікер", desc: "Вершковий, міцність 18 %", price: 190, kernel: 30, unit: "100 мл", size: "100 мл", adult: true }
  ];

  /* ========================================================= */

  function money(n) { return Math.round(n).toLocaleString("uk-UA").replace(/\u00a0/g, " ") + " грн"; }
  function grams(n) { return Math.round(n).toLocaleString("uk-UA").replace(/\u00a0/g, " ") + " г"; }
  function kg(n) { return (n / 1000).toLocaleString("uk-UA", { maximumFractionDigits: 1 }); }

  /* ---------- Header: solid on scroll ---------- */
  var header = document.querySelector(".site-header");
  var solidFromStart = header && header.hasAttribute("data-solid");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-solid", solidFromStart || window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* =========================================================
     Конструктор підписки + форма (лише на certificate.html)
     ========================================================= */
  var form = document.getElementById("order-form");
  if (!form) return;

  var tierSelect = form.elements["tier"];
  var treeInput = form.elements["tree_name"];
  var forInput = form.elements["recipient"];
  var status = document.getElementById("form-status");

  var state = { tier: "gourmet", qty: {} };
  PRODUCTS.forEach(function (p) { state.qty[p.id] = 0; });

  function used() {
    return PRODUCTS.reduce(function (s, p) { return s + state.qty[p.id] * p.kernel; }, 0);
  }
  function productsTotal() {
    return PRODUCTS.reduce(function (s, p) { return s + state.qty[p.id] * p.price; }, 0);
  }
  function selected() { return PRODUCTS.filter(function (p) { return state.qty[p.id] > 0; }); }
  function hasAdult() { return selected().some(function (p) { return p.adult; }); }
  function isTree() { return !TIERS[state.tier].noTree; }

  /* ----- fill tier labels from config ----- */
  ["classic", "gourmet", "owner"].forEach(function (id) {
    var b = document.querySelector('[data-budget="' + id + '"]');
    var f = document.querySelector('[data-fee="' + id + '"]');
    if (b) b.textContent = kg(TIERS[id].budget);
    if (f) f.textContent = Math.round(TIERS[id].fee).toLocaleString("uk-UA").replace(/\u00a0/g, " ");
  });

  /* ----- render product rows ----- */
  var table = document.getElementById("products");
  PRODUCTS.forEach(function (p) {
    var row = document.createElement("div");
    row.className = "prow";
    row.setAttribute("role", "row");
    row.dataset.id = p.id;
    var priceTxt = p.piece ? money(p.price) + " <small>/ шт.</small>" : money(p.price) + " <small>/ " + p.unit + "</small>";
    var kTxt = p.piece ? p.kernel + " г <small>/ шт.</small>" : p.kernel + " г <small>/ " + p.unit + "</small>";
    row.innerHTML =
      '<div class="prow__name"><b>' + p.name + (p.adult ? ' <i class="adult">18+</i>' : "") + "</b><span>" + p.desc + "</span></div>" +
      '<div class="prow__price" data-l="Ціна">' + priceTxt + "</div>" +
      '<div class="prow__kernel" data-l="Фундука">' + kTxt + "</div>" +
      '<div class="stepper" data-l="Кількість">' +
      '<button type="button" class="stepper__b" data-act="dec" aria-label="Менше: ' + p.name + '">−</button>' +
      '<output class="stepper__v" aria-live="polite">0</output>' +
      '<button type="button" class="stepper__b" data-act="inc" aria-label="Більше: ' + p.name + '">+</button>' +
      '<span class="stepper__sz">× ' + p.size + "</span></div>";
    table.appendChild(row);
  });

  table.addEventListener("click", function (e) {
    var btn = e.target.closest(".stepper__b");
    if (!btn) return;
    var id = btn.closest(".prow").dataset.id;
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
    if (btn.dataset.act === "inc") {
      if (isTree() && used() + p.kernel <= TIERS[state.tier].budget) state.qty[id]++;
    } else if (state.qty[id] > 0) {
      state.qty[id]--;
    }
    render();
  });

  /* ----- tier pickers ----- */
  var picks = document.querySelectorAll("[data-pick]");
  picks.forEach(function (b) {
    b.addEventListener("click", function () { setTier(b.getAttribute("data-pick")); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTier(b.getAttribute("data-pick")); }
    });
  });

  // Trim selection to the new budget (from the most recently added kinds backwards)
  function trimToBudget() {
    if (!isTree()) return;
    var max = TIERS[state.tier].budget;
    var ids = PRODUCTS.map(function (p) { return p.id; }).reverse();
    var guard = 0;
    while (used() > max && guard++ < 500) {
      for (var i = 0; i < ids.length && used() > max; i++) {
        if (state.qty[ids[i]] > 0) state.qty[ids[i]]--;
      }
    }
  }

  function setTier(id) {
    if (!TIERS[id]) return;
    state.tier = id;
    tierSelect.value = id;
    trimToBudget();
    render();
    syncFormFields();
  }
  tierSelect.addEventListener("change", function () { setTier(tierSelect.value); });

  /* ----- tag preview ----- */
  var tagName = document.getElementById("tag-name");
  var tagFor = document.getElementById("tag-for");
  var tagNo = document.getElementById("tag-no");
  function updateTag() {
    var n = (treeInput.value || "").trim();
    var f = (forInput.value || "").trim();
    if (tagName) tagName.textContent = n || "Назва дерева";
    if (tagFor) tagFor.textContent = f || "імʼя власника";
  }
  treeInput.addEventListener("input", updateTag);
  forInput.addEventListener("input", updateTag);
  if (tagNo) tagNo.textContent = String(Math.floor(Math.random() * 150) + 1);

  /* ----- form fields depending on tier ----- */
  var variantField = document.getElementById("advent-variant");
  var treeField = treeInput.closest(".field");
  function syncFormFields() {
    var tree = isTree();
    treeField.hidden = !tree;
    treeInput.required = tree;
    forInput.required = tree;
    variantField.hidden = tree;
    if (!tree) treeInput.value = "";
    updateTag();
  }

  /* ----- render summary ----- */
  function render() {
    var t = TIERS[state.tier];
    var tree = isTree();

    // pick buttons
    picks.forEach(function (b) {
      var on = b.getAttribute("data-pick") === state.tier;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.classList.toggle("is-on", on);
    });

    var builder = document.getElementById("builder");
    builder.classList.toggle("is-off", !tree);

    // product rows
    var u = used();
    var left = tree ? t.budget - u : 0;
    table.querySelectorAll(".prow").forEach(function (row) {
      var p = PRODUCTS.filter(function (x) { return x.id === row.dataset.id; })[0];
      var q = state.qty[p.id];
      row.querySelector(".stepper__v").textContent = q;
      row.classList.toggle("is-picked", q > 0);
      row.querySelector('[data-act="dec"]').disabled = q === 0;
      row.querySelector('[data-act="inc"]').disabled = !tree || left < p.kernel;
    });

    var sumTier = document.getElementById("sum-tier");
    var meterBar = document.getElementById("meter-bar");
    var list = document.getElementById("sum-list");
    var sel = selected();

    if (!tree) {
      sumTier.textContent = t.name + " — готовий набір";
      meterBar.style.width = "0%";
      document.getElementById("meter-used").textContent = "—";
      document.getElementById("meter-max").textContent = "—";
      list.innerHTML = '<li class="muted">Для календаря «7 днів» продукти не обираються — набір фіксований (див. вище).</li>';
      document.getElementById("sum-fee").textContent = "—";
      document.getElementById("sum-products").textContent = "—";
      document.getElementById("sum-total").textContent = money(t.fixedPrice);
    } else {
      sumTier.textContent = t.name + " · " + t.share + " урожаю дерева";
      var pct = Math.min(100, (u / t.budget) * 100);
      meterBar.style.width = pct + "%";
      meterBar.classList.toggle("is-full", pct >= 99.5);
      document.getElementById("meter-used").textContent = grams(u);
      document.getElementById("meter-max").textContent = grams(t.budget);
      list.innerHTML = sel.length
        ? sel.map(function (p) {
            var q = state.qty[p.id];
            var sz = p.piece ? q + " шт." : (p.unit === "100 мл" ? q * 100 + " мл" : q * 100 + " г");
            return "<li><span>" + p.name + " <em>" + sz + "</em></span><span>" + money(q * p.price) + "</span></li>";
          }).join("")
        : '<li class="muted">Додайте продукти зі списку ліворуч.</li>';
      document.getElementById("sum-fee").textContent = money(t.fee);
      document.getElementById("sum-products").textContent = money(productsTotal());
      document.getElementById("sum-total").textContent = money(t.fee + productsTotal());
    }

    // summary in the order form
    var box = document.getElementById("order-sum");
    var body = document.getElementById("order-sum-body");
    if (tree) {
      box.hidden = false;
      body.innerHTML =
        "<b>" + t.name + " (" + t.share + " урожаю)</b> — " + money(t.fee) +
        (sel.length
          ? "<br>" + sel.map(function (p) {
              var q = state.qty[p.id];
              return p.name + " × " + (p.piece ? q + " шт." : q * 100 + (p.unit === "100 мл" ? " мл" : " г"));
            }).join("<br>")
          : "<br><i>Продукти ще не обрано</i>") +
        "<br><b>Разом: " + money(t.fee + productsTotal()) + "</b>";
    } else {
      box.hidden = false;
      body.innerHTML = "<b>" + t.name + "</b> — " + money(t.fixedPrice);
    }

    var adultField = document.getElementById("adult-field");
    var adultNeeded = tree ? hasAdult() : false;
    adultField.hidden = !adultNeeded;
    document.getElementById("adult").required = adultNeeded;
  }

  /* ----- external triggers ----- */
  document.querySelectorAll("[data-tier]").forEach(function (a) {
    a.addEventListener("click", function () { setTier(a.getAttribute("data-tier")); });
  });
  var qs = new URLSearchParams(window.location.search);
  if (qs.get("tier") && TIERS[qs.get("tier")]) state.tier = qs.get("tier");
  tierSelect.value = state.tier;

  render();
  syncFormFields();

  /* ----- submit ----- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var tree = isTree();
    if (tree && !selected().length) {
      status.textContent = "Додайте хоча б один продукт у конструкторі вище.";
      document.getElementById("builder").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!form.reportValidity()) return;

    var d = new FormData(form);
    var t = TIERS[state.tier];
    var items = selected().map(function (p) {
      var q = state.qty[p.id];
      return {
        name: p.name,
        quantity: q,
        size: p.piece ? q + " шт." : q * 100 + (p.unit === "100 мл" ? " мл" : " г"),
        price: q * p.price,
        kernel: q * p.kernel
      };
    });
    var total = tree ? t.fee + productsTotal() : t.fixedPrice;
    var lines = ["Нове замовлення", ""];

    if (tree) {
      lines.push("Підписка: " + t.name + " (" + t.share + " урожаю дерева, ліміт " + grams(t.budget) + " ядра)");
      lines.push("Дерево і пакування: " + money(t.fee));
      lines.push("Продукти:");
      items.forEach(function (item) {
        lines.push("  • " + item.name + " — " + item.size + " = " + money(item.price) + " (ядра: " + grams(item.kernel) + ")");
      });
      lines.push("Використано ядра: " + grams(used()) + " із " + grams(t.budget));
      lines.push("РАЗОМ: " + money(total));
      lines.push("", "Назва дерева: " + (d.get("tree_name") || "—"));
    } else {
      lines.push("Набір: " + t.name + " — " + money(t.fixedPrice));
      lines.push("Версія: " + d.get("advent_variant"));
    }
    lines.push(
      "Для кого (власник): " + (d.get("recipient") || "—"),
      "Нагода: " + (d.get("occasion") || "—"),
      "Побажання на листівці: " + (d.get("message") || "—"),
      "",
      "Замовник: " + d.get("buyer"),
      "Телефон: " + d.get("phone"),
      "Email: " + (d.get("email") || "—"),
      "Доставка: " + (d.get("delivery") || "—")
    );
    if (tree && hasAdult()) lines.push("Підтверджено: одержувачу 18+");

    var payload = {
      createdAt: new Date().toISOString(),
      tier: t.name,
      share: tree ? t.share : "",
      tree: tree,
      treeName: d.get("tree_name") || "",
      recipient: d.get("recipient") || "",
      occasion: d.get("occasion") || "",
      message: d.get("message") || "",
      buyer: d.get("buyer") || "",
      phone: d.get("phone") || "",
      email: d.get("email") || "",
      delivery: d.get("delivery") || "",
      adventVariant: d.get("advent_variant") || "",
      adultConfirmed: tree && hasAdult(),
      treeFee: tree ? t.fee : 0,
      productsTotal: tree ? productsTotal() : 0,
      total: total,
      kernelUsed: tree ? used() : 0,
      kernelBudget: tree ? t.budget : 0,
      items: items,
      text: lines.join("\n")
    };

    if (ORDER_ENDPOINT) {
      status.textContent = "Надсилаємо заявку…";
      fetch(ORDER_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload)
      }).then(function () {
        status.textContent = "Заявку надіслано. Ми звʼяжемося з вами найближчим часом.";
      }).catch(function () {
        status.textContent = "Не вдалося надіслати заявку автоматично. Відкриваємо поштовий застосунок.";
        window.location.href = "mailto:" + ORDER_EMAIL +
          "?subject=" + encodeURIComponent("Підписка на дерево — " + t.name) +
          "&body=" + encodeURIComponent(lines.join("\n"));
      });
      return;
    }

    var href = "mailto:" + ORDER_EMAIL +
      "?subject=" + encodeURIComponent("Підписка на дерево — " + t.name) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    status.textContent = "Відкриваємо ваш поштовий застосунок із готовою заявкою. Якщо нічого не сталося — напишіть нам у Telegram або зателефонуйте.";
    window.location.href = href;
  });
})();
