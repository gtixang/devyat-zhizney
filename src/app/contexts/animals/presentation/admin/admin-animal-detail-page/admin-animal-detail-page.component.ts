import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { ANIMAL_STATUS_LABELS } from '@contexts/animals/domain';
import { ANIMAL_STATUS_TONE, getGenderLabel, getHealthItems, getHealthWarnings } from '@contexts/animals/presentation';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { PhotoGalleryComponent } from '@shared/ui/photo-gallery';
import { SectionComponent } from '@shared/ui/section';

/**
 * Карточка животного в админке (docs/scheme/admin-panel.md) — вся информация об одном
 * животном на одном экране, в отличие от admin-animal-list-page (только сводка в
 * таблице) и admin-animal-form-page (только редактируемые поля формы). Отдельный блок
 * "Служебная информация" показывает то, чего нет на публичной странице животного —
 * статус, признак резерва заявкой и куратора — см. обсуждение в чате.
 */
@Component({
  selector: 'app-admin-animal-detail-page',
  standalone: true,
  imports: [RouterLink, BadgeComponent, ButtonComponent, PhotoGalleryComponent, SectionComponent],
  templateUrl: './admin-animal-detail-page.component.html',
  styleUrl: './admin-animal-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnimalDetailPageComponent {
  public readonly id = input<string>('');

  private readonly animalsFacade = inject(AnimalsFacade);

  protected readonly animal = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.animalsFacade.loadById(id).pipe(catchError(() => of(null)))))
  );

  protected readonly statusLabel = computed(() => {
    const status = this.animal()?.status;
    return status ? ANIMAL_STATUS_LABELS[status] : '';
  });

  protected readonly statusTone = computed<BadgeTone>(() => {
    const status = this.animal()?.status;
    return status ? ANIMAL_STATUS_TONE[status] : 'neutral';
  });

  protected readonly genderLabel = computed(() => {
    const gender = this.animal()?.gender;
    return gender ? getGenderLabel(gender) : '';
  });

  protected readonly healthWarnings = computed(() => {
    const health = this.animal()?.health;
    return health ? getHealthWarnings(health) : [];
  });

  protected readonly healthItems = computed(() => {
    const health = this.animal()?.health;
    return health ? getHealthItems(health) : [];
  });
}
