import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { ANIMAL_STATUS_LABELS, AnimalStatus } from '@contexts/animals/domain';
import { ANIMAL_STATUS_TONE } from '@contexts/animals/presentation';
import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { PhotoGalleryComponent } from '@shared/ui/photo-gallery';
import { SectionComponent } from '@shared/ui/section';
import { HealthChecklistItem } from './animal-detail-page.types';

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

  protected readonly genderLabel = computed(() => (this.animal()?.gender === 'female' ? 'девочка' : 'мальчик'));

  protected readonly statusLabel = computed(() => {
    const status = this.animal()?.status;
    return status ? ANIMAL_STATUS_LABELS[status] : '';
  });

  protected readonly statusTone = computed<BadgeTone>(() => {
    const status = this.animal()?.status;
    return status ? ANIMAL_STATUS_TONE[status] : 'neutral';
  });

  /**
   * needsTreatment/specialNeeds — не "выполненный пункт заботы", как vaccinated/
   * sterilized/dewormed, а предупреждение, поэтому вынесены из healthItems() в
   * отдельные бейджи (см. AnimalHealth в animal.model.ts).
   */
  protected readonly healthWarnings = computed<readonly string[]>(() => {
    const health = this.animal()?.health;
    if (!health) {
      return [];
    }
    const warnings: string[] = [];
    if (health.needsTreatment) {
      warnings.push('Требуется лечение');
    }
    if (health.specialNeeds) {
      warnings.push('Особые потребности');
    }
    return warnings;
  });

  protected readonly healthItems = computed<readonly HealthChecklistItem[]>(() => {
    const animal = this.animal();
    if (!animal) {
      return [];
    }
    return [
      { label: 'Привита', done: animal.health.vaccinated },
      { label: 'Стерилизована', done: animal.health.sterilized },
      { label: 'Обработана от паразитов', done: animal.health.dewormed }
    ];
  });
}
