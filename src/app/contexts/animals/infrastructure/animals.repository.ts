import { Injectable, inject } from '@angular/core';
import { Observable, from, map, timeout } from 'rxjs';

import { SupabaseClientService } from '@core/supabase';
import { Animal, AnimalGender, AnimalStatus } from '../domain';

/**
 * На нестабильной мобильной сети (заблокированный/зафильтрованный на уровне
 * провайдера IP, слабый сигнал) запрос к Supabase может не завершиться вообще —
 * ни данными, ни ошибкой — из-за чего страница вечно висит на "Загрузка…".
 * Таймаут превращает такое зависание в обычную ошибку, которую уже ловит
 * catchError у каждого вызывающего (см. animal-catalog-page, animal-detail-page).
 */
const REQUEST_TIMEOUT_MS = 12_000;

/** Строка таблицы `animals` (docs/database/schema.md) — snake_case, как принято в Postgres. */
interface AnimalRow {
  readonly id: string;
  readonly name: string;
  readonly species: string;
  readonly gender: AnimalGender;
  readonly age: number;
  readonly status: AnimalStatus;
  readonly traits: readonly string[];
  readonly about: string;
  readonly vaccinated: boolean;
  readonly sterilized: boolean;
  readonly dewormed: boolean;
  readonly needs_treatment: boolean;
  readonly special_needs: boolean;
  readonly photo_urls: readonly string[];
}

function mapRowToAnimal(row: AnimalRow): Animal {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    gender: row.gender,
    age: row.age,
    status: row.status,
    traits: row.traits,
    about: row.about,
    health: {
      vaccinated: row.vaccinated,
      sterilized: row.sterilized,
      dewormed: row.dewormed,
      needsTreatment: row.needs_treatment,
      specialNeeds: row.special_needs
    },
    // `?? []` — граница системы (docs/specs/ts.md): пока не выполнена миграция
    // photo_url → photo_urls (docs/database/schema.md), колонки может не быть вовсе,
    // и Supabase просто не вернёт это поле, а не отдаст null/[] — не должно ронять страницу.
    photoUrls: row.photo_urls ?? []
  };
}

function mapAnimalToRow(animal: Animal): AnimalRow {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species,
    gender: animal.gender,
    age: animal.age,
    status: animal.status,
    traits: animal.traits,
    about: animal.about,
    vaccinated: animal.health.vaccinated,
    sterilized: animal.health.sterilized,
    dewormed: animal.health.dewormed,
    needs_treatment: animal.health.needsTreatment,
    special_needs: animal.health.specialNeeds,
    photo_urls: animal.photoUrls
  };
}

/**
 * Единственный слой, знающий о Supabase-таблице `animals` (docs/database/schema.md).
 * Application-слой и компоненты обращаются только сюда, а не к SupabaseClientService
 * напрямую (docs/specs/ts.md, раздел "Архитектурные ограничения DDD").
 *
 * `SupabaseClientService` внедряется как сервис, а не через `.client` в field initializer:
 * реальный клиент создаётся только внутри вызова конкретного метода, а не при простом
 * создании репозитория (например, транзитивно через AnimalsFacade на странице с mock-данными,
 * где Supabase не используется вовсе).
 */
@Injectable({ providedIn: 'root' })
export class AnimalsRepository {
  private readonly supabaseClientService = inject(SupabaseClientService);

  findAll(): Observable<Animal[]> {
    return from(this.supabaseClientService.client.from('animals').select('*')).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return ((data ?? []) as AnimalRow[]).map(mapRowToAnimal);
      })
    );
  }

  /** Как findAll(), но без пристроенных — для публичного каталога (docs/scheme/main-page.txt). */
  findAvailable(): Observable<Animal[]> {
    return from(this.supabaseClientService.client.from('animals').select('*').neq('status', 'adopted')).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return ((data ?? []) as AnimalRow[]).map(mapRowToAnimal);
      })
    );
  }

  findById(id: string): Observable<Animal | null> {
    return from(this.supabaseClientService.client.from('animals').select('*').eq('id', id).maybeSingle()).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data ? mapRowToAnimal(data as AnimalRow) : null;
      })
    );
  }

  /**
   * Без `.select()` после `insert()` — не потому, что это запрещено RLS (у `animals`
   * SELECT разрешён и анониму, и куратору), а для единообразия с
   * AdoptionApplicationsRepository.create(): вызывающая сторона уже знает все поля
   * добавленного животного (сама их и передала), повторный запрос не нужен.
   */
  create(animal: Animal): Observable<void> {
    return from(this.supabaseClientService.client.from('animals').insert(mapAnimalToRow(animal))).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  update(animal: Animal): Observable<void> {
    return from(
      this.supabaseClientService.client.from('animals').update(mapAnimalToRow(animal)).eq('id', animal.id)
    ).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }
}
