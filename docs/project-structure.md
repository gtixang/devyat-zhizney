# Project Structure

## Назначение

Этот документ описывает структуру Angular-приложения и назначение основных директорий.

Используется разработчиками и AI-агентами как справочник:

- где искать существующий код;
- куда добавлять новый код;
- к какому слою относится новая функциональность.

Перед созданием новой директории или перемещением файлов необходимо проверить этот документ.

---

## Структура проекта

project/
│
├── src/
│ ├── app/
│ │ ├── core/
│ │ │ ├── auth/
│ │ │ ├── supabase/
│ │ │ └── guards/
│ │ │
│ │ ├── shared/
│ │ │ └── ui/
│ │ │
│ │ ├── layouts/
│ │ │ ├── public/
│ │ │ └── admin/
│ │ │
│ │ ├── contexts/
│ │ │ ├── animals/
│ │ │ ├── adoption/
│ │ │ ├── volunteers/
│ │ │ ├── foster/
│ │ │ ├── news/
│ │ │ ├── events/
│ │ │ └── donations/
│ │ │
│ │ └── static-pages/
│ │
│ ├── assets/
│ ├── styles/
│ ├── environments/
│ │
│ ├── index.html
│ ├── main.ts
│ └── styles.scss
│
├── public/
│
├── docs/
│
├── angular.json
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
