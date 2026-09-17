# Схема БД (Supabase / PostgreSQL)

Соответствует доменным моделям:

- [`src/app/contexts/animals/domain/animal.model.ts`](../../src/app/contexts/animals/domain/animal.model.ts)
- [`src/app/contexts/adoption/domain/adoption-application.model.ts`](../../src/app/contexts/adoption/domain/adoption-application.model.ts)

Таблицы в Postgres используют `snake_case` (идиоматично для SQL), домен на клиенте — `camelCase`.
Маппинг между ними — в infrastructure-слое каждого контекста
(`animals.repository.ts`, `adoption-applications.repository.ts`), компоненты и
application-слой продолжают работать только с camelCase-моделями.

`animals.id` — читаемый текстовый slug (`luna`, `bruno`), а не UUID: он уже используется
в URL (`/animals/:id`, `/animals/:id/adopt`) и в mock-данных, менять на UUID нет причин.

## Как применить

Выполнить весь скрипт ниже в Supabase Dashboard → **SQL Editor** → New query → Run.
Скрипт идемпотентен (`if not exists`), повторный запуск ничего не сломает.

```sql
create extension if not exists "pgcrypto";

-- ============================================================
-- animals
-- ============================================================
create table if not exists public.animals (
  id text primary key,
  name text not null,
  species text not null,
  gender text not null check (gender in ('male', 'female')),
  age integer not null check (age >= 0),
  status text not null default 'in_shelter'
    check (status in ('needs_placement', 'in_shelter', 'in_foster', 'adopted')),
  traits text[] not null default '{}',
  about text not null default '',
  vaccinated boolean not null default false,
  sterilized boolean not null default false,
  dewormed boolean not null default false,
  needs_treatment boolean not null default false,
  special_needs boolean not null default false,
  photo_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.animals enable row level security;

drop policy if exists "Публичное чтение животных" on public.animals;
create policy "Публичное чтение животных"
  on public.animals for select
  to anon, authenticated
  using (true);

drop policy if exists "Куратор добавляет животных" on public.animals;
create policy "Куратор добавляет животных"
  on public.animals for insert
  to authenticated
  with check (true);

drop policy if exists "Куратор редактирует животных" on public.animals;
create policy "Куратор редактирует животных"
  on public.animals for update
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- adoption_applications
-- ============================================================
create table if not exists public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  animal_id text not null references public.animals (id) on delete cascade,
  applicant_name text not null,
  phone text not null,
  telegram text not null default '',
  city text not null default '',
  has_other_animals boolean not null default false,
  has_children boolean not null default false,
  about_applicant text not null default '',
  status text not null default 'new' check (status in ('new', 'in_progress', 'approved')),
  created_at timestamptz not null default now()
);

alter table public.adoption_applications enable row level security;

drop policy if exists "Публичная отправка заявки" on public.adoption_applications;
create policy "Публичная отправка заявки"
  on public.adoption_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Куратор читает заявки" on public.adoption_applications;
create policy "Куратор читает заявки"
  on public.adoption_applications for select
  to authenticated
  using (true);

drop policy if exists "Куратор меняет статус заявки" on public.adoption_applications;
create policy "Куратор меняет статус заявки"
  on public.adoption_applications for update
  to authenticated
  using (true)
  with check (true);
```

## Логика доступа (RLS)

| Таблица                | Кто читает                | Кто пишет                                  |
| ----------------------- | -------------------------- | -------------------------------------------- |
| `animals`                | все (аноним + куратор)     | только авторизованный куратор (insert/update) |
| `adoption_applications`  | только авторизованный куратор | insert — все (форма анкеты); update — только куратор |

Отдельной системы ролей (admin/куратор/волонтёр) пока нет — используется единственное
деление Supabase Auth "аноним / авторизованный", как и в `AuthService`
(`isAuthenticated`). Полноценные роли — отдельная задача, когда появится реальная
потребность больше чем в одном курат­оре.

## Опционально: тестовые данные

Тот же набор, что в `animals.mock-data.ts` — если хотите сразу увидеть что-то на
странице каталога после переключения с mock на реальные данные:

