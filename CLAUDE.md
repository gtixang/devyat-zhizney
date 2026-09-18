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
templateUrl: './admin-sidebar.component.html';
styleUrl: './admin-sidebar.component.scss';
import { AdminSidebarComponent } from './admin-sidebar.component';
```

### 3. Импорты — алиасы и barrel-файлы (index.ts) вместо глубоких путей

В `tsconfig.json` настроены алиасы на верхнеуровневые папки `src/app`:

- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@contexts/*` → `src/app/contexts/*`
- `@layouts/*` → `src/app/layouts/*`
- `@static-pages/*` → `src/app/static-pages/*`
- `@environments/*` → `src/environments/*`

Любой импорт с двумя и более `../` должен использовать алиас, а не относительный путь.
Работает и в статических `import`, и в ленивых `import()` (например, в `app.routes.ts`) —
Angular CLI (esbuild) корректно разбивает такие маршруты на отдельные чанки.

**Barrel-файлы.** Каждая папка, которая напрямую содержит файл с `export` (компонент,
facade, репозиторий, модель, guard, сервис и т.д.), должна содержать `index.ts` вида:

```ts
export * from './animals.facade';
export * from './animals.mock-data'; // если файлов в папке несколько — реэкспортировать все
```

Импортировать нужно из папки (`@contexts/animals/application`), а не из файла напрямую
(`@contexts/animals/application/animals.facade`). Это касается всех слоёв `contexts/<name>/
{domain,application,infrastructure}`, каждой отдельной страницы/компонента в `presentation/`,
`shared/ui/<name>/`, `static-pages/<name>/`, `core/auth/`, `core/supabase/`, `layouts/*` и их
вложенных `components/<name>/`. При создании нового файла с экспортом — сразу создавать
рядом `index.ts`.

Для `shared/ui` и `static-pages` есть ещё и общий `index.ts` на весь каталог
(`shared/ui/index.ts`, `static-pages/index.ts`), реэкспортирующий все дочерние барели —
потому что там много мелких сиблингов, которые часто импортируют группами. Для
`contexts/<name>/` в целом (объединяющий domain+application+infrastructure+presentation
одним файлом) такой общий барель **намеренно не создан** — он заставил бы сборщик
подтягивать вообще все lazy-loaded страницы контекста туда, где нужен только facade или
модель, и сломал бы разбиение на отдельные чанки (см. ниже).

**Что остаётся как есть (не трогать, не заворачивать в алиас/barrel):**

- Соседние файлы одной папки (`./component.html`, `./auth.service'` из `auth.guard.ts`
  в той же папке `core/auth/`).
- Ленивые `import()` в `app.routes.ts` (и вообще везде, где `loadComponent`/`loadChildren`
  указывает на конкретный маршрут) — всегда напрямую на файл компонента
  (`@contexts/animals/presentation/admin/admin-animal-create-page/admin-animal-create-page.component`,
  `@layouts/admin-layout/admin-layout.component`, `@core/auth/auth.guard`), а не через
  `index.ts`, даже если barrel для этой папки существует. Причина: Angular называет
  lazy-чанк по последнему сегменту пути импорта — импорт через `index.ts` даёт чанку в
  сборке безликое имя "index" вместо "admin-animal-create-page-component", что не ломает
  работу приложения, но затрудняет чтение отчёта сборки и профилирование в DevTools.
  Проверено сборкой в обе стороны (имена чанков возвращаются к читаемым при прямом импорте
  файла). Barrel-файл при этом всё равно создаётся в самой папке — просто этот один
  конкретный вызов `import()` его не использует. См. комментарий в `app.routes.ts`.

Правильно:

```ts
import { ButtonComponent } from '@shared/ui/button';
import { AnimalsFacade } from '@contexts/animals/application';
import { Animal } from '@contexts/animals/domain';
loadComponent: () =>
  import('@layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent);
```

Неправильно:

```ts
import { ButtonComponent } from '@shared/ui/button/button.component';
import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
```

### Данные, константы и типы

- Mock-данные, значимые константы и переиспользуемые типы не хранить внутри Angular-компонентов.
- Размещать их рядом с функциональностью, которой они принадлежат.
- Domain-типы размещать в `domain` соответствующего context.
- Не создавать глобальные директории `constants/`, `mock-data/` или `types/` без необходимости.
- Не дублировать существующие типы, константы и mock-данные.
- Подробные правила: `docs/code-style.md`.


### Документирование реализованного функционала

При реализации нового функционала или feature после завершения работы обязательно описать:

- что было реализовано;
- какие файлы и части проекта были изменены;
- как устроена основная логика нового функционала;
- как данные проходят через слои приложения;
- какие компоненты, сервисы, facades, repositories и другие сущности были добавлены или изменены;
- какие важные решения были приняты при реализации;
- какие состояния и сценарии обрабатываются;
- что было намеренно оставлено за пределами текущей задачи.

Правило применяется к новому функционалу, feature и существенным изменениям существующей логики.

Для небольших исправлений, переименований, стилистических изменений и других локальных изменений достаточно кратко указать, что было изменено.

Описание должно быть кратким, но достаточным для понимания того, как работает реализованный код.

Не ограничиваться сообщением «готово» или простым перечислением изменённых файлов.
