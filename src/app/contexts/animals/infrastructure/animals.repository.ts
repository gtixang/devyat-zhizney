import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SupabaseClientService } from '@core/supabase';
import { Animal, AnimalGender, AnimalStatus } from '../domain';

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
  readonly photo_url: string;
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
      dewormed: row.dewormed
    },
    photoUrl: row.photo_url
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
    photo_url: animal.photoUrl
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
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }
}
