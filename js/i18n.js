// Мова (uk/en) і валюта (UAH/EUR). Ключ словника — українській текст сторінки.
(function () {
  "use strict";

  var EN = {
    // --- спільне ---
    "До змісту": "Skip to content",
    "Меню": "Menu",
    "Основна навігація": "Main navigation",
    "Мова": "Language",
    "Валюта": "Currency",
    "Hazely": "Hazely",
    "Hazely — на головну": "Hazely — home",
    "Фундуковий сад · Снятин": "Hazelnut orchard · Snyatyn",
    "Магазин": "Shop",
    "Підписка": "Subscription",
    "Адвент": "Advent",
    "Контакти": "Contacts",
    "Кабінет": "Account",
    "Замовити": "Order",
    "Умови": "Terms",
    "© 2026 Фундуковий сад «Hazely»": "© 2026 Hazely Hazelnut Orchard",
    "Обрати": "Choose",
    "Оберіть": "Choose",
    "Оформити": "Checkout",
    "Замовлення": "Order",
    "Доставка": "Delivery",
    "Імʼя": "Name",
    "Телефон": "Phone",
    "Пароль": "Password",
    "Продукти": "Products",
    "Додатково": "Extras",
    "Підсумок": "Summary",
    "До сплати": "Total",
    "Сума": "Total",
    "Бюджет": "Budget",
    "ГГ": "NG",
    "100 г": "100 g",
    "шт": "pcs",
    "25 г": "25 g",
    "30 г": "30 g",
    "60 г": "60 g",
    "в роздріб": "at retail",
    "необовʼязково": "optional",

    // --- головна ---
    "Hazely — замовити фундук із саду в Снятині": "Hazely — order hazelnuts from our orchard in Snyatyn",
    "Фундук, паста, шоколад і підписка на іменне дерево з екологічного саду «Hazely». Замовлення онлайн, доставка Новою поштою.": "Hazelnuts, paste, chocolate and a named-tree subscription from the organic Hazely orchard. Order online, delivery by Nova Poshta.",
    "Ряди фундукових дерев у ранковому тумані": "Rows of hazelnut trees in the morning mist",
    "Фундук із саду —": "Hazelnuts from the orchard —",
    "замовте за хвилину": "order in a minute",
    "Горіхи, пасти й шоколад із власного саду на 150 дерев. Доставка Новою поштою по Україні.": "Nuts, pastes and chocolate from our own orchard of 150 trees. Delivery across Ukraine by Nova Poshta.",
    "Мої замовлення": "My orders",
    "Магазин · Снятин": "Shop · Snyatyn",
    "Продукти": "Products",
    "Ядро, паста, шоколад. Ціни за 100 г.": "Kernels, paste, chocolate. Prices per 100 g.",
    "від": "from",
    "Власне": "Your own",
    "дерево": "tree",
    "Іменне дерево і продукти на бюджет пакета.": "A named tree and products within your plan budget.",
    "Сезонне": "Seasonal",
    "7 днів": "7 days",
    "Сім маленьких смаків у подарунковій коробці.": "Seven small tastes in a gift box.",
    "Залиште дані": "Enter your details",
    "Продукти, підписку або те й інше разом.": "Products, a subscription, or both together.",
    "Імʼя, телефон і відділення Нової пошти.": "Name, phone and Nova Poshta branch.",
    "Стежте": "Track it",
    "Статус замовлення — у вашому кабінеті.": "Order status is in your account.",
    "Hazely — невеликий екологічний сад на Покутті: 150 дерев, ручний збір, без синтетичної хімії.": "Hazely is a small organic orchard in Pokuttia: 150 trees, hand-picked, no synthetic chemicals.",
    "Контакти й візити →": "Contacts and visits →",

    // --- підписка ---
    "Підписка на фундучне дерево — Hazely": "Hazelnut tree subscription — Hazely",
    "Іменне дерево в саду «Hazely» і продукти на бюджет пакета: Класичний, Гурман, Господар дерева.": "A named tree in the Hazely orchard and products within the plan budget: Classic, Gourmet, Tree Owner.",
    "Підписка на дерево": "Tree subscription",
    "Дерево з": "A tree with",
    "вашим імʼям": "your name",
    "Іменне дерево в нашому саду і продукти на бюджет пакета — на 12 місяців.": "A named tree in our orchard and products within the plan budget — for 12 months.",
    "Класичний": "Classic",
    "Гурман": "Gourmet",
    "Господар дерева": "Tree Owner",
    "Найпопулярніший": "Most popular",
    "Іменне дерево і ярлик": "Named tree and tag",
    "Сертифікат та фото дерева": "Certificate and tree photo",
    "Фотозвіт навесні": "Photo report in spring",
    "Подарункова коробка": "Gift box",
    "Усе з «Класичного»": "Everything in “Classic”",
    "Іменна табличка біля дерева": "Name plate by the tree",
    "Преміальна дерев’яна коробка": "Premium wooden box",
    "Листівка від руки": "Handwritten card",
    "Усе з «Гурмана»": "Everything in “Gourmet”",
    "Візит у сад для двох": "Orchard visit for two",
    "Особисте фото біля дерева": "Personal photo by the tree",
    "Доставка включена": "Delivery included",
    "Як рахується": "How",
    "ціна": "the price is calculated",
    "Що таке бюджет (ГГ)?": "What is the budget (NG)?",
    "1 ГГ — це 1 грн внутрішньої вартості продукту. Продукти, які ви набираєте в межах бюджету, вже входять у ціну пакета — за них нічого не доплачуєте.": "1 NG (nut gram) equals 1 UAH of a product's internal value. Products you pick within the budget are already included in the plan price — you pay nothing extra for them.",
    "Що, якщо не вдалося набрати рівно на бюджет?": "What if I can't hit the budget exactly?",
    "Це нормально: фасування різні. Якщо ви набрали від 90% бюджету і більше, ціна пакета просто підлаштується під набране (±10% бюджету, це приблизно ±5% вартості пакета). Якщо набрано менше 90%, ви платите повну ціну пакета, а залишок бюджету зберігається на наступну відправку.": "That's fine — pack sizes differ. If you pick 90% of the budget or more, the plan price simply adjusts to what you picked (±10% of the budget, roughly ±5% of the plan price). If you pick less than 90%, you pay the full plan price and the remaining budget is kept for the next shipment.",
    "Чи можна купити ще продукти?": "Can I buy more products?",
    "Так. Крім підписки, у тому самому замовленні можна додати продукти в роздріб за магазинними цінами — вони рахуються окремо від бюджету.": "Yes. Besides the subscription, you can add retail products to the same order at shop prices — they are counted separately from the budget.",
    "Чи можна замовити без підписки?": "Can I order without a subscription?",
    "Звісно: продукти в роздріб (від 300 грн) і адвент замовляються окремо.": "Of course: retail products (from UAH 300) and the Advent calendar can be ordered on their own.",
    "Скільки триває підписка?": "How long does a subscription last?",
    "12 місяців, до двох відправок включено. Імʼя дерева та одержувача менеджер уточнить під час підтвердження замовлення.": "12 months, up to two shipments included. We will confirm the tree name and recipient when we confirm your order.",

    // --- магазин ---
    "Магазин фундука — Hazely, Снятин": "Hazelnut shop — Hazely, Snyatyn",
    "Фундук, смажене ядро, паста та горіхи в шоколаді з саду «Hazely». Роздрібний магазин із доставкою по Україні.": "Hazelnuts, roasted kernels, paste and chocolate-coated nuts from the Hazely orchard. Retail shop with delivery across Ukraine.",
    "Магазин — Hazely, фундуковий сад": "Shop — Hazely hazelnut orchard",
    "Обирайте продукти з фундука з доставкою по Україні або самовивозом у Снятині.": "Choose hazelnut products with delivery across Ukraine or pick-up in Snyatyn.",
    "Смаки": "Flavours",
    "з нашого саду": "from our orchard",
    "Обирайте стільки, скільки потрібно для дому, подарунка або офісу. Усі ціни вказані за фасування 100 г.": "Order as much as you need for home, a gift or the office. All prices are per 100 g pack.",
    "Каталог": "Catalogue",
    "Фундук без": "Hazelnuts without",
    "зайвого": "the extras",
    "Власникам іменних дерев — ціна за внутрішнім GG-бюджетом, приблизно на 9% нижча.": "Owners of named trees get products at the internal NG budget price, about 9% lower.",
    "Підписатися на дерево →": "Subscribe to a tree →",
    "Ваш кошик": "Your basket",
    "До": "For your",
    "замовлення": "orders",
    "Кошик порожній.": "Your basket is empty.",
    "Мінімальне замовлення — 300 грн.": "Minimum order — UAH 300.",
    "Оформити замовлення": "Place order",
    "Доставка — за тарифами перевізника. Самовивіз — у Снятині.": "Delivery at the carrier's rates. Pick-up in Snyatyn.",
    "Фундук у шкаралупі": "Hazelnuts in shell",
    "Свіжий сезонний збір, як із гілки": "Fresh seasonal harvest, straight from the branch",
    "Ядро сире": "Raw kernels",
    "Висушене природно, без обсмажування": "Naturally dried, not roasted",
    "Ядро смажене": "Roasted kernels",
    "Легке обсмажування, насичений аромат": "Lightly roasted, rich aroma",
    "Паста з фундука 100%": "100% hazelnut paste",
    "Лише фундук і дрібка солі": "Just hazelnuts and a pinch of salt",
    "Фундук у темному шоколаді": "Hazelnuts in dark chocolate",
    "Цілий фундук і темний шоколад 70%": "Whole hazelnuts and 70% dark chocolate",
    "Шоколадна паста": "Chocolate hazelnut paste",
    "Фундук, какао і трохи тростинного цукру": "Hazelnuts, cocoa and a little cane sugar",

    // --- адвент ---
    "Адвент із фундука — Hazely": "Hazelnut Advent calendar — Hazely",
    "Адвент-календар «7 днів фундука» від саду «Hazely»: сім маленьких смаків до зимових свят.": "The “7 Days of Hazelnut” Advent calendar from the Hazely orchard: seven small tastes before the winter holidays.",
    "Адвент-календар «7 днів фундука» від саду «Hazely»: сім маленьких смаків до зимових свят": "The “7 Days of Hazelnut” Advent calendar from the Hazely orchard: seven small tastes before the winter holidays",
    "Адвент-календар із фундука — Hazely": "Hazelnut Advent calendar — Hazely",
    "Сім днів горіхових сюрпризів із саду в Снятині.": "Seven days of nutty surprises from our orchard in Snyatyn.",
    "Адвент-календар із горіховими сюрпризами": "Advent calendar with nutty surprises",
    "Сезонна пропозиція · 2026": "Seasonal offer · 2026",
    "Зима, розкладена на": "Winter, laid out in",
    "маленькі смаки": "little flavours",
    "Адвент-календар «Hazely» — подарунок, який відкривається щодня і пахне свіжим фундуком.": "The Hazely Advent calendar is a gift you open every day, and it smells of fresh hazelnuts.",
    "Замовлення до 20 листопада 2026": "Order by 20 November 2026",
    "Підготовка та відправлення — до початку грудня.": "Preparation and dispatch — by early December.",
    "Адвент-календар на сім днів": "Seven-day Advent calendar",
    "Компактний подарунок": "A compact gift",
    "«7 днів": "“7 days of",
    "фундука": "hazelnut",
    "»": "”",
    "Один тиждень — сім маленьких відкриттів. Без сертифіката на дерево, можна замовити окремо.": "One week — seven small discoveries. No tree certificate; can be ordered separately.",
    "Фундук у шкаралупі, сирий": "Hazelnuts in shell, raw",
    "Смажений фундук": "Roasted hazelnuts",
    "Фундукова паста": "Hazelnut paste",
    "Шоколадна фундукова паста": "Chocolate hazelnut paste",
    "Карамелізований фундук": "Caramelised hazelnuts",
    "Фундукове печиво": "Hazelnut cookies",
    "Версія без алкоголю. Алкогольну (18+) за потреби узгодимо окремо під час підтвердження замовлення.": "Alcohol-free version. An alcoholic (18+) version can be agreed separately when we confirm your order.",
    "Подарунок без зайвого": "A gift without the fuss",
    "ритм зими": "winter rhythm",
    "Оберіть свій": "Choose your",
    "Сім днів — для невеликого знаку уваги з продуктами з нашого саду.": "Seven days — a small gesture of attention with products from our orchard.",
    "До магазину": "To the shop",
    "Подарункова коробка з виробами з фундука": "Gift box with hazelnut products",

    // --- контакти ---
    "Контакти — Hazely, фундуковий сад у Снятині": "Contacts — Hazely hazelnut orchard in Snyatyn",
    "Адреса, телефон, email та графік візитів у фундуковий сад «Hazely», м. Снятин, Івано-Франківська область.": "Address, phone, email and visiting hours for the Hazely hazelnut orchard, Snyatyn, Ivano-Frankivsk Oblast.",
    "Приїздіть": "Come and",
    "у гості": "visit us",
    "Ми завжди раді поспілкуватися, показати сад і розповісти про сертифікати. Просто напишіть чи зателефонуйте.": "We are always happy to chat, show you the orchard and tell you about certificates. Just write or call.",
    "Адреса саду": "Orchard address",
    "м. Снятин,": "Snyatyn,",
    "Івано-Франківська область, Україна": "Ivano-Frankivsk Oblast, Ukraine",
    "Точну адресу та маршрут надішлемо після запису на візит.": "We will send the exact address and directions once you book a visit.",
    "Також Viber та Telegram": "Also on Viber and Telegram",
    "Відповідаємо протягом доби": "We reply within a day",
    "Соцмережі": "Social media",
    "Візити в сад": "Orchard visits",
    "За попереднім записом": "By appointment",
    "Найкращі пори: лютий–березень (цвітіння) та вересень–жовтень (збір урожаю). Тривалість — близько 1,5 години.": "Best seasons: February–March (blossom) and September–October (harvest). Duration — about 1.5 hours.",
    "Реквізити": "Company details",
    "ФОП [Ваше імʼя]": "Sole proprietor [Your name]",
    "ІПН / ЄДРПОУ: [номер]": "Tax ID: [number]",
    "Карта: Снятин, Івано-Франківська область": "Map: Snyatyn, Ivano-Frankivsk Oblast",
    "Снятин розташований над Прутом, на межі Покуття й Буковини, неподалік Коломиї та Чернівців.": "Snyatyn lies on the Prut river, on the border of Pokuttia and Bukovina, not far from Kolomyia and Chernivtsi.",
    "Готові подарувати?": "Ready to give a gift?",
    "Оберіть": "Choose",
    "своє дерево": "your tree",
    "Сертифікат — найкращий спосіб подарувати шматочок саду тому, кого ви любите.": "A certificate is the best way to give a piece of the orchard to someone you love.",

    // --- умови ---
    "Умови замовлення — Hazely": "Terms of order — Hazely",
    "Умови доставки, оплати, повернення харчових продуктів і обробки персональних даних для магазину та підписки «Hazely».": "Delivery, payment, food returns and personal data terms for the Hazely shop and subscription.",
    "Прозорі правила": "Clear rules",
    "Коротко про доставку, підписку, повернення та обробку даних.": "Briefly about delivery, subscriptions, returns and data processing.",
    "Мінімальна сума замовлення — 300 грн. Доставка оплачується за тарифами перевізника. Самовивіз доступний у Снятині за попереднім узгодженням.": "The minimum order is UAH 300. Delivery is paid at the carrier's rates. Pick-up is available in Snyatyn by prior arrangement.",
    "Підписка на дерево": "Tree subscription",
    "Один сертифікат закріплює одне іменне дерево за одним одержувачем на 12 місяців. Ціна пакета є фінальною та включає горіховий бюджет, коробку й до двох відправок на рік — восени та наприкінці зими.": "One certificate assigns one named tree to one recipient for 12 months. The plan price is final and includes the nut budget, the box and up to two shipments a year — in autumn and at the end of winter.",
    "Продукти можна обрати під час замовлення або пізніше, протягом терміну дії сертифіката. Продукти в межах бюджету входять у ціну пакета. Якщо набрано від 90% бюджету, ціна пакета підлаштовується під набране (1 ГГ = 1 грн, не більше ніж ±10% бюджету). Якщо набрано менше 90%, діє повна ціна пакета, а залишок бюджету зберігається для наступної відправки. Додаткові продукти в роздріб можна замовити разом із підпискою за магазинними цінами.": "Products can be chosen when ordering or later, while the certificate is valid. Products within the budget are included in the plan price. If you pick 90% of the budget or more, the plan price adjusts to what you picked (1 NG = UAH 1, by no more than ±10% of the budget). If you pick less than 90%, the full plan price applies and the remaining budget is kept for the next shipment. Additional retail products can be ordered together with the subscription at shop prices.",
    "Якщо вибір не зроблено протягом 30 днів після оплати, ми звʼяжемося з одержувачем і запропонуємо готовий набір за доступним бюджетом.": "If no choice is made within 30 days of payment, we will contact the recipient and offer a ready-made set within the available budget.",
    "Урожай і строки": "Harvest and timing",
    "Урожай залежить від погоди. Якщо його недостатньо, ми докомплектуємо замовлення продукцією з інших дерев саду — горіховий бюджет і вага погодженого набору не зменшуються.": "The harvest depends on the weather. If it falls short, we will top up your order with produce from other trees in the orchard — the nut budget and the agreed weight do not shrink.",
    "Повернення": "Returns",
    "Для харчових продуктів належної якості повернення та обмін можливі лише у випадках, передбачених законодавством. Якщо посилка пошкоджена або товар має неналежну якість, зафіксуйте це під час отримання та звʼяжіться з нами.": "For food of proper quality, returns and exchanges are possible only in cases provided by law. If the parcel is damaged or the product is of poor quality, document it on receipt and contact us.",
    "Алкоголь": "Alcohol",
    "Настоянка та лікер можуть продаватися лише після перевірки ліцензійних вимог, віку одержувача й правил перевізника. До окремого підтвердження алкоголь не входить у магазин і базові пакети; адвент-календар пропонується без алкоголю.": "Tinctures and liqueurs can be sold only after checking licence requirements, the recipient's age and carrier rules. Until separately confirmed, alcohol is not part of the shop or the basic plans; the Advent calendar is offered alcohol-free.",
    "Персональні дані": "Personal data",
    "Ми використовуємо імʼя, телефон, email та дані доставки лише для звʼязку, виконання замовлення й доставки. Дані передаються перевізнику лише в обсязі, потрібному для відправлення. Оформлюючи замовлення й створюючи кабінет, ви погоджуєтеся на таку обробку. Пароль зберігається лише у вигляді захищеного хешу.": "We use your name, phone, email and delivery details only to contact you, fulfil the order and deliver it. Data is passed to the carrier only as far as needed for dispatch. By placing an order and creating an account you agree to this processing. Your password is stored only as a protected hash.",
    "Кабінет і скасування": "Account and cancellation",
    "Статуси замовлення: «Обробка», «Підтверджено», «Доставлено». Скасувати замовлення самостійно в кабінеті можна лише на етапі «Обробка»; після підтвердження — зателефонуйте нам.": "Order statuses: “Processing”, “Confirmed”, “Delivered”. You can cancel an order yourself in your account only at the “Processing” stage; after confirmation, please call us.",

    // --- замовлення ---
    "Замовлення — Hazely": "Order — Hazely",
    "Оформіть замовлення: імʼя, телефон, відділення Нової пошти та продукти.": "Place an order: name, phone, Nova Poshta branch and products.",
    "Ваше": "Your",
    "Підписка": "Subscription",
    "Набір по підписці": "Subscription set",
    "Відділення Нової пошти": "Nova Poshta branch",
    "Місто, № відділення": "City, branch no.",
    "Пароль для кабінету": "Account password",
    "від 6 символів": "at least 6 characters",
    "+38 0__ ___ __ __": "+38 0__ ___ __ __",
    "Підлаштування ціни": "Price adjustment",
    "Доставка — за тарифами Нової пошти. Після оформлення ми зателефонуємо для підтвердження.": "Delivery at Nova Poshta rates. After checkout we will call to confirm.",
    "Дякуємо": "Thank you",
    "прийнято": "received",
    "Статус — «Обробка». Скасувати замовлення можна в кабінеті, поки його не підтверджено.": "Status: “Processing”. You can cancel the order in your account until it is confirmed.",
    "Відкрити кабінет": "Open account",

    // --- кабінет ---
    "Кабінет — Hazely": "Account — Hazely",
    "Статуси ваших замовлень: обробка, підтверджено, доставлено. Скасування на етапі обробки.": "Your order statuses: processing, confirmed, delivered. Cancellation is possible at the processing stage.",
    "Мої": "My",
    "Вхід": "Sign in",
    "Реєстрація": "Register",
    "Увійти": "Sign in",
    "Вийти": "Sign out",
    "Нове замовлення": "New order",

    // --- JS: загальне ---
    "Менше": "Less",
    "Додати": "Add",
    "Кількість": "Quantity",
    "Більше": "More",
    "Не вдалося завантажити каталог. Оновіть сторінку або напишіть нам.": "Could not load the catalogue. Refresh the page or write to us.",
    "Мінімальне замовлення — {min}. Залишилося додати {left}.": "Minimum order — {min}. {left} more to add.",
    "Доставка — Новою поштою за тарифами перевізника.": "Delivery by Nova Poshta at the carrier's rates.",
    "Без підписки": "No subscription",
    "Лише продукти": "Products only",
    "Продукти з бюджету пакета — доплати немає. Фасування {unit}.": "Products from the plan budget — no extra charge. Pack size {unit}.",
    "Необовʼязково: окремо від підписки, за магазинними цінами.": "Optional: separate from the subscription, at shop prices.",
    "Ціни за фасування. Мінімальна сума продуктів — {min}.": "Prices are per pack. Minimum products total — {min}.",
    "з бюджету": "from budget",
    "без алкоголю": "alcohol-free",
    "Адвент «7 днів фундука»": "Advent “7 Days of Hazelnut”",
    "Підписка «{name}» · {price}": "“{name}” subscription · {price}",
    "Підписка «{name}»": "“{name}” subscription",
    "Оберіть підписку або продукти": "Choose a subscription or products",
    "Замовлення без підписки": "Order without a subscription",
    "Поки порожньо.": "Nothing yet.",
    "у підписці": "in subscription",
    "Бюджет {budget}. Продукти можна обрати зараз або пізніше — без них діє ціна пакета.": "Budget {budget}. You can pick products now or later — without them the plan price applies.",
    "Набрано {used} із {budget}. Додайте ще від {need}, щоб ціна підлаштувалась, або залишок {credit} збережеться на наступну відправку.": "Picked {used} of {budget}. Add at least {need} more to adjust the price, or the remaining {credit} is kept for the next shipment.",
    "Набрано {used} із {budget}: ціна підлаштована ({adjust}).": "Picked {used} of {budget}: price adjusted ({adjust}).",
    "Набрано {used} із {budget}: ціна підлаштована, точно в бюджет.": "Picked {used} of {budget}: price adjusted, right on budget.",
    "Набрано {used} — понад бюджет {budget}. Ціна зростає на {adjust}, або оберіть вищий пакет.": "Picked {used} — over the {budget} budget. The price rises by {adjust}, or choose a higher plan.",
    "Для відстеження замовлення створимо кабінет. Вже реєструвалися? ": "We will create an account so you can track the order. Already registered? ",
    "Ви увійшли як {name}. Статус замовлення — у ": "Signed in as {name}. Order status is in your ",
    "кабінеті": "account",
    "Оберіть підписку або продукти.": "Choose a subscription or products.",
    "Мінімальна сума продуктів — {min}.": "Minimum products total — {min}.",
    "Надсилаємо…": "Sending…",
    "Не вдалося надіслати. Спробуйте ще раз.": "Could not send. Please try again.",
    "Оплата здійснюється в гривнях. Суми в євро — орієнтовні за курсом 1 € = {rate} ₴.": "Payment is made in hryvnia. Euro amounts are approximate at 1 € = {rate} ₴.",

    // --- JS: кабінет ---
    "Обробка": "Processing",
    "Підтверджено": "Confirmed",
    "Доставлено": "Delivered",
    "Скасовано": "Cancelled",
    "Створити кабінет": "Create account",
    " · залишок бюджету {credit}": " · budget left {credit}",
    "Скасувати замовлення": "Cancel order",
    "Підтвердити скасування": "Confirm cancellation",
    "Замовлення підтверджено — для змін зателефонуйте нам.": "Order confirmed — please call us for changes.",
    "Нова пошта: {branch}": "Nova Poshta: {branch}",
    "Завантаження…": "Loading…",
    "Замовлень ще немає. ": "No orders yet. ",
    "Зробити перше →": "Place your first →",
    "Сервер недоступний. Спробуйте пізніше.": "Server unavailable. Please try later.",

    // --- відповіді сервера ---
    "Вкажіть номер телефону у форматі +38 0XX XXX XX XX": "Enter a phone number in the format +38 0XX XXX XX XX",
    "Заповніть поле: імʼя": "Please fill in: name",
    "Заповніть поле: поштове відділення": "Please fill in: Nova Poshta branch",
    "Пароль має містити від 6 символів": "The password must be at least 6 characters",
    "Невідома підписка": "Unknown subscription",
    "Оберіть підписку або продукти": "Choose a subscription or products",
    "Цей номер уже зареєстрований. Увійдіть у кабінет.": "This number is already registered. Please sign in.",
    "Невірний номер або пароль": "Wrong number or password",
    "Увійдіть у кабінет": "Please sign in",
    "Забагато спроб. Спробуйте трохи пізніше.": "Too many attempts. Please try again later.",
    "Це замовлення вже підтверджено, скасувати його в кабінеті не можна. Зателефонуйте нам.": "This order is already confirmed and cannot be cancelled in your account. Please call us.",
    "Замовлення не знайдено": "Order not found",
    "Помилка сервера": "Server error",
    "Запит завеликий": "Request too large",
    "Некоректний JSON": "Invalid request"
  };

  var PATTERNS = [
    [/^Мінімальне замовлення продуктів — (\d+) грн$/, function (m, f) { return "Minimum products order — " + f.money(+m[1]); }],
    [/^Ми вже отримали ваше замовлення\. Нове можна створити через (\d+) хв\.$/, function (m) { return "We already received your order. You can place a new one in " + m[1] + " min."; }],
    [/^Занадто довге поле: (.*)$/, function (m) { return "Field too long: " + m[1]; }],
    [/^Заповніть поле: (.*)$/, function (m) { return "Please fill in: " + m[1]; }]
  ];

  var store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (_) { /* приватний режим */ } }
  };

  var CFG = window.HAZELY_PRICING || {};
  var RATE = CFG.UAH_PER_EUR || 48;
  // ?lang=en&cur=EUR дозволяє поділитися посиланням з потрібними налаштуваннями
  var query = new URLSearchParams(window.location.search);
  if (query.get("lang")) store.set("hazely-lang", query.get("lang"));
  if (query.get("cur")) store.set("hazely-cur", query.get("cur"));
  var lang = store.get("hazely-lang") === "en" ? "en" : "uk";
  var cur = store.get("hazely-cur") === "EUR" ? "EUR" : "UAH";
  var listeners = [];
  var textNodes = [];
  var attrNodes = [];

  function fill(text, vars) {
    return vars ? text.replace(/\{(\w+)\}/g, function (all, key) { return vars[key] != null ? vars[key] : all; }) : text;
  }

  var api = {
    get lang() { return lang; },
    get cur() { return cur; },
    rate: RATE,
    t: function (uk, vars) {
      var out = uk;
      if (lang === "en") {
        if (Object.prototype.hasOwnProperty.call(EN, uk)) out = EN[uk];
        else {
          for (var i = 0; i < PATTERNS.length; i++) {
            var m = PATTERNS[i][0].exec(uk);
            if (m) { out = PATTERNS[i][1](m, api); break; }
          }
        }
      }
      return fill(out, vars);
    },
    // суми в проєкті зберігаються в гривнях; євро — лише відображення
    money: function (uah) {
      var value = Number(uah) || 0;
      if (cur === "EUR") {
        var eur = value / RATE;
        var whole = Math.abs(eur - Math.round(eur)) < 0.005;
        return eur.toLocaleString(lang === "en" ? "en-GB" : "uk-UA", {
          style: "currency", currency: "EUR", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2
        }).replace(/ /g, " ");
      }
      var n = Math.round(value);
      return lang === "en" ? "₴" + n.toLocaleString("en-GB") : n.toLocaleString("uk-UA").replace(/ /g, " ") + " грн";
    },
    onChange: function (fn) { listeners.push(fn); },
    set: function (next) {
      if (next.lang) { lang = next.lang === "en" ? "en" : "uk"; store.set("hazely-lang", lang); }
      if (next.cur) { cur = next.cur === "EUR" ? "EUR" : "UAH"; store.set("hazely-cur", cur); }
      applyStatic();
      listeners.forEach(function (fn) { fn(); });
    }
  };

  function collect() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentNode;
      if (!parent || /^(SCRIPT|STYLE)$/.test(parent.nodeName) || parent.closest("[data-price],[data-budget]")) continue;
      var raw = node.nodeValue;
      var key = raw.replace(/\s+/g, " ").trim();
      if (!key) continue;
      textNodes.push({ node: node, key: key, lead: /^\s/.test(raw) ? " " : "", trail: /\s$/.test(raw) ? " " : "", override: parent.getAttribute("data-en") });
    }
    document.querySelectorAll("[alt],[placeholder],[aria-label],[title]").forEach(function (el) {
      ["alt", "placeholder", "aria-label", "title"].forEach(function (attr) {
        if (el.hasAttribute(attr)) attrNodes.push({ el: el, attr: attr, key: el.getAttribute(attr) });
      });
    });
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(function (el) {
      attrNodes.push({ el: el, attr: "content", key: el.getAttribute("content") });
    });
    attrNodes.push({ title: true, key: document.title });
  }

  function applyStatic() {
    document.documentElement.lang = lang === "en" ? "en" : "uk";
    textNodes.forEach(function (item) {
      if (!item.node.isConnected) return;
      var text = lang === "en" && item.override ? item.override : api.t(item.key);
      item.node.nodeValue = item.lead + text + item.trail;
    });
    attrNodes.forEach(function (item) {
      if (item.title) { document.title = api.t(item.key); return; }
      if (item.el.isConnected) item.el.setAttribute(item.attr, api.t(item.key));
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"); });
    document.querySelectorAll("[data-cur]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.cur === cur ? "true" : "false"); });
  }

  window.I18N = api;

  function init() {
    collect();
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        // уперше обираючи English, показуємо євро, якщо валюту ще не обирали
        var next = { lang: b.dataset.lang };
        if (b.dataset.lang === "en" && !store.get("hazely-cur")) next.cur = "EUR";
        api.set(next);
      });
    });
    document.querySelectorAll("[data-cur]").forEach(function (b) {
      b.addEventListener("click", function () { api.set({ cur: b.dataset.cur }); });
    });
    applyStatic();
  }

  // скрипт підключено в кінці body: збираємо статичний текст до того, як script.js щось домалює
  init();
})();
