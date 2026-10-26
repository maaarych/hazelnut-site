window.LISHCHYNA_PRICING = {
  GG_OWNER: 1.0,
  GG_RETAIL: 1.1,
  ROUND_TO: 5,
  MIN_SHOP_ORDER: 300,
  PRODUCTS_URL: "data/products.json",
  ORDER_ENDPOINT: "https://script.google.com/macros/s/AKfycbxLOsFVMmLza7Fj87iDrHFtR7JCADZU3-GLAXxcGKcOyRM6p7i2ac8UynnMC17y6wVg/exec",
  SHOP_CART_KEY: "lishchyna-shop-cart",
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
      features: ["Усе з «Гурмана»", "Візит у сад для двох", "Особисте фото біля дерева", "Імʼя в книзі саду"]
    }
  },
  ADVENT: {
    seven: {
      id: "advent7",
      name: "Адвент «7 днів фундука»",
      price: 1190,
      variants: ["Без алкоголю", "З алкоголем (18+)"]
    },
    twentyFour: {
      id: "advent24",
      name: "Адвент «24 дні»",
      price: 1450,
      variants: ["Без алкоголю", "З алкоголем (18+)"]
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
  }
};
