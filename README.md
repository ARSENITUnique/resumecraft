# ResumeCraft

Учебный проект — сервис создания резюме с экспортом в PDF.

## Технологии

- React + Vite (frontend)
- Node.js + Express (backend)
- SQLite (встроенный модуль `node:sqlite`)
- html2pdf.js (экспорт в PDF)
- Git (контроль версий)

## Запуск

### Backend (Express + SQLite)

cd server
npm install
npm run dev

Сервер: http://localhost:5000

### Frontend (React + Vite)

cd client
npm install
npm run dev

Сайт: http://localhost:3000

## API

- GET /api/health — проверка сервера
- GET /api/db-check — список таблиц
- GET /api/resumes — список резюме
- GET /api/resumes/:id — одно резюме
- POST /api/resumes — создать
- PUT /api/resumes/:id — обновить
- DELETE /api/resumes/:id — удалить

## Структура БД

Пять таблиц: RESUME, EDUCATION, EXPERIENCE, SKILL, PROJECT.
Связь дочерних таблиц с RESUME через `resume_id` (ON DELETE CASCADE).

## Возможности

- Форма с личными данными, образованием, опытом, навыками, проектами
- Живой предпросмотр
- Два шаблона: Classic и Modern
- Экспорт в PDF
- Сохранение, загрузка, обновление и удаление резюме через API
- Валидация ФИО и email