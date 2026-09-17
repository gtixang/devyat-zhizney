# CLAUDE.md — Project Rules (Angular + Supabase)

Этот файл читается автоматически при каждой сессии ИИ. Следуй этим правилам при любой задаче.

---

## Проект

**Девять жизней (Devyat Zhizney)** — мобильное/веб приложение для волонтерского движения помощи бездомным животным. Основной функционал: каталог питомцев, галерея, поиск передержек и панель администратора (куратора).

---

## Документация

Перед началом задачи читай нужные файлы по теме:

| Тема                                | Файл                         |
| ----------------------------------- | ---------------------------- |
| Структура проекта                   | `docs/project-structure.md`  |
| Схема БД                            | `docs/database-schema.md`    |
| Архитектура (общая)                 | `docs/architecture-rules.md` |
| Схема продукта                      | `docs/scheme`                |
| Tech stack                          | `docs/tech-stack.md`         |
| Безопасность                        | `docs/security-rules.md`     |
| Стиль кода (общий)                  | `docs/code-style.md`         |
| Стиль кода — Angular (Компоненты)   | `docs/specs/angular.md`      |
| Стиль кода — Angular HTML (Шаблоны) | `docs/specs/angular-html.md` |
| Стиль кода — TypeScript             | `docs/specs/typescript.md`   |
| Стиль кода — RxJS                   | `docs/specs/rxjs.md`         |
| Стиль кода — SCSS                   | `docs/specs/styles.md`       |
| Правила для ИИ                      | `docs/ai-rules/ai-rules.md`  |
| Фичи                                | `docs/product/features.md`   |
| Дизайн                              | `docs/design/direction.md`   |
| Дизайн-система                      | `docs/design-system/`        |
| Фазы разработки                     | `docs/📝 phases/`            |

## Tech Stack

**Используем:**

- **Frontend:** Angular 17+ (Строго Standalone-компоненты, без NgModules)
- **Язык:** TypeScript (строгая типизация `strict: true`)
- **Реактивность:** Angular Signals для состояния UI, RxJS — для асинхронных потоков и запросов
- **Backend/БД:** Supabase (Auth, PostgreSQL, Realtime)
- **Стили:** SCSS + BEM (Tailwind CSS не используется — запрещён)
- **Форматирование:** Prettier, ESLint

**Не используем — никогда:**

- PHP, MySQL, SQLite, чистый JS без фреймворков
- React, Vue, AngularJS (1.x)
- Старый подход Angular с `NgModule`
- Прямые SQL-запросы из компонентов UI (все идет через слой инфраструктуры)
- Внешние тяжелые UI-фреймворки (Angular Material не используем, пишем легкие компоненты на чистом SCSS)
- Tailwind CSS и любые другие утилитарные CSS-фреймворки

**В дизайне не используем — никогда:**

- Glassmorphism (размытые стёкла, backdrop-filter)
- Сложные анимации и transition-эффекты
- Перегруженные градиенты
- Неоновые свечения и glow-эффекты
- Тёмные фоны с яркими акцентами в стиле "SaaS dashboard"
- Мелкий текст (базовый размер не менее 16px)
- Карточки с heavy shadow и border-radius > 16px
- Декоративные blob-формы и абстрактные SVG-фигуры на фоне

### 2. Angular и TypeScript

- Только `standalone: true` для всех компонентов, директив и пайпов.
- СТРОГО использовать `changeDetection: ChangeDetectionStrategy.OnPush` для ВСЕХ компонентов без исключения для обеспечения максимальной производительности.
- Для отслеживания состояния интерфейса используй Angular Signals (`signal()`, `computed()`).
- Для работы с Supabase Client используй RxJS `Observable`, оборачивая промисы через `from()`.
- Использование `any` запрещено. Все типы данных должны быть явно описаны.
- Все Angular-компоненты должны использовать суффикс `.component` в именах файлов.
- Не использовать сокращённые имена файлов без `.component`.
  Правильно:

- `header.component.ts`
- `header.component.html`
- `header.component.scss`
- `admin-sidebar.component.ts`
- `admin-sidebar.component.html`
- `admin-sidebar.component.scss`
- `animal-card.component.ts`
- `animal-card.component.html`
- `animal-card.component.scss`

Неправильно:

- `header.ts`
- `header.html`
- `header.scss`
- `admin-sidebar.ts`
- `admin-sidebar.html`
- `admin-sidebar.scss`

При переименовании компонента обязательно обновлять все связанные ссылки.

Например:

`templateUrl`:

```ts
templateUrl: './admin-sidebar.component.html'
styleUrl: './admin-sidebar.component.scss'
import { AdminSidebarComponent } from './admin-sidebar.component';
```

### 3. Импорты — алиасы вместо глубоких относительных путей

В `tsconfig.json` настроены алиасы на верхнеуровневые папки `src/app`:

- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@contexts/*` → `src/app/contexts/*`
- `@layouts/*` → `src/app/layouts/*`
- `@static-pages/*` → `src/app/static-pages/*`
- `@environments/*` → `src/environments/*`

Любой импорт с двумя и более `../` (в том числе внутри одного контекста, например из
`presentation/public/...` в `application/` или `domain/`) должен использовать алиас, а не
относительный путь. Работает и в статических `import`, и в ленивых `import()` (например,
в `app.routes.ts`) — Angular CLI (esbuild) корректно разбивает такие маршруты на отдельные
чанки, проверено сборкой.

Соседние файлы в одной папке (`./component.html`) и файлы на один уровень выше в том же
контексте (`../domain/animal.model` из `infrastructure/`) остаются относительными —
алиас для них ничего не сокращает.

Правильно:

```ts
import { ButtonComponent } from '@shared/ui/button/button.component';
import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
loadComponent: () => import('@layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent);
```

Неправильно:

```ts
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { AnimalsFacade } from '../../../application/animals.facade';
```
