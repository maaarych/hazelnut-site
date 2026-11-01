"use strict";
// Сайт + API «Hazeloo»: користувачі, кабінет, замовлення. Без зовнішніх залежностей (Node 22+, node:sqlite).

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

try { process.loadEnvFile(path.join(__dirname, ".env")); } catch (_) { /* .env необовʼязковий */ }

const PRICING = require("./js/pricing.js");
const PRODUCTS = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf8")).filter((p) => !p.adult);

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "hazeloo.db");
const SESSION_DAYS = 30;
const STATUSES = ["processing", "confirmed", "delivered", "cancelled"];

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(fs.readFileSync(path.join(__dirname, "db", "schema.sql"), "utf8"));

// ---------- допоміжне ----------

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10 && digits[0] === "0") digits = "38" + digits;
  if (digits.length === 11 && digits.startsWith("80")) digits = "3" + digits;
  if (!/^380\d{9}$/.test(digits)) throw new HttpError(400, "Вкажіть номер телефону у форматі +38 0XX XXX XX XX");
  return digits;
}

function cleanText(value, label, max) {
  const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  if (!text) throw new HttpError(400, "Заповніть поле: " + label);
  if (text.length > max) throw new HttpError(400, "Занадто довге поле: " + label);
  return text;
}

function checkPassword(value) {
  const password = String(value || "");
  if (password.length < 6 || password.length > 100) throw new HttpError(400, "Пароль має містити від 6 символів");
  return password;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password, user) {
  const a = Buffer.from(hashPassword(password, user.password_salt), "hex");
  const b = Buffer.from(user.password_hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

const attempts = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) throw new HttpError(429, "Забагато спроб. Спробуйте трохи пізніше.");
  list.push(now);
  attempts.set(key, list);
}
setInterval(() => attempts.clear(), 60 * 60 * 1000).unref();

// ---------- сесії ----------

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function sessionCookie(token, maxAgeSeconds) {
  return "sid=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + maxAgeSeconds + (process.env.COOKIE_SECURE ? "; Secure" : "");
}

function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, expires);
  res.setHeader("Set-Cookie", sessionCookie(token, SESSION_DAYS * 86400));
}

function currentUser(req) {
  const token = parseCookies(req).sid;
  if (!token) return null;
  const row = db.prepare(
    "SELECT u.id, u.name, u.phone, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?"
  ).get(sha256(token));
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
    return null;
  }
  return row;
}

function publicUser(user) { return { id: user.id, name: user.name, phone: user.phone }; }

// ---------- замовлення ----------

function publicOrderId() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  return "HZ-" + stamp + "-" + crypto.randomInt(1000, 10000);
}

function loadOrders(userId, publicId) {
  const orders = publicId
    ? db.prepare("SELECT * FROM orders WHERE user_id = ? AND public_id = ?").all(userId, publicId)
    : db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(userId);
  const itemsStmt = db.prepare("SELECT kind, product_id, name, qty, price FROM order_items WHERE order_id = ? ORDER BY id");
  return orders.map((o) => ({
    id: o.public_id,
    status: o.status,
    canCancel: o.status === "processing",
    createdAt: o.created_at + "Z",
    updatedAt: o.updated_at + "Z",
    name: o.customer_name,
    phone: o.phone,
    branch: o.np_branch,
    subscription: o.subscription_id
      ? { id: o.subscription_id, name: PRICING.SUBSCRIPTIONS[o.subscription_id].name, price: o.subscription_price, usedGG: o.budget_used_gg, creditGG: o.budget_credit_gg }
      : null,
    retailTotal: o.retail_total,
    adventTotal: o.advent_total,
    total: o.total,
    items: itemsStmt.all(o.id)
  }));
}

function prepareOrder(body) {
  const planId = body.subscription ? String(body.subscription) : "";
  if (planId && !PRICING.SUBSCRIPTIONS[planId]) throw new HttpError(400, "Невідома підписка");
  const input = { subscription: planId || null, sub: body.sub || {}, extra: body.extra || {}, advent: body.advent };
  if (!planId && Object.values(input.sub).some((q) => Number(q) > 0)) throw new HttpError(400, "Продукти підписки без підписки");
  const calc = PRICING.calculate(PRODUCTS, input);
  if (calc.empty) throw new HttpError(400, "Оберіть підписку або продукти");
  if (!calc.minOrderOk) throw new HttpError(400, "Мінімальне замовлення продуктів — " + PRICING.MIN_SHOP_ORDER + " грн");

  const name = cleanText(body.name, "імʼя", 120);
  const phone = normalizePhone(body.phone);
  const branch = cleanText(body.branch, "поштове відділення", 200);
  return { calc, name, phone, branch };
}

