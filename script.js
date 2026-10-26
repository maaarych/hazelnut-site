(function () {
  "use strict";

  var CONFIG = window.LISHCHYNA_PRICING || {};
  var ORDER_EMAIL = "hello@lishchyna.example";
  var productsCache = null;

  function money(value) {
    return Math.round(Number(value) || 0).toLocaleString("uk-UA").replace(/\u00a0/g, " ") + " грн";
  }

  function number(value) {
    return Math.round(Number(value) || 0).toLocaleString("uk-UA").replace(/\u00a0/g, " ");
  }

  function gg(value) {
    return number(value) + " ГГ";
  }

  function kg(value) {
    return (Number(value) || 0).toLocaleString("uk-UA", { maximumFractionDigits: 2 }) + " кг";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function getRetailPrice(product) {
    return CONFIG.roundPrice ? CONFIG.roundPrice(product.gg * CONFIG.GG_RETAIL) : Math.round(product.gg * CONFIG.GG_RETAIL);
  }

  function getOwnerPrice(product) {
    return product.gg * CONFIG.GG_OWNER;
  }
  function initConfigLabels() {
    document.querySelectorAll("[data-pick]").forEach(function (card) {
      var packageData = CONFIG.SUBSCRIPTIONS && CONFIG.SUBSCRIPTIONS[card.dataset.pick];
      if (!packageData) return;
      var price = card.querySelector(".tpick__price");
      var budget = card.querySelector(".tpick__kg");
      if (price) price.innerHTML = money(packageData.price).replace(" грн", "") + " <small>грн</small>";
      if (budget) budget.innerHTML = "Бюджет <b>" + gg(packageData.budget) + "</b> · <span>" + escapeHtml(packageData.harvest) + "</span>";
    });
    var typeSelect = document.getElementById("order_type");
    if (typeSelect && CONFIG.SUBSCRIPTIONS) {
      ["classic", "gourmet", "owner"].forEach(function (id) {
        var option = typeSelect.querySelector('option[value="' + id + '"]');
        if (option) option.textContent = "Підписка «" + CONFIG.SUBSCRIPTIONS[id].name + "» — " + money(CONFIG.SUBSCRIPTIONS[id].price);
      });
      var advent7 = typeSelect.querySelector('option[value="advent7"]');
      var advent24 = typeSelect.querySelector('option[value="advent24"]');
      if (advent7) advent7.textContent = "Адвент «7 днів» — " + money(CONFIG.ADVENT.seven.price);
      if (advent24) advent24.textContent = "Адвент «24 дні» — " + money(CONFIG.ADVENT.twentyFour.price);
    }
    var adventPrices = document.querySelectorAll(".offer-bottom strong");
    if (adventPrices[0] && CONFIG.ADVENT) adventPrices[0].textContent = money(CONFIG.ADVENT.seven.price);
    if (adventPrices[1] && CONFIG.ADVENT) adventPrices[1].textContent = money(CONFIG.ADVENT.twentyFour.price);
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CONFIG.SHOP_CART_KEY) || "{}"); } catch (_) { return {}; }
  }

  function saveCart(cart) {
    localStorage.setItem(CONFIG.SHOP_CART_KEY, JSON.stringify(cart));
  }

  function loadProducts(callback) {
    if (productsCache) { callback(productsCache); return; }
    fetch(CONFIG.PRODUCTS_URL || "data/products.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Каталог недоступний");
        return response.json();
      })
      .then(function (products) {
        productsCache = products.filter(function (product) { return !product.adult; });
        callback(productsCache);
      })
      .catch(function (error) {
        document.querySelectorAll("[data-products-error]").forEach(function (node) {
          node.textContent = "Не вдалося завантажити каталог. Оновіть сторінку або напишіть нам.";
        });
        console.error(error);
      });
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    function onScroll() {
      if (header) header.classList.toggle("is-solid", header.hasAttribute("data-solid") || window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.querySelectorAll(".nav a").forEach(function (link) {
        link.addEventListener("click", function () {
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    items.forEach(function (item) { observer.observe(item); });
  }

  function initShop(products) {
    var root = document.getElementById("shop-app");
    var grid = document.getElementById("shop-products");
    var list = document.getElementById("shop-cart-list");
    var totalNode = document.getElementById("shop-total");
    var note = document.getElementById("shop-note");
    var checkout = document.getElementById("shop-checkout");
    var status = document.getElementById("shop-status");
    if (!root || !grid) return;

    var cart = getCart();
    products.forEach(function (product) { if (!Number.isFinite(cart[product.id])) cart[product.id] = 0; });

    function total() {
      return products.reduce(function (sum, product) { return sum + (cart[product.id] || 0) * getRetailPrice(product); }, 0);
    }

    function renderCart() {
      var selected = products.filter(function (product) { return cart[product.id] > 0; });
      var sum = total();
      list.innerHTML = selected.length ? selected.map(function (product) {
        var qty = cart[product.id];
        return '<li><span><b>' + escapeHtml(product.name) + '</b><small>' + qty + ' × ' + product.unit + '</small></span><span>' + money(qty * getRetailPrice(product)) + ' <button class="cart-step" data-cart-act="dec" data-id="' + product.id + '" aria-label="Менше">−</button><button class="cart-step" data-cart-act="inc" data-id="' + product.id + '" aria-label="Більше">+</button></span></li>';
      }).join("") : '<li class="muted">Кошик порожній.</li>';
      totalNode.textContent = money(sum);
      if (sum < CONFIG.MIN_SHOP_ORDER) {
        note.textContent = "Мінімальне замовлення — " + money(CONFIG.MIN_SHOP_ORDER) + ". Залишилося додати " + money(Math.max(0, CONFIG.MIN_SHOP_ORDER - sum)) + ".";
        checkout.setAttribute("aria-disabled", "true");
      } else {
        note.textContent = "Доставка — за тарифами перевізника або самовивіз у Снятині.";
        checkout.removeAttribute("aria-disabled");
      }
      saveCart(cart);
    }

    grid.innerHTML = products.map(function (product) {
      var price = getRetailPrice(product);
      return '<article class="product-card reveal"><div class="product-card__image"><img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy"></div><div class="product-card__body"><h3>' + escapeHtml(product.name) + '</h3><p>' + escapeHtml(product.description) + '</p><div class="product-card__meta"><strong>' + money(price) + '</strong><span>' + product.unit + '</span></div><small class="product-card__gg">Витрата: ' + gg(product.gg) + '</small><button class="btn product-add" data-id="' + product.id + '">Додати <span class="arrow">+</span></button></div></article>';
    }).join("");

    grid.addEventListener("click", function (event) {
      var button = event.target.closest("[data-id]");
      if (!button) return;
      cart[button.dataset.id] = (cart[button.dataset.id] || 0) + 1;
      renderCart();
    });
    list.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cart-act]");
      if (!button) return;
      var id = button.dataset.id;
      cart[id] = Math.max(0, (cart[id] || 0) + (button.dataset.cartAct === "inc" ? 1 : -1));
      renderCart();
    });
    checkout.addEventListener("click", function (event) {
      if (total() < CONFIG.MIN_SHOP_ORDER) {
        event.preventDefault();
        if (status) status.textContent = "Додайте товарів, щоб сума досягла мінімуму " + money(CONFIG.MIN_SHOP_ORDER) + ".";
      }
    });
    renderCart();
    initReveal();
  }

  function initCertificate(products) {
    var form = document.getElementById("order-form");
    if (!form) return;

    var subscriptions = CONFIG.SUBSCRIPTIONS;
    var typeSelect = form.elements["order_type"];
    var treeInput = form.elements["tree_name"];
    var recipientInput = form.elements["recipient"];
    var status = document.getElementById("form-status");
    var productTable = document.getElementById("subscription-products");
    var builder = document.getElementById("subscription-builder");
    var adventVariant = form.elements["advent_variant"];
    var adultInput = form.elements["adult"];
    var adultField = adultInput ? adultInput.closest(".check") : null;
    var state = { type: "gourmet", qty: {} };

    products.forEach(function (product) { state.qty[product.id] = 0; });

    function isSubscription() { return Boolean(subscriptions[state.type]); }
    function currentPackage() { return subscriptions[state.type] || null; }
    function usedBudget() {
      return products.reduce(function (sum, product) { return sum + state.qty[product.id] * product.gg; }, 0);
    }
    function productTotal() {
      var owner = isSubscription();
      return products.reduce(function (sum, product) {
        var price = owner ? getOwnerPrice(product) : getRetailPrice(product);
        return sum + state.qty[product.id] * price;
      }, 0);
    }
    function selectedItems() {
      return products.filter(function (product) { return state.qty[product.id] > 0; }).map(function (product) {
        var quantity = state.qty[product.id];
        var price = isSubscription() ? getOwnerPrice(product) : getRetailPrice(product);
        return { name: product.name, quantity: quantity, size: quantity + " × " + product.unit, price: quantity * price, kernel: quantity * product.kernel_g, gg: quantity * product.gg };
      });
    }
    function adventOffer() {
      return state.type === "advent24" ? CONFIG.ADVENT.twentyFour : CONFIG.ADVENT.seven;
    }
    function orderTitle() {
      if (state.type === "shop") return "Замовлення з магазину";
      if (state.type === "advent7") return CONFIG.ADVENT.seven.name;
      if (state.type === "advent24") return CONFIG.ADVENT.twentyFour.name;
      return currentPackage().name;
    }
    function total() {
      if (isSubscription()) {
        var surcharge = Math.max(0, usedBudget() - currentPackage().budget) * CONFIG.GG_OWNER;
        return currentPackage().price + surcharge;
      }
      if (state.type === "shop") return productTotal();
      return adventOffer().price;
    }
    function show(node, visible) { if (node) node.hidden = !visible; }

    function setType(type) {
      if (!type) return;
      state.type = type;
      typeSelect.value = type;
      render();
      syncFields();
    }

    function setReadySet(id) {
      var ids = CONFIG.READY_SETS[id] || [];
      products.forEach(function (product) { state.qty[product.id] = ids.indexOf(product.id) >= 0 ? 1 : 0; });
      if (subscriptions[id]) state.type = id;
      typeSelect.value = state.type;
      render();
      syncFields();
    }

    function renderProducts() {
      if (!productTable) return;
      productTable.innerHTML = '<div class="ptable__head" role="row"><span>Продукт</span><span>Для власника</span><span>Бюджет</span><span>Кількість</span></div>' + products.map(function (product) {
        var quantity = state.qty[product.id];
        var price = isSubscription() ? getOwnerPrice(product) : getRetailPrice(product);
        return '<div class="prow ' + (quantity ? "is-picked" : "") + '" role="row" data-id="' + product.id + '"><div class="prow__name"><b>' + escapeHtml(product.name) + '</b><span>' + escapeHtml(product.description) + '</span></div><div class="prow__price" data-l="Ціна">' + money(price) + ' <small>/ ' + product.unit + '</small></div><div class="prow__kernel" data-l="ГГ">−' + gg(product.gg) + '</div><div class="stepper" data-l="Кількість"><button type="button" class="stepper__b" data-act="dec" aria-label="Менше: ' + escapeHtml(product.name) + '">−</button><output class="stepper__v" aria-live="polite">' + quantity + '</output><button type="button" class="stepper__b" data-act="inc" aria-label="Більше: ' + escapeHtml(product.name) + '">+</button><span class="stepper__sz">× ' + product.unit + '</span></div></div>';
      }).join("");
    }

    function render() {
      var packageData = currentPackage();
      var budget = packageData ? packageData.budget : 0;
      var used = isSubscription() ? usedBudget() : 0;
      var surcharge = isSubscription() ? Math.max(0, used - budget) * CONFIG.GG_OWNER : 0;
      var items = selectedItems();
      var summaryList = document.getElementById("sum-list");
      var totalNode = document.getElementById("sum-total");
      var packageNode = document.getElementById("sum-package");
      var usedNode = document.getElementById("sum-used");
      var budgetNode = document.getElementById("sum-budget");
      var leftNode = document.getElementById("sum-left");
      var surchargeNode = document.getElementById("sum-surcharge");
      var meter = document.getElementById("meter-bar");

      document.querySelectorAll("[data-pick]").forEach(function (card) {
        var active = card.dataset.pick === state.type;
        card.classList.toggle("is-on", active);
        card.setAttribute("aria-checked", active ? "true" : "false");
      });
      if (builder) builder.classList.toggle("is-off", !isSubscription() && state.type !== "shop");
      renderProducts();
      if (summaryList) summaryList.innerHTML = items.length ? items.map(function (item) { return "<li><span>" + escapeHtml(item.name) + " <em>" + escapeHtml(item.size) + "</em></span><span>" + money(item.price) + "</span></li>"; }).join("") : '<li class="muted">Продукти можна обрати зараз або пізніше.</li>';
      if (packageNode) packageNode.textContent = isSubscription() ? packageData.name + " · " + money(packageData.price) : orderTitle();
      if (usedNode) usedNode.textContent = isSubscription() ? gg(used) : "—";
      if (budgetNode) budgetNode.textContent = isSubscription() ? gg(budget) : "—";
      if (leftNode) leftNode.textContent = isSubscription() ? gg(Math.max(0, budget - used)) : "—";
      if (surchargeNode) surchargeNode.textContent = surcharge ? money(surcharge) : "0 грн";
      if (totalNode) totalNode.textContent = money(total());
      if (meter) {
        meter.style.width = isSubscription() ? Math.min(100, budget ? used / budget * 100 : 0) + "%" : "0%";
        meter.classList.toggle("is-over", surcharge > 0);
      }
      document.querySelectorAll(".prow").forEach(function (row) {
        var product = products.filter(function (item) { return item.id === row.dataset.id; })[0];
        var quantity = state.qty[product.id];
        row.querySelector(".stepper__v").textContent = quantity;
        row.querySelector('[data-act="dec"]').disabled = quantity === 0;
        row.querySelector('[data-act="inc"]').disabled = !isSubscription() && state.type !== "shop";
      });
      var formSummary = document.getElementById("order-sum-body");
      if (formSummary) formSummary.innerHTML = "<b>" + escapeHtml(orderTitle()) + "</b><br>До сплати: <b>" + money(total()) + "</b>" + (isSubscription() ? "<br>Горіховий бюджет: " + gg(used) + " із " + gg(budget) : "") + (surcharge ? "<br>Доплата за перевищення: " + money(surcharge) : "");
    }

    function syncFields() {
      var subscription = isSubscription();
      var advent = state.type === "advent7" || state.type === "advent24";
      var alcohol = advent && adventVariant && adventVariant.value.indexOf("алкогол") >= 0;
      var treeField = treeInput ? treeInput.closest(".field") : null;
      var recipientField = recipientInput ? recipientInput.closest(".field") : null;
      var typeNote = document.getElementById("order-type-note");
      show(builder, subscription || state.type === "shop");
      show(document.getElementById("advent-variant"), advent);
      show(adultField, advent);
      show(treeField, subscription);
      show(recipientField, subscription);
      if (treeInput) treeInput.required = subscription;
      if (recipientInput) recipientInput.required = subscription;
      if (adultInput) {
        adultInput.required = alcohol;
        if (!alcohol) adultInput.checked = false;
      }
      if (typeNote) typeNote.textContent = subscription ? "Продукти можна обрати зараз або пізніше. До двох відправок на рік включено." : "Заявка піде в таблицю замовлень і Telegram.";
      updateTag();
    }

    function updateTag() {
      var tagName = document.getElementById("tag-name");
      var tagFor = document.getElementById("tag-for");
      if (tagName) tagName.textContent = (treeInput && treeInput.value.trim()) || "Назва дерева";
      if (tagFor) tagFor.textContent = (recipientInput && recipientInput.value.trim()) || "імʼя одержувача";
    }

    document.querySelectorAll("[data-pick]").forEach(function (card) {
      card.addEventListener("click", function () { setType(card.dataset.pick); });
      card.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setType(card.dataset.pick); } });
    });
    document.querySelectorAll("[data-ready]").forEach(function (button) { button.addEventListener("click", function () { setReadySet(button.dataset.ready); }); });
    if (productTable) {
      productTable.addEventListener("click", function (event) {
        var button = event.target.closest(".stepper__b");
        if (!button) return;
        var row = button.closest(".prow");
        var product = products.filter(function (item) { return item.id === row.dataset.id; })[0];
        state.qty[product.id] = Math.max(0, state.qty[product.id] + (button.dataset.act === "inc" ? 1 : -1));
        render();
      });
    }
    if (typeSelect) typeSelect.addEventListener("change", function () { setType(typeSelect.value); });
    if (adventVariant) adventVariant.addEventListener("change", syncFields);
    if (treeInput) treeInput.addEventListener("input", updateTag);
    if (recipientInput) recipientInput.addEventListener("input", updateTag);
    var queryType = new URLSearchParams(window.location.search).get("type");
    if (queryType && (subscriptions[queryType] || queryType === "shop" || queryType === "advent7" || queryType === "advent24")) state.type = queryType;
    if (state.type === "shop") {
      var savedCart = getCart();
      products.forEach(function (product) { state.qty[product.id] = Number(savedCart[product.id]) || 0; });
    }
    typeSelect.value = state.type;
    render();
    syncFields();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (state.type === "shop" && total() < CONFIG.MIN_SHOP_ORDER) {
        status.textContent = "Мінімальне замовлення з магазину — " + money(CONFIG.MIN_SHOP_ORDER) + ".";
        return;
      }
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var items = selectedItems();
      var packageData = currentPackage();
      var selectedTotal = total();
      var lines = ["Нове замовлення", "Тип: " + orderTitle(), "До сплати: " + money(selectedTotal), ""];
      if (packageData) lines.push("Горіховий бюджет: " + gg(usedBudget()) + " із " + gg(packageData.budget));
      if (items.length) {
        lines.push("Продукти:");
        items.forEach(function (item) { lines.push("• " + item.name + " — " + item.size + " = " + money(item.price)); });
      }
      lines.push("", "Покупець: " + data.get("buyer"), "Телефон: " + data.get("phone"), "Email: " + (data.get("email") || "—"), "Доставка: " + data.get("delivery"));
      if (data.get("tree_name")) lines.push("Назва дерева: " + data.get("tree_name"));
      if (data.get("recipient")) lines.push("Одержувач: " + data.get("recipient"));
      if (data.get("occasion")) lines.push("Нагода: " + data.get("occasion"));
      if (data.get("message")) lines.push("Побажання: " + data.get("message"));
      if (data.get("advent_variant")) lines.push("Версія адвенту: " + data.get("advent_variant"));
      var payload = {
        createdAt: new Date().toISOString(),
        type: state.type,
        tier: orderTitle(),
        tree: isSubscription(),
        treeName: data.get("tree_name") || "",
        recipient: data.get("recipient") || "",
        occasion: data.get("occasion") || "",
        message: data.get("message") || "",
        buyer: data.get("buyer") || "",
        phone: data.get("phone") || "",
        email: data.get("email") || "",
        delivery: data.get("delivery") || "",
        adventVariant: data.get("advent_variant") || "",
        adultConfirmed: data.get("adult") === "on",
        treeFee: packageData ? packageData.price : 0,
        productsTotal: productTotal(),
        total: selectedTotal,
        kernelUsed: usedBudget(),
        surcharge: packageData ? Math.max(0, usedBudget() - packageData.budget) * CONFIG.GG_OWNER : 0,
        items: items,
        text: lines.join("\n")
      };
      status.textContent = "Надсилаємо заявку…";
      fetch(CONFIG.ORDER_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload) })
        .then(function () {
          status.textContent = "Заявку надіслано. Ми звʼяжемося з вами найближчим часом.";
          if (state.type === "shop") localStorage.removeItem(CONFIG.SHOP_CART_KEY);
        })
        .catch(function () {
          var href = "mailto:" + ORDER_EMAIL + "?subject=" + encodeURIComponent("Замовлення — " + orderTitle()) + "&body=" + encodeURIComponent(lines.join("\n"));
          status.textContent = "Не вдалося надіслати автоматично. Відкриваємо поштовий застосунок.";
          window.location.href = href;
        });
    });
  }

  initHeader();
  initConfigLabels();
  initReveal();
  var shop = document.getElementById("shop-app");
  var certificate = document.getElementById("order-form");
  if (shop || certificate) loadProducts(function (products) {
    if (shop) initShop(products);
    if (certificate) initCertificate(products);
  });
})();
