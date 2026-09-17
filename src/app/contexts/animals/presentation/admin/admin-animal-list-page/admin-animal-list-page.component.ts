import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
import { Animal, AnimalStatus } from '@contexts/animals/domain/animal.model';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { SectionComponent } from '@shared/ui/section/section.component';

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
 * `animals` в Supabase через AnimalsFacade.loadAll(). Добавление животного —
 * admin-animal-create-page. Редактирование/удаление уже существующих из админки
 * пока не реализовано.
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
