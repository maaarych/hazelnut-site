# Hazely

Сайт фундукового саду: магазин, підписка на дерево, адвент, кабінет із замовленнями.
Node 22+ (без залежностей) + SQLite.

## Локально

```
cp .env.example .env   # заповніть значення
npm start              # http://localhost:3000
```

Змінити статус замовлення: `npm run order-status -- HZ-261101-1234 confirmed`
(`processing | confirmed | delivered | cancelled`).

## Хостинг на Render (Starter: 0.5 CPU, 512 MB)

1. render.com → **New → Blueprint** → оберіть цей репозиторій (підхопить `render.yaml`).
2. Введіть `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_IDS` (ID через кому). `ADMIN_TOKEN` згенерується сам.
3. База лежить на диску `/var/data` (1 ГБ) — не видаляйте диск.
4. **Settings → Custom Domains** → додайте свій домен; HTTPS підключиться автоматично.
5. Кожен пуш у `main` оновлює сайт.

Змінити статус замовлення на хостингу: Render → Shell → команда `npm run order-status` вище,
або `POST /api/admin/orders/<id>/status` із заголовком `Authorization: Bearer <ADMIN_TOKEN>`.
