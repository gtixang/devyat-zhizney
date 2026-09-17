import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { AdoptionFacade } from '@contexts/adoption/application';
import { AdoptionApplication, AdoptionApplicationStatus } from '@contexts/adoption/domain';
import { AnimalsFacade } from '@contexts/animals/application';
import { Animal } from '@contexts/animals/domain';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { SectionComponent } from '@shared/ui/section';

const STATUS_LABEL: Record<AdoptionApplicationStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  approved: 'Одобрена'
};

const STATUS_TONE: Record<AdoptionApplicationStatus, BadgeTone> = {
  new: 'accent',
  in_progress: 'primary',
  approved: 'neutral'
};

interface ApplicationRow {
  readonly application: AdoptionApplication;
  readonly animalName: string;
}

/**
 * Админ-раздел "Заявки" (docs/scheme/admin-panel.md). Данные — реальная таблица
 * `adoption_applications` (виден только куратору, RLS — docs/database/schema.md).
 * Имя животного подтягивается отдельным запросом к `animals` и сопоставляется
 * по `animalId`, т.к. в самой заявке хранится только id. Пока только просмотр —
 * смена статуса заявки из админки не реализована на этом этапе.
 */
@Component({
  selector: 'app-admin-application-list-page',
  standalone: true,
  imports: [SectionComponent, BadgeComponent],
  templateUrl: './admin-application-list-page.component.html',
  styleUrl: './admin-application-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminApplicationListPageComponent {
  private readonly adoptionFacade = inject(AdoptionFacade);
  private readonly animalsFacade = inject(AnimalsFacade);

  private readonly applications = toSignal(
    this.adoptionFacade.loadAll().pipe(catchError(() => of([] as AdoptionApplication[]))),
    { initialValue: [] as AdoptionApplication[] }
  );

  private readonly animals = toSignal(this.animalsFacade.loadAll().pipe(catchError(() => of([] as Animal[]))), {
    initialValue: [] as Animal[]
  });

  protected readonly rows = computed<readonly ApplicationRow[]>(() => {
    const animalNameById = new Map(this.animals().map((animal) => [animal.id, animal.name] as const));
    return this.applications().map((application) => ({
      application,
      animalName: animalNameById.get(application.animalId) ?? application.animalId
    }));
  });

  protected statusLabel(status: AdoptionApplicationStatus): string {
    return STATUS_LABEL[status];
  }

  protected statusTone(status: AdoptionApplicationStatus): BadgeTone {
    return STATUS_TONE[status];
  }
}
