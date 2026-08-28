# Engyls Inc. — сайт + бэкенд

## Что это
Сайт с красными анимированными обоями, скачиванием Engylsdroid, меню
(HUNGRY CIRCLE, ENGYLSOP WORLD, САЙТ ALEXB612) и соц-сетью ENGYLSOP WORLD:
аккаунты, публикация проектов в `.zip`, поиск, скачивание.

Теперь данные (аккаунты и проекты) хранятся на **сервере**, а не в браузере —
поэтому их видят все устройства.

## Запуск
1. Установи Node.js (https://nodejs.org).
2. В папке проекта:
   ```
   npm install
   npm start
   ```
3. Открой в браузере: http://localhost:3000

## Структура
- `index.html` — главный сайт
- `alexb612.html` — отдельный проект ALEXB612
- `server.js` — Express бэкенд (API + раздача файлов)
- `package.json` — зависимости
- `data/` — база аккаунтов и проектов (создаётся автоматически)
- `uploads/` — загруженные `.zip` проекты (создаётся автоматически)

## API
- `POST /api/accounts` — создать аккаунт
- `GET  /api/accounts?q=` — список / поиск аккаунтов
- `POST /api/projects` (multipart, поле `file` .zip) — опубликовать проект
- `GET  /api/projects?q=` — список / поиск проектов
- `GET  /api/projects/:id/download` — скачать проект