```sql
insert into public.animals (id, name, species, gender, age, status, traits, about, vaccinated, sterilized, dewormed)
values
  ('luna', 'Луна', 'Собака', 'female', 3, 'in_shelter',
   array['Спокойная', 'Дружелюбная', 'Приучена к выгулу'],
   'Луна очень ласковая и любит людей, легко находит общий язык с детьми и другими животными.',
   true, true, true),
  ('murka', 'Мурка', 'Кошка', 'female', 1, 'in_shelter',
   array['Ласковая', 'Любит спать на руках'],
   'Мурка обожает нежиться на солнышке и совсем не боится других животных.',
   true, false, true),
  ('bruno', 'Бруно', 'Собака', 'male', 2, 'in_foster',
   array['Активный', 'Любит детей'],
   'Бруно ищет активную семью, готов на долгие прогулки и игры.',
   true, true, true),
  ('snezhok', 'Снежок', 'Кошка', 'male', 4, 'in_shelter',
   array['Спокойный', 'Аккуратный'],
   'Снежок — рассудительный кот, который ценит тишину и уют.',
   true, true, false)
on conflict (id) do nothing;
```

## Тестовые фото (Unsplash, только для демонстрации)

Свободно лицензированные фото (Unsplash License, использование без атрибуции разрешено) —
подставлены только чтобы каталог не выглядел пустым при демонстрации. Это **не** фото
реальных животных приюта — как только появятся настоящие фото, эти ссылки нужно заменить
(см. обсуждение про Supabase Storage в чате).

```sql
update public.animals set photo_url = 'https://images.unsplash.com/photo-1668036268050-ca69ef2f0ca0?w=1200&auto=format&fit=crop&q=80' where id = 'luna';
update public.animals set photo_url = 'https://images.unsplash.com/photo-1668194273694-89a5046f0181?w=1200&auto=format&fit=crop&q=80' where id = 'murka';
update public.animals set photo_url = 'https://images.unsplash.com/photo-1559861985-8c8c4c0fcbb4?w=1200&auto=format&fit=crop&q=80' where id = 'bruno';
update public.animals set photo_url = 'https://images.unsplash.com/photo-1653176070897-da3de9bbdc3c?w=1200&auto=format&fit=crop&q=80' where id = 'snezhok';
```

## Storage: бакет для настоящих фото животных

Форма добавления животного (`/admin/animals/new`) теперь загружает фото в Supabase
Storage по-настоящему (не только превью) — но сам бакет и его RLS-политики нужно
создать вручную, я не могу сделать это анонимным ключом.

Выполнить в Supabase Dashboard → **SQL Editor** → New query → Run:

```sql
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict (id) do nothing;

drop policy if exists "Публичное чтение фото животных" on storage.objects;
create policy "Публичное чтение фото животных"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'animal-photos');

drop policy if exists "Куратор загружает фото животных" on storage.objects;
create policy "Куратор загружает фото животных"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'animal-photos');

drop policy if exists "Куратор заменяет фото животных" on storage.objects;
create policy "Куратор заменяет фото животных"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'animal-photos')
  with check (bucket_id = 'animal-photos');

drop policy if exists "Куратор удаляет фото животных" on storage.objects;
create policy "Куратор удаляет фото животных"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'animal-photos');
```

Логика та же, что и у таблицы `animals`: читать фото может кто угодно (бакет публичный,
чтобы фото открывались в `<img>` без токена), а загружать/менять/удалять — только
авторизованный куратор.

## Миграция: расширенные статус и здоровье

По итогам разговора с куратором (в чате) статус животного и блок здоровья расширены:

- `status` — добавлены `needs_placement` ("Нужен приют" — животное известно куратору,
  но ещё не в приюте и не на передержке, например живёт на улице) и `adopted`
  ("Пристроен" — нашло дом; такие животные не удаляются из базы, а просто перестают
  показываться в публичном каталоге, `AnimalsFacade.loadAvailable()`).
- Здоровье — добавлены `needs_treatment` ("Требуется лечение") и `special_needs`
  ("Особые потребности"), оба `boolean not null default false`.

В базе, созданной ДО этой правки, CHECK-ограничение на `status` ещё старое (разрешает
только `in_shelter`/`in_foster`) и новых колонок здоровья ещё нет. Выполнить в Supabase
Dashboard → **SQL Editor** → New query → Run:

```sql
alter table public.animals drop constraint if exists animals_status_check;
alter table public.animals add constraint animals_status_check
  check (status in ('needs_placement', 'in_shelter', 'in_foster', 'adopted'));

alter table public.animals add column if not exists needs_treatment boolean not null default false;
alter table public.animals add column if not exists special_needs boolean not null default false;
```

Существующие животные ничего не потеряют — у них просто появятся `needs_treatment` и
`special_needs` со значением `false` по умолчанию, статус останется прежним (он и так
входит в новый разрешённый список).
