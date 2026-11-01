(function () {
  "use strict";

  var CONFIG = window.HAZELOO_PRICING || {};
  var productsCache = null;
    var STATUS_FLOW = ["processing", "confirmed", "delivered"];
  var STATUS_LABELS = { processing: "Обробка", confirmed: "Підтверджено", delivered: "Доставлено", cancelled: "Скасовано" };

  var t = I18N.t;

  function number(value) {
    return Math.round(Number(value) || 0).toLocaleString("uk-UA").replace(/ /g, " ");
  }

  function money(value) {
    return I18N.money(value);
  }

  function gg(value) {
    return number(value) + " " + t("ГГ");
  }

  function signed(value) {
    return (value > 0 ? "+" : value < 0 ? "−" : "") + money(Math.abs(value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>\"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function byId(id) { return document.getElementById(id); }

  function api(path, method, body) {
    return fetch(path, {
      method: method || "GET",
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(t(data.error || "Помилка сервера"));
          error.status = response.status;
          throw error;
        }
        return data;
      });
    });
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CONFIG.SHOP_CART_KEY) || "{}"); } catch (_) { return {}; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CONFIG.SHOP_CART_KEY, JSON.stringify(cart)); } catch (_) { /* приватний режим */ }
  }

  function clearCart() {
    try { localStorage.removeItem(CONFIG.SHOP_CART_KEY); } catch (_) { /* приватний режим */ }
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
          node.textContent = t("Не вдалося завантажити каталог. Оновіть сторінку або напишіть нам.");
        });
        console.error(error);
      });
  }

  function initConfigLabels() {
    document.querySelectorAll("[data-price]").forEach(function (node) {
      var key = node.dataset.price;
      var value = CONFIG.SUBSCRIPTIONS && CONFIG.SUBSCRIPTIONS[key] ? CONFIG.SUBSCRIPTIONS[key].price
        : key === "advent" ? CONFIG.ADVENT.seven.price
        : key === "min" ? CONFIG.MIN_SHOP_ORDER : null;
      if (value != null) node.textContent = money(value);
    });
    document.querySelectorAll("[data-budget]").forEach(function (node) {
      var plan = CONFIG.SUBSCRIPTIONS && CONFIG.SUBSCRIPTIONS[node.dataset.budget];
      if (plan) node.textContent = gg(plan.budget);
    });
  }

  // нотатка про курс видима лише коли показано євро
  function currencyNote() {
    document.querySelectorAll("[data-cur-note]").forEach(function (node) {
      node.hidden = I18N.cur !== "EUR";
      node.textContent = t("Оплата здійснюється в гривнях. Суми в євро — орієнтовні за курсом 1 € = {rate} ₴.", { rate: I18N.rate });
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
    var items = document.querySelectorAll(".reveal:not(.is-in)");
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

  // ---------- Магазин: кошик ----------
  function initShop(products) {
    var root = byId("shop-app");
    var grid = byId("shop-products");
    var list = byId("shop-cart-list");
    var totalNode = byId("shop-total");
    var note = byId("shop-note");
    var checkout = byId("shop-checkout");
    if (!root || !grid) return;

    var cart = getCart();
    products.forEach(function (product) { if (!Number.isFinite(cart[product.id])) cart[product.id] = 0; });

    function total() {
      return products.reduce(function (sum, product) { return sum + (cart[product.id] || 0) * CONFIG.retailPrice(product); }, 0);
    }

    function renderGrid() {
      grid.innerHTML = products.map(function (product) {
        return '<article class="product-card"><div class="product-card__image"><img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(t(product.name)) + '" loading="lazy"></div><div class="product-card__body"><h3>' + escapeHtml(t(product.name)) + '</h3><p>' + escapeHtml(t(product.description)) + '</p><div class="product-card__meta"><strong>' + money(CONFIG.retailPrice(product)) + '</strong><span>' + escapeHtml(t(product.unit)) + '</span></div><button class="btn product-add" data-id="' + product.id + '">' + t("Додати") + ' <span class="arrow">+</span></button></div></article>';
      }).join("");
    }

    function renderCart() {
      var selected = products.filter(function (product) { return cart[product.id] > 0; });
      var sum = total();
      list.innerHTML = selected.length ? selected.map(function (product) {
        var qty = cart[product.id];
        return '<li><span><b>' + escapeHtml(t(product.name)) + '</b><small>' + qty + ' × ' + escapeHtml(t(product.unit)) + '</small></span><span>' + money(qty * CONFIG.retailPrice(product)) + ' <button class="cart-step" data-cart-act="dec" data-id="' + product.id + '" aria-label="' + t("Менше") + '">−</button><button class="cart-step" data-cart-act="inc" data-id="' + product.id + '" aria-label="' + t("Більше") + '">+</button></span></li>';
      }).join("") : '<li class="muted">' + t("Кошик порожній.") + '</li>';
      totalNode.textContent = money(sum);
      if (sum < CONFIG.MIN_SHOP_ORDER) {
        note.textContent = t("Мінімальне замовлення — {min}. Залишилося додати {left}.", { min: money(CONFIG.MIN_SHOP_ORDER), left: money(CONFIG.MIN_SHOP_ORDER - sum) });
        checkout.setAttribute("aria-disabled", "true");
      } else {
        note.textContent = t("Доставка — Новою поштою за тарифами перевізника.");
        checkout.removeAttribute("aria-disabled");
      }
      saveCart(cart);
    }

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
      if (total() < CONFIG.MIN_SHOP_ORDER) event.preventDefault();
    });
    renderGrid();
    renderCart();
    I18N.onChange(function () { renderGrid(); renderCart(); });
  }

  // ---------- Сторінка замовлення ----------
  function initOrder(products) {
    var form = byId("order-form");
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var plans = CONFIG.SUBSCRIPTIONS;
    var state = { subscription: "", sub: {}, extra: {}, advent: 0, user: null, busy: false };
    var cart = getCart();
    products.forEach(function (product) {
      state.sub[product.id] = 0;
      state.extra[product.id] = Math.max(0, Math.floor(Number(cart[product.id]) || 0));
    });
    if (plans[params.get("sub")]) state.subscription = params.get("sub");
    if (params.get("advent")) state.advent = 1;

    var pick = byId("plan-pick");
    var table = byId("order-products");
    var status = byId("form-status");

    function calc() {
      return CONFIG.calculate(products, { subscription: state.subscription, sub: state.sub, extra: state.extra, advent: state.advent });
    }

    function renderPlans() {
      var options = [{ id: "", name: t("Без підписки"), note: t("Лише продукти") }].concat(Object.keys(plans).map(function (id) {
        return { id: id, name: t(plans[id].name), note: money(plans[id].price) + " · " + gg(plans[id].budget) };
      }));
      pick.innerHTML = options.map(function (option) {
        var on = option.id === state.subscription;
        return '<button type="button" class="plan-opt' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '" data-plan="' + option.id + '"><b>' + escapeHtml(option.name) + '</b><span>' + escapeHtml(option.note) + '</span></button>';
      }).join("");
    }

    function stepper(group, id, qty, label) {
      return '<div class="stepper" data-group="' + group + '" data-id="' + id + '"><button type="button" class="stepper__b" data-act="dec" aria-label="' + escapeHtml(t("Менше") + ": " + label) + '"' + (qty ? "" : " disabled") + '>−</button><output class="stepper__v">' + qty + '</output><button type="button" class="stepper__b" data-act="inc" aria-label="' + escapeHtml(t("Більше") + ": " + label) + '">+</button></div>';
    }

    function productRows(group) {
      return products.map(function (product) {
        var qty = state[group][product.id];
        var note = group === "sub" ? gg(product.gg) + " " + t("з бюджету") : money(CONFIG.retailPrice(product)) + " / " + escapeHtml(t(product.unit));
        return '<div class="orow' + (qty ? " is-picked" : "") + '"><div class="orow__name"><b>' + escapeHtml(t(product.name)) + '</b><span>' + note + '</span></div><div class="orow__cell" data-l="' + t("Кількість") + '">' + stepper(group, product.id, qty, t(product.name)) + '</div></div>';
      }).join("");
    }

    function renderProducts() {
      var hasPlan = Boolean(state.subscription);
      byId("block-sub").hidden = !hasPlan;
      byId("extra-title").textContent = t(hasPlan ? "Додатково" : "Продукти");
      byId("sub-hint").textContent = hasPlan ? t("Продукти з бюджету пакета — доплати немає. Фасування {unit}.", { unit: t(products[0].unit) }) : "";
      byId("products-hint").textContent = hasPlan
        ? t("Необовʼязково: окремо від підписки, за магазинними цінами.")
        : t("Ціни за фасування. Мінімальна сума продуктів — {min}.", { min: money(CONFIG.MIN_SHOP_ORDER) });
      var advent = CONFIG.ADVENT.seven;
      var adventRow = '<div class="orow orow--advent' + (state.advent ? " is-picked" : "") + '"><div class="orow__name"><b>' + escapeHtml(t(advent.name)) + '</b><span>' + money(advent.price) + ' · ' + t("без алкоголю") + '</span></div><div class="orow__cell" data-l="' + t("Кількість") + '">' + stepper("advent", "advent", state.advent, t(advent.name)) + '</div></div>';
      byId("order-sub").innerHTML = hasPlan ? productRows("sub") : "";
      table.innerHTML = productRows("extra") + adventRow;
      document.querySelectorAll("[data-n]").forEach(function (node, i, all) {
        var visible = Array.prototype.filter.call(all, function (n) { return !n.closest("[hidden]"); });
        node.textContent = visible.indexOf(node) + 1;
      });
    }

    function renderSummary() {
      var result = calc();
      var plan = result.subscription;
      var list = byId("sum-list");
      var regulator = byId("regulator");
      var adjustRow = byId("sum-adjust-row");

      byId("sum-plan").textContent = plan ? t("Підписка «{name}» · {price}", { name: t(plan.name), price: money(plan.basePrice) }) : t(result.empty ? "Оберіть підписку або продукти" : "Замовлення без підписки");
      list.innerHTML = result.lines.length ? result.lines.map(function (line) {
        var right = line.group === "subscription" ? t("у підписці") : money(line.price);
        return "<li><span>" + escapeHtml(t(line.name)) + " <em>× " + line.qty + "</em></span><span>" + right + "</span></li>";
      }).join("") : '<li class="muted">' + t("Поки порожньо.") + '</li>';

      regulator.hidden = !plan;
      adjustRow.hidden = !plan || !plan.adjust;
      if (plan) {
        var scale = plan.maxGG * 1.15;
        byId("reg-zone").style.left = plan.minGG / scale * 100 + "%";
        byId("reg-zone").style.width = (plan.maxGG - plan.minGG) / scale * 100 + "%";
        byId("reg-fill").style.width = Math.min(100, plan.usedGG / scale * 100) + "%";
        var text;
        if (!plan.usedGG) {
          text = t("Бюджет {budget}. Продукти можна обрати зараз або пізніше — без них діє ціна пакета.", { budget: gg(plan.budget) });
        } else if (plan.usedGG < plan.minGG) {
          text = t("Набрано {used} із {budget}. Додайте ще від {need}, щоб ціна підлаштувалась, або залишок {credit} збережеться на наступну відправку.", { used: gg(plan.usedGG), budget: gg(plan.budget), need: gg(plan.minGG - plan.usedGG), credit: gg(plan.credit) });
        } else if (plan.usedGG <= plan.maxGG) {
          text = plan.adjust
            ? t("Набрано {used} із {budget}: ціна підлаштована ({adjust}).", { used: gg(plan.usedGG), budget: gg(plan.budget), adjust: signed(plan.adjust) })
            : t("Набрано {used} із {budget}: ціна підлаштована, точно в бюджет.", { used: gg(plan.usedGG), budget: gg(plan.budget) });
        } else {
          text = t("Набрано {used} — понад бюджет {budget}. Ціна зростає на {adjust}, або оберіть вищий пакет.", { used: gg(plan.usedGG), budget: gg(plan.budget), adjust: money(plan.adjust) });
        }
        byId("reg-txt").textContent = text;
        byId("sum-adjust").textContent = signed(plan.adjust);
      }
      byId("sum-total").textContent = money(result.total);
      return result;
    }

    function render() {
      renderPlans();
      renderProducts();
      renderSummary();
    }

    function renderAccount() {
      var guest = !state.user;
      byId("password-field").hidden = !guest;
      byId("password").required = guest;
      byId("account-note").innerHTML = guest
        ? escapeHtml(t("Для відстеження замовлення створимо кабінет. Вже реєструвалися? ")) + '<a href="cabinet.html" class="link-line">' + t("Увійти") + '</a>'
        : escapeHtml(t("Ви увійшли як {name}. Статус замовлення — у ", { name: state.user.name })) + '<a href="cabinet.html" class="link-line">' + t("кабінеті") + '</a>.';
      if (state.user) {
        if (!form.elements.name.value) form.elements.name.value = state.user.name;
        if (!form.elements.phone.value) form.elements.phone.value = "+" + state.user.phone;
      }
    }

    pick.addEventListener("click", function (event) {
      var button = event.target.closest("[data-plan]");
      if (!button) return;
      state.subscription = button.dataset.plan;
      if (!state.subscription) products.forEach(function (product) { state.sub[product.id] = 0; });
      render();
    });
    function onStep(event) {
      var button = event.target.closest(".stepper__b");
      if (!button) return;
      var box = button.closest(".stepper");
      var delta = button.dataset.act === "inc" ? 1 : -1;
      var max = CONFIG.MAX_QTY || 50;
      if (box.dataset.group === "advent") state.advent = Math.max(0, Math.min(max, state.advent + delta));
      else state[box.dataset.group][box.dataset.id] = Math.max(0, Math.min(max, state[box.dataset.group][box.dataset.id] + delta));
      renderProducts();
      renderSummary();
    }
    table.addEventListener("click", onStep);
    byId("order-sub").addEventListener("click", onStep);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (state.busy) return;
      var result = calc();
      if (result.empty) { status.textContent = t("Оберіть підписку або продукти."); return; }
      if (!result.minOrderOk) { status.textContent = t("Мінімальна сума продуктів — {min}.", { min: money(CONFIG.MIN_SHOP_ORDER) }); return; }
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      state.busy = true;
      status.textContent = t("Надсилаємо…");
      api("/api/orders", "POST", {
        name: data.get("name"),
        phone: data.get("phone"),
        branch: data.get("branch"),
        password: data.get("password") || undefined,
        subscription: state.subscription || null,
        sub: state.sub,
        extra: state.extra,
        advent: state.advent
      }).then(function (response) {
        clearCart();
        form.hidden = true;
        byId("order-done").hidden = false;
        byId("done-id").textContent = "#" + response.order.id;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }).catch(function (error) {
        status.textContent = error.message || t("Не вдалося надіслати. Спробуйте ще раз.");
      }).then(function () { state.busy = false; });
    });

    render();
    renderAccount();
    I18N.onChange(function () { render(); renderAccount(); });
    api("/api/me").then(function (data) {
      state.user = data.user;
      renderAccount();
    }).catch(function () { /* залишаємо форму гостя */ });
  }

  // ---------- Кабінет ----------
  function initCabinet() {
    var authBox = byId("auth");
    if (!authBox) return;
    var accountBox = byId("account");
    var ordersBox = byId("orders");
    var mode = "login";
    var lastOrders = null;

    function setMode(next) {
      mode = next;
      document.querySelectorAll(".auth__tabs button").forEach(function (button) { button.classList.toggle("is-on", button.dataset.tab === mode); });
      byId("auth-name-field").hidden = mode !== "register";
      byId("auth-name").required = mode === "register";
      byId("auth-password").autocomplete = mode === "register" ? "new-password" : "current-password";
      byId("auth-submit").firstChild.textContent = t(mode === "register" ? "Створити кабінет" : "Увійти") + " ";
      byId("auth-status").textContent = "";
    }

    function dateText(iso) {
      var date = new Date(iso.replace(" ", "T"));
      return isNaN(date) ? "" : date.toLocaleString(I18N.lang === "en" ? "en-GB" : "uk-UA", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    }

    function tracker(order) {
      if (order.status === "cancelled") return '<div class="track track--cancelled">' + t("Скасовано") + '</div>';
      var index = STATUS_FLOW.indexOf(order.status);
      return '<ol class="track">' + STATUS_FLOW.map(function (key, i) {
        return '<li class="' + (i < index ? "is-done" : i === index ? "is-now" : "") + '"><i></i>' + t(STATUS_LABELS[key]) + '</li>';
      }).join("") + '</ol>';
    }

    function orderCard(order) {
      var items = order.items.map(function (item) {
        var right = item.kind === "subscription" ? t("у підписці") : money(item.price);
        return "<li><span>" + escapeHtml(t(item.name)) + " × " + item.qty + "</span><span>" + right + "</span></li>";
      }).join("");
      var plan = order.subscription
        ? '<p class="order-card__plan">' + escapeHtml(t("Підписка «{name}» · {price}", { name: t(order.subscription.name), price: money(order.subscription.price) }) + (order.subscription.creditGG ? t(" · залишок бюджету {credit}", { credit: gg(order.subscription.creditGG) }) : "")) + '</p>' : "";
      var action = order.canCancel
        ? '<div class="order-card__actions"><button type="button" class="btn btn--ghost" data-cancel="' + order.id + '">' + t("Скасувати замовлення") + '</button></div>'
        : order.status === "confirmed" ? '<p class="hint">' + t("Замовлення підтверджено — для змін зателефонуйте нам.") + '</p>' : "";
      return '<article class="order-card' + (order.status === "cancelled" ? " is-cancelled" : "") + '"><header><div><b>#' + escapeHtml(order.id) + '</b><span>' + dateText(order.createdAt) + '</span></div><strong>' + money(order.total) + '</strong></header>' +
        tracker(order) + plan + '<ul class="order-card__items">' + items + '</ul><p class="hint">' + escapeHtml(t("Нова пошта: {branch}", { branch: order.branch })) + '</p>' + action + '</article>';
    }

    function renderOrders() {
      if (!lastOrders) return;
      ordersBox.innerHTML = lastOrders.length ? lastOrders.map(orderCard).join("")
        : '<p class="muted">' + t("Замовлень ще немає. ") + '<a href="order.html" class="link-line">' + t("Зробити перше →") + '</a></p>';
    }

    function loadOrders() {
      ordersBox.innerHTML = '<p class="muted">' + t("Завантаження…") + '</p>';
      api("/api/orders").then(function (data) {
        lastOrders = data.orders;
        renderOrders();
      }).catch(function (error) {
        if (error.status === 401) showAuth();
        else ordersBox.innerHTML = '<p class="muted">' + escapeHtml(error.message) + '</p>';
      });
    }

    function showAccount(user) {
      authBox.hidden = true;
      accountBox.hidden = false;
      byId("acc-name").textContent = user.name;
      byId("acc-phone").textContent = "+" + user.phone;
      loadOrders();
    }

    function showAuth() {
      accountBox.hidden = true;
      authBox.hidden = false;
    }

    document.querySelectorAll(".auth__tabs button").forEach(function (button) {
      button.addEventListener("click", function () { setMode(button.dataset.tab); });
    });
    byId("auth-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;
      var statusNode = byId("auth-status");
      if (!form.reportValidity()) return;
      statusNode.textContent = "…";
      api(mode === "register" ? "/api/register" : "/api/login", "POST", {
        name: form.elements.name.value,
        phone: form.elements.phone.value,
        password: form.elements.password.value
      }).then(function (data) {
        form.reset();
        statusNode.textContent = "";
        showAccount(data.user);
      }).catch(function (error) { statusNode.textContent = error.message; });
    });
    byId("logout").addEventListener("click", function () {
      api("/api/logout", "POST", {}).then(showAuth);
    });
    ordersBox.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cancel]");
      if (!button) return;
      if (button.dataset.armed !== "1") {
        button.dataset.armed = "1";
        button.textContent = t("Підтвердити скасування");
        return;
      }
      button.disabled = true;
      api("/api/orders/" + encodeURIComponent(button.dataset.cancel) + "/cancel", "POST", {})
        .then(loadOrders)
        .catch(function (error) {
          button.disabled = false;
          button.insertAdjacentHTML("afterend", '<p class="form-status">' + escapeHtml(error.message) + "</p>");
          loadOrders();
        });
    });

    setMode("login");
    I18N.onChange(function () { setMode(mode); renderOrders(); });
    api("/api/me").then(function (data) {
      if (data.user) showAccount(data.user); else showAuth();
    }).catch(function () {
      showAuth();
      byId("auth-status").textContent = t("Сервер недоступний. Спробуйте пізніше.");
    });
  }

  initHeader();
  initConfigLabels();
  currencyNote();
  I18N.onChange(function () { initConfigLabels(); currencyNote(); });
  initReveal();
  initCabinet();
  if (byId("shop-app") || byId("order-form")) loadProducts(function (products) {
    initShop(products);
    initOrder(products);
  });
})();
