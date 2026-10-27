# Pink — структура сайту для Figma і Webflow

Єдине джерело структури для прототипу у Figma і збірки у Webflow. Назви фреймів у Figma = назви класів у Webflow (система Client-First).

## 1. Стайлгайд (Figma Variables / Webflow Variables)

### Кольори
| Токен | HEX | Призначення |
|---|---|---|
| pink-50 | #FBF4F2 | фон сторінки |
| pink-100 | #F6E4E1 | blush, фон секції «Послуги», поля форми |
| pink-200 | #EDCBC6 | лінії, рамки |
| pink-400 | #D9879A | акцент на темному фоні, крапка в лого |
| pink-700 | #8C2F4B | кнопки, курсив-акценти в заголовках |
| pink-900 | #4A1527 | темні секції (marquee, «Чому Pink») |
| ink | #1F1418 | основний текст |
| ink-60 | #6B5A60 | другорядний текст |

### Типографіка
| Стиль | Шрифт | Розмір (desktop → mobile) | Line-height |
|---|---|---|---|
| Логотип PINK (hero) | Anton 400 | 37vw (≈530 px) → 50vw | 0.82 |
| H2 | Cormorant Garamond 500 | 68 → 40 px | 1.05 |
| H3 / назви карток | Cormorant Garamond 500 | 26–32 px | 1.15 |
| Акцент у заголовку | Cormorant Garamond Italic, колір pink-700 | — | — |
| Eyebrow | Manrope 600, UPPERCASE, трекінг 18% | 12 px | — |
| Body large | Manrope 400 | 19 px | 1.55 |
| Body | Manrope 400 | 16 px | 1.6 |
| Small | Manrope 400 | 14 px | 1.5 |

### Радіуси й відступи
- Радіуси: S 8 · M 16 · L 32 · Pill 999
- Контейнер: 1280 px, бокові поля 40 / 24 / 16 px (desktop / tablet / mobile)
- Вертикальні відступи секцій: large 120 → 80 px, medium 80 → 56 px
- Брейкпоінти Webflow: Desktop 1440 (база 992+), Tablet 991, Mobile portrait 478

### Компоненти
- `button` — pill-кнопка з рожевим градієнтом і світінням на hover; `is-outline` — градієнтна обводка з м'якою підсвіткою; `is-dark-bg` — для темного фону
- `image-ph` — місце під фото (у Figma: прямокутник із заливкою-фото; у Webflow: Image)
- `form_input`, `form_label`, `form_field-wrapper`

## 2. Сторінка Home — ієрархія фреймів / класів

```
page-wrapper
├── navbar_component (sticky)
│   └── padding-global › container-large › navbar_container
│       ├── navbar_logo  «Pink.»
│       ├── navbar_menu › navbar_link ×5 (Про нас, Послуги, Майстри, Роботи, Контакти)
│       └── navbar_button-wrapper › navbar_phone, button «Записатися», navbar_menu-button (≤991)
├── main-wrapper
│   ├── section_hero (рожева рамка 14 px)
│   │   └── hero_component (темна картка, радіус 22)
│   │       ├── navbar_component › navbar_brand, navbar_menu, button.is-outline, navbar_menu-button
│   │       ├── hero_stage
│   │       │   ├── hero_logo.is-fill «PINK» (шар 1, заливка)
│   │       │   ├── hero_girl › img girl.webp + canvas WebGL (шар 2, хвиля волосся за мишкою)
│   │       │   └── hero_logo.is-outline «PINK» (шар 3, лише контур поверх дівчини)
│   │       └── hero_bottom › hero_text, hero_buttons
│   ├── marquee_component (темна стрічка з послугами, біжучий рядок)
│   ├── section_about
│   │   └── … › about_component (2 колонки)
│   │       ├── about_images: about_image-1, about_image-2 (зсув вниз 64 px)
│   │       └── about_content: eyebrow, H2, текст, about_list (2×2 about_item)
│   ├── section_services (фон pink-100)
│   │   └── … › services_component
│   │       ├── services_header: eyebrow + H2 | services_tabs-menu (4 таби)
│   │       └── services_tabs-content › services_tab-pane ×4 (Волосся, Нігті, Брови та вії, Косметологія)
│   │           ├── services_image
│   │           └── services_list › services_item ×4 (name · price · desc)
│   ├── section_team
│   │   └── … › team_header + team_list (4 колонки) › team_item ×4 (team_image 3:4, team_name, team_role)
│   ├── section_gallery
│   │   └── … › gallery_grid (4 колонки, рядок 220 px, dense) › gallery_item ×8 (модифікатори is-tall, is-wide)
│   ├── section_benefits (фон pink-900)
│   │   └── … › benefits_list (4 колонки) › benefits_item ×4 (number, title, text)
│   └── section_booking
│       └── … › booking_component (2 колонки, рамка, радіус 32)
│           ├── booking_image
│           └── booking_content: eyebrow, H2, текст, booking_form (Ім'я, Телефон, Послуга, Дата, Коментар, кнопка) + form_success
└── footer_component
    └── … › footer_top (4 колонки: лого, адреса, контакти, соцмережі) + footer_bottom
```

