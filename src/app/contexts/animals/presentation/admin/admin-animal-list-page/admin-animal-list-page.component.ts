import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { Animal, AnimalStatus } from '@contexts/animals/domain';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';

const STATUS_LABEL: Record<AnimalStatus, string> = {
  in_shelter: 'В приюте',
  in_foster: 'На передержке'
};

const STATUS_TONE: Record<AnimalStatus, BadgeTone> = {
  in_shelter: 'neutral',
  in_foster: 'primary'
};

/**
 * Админ-раздел "Животные" (docs/scheme/admin-panel.md). Данные — реальная таблица
 * `animals` в Supabase через AnimalsFacade.loadAll(). Добавление и редактирование —
 * одна и та же форма, admin-animal-form-page (см. её комментарий). Удаление уже
 * существующих животных из админки пока не реализовано.
 */
@Component({
  selector: 'app-admin-animal-list-page',
  standalone: true,
  imports: [SectionComponent, BadgeComponent, ButtonComponent],
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
    return STATUS_LABEL[status];
  }

  protected statusTone(status: AnimalStatus): BadgeTone {
    return STATUS_TONE[status];
  }
}
