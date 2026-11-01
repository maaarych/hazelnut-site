(function (root) {
var PRICING = {
  GG_OWNER: 1.0,
  GG_RETAIL: 1.1,
  ROUND_TO: 5,
  MIN_SHOP_ORDER: 300,
  ORDER_COOLDOWN_MS: 10 * 60 * 1000,
  MAX_QTY: 50,
  // Орієнтовний курс лише для відображення євро; оплата завжди в гривнях.
  UAH_PER_EUR: 52,
  // Регулятор підписки: якщо набрано від (1 − t) бюджету і більше, ціна підлаштовується під набране
  // (1 ГГ = 1 грн). 10% бюджету ≈ 5% вартості пакета.
  BUDGET_TOLERANCE: 0.1,
  PRODUCTS_URL: "data/products.json",
  SHOP_CART_KEY: "hazely-shop-cart",
  SUBSCRIPTIONS: {
    classic: {
      id: "classic",
      name: "Класичний",
      price: 1500,
      budget: 700,
      harvest: "≈ 1,75 кг у шкаралупі",
      share: "1/3",
      treeFee: 800,
      features: ["Іменне дерево і ярлик", "Сертифікат та фото дерева", "Фотозвіт навесні", "Подарункова коробка"]
    },
    gourmet: {
      id: "gourmet",
      name: "Гурман",
      price: 2250,
      budget: 1100,
      harvest: "≈ 2,75 кг у шкаралупі",
      share: "1/2",
      treeFee: 1150,
      featured: true,
      features: ["Усе з «Класичного»", "Іменна табличка біля дерева", "Преміальна деревʼяна коробка", "Листівка від руки"]
    },
    owner: {
      id: "owner",
      name: "Господар дерева",
      price: 3500,
      budget: 1600,
      harvest: "≈ 4 кг у шкаралупі",
      share: "3/4",
      treeFee: 1900,
      freeDelivery: true,
      features: ["Усе з «Гурмана»", "Візит у сад для двох", "Особисте фото біля дерева", "Імʼя в книзі саду"]
    }
  },
  ADVENT: {
    seven: {
      id: "advent7",
      name: "Адвент «7 днів фундука»",
      price: 1190,
      days: 7
    }
  },
  READY_SETS: {
    classic: ["roast", "paste", "choc", "chocpaste"],
    gourmet: ["raw", "roast", "paste", "choc", "chocpaste"],
    owner: ["inshell", "raw", "roast", "paste", "choc", "chocpaste"]
  },
  roundPrice: function (value) {
    return Math.round(value / this.ROUND_TO) * this.ROUND_TO;
  },
  retailPrice: function (product) {
    return this.roundPrice(product.gg * this.GG_RETAIL);
  },
  ownerPrice: function (product) {
    return product.gg * this.GG_OWNER;
  },
  // Єдиний розрахунок для сайту й сервера. input: { subscription, sub: {id: к-сть}, extra: {id: к-сть}, advent }
  calculate: function (products, input) {
    var self = this;
    var byId = {};
    products.forEach(function (product) { byId[product.id] = product; });
    function qtyOf(map, id) {
      var value = Math.floor(Number(map && map[id]) || 0);
      return Math.max(0, Math.min(value, self.MAX_QTY));
    }
    var plan = input.subscription ? this.SUBSCRIPTIONS[input.subscription] : null;
    var lines = [];
    var result = { lines: lines, subscription: null, extraTotal: 0, adventTotal: 0, adventQty: 0, total: 0, minOrderOk: true };

    var used = 0;
    products.forEach(function (product) {
      var qty = plan ? qtyOf(input.sub, product.id) : 0;
      if (!qty) return;
      used += qty * product.gg;
      lines.push({ group: "subscription", id: product.id, name: product.name, unit: product.unit, qty: qty, gg: qty * product.gg, price: 0 });
    });

    if (plan) {
      var floor = plan.budget * (1 - this.BUDGET_TOLERANCE);
      var total = plan.price;
      var credit = 0;
      if (used === 0) {
        credit = plan.budget;
      } else if (used >= floor) {
        total = plan.treeFee + used * this.GG_OWNER;
      } else {
        credit = plan.budget - used;
      }
      result.subscription = {
        id: plan.id, name: plan.name, basePrice: plan.price, budget: plan.budget, usedGG: used,
        adjust: total - plan.price, credit: credit, total: total, minGG: Math.round(floor), maxGG: Math.round(plan.budget * (1 + this.BUDGET_TOLERANCE))
      };
    }

    products.forEach(function (product) {
      var qty = qtyOf(input.extra, product.id);
      if (!qty) return;
      var price = qty * self.retailPrice(product);
      result.extraTotal += price;
      lines.push({ group: "extra", id: product.id, name: product.name, unit: product.unit, qty: qty, gg: 0, price: price });
    });

    result.adventQty = qtyOf({ a: input.advent }, "a");
    result.adventTotal = result.adventQty * this.ADVENT.seven.price;
    if (result.adventQty) lines.push({ group: "advent", id: this.ADVENT.seven.id, name: this.ADVENT.seven.name, unit: "шт", qty: result.adventQty, gg: 0, price: result.adventTotal });

    result.total = (result.subscription ? result.subscription.total : 0) + result.extraTotal + result.adventTotal;
    result.minOrderOk = Boolean(plan) || result.adventQty > 0 || result.extraTotal >= this.MIN_SHOP_ORDER;
    result.empty = !plan && !result.adventQty && !result.extraTotal;
    return result;
  }
};
if (typeof module !== "undefined" && module.exports) module.exports = PRICING;
else root.HAZELY_PRICING = PRICING;
})(typeof window !== "undefined" ? window : globalThis);
