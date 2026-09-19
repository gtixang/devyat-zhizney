import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Animal } from '@contexts/animals/domain';

/**
 * Карточка животного для сетки каталога (docs/scheme/main-page.txt, раздел "Ищет семью").
 * Статус ("В приюте"/"На передержке" и т.д.) сюда намеренно не выводится — это внутренняя
 * учётная метка куратора (где физически находится животное и кто за ним смотрит), а не
 * что-то полезное человеку, который просто ищет питомца. Статус виден только в админке
 * (admin-animal-list-page) — см. обсуждение в чате.
 */
@Component({
  selector: 'app-animal-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './animal-card.component.html',
  styleUrl: './animal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalCardComponent {
  public readonly animal = input.required<Animal>();

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
