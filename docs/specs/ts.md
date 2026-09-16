# TypeScript Component Logic Spec (Angular + TS)

## Purpose

Определение правил написания TypeScript кода (`*.component.ts`) для компонентов проекта "Девять жизней". Цель — создание читаемой, строго типизированной логики на базе Angular Signals и OnPush, которая изолирована от прямой работы с БД и инфраструктурой.

## Базовые правила TypeScript

- **Строгая типизация (`strict: true`):** Использование типа `any` категорически запрещено. Каждый объект, аргумент функции или возвращаемое значение должны иметь четкий тип или интерфейс.
- **Модификаторы доступа:** Всегда явно указывайте `public`, `private` или `protected` для методов и свойств класса. По умолчанию свойства, используемые только внутри шаблона, должны быть `protected` или `public`.
- **Именование:**
  - Классы компонентов: `PascalCase` с суффиксом `Component` (например, `PetCardComponent`).
  - Методы и переменные: `camelCase` (например, `isLoading`, `updateStatus`).
  - Интерфейсы: `PascalCase` без префикса `I` (например, `Pet`, `FosterPlace`).

## Специфика Angular и Реактивности (Signals)

### 1. Объявление компонента

Каждый компонент обязан быть Standalone и использовать стратегию производительности `OnPush`:

```typescript
import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-pet-card",
  standalone: true,
  imports: [], // Импортируем только нужные standalone компоненты/директивы
  templateUrl: "./pet-card.component.html",
  styleUrl: "./pet-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush, // СТРОГО ОБЯЗАТЕЛЬНО
})
export class PetCardComponent {}
```

### 2. Управление состоянием через Signals

- **Внутреннее состояние:** Для хранения любых изменяемых данных на экране (выбранный фильтр, статус загрузки, список котиков) используются только сигналы `signal()`.
- **Входные данные (Inputs):** Для приема данных от родительских компонентов используется функция `input()` или `input.required()`. Они автоматически являются сигналами.
- **Вычисляемые данные:** Если значение зависит от других сигналов (например, отфильтрованный список котиков на основе выбранного статуса), всегда используйте `computed()`. Это исключает лишние перерисовки интерфейса.

```typescript
import { signal, computed, input } from '@angular/core';

// Пример логики внутри класса:
protected isLoading = signal<boolean>(false);
public selectedStatus = signal<string>('Все');

// Входной сигнал (иммутабельный)
public allPets = input.required<Pet[]>();

// Вычисляемый сигнал (автоматически обновит HTML при изменении selectedStatus или allPets)
protected filteredPets = computed(() => {
  const status = this.selectedStatus();
  if (status === 'Все') return this.allPets();
  return this.allPets().filter(pet => pet.status === status);
});
```

### 3. Изменение состояния

- Для полной перезаписи сигнала используйте `.set()`: `this.isLoading.set(true);`.
- Для обновления значения на основе предыдущего состояния используйте `.update()`: `this.counter.update(val => val + 1);`.

### 4. Взаимодействие с RxJS и Асинхронность

Так как на бэкенде планируется Supabase, который работает на Promise, или сервисы на RxJS Observable, их интеграция с сигналами должна быть чистой:

- Для превращения Observable в Signal в компонентах используйте функцию `toSignal()` из `@angular/core/rxjs-interop`.
- Компонент не должен делать ручные подписки (`.subscribe()`), чтобы избежать утечек памяти. Все асинхронные данные переводятся в сигналы.

## Архитектурные ограничения (DDD)

- **Компонент — это только Представление (Presentation).** Компонент не знает, как устроена база данных Supabase, и не делает туда прямых запросов.
- Вся логика получения данных должна быть вызвана через **Use Cases / Фасады** из слоя `application`. Компонент лишь вызывает метод (например, `this.catalogFacade.loadPets()`) и читает готовый сигнал со списком животных.
- Обработчики событий из HTML шаблона должны начинаться с префикса `on` (например, `onCardClick(id: string)`).

## Правила для ИИ (Claude Constraints)

AI должен:

- Автоматически добавлять `ChangeDetectionStrategy.OnPush` в декоратор каждого компонента [💡].
- Писать логику строго на Angular Signals, избегая старых изменяемых переменных класса [💡].
- Обеспечивать 100% строгую типизацию и добавлять краткие комментарии на русском языке к логике работы `computed()` сигналов.
