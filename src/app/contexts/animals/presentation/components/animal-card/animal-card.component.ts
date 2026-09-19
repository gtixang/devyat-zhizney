import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Animal } from '@contexts/animals/domain';
import { URGENT_LABEL, isUrgent } from '@contexts/animals/presentation';
import { BadgeComponent } from '@shared/ui/badge';

/**
 * Карточка животного для сетки каталога (docs/scheme/main-page.txt, раздел "Ищет семью").
 * Статус целиком ("В приюте"/"На передержке" и т.д.) сюда намеренно не выводится — это
 * внутренняя учётная метка куратора, а не что-то полезное человеку, который просто ищет
 * питомца. Статус виден только в админке (admin-animal-list-page). Исключение — "Срочно
 * нужен дом" для needs_placement: это единственный кусочек статуса, реально полезный
 * адоптеру (см. isUrgent() в animal-display.ts и обсуждение в чате).
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

  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly isUrgent = computed(() => isUrgent(this.animal().status));

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