function createOrder(user, prepared) {
  const { calc, name, phone, branch } = prepared;
  const last = db.prepare("SELECT created_at FROM orders WHERE user_id = ? AND status != 'cancelled' ORDER BY id DESC LIMIT 1").get(user.id);
  if (last) {
    const waitMs = PRICING.ORDER_COOLDOWN_MS - (Date.now() - Date.parse(last.created_at + "Z"));
    if (waitMs > 0) throw new HttpError(429, "Ми вже отримали ваше замовлення. Нове можна створити через " + Math.ceil(waitMs / 60000) + " хв.");
  }

  const sub = calc.subscription;
  const publicId = publicOrderId();
  db.exec("BEGIN");
  try {
    const info = db.prepare(
      `INSERT INTO orders (public_id, user_id, customer_name, phone, np_branch, subscription_id, subscription_price,
        budget_used_gg, budget_credit_gg, retail_total, advent_qty, advent_total, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(publicId, user.id, name, phone, branch, sub ? sub.id : null, sub ? sub.total : 0,
      sub ? sub.usedGG : 0, sub ? sub.credit : 0, calc.extraTotal, calc.adventQty, calc.adventTotal, calc.total);
    const insertItem = db.prepare("INSERT INTO order_items (order_id, kind, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?, ?)");
    calc.lines.forEach((line) => insertItem.run(info.lastInsertRowid, line.group, line.id, line.name, line.qty, line.price));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const order = loadOrders(user.id, publicId)[0];
  notify(orderMessage("Нове замовлення", order));
  return order;
}

function orderMessage(title, order) {
  const lines = [title + " #" + order.id, "", "Імʼя: " + order.name, "Телефон: +" + order.phone, "Відділення НП: " + order.branch, ""];
  if (order.subscription) {
    lines.push("Підписка «" + order.subscription.name + "»: " + order.subscription.price + " грн");
    lines.push("Бюджет: " + order.subscription.usedGG + " ГГ набрано, залишок " + order.subscription.creditGG + " ГГ");
  }
  const labels = { subscription: "У підписці", extra: "Додатково", advent: "Адвент" };
  order.items.forEach((item) => lines.push("• [" + labels[item.kind] + "] " + item.name + " × " + item.qty + (item.price ? " — " + item.price + " грн" : "")));
  lines.push("", "Разом: " + order.total + " грн");
  return lines.join("\n");
}

function notify(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chats = String(process.env.TELEGRAM_CHAT_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !chats.length) return;
  chats.forEach((chatId) => {
    fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    }).then((r) => { if (!r.ok) console.error("Telegram", chatId, r.status); }).catch((e) => console.error("Telegram", e.message));
  });
}

function setStatus(publicId, status) {
  if (!STATUSES.includes(status)) throw new HttpError(400, "Невідомий статус");
  const info = db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE public_id = ?").run(status, publicId);
  if (!info.changes) throw new HttpError(404, "Замовлення не знайдено");
}

// ---------- API ----------

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) throw new HttpError(413, "Запит завеликий");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (_) { throw new HttpError(400, "Некоректний JSON"); }
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw new HttpError(401, "Увійдіть у кабінет");
  return user;
}

function register(res, body) {
  const name = cleanText(body.name, "імʼя", 120);
  const phone = normalizePhone(body.phone);
  const password = checkPassword(body.password);
  if (db.prepare("SELECT 1 FROM users WHERE phone = ?").get(phone)) throw new HttpError(409, "Цей номер уже зареєстрований. Увійдіть у кабінет.");
  const salt = crypto.randomBytes(16).toString("hex");
  const info = db.prepare("INSERT INTO users (name, phone, password_hash, password_salt) VALUES (?, ?, ?, ?)").run(name, phone, hashPassword(password, salt), salt);
  startSession(res, Number(info.lastInsertRowid));
  return { id: Number(info.lastInsertRowid), name, phone };
}

async function handleApi(req, res, url) {
  const route = req.method + " " + url.pathname;
  // за проксі (Render) реальна адреса клієнта — останній запис X-Forwarded-For, доданий найближчим проксі
  const forwarded = process.env.TRUST_PROXY ? String(req.headers["x-forwarded-for"] || "").split(",").pop().trim() : "";
  const ip = forwarded || req.socket.remoteAddress || "";

  if (route === "GET /api/me") {
    const user = currentUser(req);
    return sendJson(res, 200, { user: user ? publicUser(user) : null });
  }
  if (req.method === "POST" && !String(req.headers["content-type"] || "").startsWith("application/json")) {
    throw new HttpError(415, "Очікується JSON");
  }

  if (route === "POST /api/register") {
    rateLimit("reg:" + ip, 10, 3600000);
    const user = register(res, await readJson(req));
    return sendJson(res, 201, { user });
  }
  if (route === "POST /api/login") {
    rateLimit("login:" + ip, 15, 15 * 60000);
    const body = await readJson(req);
    const phone = normalizePhone(body.phone);
    rateLimit("login:" + phone, 8, 15 * 60000);
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (!user || !verifyPassword(String(body.password || ""), user)) throw new HttpError(401, "Невірний номер або пароль");
    startSession(res, user.id);
    return sendJson(res, 200, { user: publicUser(user) });
  }
  if (route === "POST /api/logout") {
    const token = parseCookies(req).sid;
    if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
    res.setHeader("Set-Cookie", sessionCookie("", 0));
    return sendJson(res, 200, { ok: true });
  }
  if (route === "GET /api/orders") {
    return sendJson(res, 200, { orders: loadOrders(requireUser(req).id) });
  }
  if (route === "POST /api/orders") {
    rateLimit("order:" + ip, 20, 3600000);
    const body = await readJson(req);
    const prepared = prepareOrder(body);
    let user = currentUser(req);
    // гість: акаунт створюється разом із замовленням (імʼя, телефон + пароль)
    if (!user) user = register(res, { name: prepared.name, phone: prepared.phone, password: body.password });
    return sendJson(res, 201, { order: createOrder(user, prepared), user: publicUser(user) });
  }
  const cancel = url.pathname.match(/^\/api\/orders\/(HZ-[\w-]+)\/cancel$/);
  if (cancel && req.method === "POST") {
    const user = requireUser(req);
    const [order] = loadOrders(user.id, cancel[1]);
    if (!order) throw new HttpError(404, "Замовлення не знайдено");
    // умовний UPDATE: скасувати можна лише на етапі «Обробка»
    const info = db.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE public_id = ? AND user_id = ? AND status = 'processing'").run(cancel[1], user.id);
    if (!info.changes) throw new HttpError(409, "Це замовлення вже підтверджено, скасувати його в кабінеті не можна. Зателефонуйте нам.");
    const updated = loadOrders(user.id, cancel[1])[0];
    notify("Замовлення #" + updated.id + " скасовано клієнтом (" + updated.name + ", +" + updated.phone + ")");
    return sendJson(res, 200, { order: updated });
  }
  const admin = url.pathname.match(/^\/api\/admin\/orders\/(HZ-[\w-]+)\/status$/);
  if (admin && req.method === "POST") {
    const expected = process.env.ADMIN_TOKEN || "";
    const given = String(req.headers.authorization || "").replace(/^Bearer /, "");
    const ok = expected && crypto.timingSafeEqual(Buffer.from(sha256(given)), Buffer.from(sha256(expected)));
    if (!ok) throw new HttpError(403, "Недостатньо прав");
    setStatus(admin[1], String((await readJson(req)).status || ""));
    return sendJson(res, 200, { ok: true });
  }
  throw new HttpError(404, "Не знайдено");
}

// ---------- статика ----------

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function staticPath(pathname) {
  const clean = decodeURIComponent(pathname === "/" ? "/index.html" : pathname).replace(/\\/g, "/");
  if (clean.includes("..")) return null;
  const allowed = /^\/([\w-]+\.html|style\.css|script\.js|js\/[\w.-]+\.js|images\/[\w.-]+|data\/products\.json)$/.test(clean);
  return allowed ? path.join(__dirname, clean) : null;
}

function serveStatic(req, res, url) {
  const file = staticPath(url.pathname);
  if (!file || !["GET", "HEAD"].includes(req.method)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Не знайдено");
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Не знайдено");
    }
    const ext = path.extname(file);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".jpg" ? "public, max-age=86400" : "no-cache"
    });
    res.end(req.method === "HEAD" ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      if (!(error instanceof HttpError)) console.error(error);
      if (!res.headersSent) sendJson(res, error.status || 500, { error: error instanceof HttpError ? error.message : "Помилка сервера" });
    }
    return;
  }
  serveStatic(req, res, url);
});

if (require.main === module) {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());
  server.listen(PORT, () => console.log("Hazeloo: http://localhost:" + PORT));
}

module.exports = { db, setStatus, STATUSES, server };