## 3. Адаптив
| Блок | Desktop | Tablet ≤991 | Mobile ≤478 |
|---|---|---|---|
| Меню | у рядок | бургер, випадаюче | бургер, кнопка «Записатися» прихована |
| Hero / About / Services / Booking | 2 колонки | 1 колонка | 1 колонка |
| Майстри | 4 | 2 | 2 |
| Галерея | 4 | 2 | 2, рядок 160 px |
| Переваги | 4 | 2 | 1 |
| Футер | 4 | 2 | 1 |

## 4. Структура файлу Figma
- Сторінка **Cover** — обкладинка кейсу
- Сторінка **Style guide** — кольори, типографіка, кнопки, поля форми (як Variables + Text styles + Components)
- Сторінка **Desktop 1440** — фрейм `Home` з вкладеними auto-layout фреймами за ієрархією вище
- Сторінка **Tablet 991** і **Mobile 390** — ті самі фрейми з адаптивними налаштуваннями
- Сторінка **Prototype** — переходи: пункти меню → якорі секцій, таби послуг (variants), бургер-меню (overlay), відправка форми → стан успіху

## 5. Збірка у Webflow
1. Variables → додати кольори й шрифти з розділу 1.
2. Стилі тегів Body / H1 / H2 / H3 / Paragraph.
3. Створити глобальні класи `padding-global`, `container-large`, `padding-section-large/medium`, `button` та модифікатори.
4. Будувати секції за ієрархією, використовуючи нативні елементи: Navbar, Tabs (послуги), Form (запис), Image (замість `image-ph`).
5. Пункти меню — посилання на ID секцій (#about, #services, #team, #gallery, #booking, #contacts).
6. Перевірити брейкпоінти 991 і 478, опублікувати на webflow.io.

## 6. Анімації та взаємодія
- Плавний скрол: Lenis 1.1.13 (lerp 0.085), якорі меню скролять до секцій.
- Волосся в hero: WebGL-шейдер на вирізаному фото; зміщення росте від коренів до кінчиків, м'яка пружина за швидкістю руху мишки + повільна хвиля.
- Поява секцій при скролі: атрибут data-reveal (fade-up).
- Кнопки: зсув градієнта + рожеве світіння на hover; outline — підсвітка обводки.
- Повага до prefers-reduced-motion: анімації вимикаються.

## 7. Файли
- Figma: https://www.figma.com/design/dzslw5IIs1TQvdlXvUp5RC — сторінки «Style guide & components», «Desktop 1440», «Mobile 390». Рамки під фото названі `img:<назва-файлу>`.
- Код сайту: pink.css, pink.js, body.html (збираються в index.html).
