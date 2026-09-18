import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { AdoptionFacade } from '@contexts/adoption/application';
import { AdoptionApplication, AdoptionApplicationStatus } from '@contexts/adoption/domain';
import { AnimalsFacade } from '@contexts/animals/application';
import { Animal } from '@contexts/animals/domain';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';
import {
  ApplicationRow,
  NEXT_STATUS,
  NEXT_STATUS_ACTION_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  StatusChangeState
} from './admin-application-list-page.types';

/**
 * Админ-раздел "Заявки" (docs/scheme/admin-panel.md). Данные — реальная таблица
 * `adoption_applications` (виден только куратору, RLS — docs/database/schema.md).
 * Имя животного подтягивается отдельным запросом к `animals` и сопоставляется
 * по `animalId`, т.к. в самой заявке хранится только id.
 *
 * Статус меняется одной кнопкой "вперёд" (new → in_progress → approved, см.
 * NEXT_STATUS) — не произвольным выбором, потому что реальный процесс куратора
 * линейный, откатывать заявку назад не нужно. После успешной смены статуса список
 * перезагружается через `refresh` (тот же приём, что и в других admin-страницах
 * с мутацией — Subject-триггер вместо ручного .subscribe(), см. docs/specs/ts.md).
 */
@Component({
  selector: 'app-admin-application-list-page',
  standalone: true,
  imports: [SectionComponent, BadgeComponent, ButtonComponent],
  templateUrl: './admin-application-list-page.component.html',
  styleUrl: './admin-application-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminApplicationListPageComponent {
  private readonly adoptionFacade = inject(AdoptionFacade);
  private readonly animalsFacade = inject(AnimalsFacade);

  private readonly refresh = new Subject<void>();

  private readonly applications = toSignal(
    this.refresh.pipe(
      startWith(undefined),
      switchMap(() => this.adoptionFacade.loadAll().pipe(catchError(() => of([] as AdoptionApplication[]))))
    ),
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

  private readonly statusChangeTrigger = new Subject<{
    readonly applicationId: string;
    readonly status: AdoptionApplicationStatus;
  }>();

  private readonly statusChangeState = toSignal(
    this.statusChangeTrigger.pipe(
      switchMap(({ applicationId, status }) =>
        this.adoptionFacade.updateStatus(applicationId, status).pipe(
          map((): StatusChangeState => {
            this.refresh.next();
            return { kind: 'idle' };
          }),
          catchError(() => of<StatusChangeState>({ kind: 'error', applicationId })),
          startWith<StatusChangeState>({ kind: 'pending', applicationId })
        )
      )
    ),
    { initialValue: { kind: 'idle' } as StatusChangeState }
  );

  protected statusLabel(status: AdoptionApplicationStatus): string {
    return STATUS_LABEL[status];
  }

  protected statusTone(status: AdoptionApplicationStatus): BadgeTone {
    return STATUS_TONE[status];
  }

  protected nextStatusActionLabel(status: AdoptionApplicationStatus): string {
    return NEXT_STATUS_ACTION_LABEL[status];
  }

  protected canAdvanceStatus(status: AdoptionApplicationStatus): boolean {
    return NEXT_STATUS[status] !== null;
  }

  protected isUpdatingStatus(applicationId: string): boolean {
    const state = this.statusChangeState();
    return state.kind === 'pending' && state.applicationId === applicationId;
  }

  protected hasStatusChangeError(applicationId: string): boolean {
    const state = this.statusChangeState();
    return state.kind === 'error' && state.applicationId === applicationId;
  }

  protected onAdvanceStatus(applicationId: string, currentStatus: AdoptionApplicationStatus): void {
    const next = NEXT_STATUS[currentStatus];
    if (!next) {
      return;
    }
    this.statusChangeTrigger.next({ applicationId, status: next });
  }
}
