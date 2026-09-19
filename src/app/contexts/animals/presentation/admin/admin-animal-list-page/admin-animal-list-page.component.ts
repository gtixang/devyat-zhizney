import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { ANIMAL_STATUS_LABELS, Animal, AnimalStatus } from '@contexts/animals/domain';
import { ANIMAL_STATUS_TONE } from '@contexts/animals/presentation';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';

/**
 * Админ-раздел "Животные" (docs/scheme/admin-panel.md). Данные — реальная таблица
 * `animals` в Supabase через AnimalsFacade.loadAll(). Добавление и редактирование —
 * одна и та же форма, admin-animal-form-page (см. её комментарий). Удаление уже
 * существующих животных из админки пока не реализовано.
 */
@Component({
  selector: 'app-admin-animal-list-page',
  standalone: true,
  imports: [RouterLink, SectionComponent, BadgeComponent, ButtonComponent],
  templateUrl: './admin-animal-list-page.component.html',
  styleUrl: './admin-animal-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnimalListPageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);

  protected readonly animals = toSignal(this.animalsFacade.loadAll().pipe(catchError(() => of([] as Animal[]))), {
    initialValue: [] as Animal[]
  });

  protected statusLabel(status: AnimalStatus): string {
    return ANIMAL_STATUS_LABELS[status];
  }

  protected statusTone(status: AnimalStatus): BadgeTone {
    return ANIMAL_STATUS_TONE[status];
  }
}
