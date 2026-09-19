import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { URGENT_LABEL, getGenderLabel, getHealthItems, getHealthWarnings, isUrgent } from '@contexts/animals/presentation';
import { BadgeComponent } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { PhotoGalleryComponent } from '@shared/ui/photo-gallery';
import { SectionComponent } from '@shared/ui/section';

/**
 * Карточка животного (docs/scheme/pet-card.md). Данные — реальная таблица `animals`
 * в Supabase (docs/database/schema.md) через AnimalsFacade.loadById().
 *
 * `animal()` различает три состояния: `undefined` — идёт загрузка, `null` — животное
 * не найдено, `Animal` — данные получены. Отдельно `loadFailed` — настоящая ошибка
 * загрузки (например, зависший на нестабильной мобильной сети запрос, см.
 * REQUEST_TIMEOUT_MS в AnimalsRepository) — это не то же самое, что "не найдено".
 *
 * Имя животного нигде не подставляется в падежные формы ("о Луне", "забрать Луну") —
 * русское склонение произвольных имён нельзя корректно автоматизировать без отдельной
 * библиотеки, поэтому заголовки сформулированы без обращения к падежам.
 *
 * `status` животного здесь не показывается: это внутренняя учётная метка куратора
 * (где физически находится животное), а не то, что нужно человеку, который ищет
 * питомца — см. также animal-card.component.ts и обсуждение в чате. Исключение —
 * "Срочно нужен дом" (isUrgent()) для needs_placement, единственный производный
 * факт из статуса, полезный именно адоптеру.
 */
@Component({
  selector: 'app-animal-detail-page',
  standalone: true,
  imports: [RouterLink, BadgeComponent, ButtonComponent, PhotoGalleryComponent, SectionComponent],
  templateUrl: './animal-detail-page.component.html',
  styleUrl: './animal-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalDetailPageComponent {
  public readonly id = input<string>('');

  private readonly animalsFacade = inject(AnimalsFacade);

  protected readonly loadFailed = signal(false);

  protected readonly animal = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => {
        this.loadFailed.set(false);
        return this.animalsFacade.loadById(id).pipe(
          catchError(() => {
            this.loadFailed.set(true);
            return of(null);
          })
        );
      })
    )
  );

  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly isUrgent = computed(() => {
    const status = this.animal()?.status;
    return status ? isUrgent(status) : false;
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
