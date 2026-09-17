import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BadgeComponent, BadgeTone } from '@shared/ui/badge';
import { ANIMAL_STATUS_LABELS, Animal, AnimalStatus } from '@contexts/animals/domain';

const STATUS_TONE: Record<AnimalStatus, BadgeTone> = {
  needs_placement: 'warning',
  in_shelter: 'neutral',
  in_foster: 'primary',
  adopted: 'success'
};

/**
 * Карточка животного для сетки каталога (docs/scheme/main-page.txt, раздел "Ищет семью").
 * Маппинг доменного статуса в тон бейджа делается здесь, а не в shared/ui —
 * BadgeComponent остаётся независимым от домена (docs/design-system/_description.json).
 */
@Component({
  selector: 'app-animal-card',
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  templateUrl: './animal-card.component.html',
  styleUrl: './animal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalCardComponent {
  public readonly animal = input.required<Animal>();

  protected readonly statusLabel = computed(() => ANIMAL_STATUS_LABELS[this.animal().status]);
  protected readonly statusTone = computed(() => STATUS_TONE[this.animal().status]);

  /** Обложка карточки — первое фото из галереи (остальные видны только на странице животного). */
  protected readonly coverPhotoUrl = computed(() => this.animal().photoUrls[0]);

  /**
   * Фото хостится на внешнем CDN (Unsplash/Supabase Storage) — если оно не загрузилось
   * (заблокировано мобильной сетью, оператором, недоступен CDN и т.п.), <img> сам по себе
   * просто останется пустым/сломанным. Явно откатываемся на плейсхолдер по событию error.
   */
  protected readonly photoFailed = signal(false);

  protected readonly showCoverPhoto = computed(() => !!this.coverPhotoUrl() && !this.photoFailed());

  protected onPhotoError(): void {
    this.photoFailed.set(true);
  }
}
