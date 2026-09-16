# Tech Stack

## Frontend

- Angular 20+
- TypeScript
- Angular Signals
- RxJS
- SCSS
- BEM
- Angular Router
- Angular Reactive Forms
- Supabase JS Client

## Backend / BaaS

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Supabase Row Level Security (RLS)
- Supabase Edge Functions — при необходимости

Отдельный backend на Node.js/NestJS на текущем этапе не используется.

Если в будущем появится необходимость в серверной логике, которая не может безопасно выполняться через Supabase/RLS, она может быть реализована через Edge Functions или отдельный backend.

---

## Database

- PostgreSQL через Supabase
- Row Level Security (RLS)
- Supabase migrations — для изменений схемы базы данных

Не использовать SQLite.

---

## Authentication

- Supabase Auth

Не реализовывать собственную систему хранения паролей и авторизации без необходимости.

---

## Storage

- Supabase Storage

Используется для хранения:

- фотографий животных;
- изображений новостей;
- других пользовательских или административных файлов.

Доступ к файлам должен контролироваться Storage policies.

---

## Realtime

- Supabase Realtime

Использовать только там, где realtime действительно необходим.

Например:

- изменение статуса заказа/заявки;
- уведомления;
- изменения данных, которые должны отображаться без перезагрузки страницы.

Не использовать Realtime без необходимости.

---

## Styling

- SCSS
- BEM
- централизованные design tokens
- CSS Grid
- Flexbox

Основные дизайн-токены находятся в:

```text
src/styles/
```
