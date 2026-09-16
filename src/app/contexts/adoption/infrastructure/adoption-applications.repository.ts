import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SupabaseClientService } from '../../../core/supabase/supabase-client.service';
import { AdoptionApplication, AdoptionApplicationStatus } from '../domain/adoption-application.model';

/** Строка таблицы `adoption_applications` (docs/database/schema.md) — snake_case. */
interface AdoptionApplicationRow {
  readonly id: string;
  readonly animal_id: string;
  readonly applicant_name: string;
  readonly phone: string;
  readonly telegram: string;
  readonly city: string;
  readonly has_other_animals: boolean;
  readonly has_children: boolean;
  readonly about_applicant: string;
  readonly status: AdoptionApplicationStatus;
  readonly created_at: string;
}

function mapRowToAdoptionApplication(row: AdoptionApplicationRow): AdoptionApplication {
  return {
    id: row.id,
    animalId: row.animal_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    telegram: row.telegram,
    city: row.city,
    hasOtherAnimals: row.has_other_animals,
    hasChildren: row.has_children,
    aboutApplicant: row.about_applicant,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapApplicationToRow(application: Omit<AdoptionApplication, 'id' | 'status' | 'createdAt'>) {
  return {
    animal_id: application.animalId,
    applicant_name: application.applicantName,
    phone: application.phone,
    telegram: application.telegram,
    city: application.city,
    has_other_animals: application.hasOtherAnimals,
    has_children: application.hasChildren,
    about_applicant: application.aboutApplicant
  };
}

/**
 * Единственный слой, знающий о Supabase-таблице `adoption_applications`
 * (docs/database/schema.md).
 *
 * `SupabaseClientService` внедряется как сервис, а не через `.client` в field initializer —
 * см. пояснение в animals.repository.ts.
 */
@Injectable({ providedIn: 'root' })
export class AdoptionApplicationsRepository {
  private readonly supabaseClientService = inject(SupabaseClientService);

  findAll(): Observable<AdoptionApplication[]> {
    return from(this.supabaseClientService.client.from('adoption_applications').select('*')).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return ((data ?? []) as AdoptionApplicationRow[]).map(mapRowToAdoptionApplication);
      })
    );
  }

  /**
   * Без `.select()` после `insert()`: аноним может ВСТАВИТЬ заявку (политика insert
   * это разрешает), но не может прочитать её обратно тем же запросом — читать заявки
   * может только авторизованный куратор (политика select). Если запросить возврат
   * вставленной строки через `.select()`, Postgres применяет RLS-политику SELECT
   * к RETURNING и весь insert откатывается с ошибкой "violates row-level security
   * policy", даже если сама вставка была бы разрешена. Заявителю (не куратору)
   * возвращать вставленную запись и не нужно — только подтверждение, что она ушла.
   */
  create(application: Omit<AdoptionApplication, 'id' | 'status' | 'createdAt'>): Observable<void> {
    return from(
      this.supabaseClientService.client.from('adoption_applications').insert(mapApplicationToRow(application))
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }
}
