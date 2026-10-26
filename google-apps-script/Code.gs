var HEADERS = [
  "Створено",
  "ID",
  "Тариф",
  "Дерево",
  "Назва дерева",
  "Одержувач",
  "Покупець",
  "Телефон",
  "Email",
  "Доставка",
  "Сума, грн",
  "Ядра, г",
  "Продукти",
  "Нагода",
  "Побажання",
  "Версія адвенту",
  "18+"
];

function doGet() {
  return json_({ ok: true, service: "hazelnut-orders" });
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw && e && e.parameter) raw = e.parameter.payload;
    if (!raw) throw new Error("Порожня заявка");

    var order = JSON.parse(raw);
    validate_(order);

    var properties = PropertiesService.getScriptProperties();
    enforceCooldown_(properties, order);
    var sheetId = requiredProperty_(properties, "SHEET_ID");
    var sheetName = properties.getProperty("SHEET_NAME") || "Orders";
    var sheetBook = SpreadsheetApp.openById(sheetId);
    var sheet = sheetBook.getSheetByName(sheetName) || sheetBook.insertSheet(sheetName);
    ensureHeaders_(sheet);

    var id = makeOrderId_();
    var items = Array.isArray(order.items) ? order.items : [];
    sheet.appendRow([
      new Date(),
      id,
      cell_(order.tier),
      order.tree ? "Так" : "Ні",
      cell_(order.treeName),
      cell_(order.recipient),
      cell_(order.buyer),
      cell_(order.phone),
      cell_(order.email),
      cell_(order.delivery),
      number_(order.total),
      number_(order.kernelUsed),
      cell_(items.map(itemText_).join("; ")),
      cell_(order.occasion),
      cell_(order.message),
      cell_(order.adventVariant),
      order.adultConfirmed ? "Так" : "Ні"
    ]);

    sendTelegram_(properties, formatTelegram_(id, order));
    return json_({ ok: true, id: id });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function validate_(order) {
  ["buyer", "phone", "delivery", "tier"].forEach(function (field) {
    if (!order[field] || String(order[field]).trim() === "") {
      throw new Error("Не заповнено поле: " + field);
    }
  });
  if (String(order.buyer).length > 120 || String(order.phone).length > 60) {
    throw new Error("Некоректні контактні дані");
  }
}
function enforceCooldown_(properties, order) {
  var phone = String(order.phone || "").replace(/\D/g, "");
  var email = String(order.email || "").trim().toLowerCase();
  var identity = phone + "|" + email;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, identity);
  var key = "order-cooldown-" + Utilities.base64EncodeWebSafe(digest).replace(/=/g, "");
  var cache = CacheService.getScriptCache();
  if (cache.get(key)) throw new Error("Ми вже отримали заявку. Спробуйте ще раз через 10 хвилин.");
  var seconds = Number(properties.getProperty("ORDER_COOLDOWN_SECONDS") || 600);
  cache.put(key, "1", Math.max(60, Math.min(seconds, 21600)));
}


function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
}

function sendTelegram_(properties, text) {
  var token = requiredProperty_(properties, "TELEGRAM_BOT_TOKEN");
  var configuredIds = properties.getProperty("TELEGRAM_CHAT_IDS") || requiredProperty_(properties, "TELEGRAM_CHAT_ID");
  var chatIds = configuredIds.split(",").map(function (id) { return id.trim(); }).filter(function (id) { return id; });
  if (!chatIds.length) throw new Error("Не налаштовано жодного Telegram chat ID");

  chatIds.forEach(function (chatId) {
    var response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ chat_id: chatId, text: text }),
      muteHttpExceptions: true
    });
    if (response.getResponseCode() >= 400) {
      console.error("Telegram error for " + chatId + ": " + response.getContentText());
    }
  });
}

function formatTelegram_(id, order) {
  var lines = [
    "Нове замовлення #" + id,
    "",
    "Тариф: " + order.tier,
    order.tree ? "Дерево: " + (order.treeName || "—") : "Окремий набір",
    order.recipient ? "Одержувач: " + order.recipient : "",
    "",
    "Покупець: " + order.buyer,
    "Телефон: " + order.phone,
    order.email ? "Email: " + order.email : "",
    "Доставка: " + order.delivery,
    "",
    "Сума: " + number_(order.total) + " грн"
  ];

  if (order.items && order.items.length) {
    lines.push("", "Продукти:");
    order.items.forEach(function (item) {
      lines.push("• " + itemText_(item) + " — " + number_(item.price) + " грн");
    });
  }
  if (order.occasion) lines.push("", "Нагода: " + order.occasion);
  if (order.message) lines.push("Побажання: " + order.message);
  if (order.adventVariant) lines.push("Адвент: " + order.adventVariant);
  if (order.adultConfirmed) lines.push("Підтверджено 18+");
  return lines.filter(function (line) { return line !== undefined; }).join("\n");
}

function itemText_(item) {
  return String(item.name || "Продукт") + " × " + String(item.size || item.quantity || "");
}

function requiredProperty_(properties, name) {
  var value = properties.getProperty(name);
  if (!value) throw new Error("Не налаштовано Script Property: " + name);
  return value;
}

function makeOrderId_() {
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  return "HZ-" + stamp + "-" + Math.floor(Math.random() * 900 + 100);
}

function number_(value) {
  var number = Number(value);
  return isFinite(number) ? number : 0;
}

function cell_(value) {
  var text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
